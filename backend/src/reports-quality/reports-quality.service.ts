/**
 * G005 放射RIS系统 v3.0.2.2 - 报告质量服务
 * 评分维度与前端 ReportQualityScore.tsx 对齐
 */
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface QualityDimension {
  key: string
  label: string
  score: number
  max: number
  weight: number
  issues: string[]
}

export interface QualityEvaluation {
  id: string
  reportId: string
  totalScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: QualityDimension[]
  evaluatedAt: string
  suggestions: string[]
}

export interface EvaluateDto {
  reportId: string
  findings: string
  conclusion: string
  suggestion?: string
  radsCategory?: string
  hasCritical?: boolean
  verified?: boolean
  structuredCompletion?: number
}

const DEFAULT_KEYWORDS = ['正常', '未见', '清晰', '对称', '规则', '均匀']
const BLACKLIST = ['TODO', 'xxx', '...', '?', '待补充']

@Injectable()
export class ReportsQualityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 评分规则(GET rules)
   */
  getRules() {
    return {
      version: '3.0.2.2',
      dimensions: [
        { key: 'structured', label: '结构化字段完整度', max: 20, weight: 0.2 },
        { key: 'keywords', label: '关键术语命中', max: 20, weight: 0.2 },
        { key: 'rads', label: 'RADS 类别标注', max: 15, weight: 0.15 },
        { key: 'clarity', label: '结论清晰度', max: 15, weight: 0.15 },
        { key: 'length', label: '长度合理性', max: 10, weight: 0.1 },
        { key: 'blacklist', label: '黑名单规避', max: 10, weight: 0.1 },
        { key: 'critical', label: '危急值标注', max: 5, weight: 0.05 },
        { key: 'verified', label: '审核完成', max: 5, weight: 0.05 },
      ],
      grades: [
        { grade: 'A', min: 90, label: '优秀' },
        { grade: 'B', min: 80, label: '良好' },
        { grade: 'C', min: 70, label: '合格' },
        { grade: 'D', min: 60, label: '欠佳' },
        { grade: 'F', min: 0, label: '不合格' },
      ],
      keywords: DEFAULT_KEYWORDS,
      blacklist: BLACKLIST,
    }
  }

  /**
   * 评估报告(POST evaluate)
   * 注:无 ReportQualityScore 表时,仅返回计算结果(不持久化)
   */
  async evaluate(dto: EvaluateDto): Promise<QualityEvaluation> {
    const result = this.computeScore(dto)
    // 尝试持久化(若表存在)
    try {
      const model = (this.prisma as any).reportQualityScore
      if (model?.create) {
        await model.create({
          data: {
            reportId: dto.reportId,
            totalScore: result.totalScore,
            grade: result.grade,
            dimensions: result.dimensions,
            suggestions: result.suggestions,
            evaluatedAt: new Date(),
          },
        })
      }
    } catch {
      // 忽略持久化错误,继续返回结果
    }
    return result
  }

  /**
   * 评分计算逻辑(纯函数)
   */
  private computeScore(input: EvaluateDto): QualityEvaluation {
    const dimensions: QualityDimension[] = []
    let total = 0
    const findings = input.findings ?? ''
    const conclusion = input.conclusion ?? ''
    const suggestion = input.suggestion ?? ''

    // 1. 结构化字段完整度
    const structScore = Math.round((input.structuredCompletion ?? 0) * 20)
    total += structScore
    dimensions.push({
      key: 'structured',
      label: '结构化字段完整度',
      score: structScore,
      max: 20,
      weight: 0.2,
      issues: (input.structuredCompletion ?? 0) < 0.5 ? ['结构化字段缺失较多'] : [],
    })

    // 2. 关键术语
    const hit = DEFAULT_KEYWORDS.filter((kw) => findings.includes(kw) || conclusion.includes(kw)).length
    const kwScore = Math.min(20, Math.round((hit / DEFAULT_KEYWORDS.length) * 25))
    total += kwScore
    dimensions.push({
      key: 'keywords',
      label: '关键术语命中',
      score: kwScore,
      max: 20,
      weight: 0.2,
      issues: hit < 3 ? ['关键术语过少'] : [],
    })

    // 3. RADS
    const radsScore = input.radsCategory ? 15 : 0
    total += radsScore
    dimensions.push({
      key: 'rads',
      label: 'RADS 类别标注',
      score: radsScore,
      max: 15,
      weight: 0.15,
      issues: input.radsCategory ? [] : ['建议补充 RADS 分类'],
    })

    // 4. 结论清晰度
    let clarity = 0
    if (conclusion.length > 10) clarity += 5
    if (conclusion.length > 30) clarity += 5
    if (/[。，.;；]/.test(conclusion)) clarity += 5
    total += clarity
    dimensions.push({
      key: 'clarity',
      label: '结论清晰度',
      score: clarity,
      max: 15,
      weight: 0.15,
      issues: clarity < 10 ? ['结论过于简短'] : [],
    })

    // 5. 长度
    const findingsLen = findings.length
    const lenScore = findingsLen < 20 ? 3 : findingsLen < 100 ? 7 : 10
    total += lenScore
    dimensions.push({
      key: 'length',
      label: '长度合理性',
      score: lenScore,
      max: 10,
      weight: 0.1,
      issues: findingsLen < 20 ? ['所见过短'] : findingsLen > 1000 ? ['所见过长'] : [],
    })

    // 6. 黑名单
    const blackHit = BLACKLIST.filter((w) => findings.includes(w) || conclusion.includes(w))
    const blackScore = Math.max(0, 10 - blackHit.length * 5)
    total += blackScore
    dimensions.push({
      key: 'blacklist',
      label: '黑名单规避',
      score: blackScore,
      max: 10,
      weight: 0.1,
      issues: blackHit.length > 0 ? [`禁用词:${blackHit.join(',')}`] : [],
    })

    // 7. 危急值
    const criticalScore = input.hasCritical ? 0 : 5
    total += criticalScore
    dimensions.push({
      key: 'critical',
      label: '危急值标注',
      score: criticalScore,
      max: 5,
      weight: 0.05,
      issues: [],
    })

    // 8. 审核
    const verifyScore = input.verified ? 5 : 0
    total += verifyScore
    dimensions.push({
      key: 'verified',
      label: '审核完成',
      score: verifyScore,
      max: 5,
      weight: 0.05,
      issues: input.verified ? [] : ['报告未审核'],
    })

    const grade: QualityEvaluation['grade'] =
      total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F'

    const suggestions: string[] = []
    dimensions.forEach((d) => d.issues.forEach((i) => suggestions.push(`${d.label}:${i}`)))
    if (total < 70) suggestions.push('报告质量未达 C 级')

    return {
      id: 'eval-' + Date.now(),
      reportId: input.reportId,
      totalScore: total,
      grade,
      dimensions,
      evaluatedAt: new Date().toISOString(),
      suggestions,
    }
  }

  /**
   * 历史(GET history)
   */
  async getHistory(reportId: string) {
    const model = (this.prisma as any).reportQualityScore
    if (!model?.findMany) return []
    return model.findMany({
      where: { reportId },
      orderBy: { evaluatedAt: 'desc' },
      take: 50,
    })
  }

  /**
   * 趋势(GET trend) — 返回最近 N 次评分
   */
  async getTrend(reportId: string, days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000)
    const model = (this.prisma as any).reportQualityScore
    if (!model?.findMany) return []
    return model.findMany({
      where: { reportId, evaluatedAt: { gte: cutoff } },
      orderBy: { evaluatedAt: 'asc' },
    })
  }

  /**
   * 重评(POST re-evaluate)
   */
  async reEvaluate(reportId: string, dto: EvaluateDto) {
    // 获取最近一次评分
    const last = await this.getHistory(reportId)
    if (last.length === 0) {
      throw new NotFoundException(`No history for report ${reportId}`)
    }
    return this.evaluate(dto)
  }
}
