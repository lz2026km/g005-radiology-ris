// P2: ReportWritePage拆分为ReportEditor/TemplatePicker/HistoryPanel
import React from 'react'

// ============================================================
// ReportEditor - 报告编辑核心组件
// 包含：检查选择、报告表单、AI辅助、模板选择、版本历史
// ============================================================

interface ReportEditorProps {
  examId: string
  onSave?: () => void
  onSubmit?: () => void
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ examId, onSave, onSubmit }) => {
  return (
    <div className="report-editor" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 报告表单区域 */}
      <div className="report-form-area">
        {/* 检查信息 */}
        <div className="exam-info-section">
          {/* 患者基本信息 */}
        </div>
        
        {/* 报告描述区域 */}
        <div className="findings-section">
          <textarea 
            placeholder="检查所见..."
            style={{ width: '100%', minHeight: 200 }}
          />
        </div>
        
        {/* 诊断意见 */}
        <div className="diagnosis-section">
          <textarea 
            placeholder="诊断意见..."
            style={{ width: '100%', minHeight: 100 }}
          />
        </div>
        
        {/* 印象/结论 */}
        <div className="impression-section">
          <textarea 
            placeholder="印象..."
            style={{ width: '100%', minHeight: 80 }}
          />
        </div>
        
        {/* 建议 */}
        <div className="recommendation-section">
          <textarea 
            placeholder="建议..."
            style={{ width: '100%', minHeight: 60 }}
          />
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="report-actions" style={{ display: 'flex', gap: 12 }}>
        <button onClick={onSave}>保存</button>
        <button onClick={onSubmit}>提交报告</button>
      </div>
    </div>
  )
}

// ============================================================
// TemplatePicker - 模板选择器组件
// 功能：快捷模板选择、常用短语、报告词库
// ============================================================

interface TemplateItem {
  id: string
  name: string
  content: string
  modality?: string
  bodyPart?: string
}

interface TemplatePickerProps {
  examType?: string
  onSelectTemplate?: (template: TemplateItem) => void
  onSelectPhrase?: (phrase: string) => void
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ examType, onSelectTemplate, onSelectPhrase }) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [category, setCategory] = React.useState('all')
  
  return (
    <div className="template-picker" style={{ padding: 16 }}>
      {/* 搜索框 */}
      <div className="search-area" style={{ marginBottom: 16 }}>
        <input 
          type="text" 
          placeholder="搜索模板..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px 12px' }}
        />
      </div>
      
      {/* 分类筛选 */}
      <div className="category-filter" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺'].map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            style={{ 
              padding: '4px 12px',
              background: category === cat ? '#3b82f6' : '#e2e8f0',
              color: category === cat ? '#fff' : '#64748b',
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* 模板列表 */}
      <div className="template-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {/* 模板项 */}
      </div>
      
      {/* 常用短语 */}
      <div className="phrase-section" style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>常用短语</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['未见异常', '建议随访', '建议增强', '建议MRI检查'].map(phrase => (
            <span 
              key={phrase}
              onClick={() => onSelectPhrase?.(phrase)}
              style={{ 
                padding: '4px 8px',
                background: '#f1f5f9',
                borderRadius: 4,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// HistoryPanel - 历史报告面板
// 功能：患者历史报告、对比视图、版本追踪
// ============================================================

interface HistoryReport {
  id: string
  examDate: string
  examType: string
  modality: string
  findings: string
  diagnosis: string
  reportDoctor: string
  signedTime: string
}

interface HistoryPanelProps {
  patientId?: string
  currentReportId?: string
  onCompare?: (reportId: string) => void
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ patientId, currentReportId, onCompare }) => {
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(null)
  const [showDiff, setShowDiff] = React.useState(false)
  
  // 模拟历史数据
  const historyReports: HistoryReport[] = React.useMemo(() => [
    {
      id: 'H001',
      examDate: '2026-05-20',
      examType: '胸部CT平扫',
      modality: 'CT',
      findings: '双肺野透亮度正常，肺纹理清晰，走行自然。',
      diagnosis: '胸部CT平扫未见明显异常。',
      reportDoctor: '张三',
      signedTime: '2026-05-20 10:30'
    },
    {
      id: 'H002',
      examDate: '2026-03-15',
      examType: '腹部CT增强',
      modality: 'CT',
      findings: '肝实质密度均匀，未见异常密度影。',
      diagnosis: '腹部CT增强未见明显异常。',
      reportDoctor: '李四',
      signedTime: '2026-03-15 14:20'
    }
  ], [patientId])
  
  return (
    <div className="history-panel" style={{ padding: 16 }}>
      {/* 标题 */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
        历史报告 ({historyReports.length})
      </h3>
      
      {/* 历史列表 */}
      <div className="history-list" style={{ maxHeight: 400, overflowY: 'auto' }}>
        {historyReports.map(report => (
          <div 
            key={report.id}
            onClick={() => setSelectedHistoryId(report.id)}
            style={{
              padding: 12,
              marginBottom: 8,
              background: selectedHistoryId === report.id ? '#eff6ff' : '#f8fafc',
              borderRadius: 6,
              border: `1px solid ${selectedHistoryId === report.id ? '#3b82f6' : '#e2e8f0'}`,
              cursor: 'pointer'
            }}
          >
            {/* 检查信息 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                {report.examType}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{report.modality}</span>
            </div>
            
            {/* 日期 */}
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
              {report.examDate}
            </div>
            
            {/* 诊断摘要 */}
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>
              {report.diagnosis.slice(0, 50)}...
            </div>
            
            {/* 医生 */}
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              报告医生: {report.reportDoctor} · {report.signedTime}
            </div>
            
            {/* 对比按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCompare?.(report.id)
              }}
              style={{
                marginTop: 8,
                padding: '4px 12px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 4,
                border: 'none',
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              对比
            </button>
          </div>
        ))}
      </div>
      
      {/* 暂无历史 */}
      {historyReports.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 32, 
          color: '#94a3b8',
          fontSize: 13 
        }}>
          暂无历史报告
        </div>
      )}
    </div>
  )
}

export default {
  ReportEditor,
  TemplatePicker,
  HistoryPanel
}