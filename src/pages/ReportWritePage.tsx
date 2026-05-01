// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 报告书写 v0.1.0
// 参照GE Centricity/东软报告书写界面设计
// 支持模板填充/词库辅助/危急值标注/结构化报告
// ============================================================
import { useState, useMemo } from 'react'
import { Search, FileText, Save, Send, AlertTriangle, CheckCircle, BookOpen, ShieldAlert, Printer, Clock, X, Plus } from 'lucide-react'
import { initialRadiologyReports, initialRadiologyExams, initialReportTemplates, initialTermLibrary, initialUsers } from '../data/initialData'
import type { RadiologyReport, ReportTemplate } from '../types'

// 模板类别
const TEMPLATE_CATEGORIES = [
  { label: '头颅CT', modality: 'CT', bodyPart: '头颅', color: '#3b82f6' },
  { label: '胸部CT', modality: 'CT', bodyPart: '胸部', color: '#22c55e' },
  { label: '上腹部CT', modality: 'CT', bodyPart: '腹部', color: '#f59e0b' },
  { label: '冠脉CTA', modality: 'CT', bodyPart: '心脏', color: '#dc2626' },
  { label: '头颅MR', modality: 'MR', bodyPart: '头颅', color: '#8b5cf6' },
  { label: '脊柱MR', modality: 'MR', bodyPart: '脊柱', color: '#06b6d4' },
  { label: '胸部DR', modality: 'DR', bodyPart: '胸部', color: '#10b981' },
  { label: '冠脉DSA', modality: 'DSA', bodyPart: '心脏', color: '#f97316' },
  { label: '乳腺钼靶', modality: '乳腺钼靶', bodyPart: '胸部', color: '#ec4899' },
]

// 危急值提示词库
const CRITICAL_TERMS = [
  '大量气胸（肺组织压缩>50%）',
  '大量胸腔积液',
  '急性心肌梗死改变',
  '大面积脑梗死（超过一个脑叶）',
  '颅内出血（外伤性/自发性）',
  '主动脉夹层',
  '肺栓塞',
  '消化道穿孔',
  '肠系膜血栓',
  '急性胰腺炎坏死',
]

export default function ReportWritePage() {
  const [search, setSearch] = useState('')
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [examSearch, setExamSearch] = useState('')
  const [template, setTemplate] = useState<ReportTemplate | null>(null)
  const [showTermLib, setShowTermLib] = useState(false)
  const [showCritical, setShowCritical] = useState(false)
  const [activeTab, setActiveTab] = useState<'findings' | 'diagnosis' | 'impression'>('findings')

  const exams = initialRadiologyExams
  const reports = initialRadiologyReports
  const templates = initialReportTemplates
  const termLib = initialTermLibrary
  const users = initialUsers

  // 待报告的检查
  const pendingExams = useMemo(() => exams.filter(e => ['待报告', '检查中'].includes(e.status) && !reports.some(r => r.examId === e.id)), [exams, reports])

  const selectedExam = exams.find(e => e.id === selectedExamId)
  const existingReport = reports.find(r => r.examId === selectedExamId)

  // 表单状态
  const [findings, setFindings] = useState(existingReport?.examFindings || '')
  const [diagnosis, setDiagnosis] = useState(existingReport?.diagnosis || '')
  const [impression, setImpression] = useState(existingReport?.impression || '')
  const [recommendations, setRecommendations] = useState(existingReport?.recommendations || '')
  const [criticalFinding, setCriticalFinding] = useState(existingReport?.criticalFinding || false)
  const [criticalDetails, setCriticalDetails] = useState(existingReport?.criticalFindingDetails || '')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const applyTemplate = (tpl: ReportTemplate) => {
    setFindings(tpl.content.replace(/^【.*】$/gm, ''))
    setSelectedTemplateId(tpl.id)
    setTemplate(tpl)
  }

  const insertTerm = (term: string) => {
    if (activeTab === 'findings') setFindings(prev => prev + term)
    else if (activeTab === 'diagnosis') setDiagnosis(prev => prev + term)
    else setImpression(prev => prev + term)
  }

  const filteredTerms = useMemo(() => {
    if (!examSearch) return termLib.slice(0, 20)
    return termLib.filter(t => t.keyword.includes(examSearch) || t.fullTerm.includes(examSearch))
  }, [termLib, examSearch])

  const currentDoctor = users.find(u => u.role === '医生')

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>报告书写</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>模板填充 · 词库辅助输入 · 危急值标注 · 电子签名</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> 打印预览
          </button>
          <button style={{ padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> 保存报告
          </button>
          <button style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Send size={14} /> 提交审核
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* 左侧：待选检查列表 */}
        {!selectedExamId && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', margin: '0 0 8px' }}>待书写报告的检查</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 8, padding: '6px 12px' }}>
                <Search size={13} style={{ color: '#94a3b8' }} />
                <input value={examSearch} onChange={e => setExamSearch(e.target.value)} placeholder="搜索患者姓名 / Accession..." style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', width: '100%' }} />
              </div>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {pendingExams.filter(e => !examSearch || e.patientName.includes(examSearch) || e.accessionNumber.includes(examSearch)).map(exam => (
                <div key={exam.id} onClick={() => setSelectedExamId(exam.id)} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLDivElement).style.background = '#eff6ff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.background = '#fff' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13 }}>{exam.patientName}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: exam.modality === 'CT' ? '#eff6ff' : '#f5f3ff', color: exam.modality === 'CT' ? '#2563eb' : '#7c3aed' }}>{exam.modality}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {exam.examItemName} · {exam.gender}/{exam.age}岁 · {exam.patientType} · {exam.accessionNumber}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {exam.clinicalDiagnosis || exam.clinicalHistory}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 右侧：报告表单 */}
        {selectedExam && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 患者信息 */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#1e3a5f' }}>{selectedExam.patientName}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{selectedExam.gender} / {selectedExam.age}岁</span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>{selectedExam.patientType}</span>
                      {selectedExam.priority !== '普通' && <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#dc2626' }}>{selectedExam.priority}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>Accession: {selectedExam.accessionNumber}</div>
                  </div>
                  <button onClick={() => setSelectedExamId('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    ['检查项目', selectedExam.examItemName],
                    ['检查设备', selectedExam.deviceName?.split('（')[0]],
                    ['检查日期', selectedExam.examDate],
                    ['临床诊断', selectedExam.clinicalDiagnosis || '-'],
                    ['临床病史', (selectedExam.clinicalHistory || '-').slice(0, 30)],
                    ['影像数量', `${selectedExam.imagesAcquired} 幅`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginTop: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 报告编辑器 */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
                {/* 模板选择 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>选择报告模板</span>
                    <button onClick={() => setShowTermLib(!showTermLib)} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOpen size={11} /> 词库
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {TEMPLATE_CATEGORIES.filter(t => t.modality === selectedExam.modality).map(tpl => (
                      <button key={tpl.label} onClick={() => {
                        const found = templates.find(t => t.modality === selectedExam.modality && t.bodyPart === tpl.bodyPart)
                        if (found) applyTemplate(found)
                      }} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${tpl.color}40`, background: `${tpl.color}10`, color: tpl.color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 报告内容 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
                    {(['findings', 'diagnosis', 'impression'] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '6px 14px', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#1e40af' : 'transparent'}`, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: activeTab === tab ? '#1e40af' : '#64748b', marginBottom: -2
                      }}>
                        {tab === 'findings' ? '检查所见' : tab === 'diagnosis' ? '诊断意见' : '印象'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={activeTab === 'findings' ? findings : activeTab === 'diagnosis' ? diagnosis : impression}
                    onChange={e => {
                      if (activeTab === 'findings') setFindings(e.target.value)
                      else if (activeTab === 'diagnosis') setDiagnosis(e.target.value)
                      else setImpression(e.target.value)
                    }}
                    placeholder={
                      activeTab === 'findings' ? '【检查所见】\n请在此处详细描述影像所见...' :
                      activeTab === 'diagnosis' ? '【诊断意见】\n请在此处填写诊断结论...' :
                      '【印象】\n请在此处填写检查印象/总结...'
                    }
                    style={{ width: '100%', minHeight: 180, border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', fontSize: 13, lineHeight: 1.8, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                {/* 建议 */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>建议</span>
                  <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} placeholder="填写检查建议..." style={{ width: '100%', minHeight: 60, border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'vertical', outline: 'none', marginTop: 6, fontFamily: 'inherit' }} />
                </div>

                {/* 危急值 */}
                <div style={{ background: '#fef2f2', borderRadius: 8, padding: '12px 14px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert size={14} style={{ color: '#dc2626' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>危急值标注</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>发现危急值</span>
                      <input type="checkbox" checked={criticalFinding} onChange={e => setCriticalFinding(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#dc2626' }} />
                    </label>
                  </div>
                  {criticalFinding && (
                    <textarea value={criticalDetails} onChange={e => setCriticalDetails(e.target.value)} placeholder="请详细描述危急值情况..." style={{ width: '100%', minHeight: 60, border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: 12, resize: 'vertical', outline: 'none', background: '#fff', fontFamily: 'inherit' }} />
                  )}
                  {criticalFinding && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {CRITICAL_TERMS.map(term => (
                        <button key={term} onClick={() => setCriticalDetails(prev => prev + (prev ? '\n' : '') + term)} style={{ padding: '2px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, fontSize: 10, cursor: 'pointer' }}>
                          + {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 签名 */}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    报告医师：<span style={{ fontWeight: 600, color: '#334155' }}>{currentDoctor?.name || '-'}</span>
                    {selectedTemplateId && <span style={{ marginLeft: 12, color: '#94a3b8' }}>模板：{templates.find(t => t.id === selectedTemplateId)?.name}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date().toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧边栏：快捷工具 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* 模板词库 */}
              {showTermLib && (
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>报告词库</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', borderRadius: 6, padding: '5px 10px', marginBottom: 10 }}>
                    <Search size={12} style={{ color: '#94a3b8' }} />
                    <input value={examSearch} onChange={e => setExamSearch(e.target.value)} placeholder="搜索词条..." style={{ border: 'none', outline: 'none', fontSize: 12, background: 'transparent', width: '100%' }} />
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {filteredTerms.map(term => (
                      <div key={term.id} onClick={() => insertTerm(term.typicalFindings || term.fullTerm)} style={{ padding: '6px 8px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', border: '1px solid #f1f5f9' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#eff6ff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#bfdbfe' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9' }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{term.fullTerm}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{term.typicalDiagnosis || term.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 快捷模板 */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>快捷模板</div>
                {templates.filter(t => t.modality === selectedExam?.modality).slice(0, 6).map(tpl => (
                  <div key={tpl.id} onClick={() => applyTemplate(tpl)} style={{ padding: '6px 8px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', border: '1px solid #f1f5f9' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f5f3ff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9' }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{tpl.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>使用 {tpl.usageCount} 次</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
