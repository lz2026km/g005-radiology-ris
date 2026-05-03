import React, { useState, useCallback } from 'react';

// Types
interface TemplateItem {
  id: string;
  name: string;
  category: string;
}

interface HistoryReport {
  id: string;
  patientName: string;
  patientId: string;
  examType: string;
  template: string;
  date: string;
  findings: string;
  diagnosis: string;
}

interface ReportFormData {
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  examDate: string;
  modality: string;
  bodyPart: string;
  template: string;
  scanningParams: string;
  aiFindings: string;
  description: string;
  diagnosis: string;
  recommendation: string;
}

// Mock data
const CT_TEMPLATES: TemplateItem[] = [
  { id: 'ct-head', name: 'CT头部', category: 'CT' },
  { id: 'ct-chest', name: 'CT胸部', category: 'CT' },
  { id: 'ct-abdomen', name: 'CT腹部', category: 'CT' },
  { id: 'ct-pelvis', name: 'CT骨盆', category: 'CT' },
  { id: 'ct-spine', name: 'CT脊柱', category: 'CT' },
];

const MRI_TEMPLATES: TemplateItem[] = [
  { id: 'mri-head', name: 'MRI头部', category: 'MRI' },
  { id: 'mri-abdomen', name: 'MRI腹部', category: 'MRI' },
  { id: 'mri-joint', name: 'MRI关节', category: 'MRI' },
];

const HISTORY_REPORTS: HistoryReport[] = [
  {
    id: 'RPT001',
    patientName: '张三',
    patientId: 'P20240001',
    examType: 'CT',
    template: 'CT头部',
    date: '2024-03-15',
    findings: '左侧额叶见类圆形低密度影，边界清晰，大小约12mm×10mm，周围无水肿。余脑实质未见异常密度影。',
    diagnosis: '左侧额叶良性病灶，建议随访复查。',
  },
  {
    id: 'RPT002',
    patientName: '李四',
    patientId: 'P20240002',
    examType: 'CT',
    template: 'CT胸部',
    date: '2024-03-12',
    findings: '双肺纹理清晰，右肺上叶见磨玻璃结节，直径约6mm，边界模糊。余未见异常。',
    diagnosis: '右肺上叶磨玻璃结节，建议6个月后复查。',
  },
  {
    id: 'RPT003',
    patientName: '王五',
    patientId: 'P20240003',
    examType: 'MRI',
    template: 'MRI头部',
    date: '2024-03-10',
    findings: '颅内未见明显异常信号，脑室系统未见扩大，中线结构居中。',
    diagnosis: '颅脑MRI未见明显异常。',
  },
  {
    id: 'RPT004',
    patientName: '赵六',
    patientId: 'P20240004',
    examType: 'CT',
    template: 'CT腹部',
    date: '2024-03-08',
    findings: '肝右叶见血管瘤，直径约25mm，边界清晰。胆囊、脾脏、胰腺未见异常。',
    diagnosis: '肝血管瘤，建议定期复查。',
  },
  {
    id: 'RPT005',
    patientName: '钱七',
    patientId: 'P20240005',
    examType: 'MRI',
    template: 'MRI关节',
    date: '2024-03-05',
    findings: '左膝关节半月板未见撕裂信号，十字韧带走行正常，关节腔未见积液。',
    diagnosis: '左膝关节MRI未见明显异常。',
  },
];

const AIStructuredReportPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ct' | 'mri'>('ct');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReportFormData>({
    patientName: '',
    patientId: '',
    age: '',
    gender: '男',
    examDate: new Date().toISOString().split('T')[0],
    modality: 'CT',
    bodyPart: '',
    template: '',
    scanningParams: '',
    aiFindings: '',
    description: '',
    diagnosis: '',
    recommendation: '',
  });

  const handleTemplateSelect = useCallback((template: TemplateItem) => {
    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
      template: template.name,
      modality: template.category,
      bodyPart: template.name.replace(/^(CT|MRI)/, ''),
      aiFindings: generateAIFindings(template),
    }));
  }, []);

  const generateAIFindings = (template: TemplateItem): string => {
    const aiFindingsMap: Record<string, string> = {
      'ct-head': 'AI检测: 脑实质密度均匀，未见明显异常密度灶。脑室系统形态正常。',
      'ct-chest': 'AI检测: 双肺透过度正常，纹理清晰，未见明显结节或浸润灶。',
      'ct-abdomen': 'AI检测: 肝脏密度均匀，未见异常密度影。胆囊形态正常。',
      'ct-pelvis': 'AI检测: 盆腔内脏器形态正常，未见异常肿块。',
      'ct-spine': 'AI检测: 椎体形态正常，椎间盘未见突出。脊髓未见异常信号。',
      'mri-head': 'AI检测: 颅内未见异常信号，脑室系统未见扩大。',
      'mri-abdomen': 'AI检测: 腹部脏器信号正常，未见异常强化灶。',
      'mri-joint': 'AI检测: 关节结构完整，软骨信号均匀，未见撕裂征象。',
    };
    return aiFindingsMap[template.id] || '';
  };

  const handleVoiceRecord = useCallback(() => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  }, [isRecording]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleHistorySelect = useCallback((report: HistoryReport) => {
    setFormData(prev => ({
      ...prev,
      patientName: report.patientName,
      patientId: report.patientId,
      template: report.template,
      description: report.findings,
      diagnosis: report.diagnosis,
    }));
    setExpandedHistory(null);
  }, []);

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSubmit = useCallback(() => {
    alert('报告已提交保存！');
  }, []);

  const templates = activeTab === 'ct' ? CT_TEMPLATES : MRI_TEMPLATES;

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
    },
    title: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#3b82f6',
      margin: 0,
    },
    voiceButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    leftPanel: {
      width: '280px',
      backgroundColor: '#1e293b',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    panelHeader: {
      padding: '16px',
      borderBottom: '1px solid #334155',
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
    },
    tab: {
      flex: 1,
      padding: '8px 12px',
      backgroundColor: 'transparent',
      color: '#94a3b8',
      border: '1px solid #334155',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    tabActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6',
    },
    templateList: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '12px',
    },
    templateItem: {
      padding: '12px 16px',
      marginBottom: '8px',
      backgroundColor: selectedTemplate ? '#334155' : '#0f172a',
      border: `1px solid ${selectedTemplate ? '#3b82f6' : '#334155'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
    },
    templateName: {
      color: selectedTemplate ? '#3b82f6' : '#e2e8f0',
      fontWeight: 500,
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    formSection: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '24px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#3b82f6',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid #334155',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
    },
    formGrid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    label: {
      fontSize: '12px',
      color: '#94a3b8',
      marginBottom: '4px',
    },
    input: {
      padding: '8px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
    },
    select: {
      padding: '8px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
    },
    textarea: {
      padding: '12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    aiField: {
      padding: '12px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '6px',
      fontSize: '13px',
      color: '#93c5fd',
      lineHeight: 1.6,
    },
    bottomBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: '#1e293b',
      borderTop: '1px solid #334155',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
    },
    button: {
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    buttonSecondary: {
      backgroundColor: '#334155',
      color: '#e2e8f0',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1px solid #3b82f6',
    },
    historyPanel: {
      position: 'absolute' as const,
      right: '24px',
      top: '80px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      overflow: 'hidden',
      zIndex: 100,
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    },
    historyHeader: {
      padding: '16px',
      borderBottom: '1px solid #334155',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#3b82f6',
    },
    historyList: {
      maxHeight: '400px',
      overflowY: 'auto' as const,
    },
    historyItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #334155',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    historyItemHover: {
      backgroundColor: '#334155',
    },
    historyItemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    historyPatientName: {
      fontWeight: 500,
      color: '#e2e8f0',
    },
    historyMeta: {
      fontSize: '12px',
      color: '#64748b',
    },
    historyFindings: {
      fontSize: '13px',
      color: '#94a3b8',
      lineHeight: 1.5,
    },
    historyExpand: {
      padding: '8px 16px',
      backgroundColor: '#0f172a',
      fontSize: '12px',
      color: '#64748b',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '18px',
    },
    previewOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    previewModal: {
      width: '800px',
      maxHeight: '90vh',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      color: '#1e293b',
    },
    previewHeader: {
      padding: '16px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    previewContent: {
      padding: '24px',
      maxHeight: '70vh',
      overflowY: 'auto' as const,
    },
    previewTitle: {
      fontSize: '18px',
      fontWeight: 600,
      textAlign: 'center' as const,
      marginBottom: '24px',
      color: '#1e293b',
    },
    previewSection: {
      marginBottom: '16px',
    },
    previewLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
    },
    previewValue: {
      fontSize: '14px',
      color: '#1e293b',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>AI结构化报告系统</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            当前用户: 医生001
          </span>
          <button
            style={styles.voiceButton}
            onClick={handleVoiceRecord}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              {isRecording ? (
                <rect x="6" y="6" width="12" height="12" rx="2" />
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              )}
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            {isRecording ? '停止录音' : '语音录入'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Template Selection */}
        <aside style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'ct' ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab('ct')}
              >
                CT模板
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'mri' ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab('mri')}
              >
                MRI模板
              </button>
            </div>
          </div>
          <div style={styles.templateList}>
            {templates.map(template => (
              <div
                key={template.id}
                style={{
                  ...styles.templateItem,
                  borderColor: selectedTemplate === template.id ? '#3b82f6' : '#334155',
                  backgroundColor: selectedTemplate === template.id ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                }}
                onClick={() => handleTemplateSelect(template)}
              >
                <span style={{
                  ...styles.templateName,
                  color: selectedTemplate === template.id ? '#3b82f6' : '#e2e8f0',
                }}>
                  {template.name}
                </span>
              </div>
            ))}
          </div>

          {/* History Reports Reference */}
          <div style={{ borderTop: '1px solid #334155', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
              历史报告参考
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {HISTORY_REPORTS.slice(0, 3).map(report => (
                <div
                  key={report.id}
                  style={{
                    ...styles.historyItem,
                    padding: '8px 12px',
                    borderBottom: '1px solid #334155',
                  }}
                  onClick={() => handleHistorySelect(report)}
                >
                  <div style={styles.historyItemHeader}>
                    <span style={styles.historyPatientName}>{report.patientName}</span>
                    <span style={{ ...styles.historyMeta, fontSize: '11px' }}>{report.template}</span>
                  </div>
                  <div style={{ ...styles.historyMeta, fontSize: '11px' }}>
                    {report.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel - Report Form */}
        <main style={styles.rightPanel}>
          <div style={styles.formSection}>
            {/* Examination Info */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>检查信息</h2>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>患者姓名</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="请输入患者姓名"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>患者ID</label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="请输入患者ID"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>年龄</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="请输入年龄"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>性别</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>检查日期</label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>模板类型</label>
                  <input
                    type="text"
                    name="template"
                    value={formData.template}
                    readOnly
                    style={{ ...styles.input, backgroundColor: '#1e293b' }}
                  />
                </div>
              </div>
            </section>

            {/* Scanning Parameters */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>扫描参数</h2>
              <div style={styles.formGroup}>
                <textarea
                  name="scanningParams"
                  value={formData.scanningParams}
                  onChange={handleInputChange}
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  placeholder="请输入扫描参数..."
                />
              </div>
            </section>

            {/* AI Auto-fill Fields */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>AI自动填充</h2>
              <div style={styles.aiField}>
                {formData.aiFindings || '选择模板后AI将自动分析并填充发现内容...'}
              </div>
            </section>

            {/* Description */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>描述</h2>
              <div style={styles.formGroup}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="请输入检查描述..."
                />
              </div>
            </section>

            {/* Diagnosis */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>诊断意见</h2>
              <div style={styles.formGrid2}>
                <div style={styles.formGroup}>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="请输入诊断意见..."
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>建议</label>
                  <textarea
                    name="recommendation"
                    value={formData.recommendation}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="请输入后续建议..."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Bar */}
          <div style={styles.bottomBar}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setExpandedHistory(expandedHistory ? null : 'main')}
            >
              历史报告 ({HISTORY_REPORTS.length})
            </button>
            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.button, ...styles.buttonOutline }}
                onClick={handlePreview}
              >
                预览
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handleSubmit}
              >
                保存报告
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handlePrint}
              >
                打印
              </button>
            </div>
          </div>
        </main>

        {/* History Reports Panel */}
        {expandedHistory && (
          <div style={styles.historyPanel}>
            <div style={styles.historyHeader}>
              <span style={styles.historyTitle}>历史报告参考</span>
              <button
                style={styles.closeButton}
                onClick={() => setExpandedHistory(null)}
              >
                ×
              </button>
            </div>
            <div style={styles.historyList}>
              {HISTORY_REPORTS.map(report => (
                <div key={report.id}>
                  <div
                    style={styles.historyItem}
                    onClick={() => handleHistorySelect(report)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={styles.historyItemHeader}>
                      <span style={styles.historyPatientName}>{report.patientName}</span>
                      <span style={styles.historyMeta}>{report.date}</span>
                    </div>
                    <div style={styles.historyMeta}>
                      ID: {report.patientId} | {report.examType} | {report.template}
                    </div>
                    <div style={{ ...styles.historyFindings, marginTop: '8px' }}>
                      {report.findings.substring(0, 60)}...
                    </div>
                  </div>
                  <div
                    style={styles.historyExpand}
                    onClick={() => setExpandedHistory(expandedHistory === report.id ? null : report.id)}
                  >
                    {expandedHistory === report.id ? '收起详情' : '展开详情'}
                  </div>
                  {expandedHistory === report.id && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#0f172a' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={styles.historyMeta}>诊断:</div>
                        <div style={{ ...styles.historyFindings, color: '#e2e8f0' }}>
                          {report.diagnosis}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={styles.previewOverlay} onClick={() => setShowPreview(false)}>
          <div style={styles.previewModal} onClick={e => e.stopPropagation()}>
            <div style={styles.previewHeader}>
              <span style={{ fontWeight: 600 }}>报告预览</span>
              <button
                style={styles.closeButton}
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.previewContent}>
              <div style={styles.previewTitle}>医学影像检查报告</div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>患者信息</div>
                <div style={styles.previewValue}>
                  姓名: {formData.patientName || '-'} | ID: {formData.patientId || '-'} |
                  年龄: {formData.age || '-'} | 性别: {formData.gender}
                </div>
              </div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>检查信息</div>
                <div style={styles.previewValue}>
                  检查日期: {formData.examDate} | 检查类型: {formData.modality} | 
                  部位: {formData.bodyPart} | 模板: {formData.template}
                </div>
              </div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>AI辅助发现</div>
                <div style={{ ...styles.previewValue, color: '#3b82f6' }}>
                  {formData.aiFindings || '-'}
                </div>
              </div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>检查描述</div>
                <div style={styles.previewValue}>
                  {formData.description || '-'}
                </div>
              </div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>诊断意见</div>
                <div style={{ ...styles.previewValue, fontWeight: 600 }}>
                  {formData.diagnosis || '-'}
                </div>
              </div>

              <div style={styles.previewSection}>
                <div style={styles.previewLabel}>建议</div>
                <div style={styles.previewValue}>
                  {formData.recommendation || '-'}
                </div>
              </div>

              <div style={{
                marginTop: '32px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#64748b',
              }}>
                <span>报告医生: 医生001</span>
                <span>审核医生: __________</span>
                <span>报告时间: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStructuredReportPage;
