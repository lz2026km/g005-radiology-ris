// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 多模态 AI 推理 (视觉+文本)
// 模拟 vision-language 模型 (VLM) 输出: 文本报告 + 注意力图
// ============================================================

import type {
  MultimodalInput,
  MultimodalResult,
  AttentionMap,
  RegistrationStudy,
} from '../../../types/fusion'
import { createMockAttentionMap } from '../../../data/fusionMock'

const TEMPLATES_LUNG: string[] = [
  '右肺{pos}可见一大小约 {w}×{h}mm 结节影,边界{clear},呈分叶状,边缘可见{spiculation},内部密度不均匀,增强扫描呈{enhance}(SUVmax={suv})。考虑周围型肺癌可能性大,建议穿刺活检明确诊断。',
  '右肺{pos}见磨玻璃结节(GGN),约 {w}×{h}mm,边界清,内部密度均匀,未见实性成分及毛刺征(SUVmax={suv})。考虑肺腺癌前驱病变可能,建议 3 个月随访。',
  '左肺下叶背段实性肿块,大小 {w}×{h}×{d}mm,边缘呈分叶状伴胸膜凹陷,增强明显强化(SUVmax={suv}),伴纵隔多发肿大淋巴结(短径 {ln}mm)。考虑中央型肺癌伴纵隔淋巴结转移。',
]

const TEMPLATES_BREAST: string[] = [
  '左乳{quadrant}象限可见一不规则肿块影,大小约 {w}×{h}mm,边缘呈毛刺状,内部信号不均匀,T1WI 呈低信号,T2WI 呈稍高信号,DWI 弥散受限(ADC≈{adc}),动态增强呈"{curve}"强化模式(BI-RADS {birads} 类)。考虑乳腺癌可能性大。',
  '右乳外上象限簇状分布细小多形性钙化,范围约 {w}×{h}mm,未见明确肿块影。BI-RADS {birads} 类。建议活检以排除导管原位癌。',
]

const TEMPLATES_BRAIN: string[] = [
  '右侧大脑半球{pos}可见一异常信号灶,T1WI 呈稍低信号,T2WI/FLAIR 呈高信号,DWI 弥散轻度受限,大小约 {w}×{h}mm,周围轻度水肿,占位效应不明显。考虑脑梗死(亚急性期)可能。',
  '鞍区见一大小约 {w}×{h}mm 类圆形异常信号,T1WI 呈等信号,T2WI 呈稍高信号,增强扫描呈明显均匀强化,垂体柄偏移。考虑垂体腺瘤可能。',
]

const TEMPLATES_PROSTATE: string[] = [
  '前列腺外周带{pos}可见一 T2WI 低信号结节,大小约 {w}×{h}mm,DWI 明显弥散受限(ADC≈{adc}),动态增强呈早期强化。PI-RADS {pirads} 分,考虑前列腺癌可能,建议穿刺活检。',
]

const TEMPLATES_BONE: string[] = [
  '{pos}椎体可见异常信号,T1WI 呈低信号,T2WI 压脂呈高信号,增强扫描呈不均匀强化,椎体形态变扁(压缩约 {pct}%)。考虑病理性骨折(转移瘤可能)。',
]

const POS = ['上叶尖后段', '上叶前段', '中叶', '下叶背段', '下叶基底段']
const QUADRANTS = ['外上', '外下', '内上', '内下', '中央区']
const ENHANCE = ['轻度强化', '中度强化', '明显不均匀强化']
const SPICULATION = ['毛刺征', '短毛刺', '深分叶征']
const CLEAR = ['欠清', '尚清', '清晰']
const CURVE = ['快进快出', '快进慢出', '持续强化', '平台型']
const BIRADS = ['4A', '4B', '4C', '5', '6']
const PIRADS = ['3', '4', '5']

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!
}

function fmt(num: number, digits = 0): string {
  return num.toFixed(digits)
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function fillTemplate(tpl: string, seed: number): string {
  return tpl
    .replace('{pos}', pick(POS, seed))
    .replace('{w}', fmt(12 + (seed % 18)))
    .replace('{h}', fmt(10 + ((seed >> 3) % 14)))
    .replace('{d}', fmt(10 + ((seed >> 5) % 16)))
    .replace('{clear}', pick(CLEAR, seed >> 1))
    .replace('{spiculation}', pick(SPICULATION, seed >> 2))
    .replace('{enhance}', pick(ENHANCE, seed >> 3))
    .replace('{suv}', fmt(2 + (seed % 14) + Math.random(), 1))
    .replace('{quadrant}', pick(QUADRANTS, seed >> 1))
    .replace('{adc}', fmt(0.7 + ((seed % 8) / 30), 2))
    .replace('{curve}', pick(CURVE, seed >> 2))
    .replace('{birads}', pick(BIRADS, seed >> 3))
    .replace('{pirads}', pick(PIRADS, seed >> 3))
    .replace('{ln}', fmt(8 + (seed % 12)))
    .replace('{pct}', fmt(15 + (seed % 40)))
}

function pickTemplateSet(modality: string | undefined, bodyPart: string | undefined): string[] {
  if (!modality) return TEMPLATES_LUNG
  const m = modality.toUpperCase()
  const bp = (bodyPart ?? '').toLowerCase()
  if (/pet/.test(m) && (bp.includes('胸') || bp.includes('肺'))) return TEMPLATES_LUNG
  if (m.includes('MR') && bp.includes('乳腺')) return TEMPLATES_BREAST
  if (m.includes('MR') && (bp.includes('头') || bp.includes('脑'))) return TEMPLATES_BRAIN
  if (m.includes('MR') && bp.includes('盆腔')) return TEMPLATES_PROSTATE
  if (m.includes('MR') && bp.includes('脊柱')) return TEMPLATES_BONE
  return TEMPLATES_LUNG
}

function pickBodyPartLabel(modality: string | undefined, bodyPart: string | undefined): string {
  if (bodyPart) return bodyPart
  if (!modality) return '胸部'
  if (/pet/.test(modality.toUpperCase())) return '胸部'
  if (modality.toUpperCase().includes('MR')) return '头颅'
  return '胸部'
}

/**
 * 多模态推理引擎 (mock)
 * 提供 infer() / getAttentionMap() 方法
 */
export class MultimodalInference {
  private history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  private lastAttention: AttentionMap | null = null
  private lastResult: MultimodalResult | null = null

  /** 主推理入口 */
  async infer(input: MultimodalInput): Promise<MultimodalResult> {
    const start = performance.now()
    const seed = hashStr(`${input.study.studyId}:${input.text}`)
    const bodyPart = pickBodyPartLabel(input.study.modality, input.study.bodyPart)
    const templates = pickTemplateSet(input.study.modality, bodyPart)
    const tpl = pick(templates, seed)
    const text = fillTemplate(tpl, seed)
    // 模拟 800-1500ms 推理
    await new Promise((r) => setTimeout(r, 800 + (seed % 700)))
    const attention = this.buildAttentionMap(input.study, seed)
    this.lastAttention = attention
    const findings = this.extractFindings(text, attention)
    const result: MultimodalResult = {
      id: `mm-${Date.now()}-${seed % 9999}`,
      text,
      attention,
      inferenceTimeMs: Math.round(performance.now() - start),
      confidence: 0.78 + ((seed % 18) / 100),
      findings,
      tokens: {
        input: 220 + (input.text.length * 2) + (input.study.imageIds?.length ?? 1) * 12,
        output: text.length * 2,
      },
    }
    this.lastResult = result
    this.history.push({ role: 'user', content: input.text })
    this.history.push({ role: 'assistant', content: text })
    return result
  }

  /** 获取最近一次注意力图 */
  getAttentionMap(): AttentionMap | null {
    return this.lastAttention
  }

  /** 获取最近一次结果 */
  getLastResult(): MultimodalResult | null {
    return this.lastResult
  }

  /** 获取历史 */
  getHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.history]
  }

  /** 重置历史 */
  reset(): void {
    this.history = []
    this.lastAttention = null
    this.lastResult = null
  }

  private buildAttentionMap(_study: RegistrationStudy, seed: number): AttentionMap {
    const cx = 0.4 + ((seed % 30) / 100)
    const cy = 0.45 + (((seed >> 4) % 25) / 100)
    const maxScore = 0.75 + ((seed % 20) / 100)
    return createMockAttentionMap(256, 256, cx, cy, maxScore)
  }

  private extractFindings(text: string, attention: AttentionMap): MultimodalResult['findings'] {
    // 简化: 从 text 中匹配尺寸/位置描述, 关联到注意力图 hotspots
    const findings: MultimodalResult['findings'] = []
    const regex = /(.{2,8}可见一大小.{1,30}?mm)/g
    let m: RegExpExecArray | null
    let i = 0
    while ((m = regex.exec(text)) !== null && i < attention.hotspots.length) {
      const h = attention.hotspots[i]!
      findings.push({
        text: m[1] ?? '',
        score: Number((0.7 + h.score * 0.25).toFixed(2)),
        bbox: { x: h.x - 16, y: h.y - 16, w: 32, h: 32 },
      })
      i++
    }
    if (findings.length === 0 && attention.hotspots.length > 0) {
      const h = attention.hotspots[0]!
      findings.push({
        text: '影像异常区',
        score: Number(h.score.toFixed(2)),
        bbox: { x: h.x - 16, y: h.y - 16, w: 32, h: 32 },
      })
    }
    return findings
  }
}

export const multimodalInference = new MultimodalInference()

export default MultimodalInference
