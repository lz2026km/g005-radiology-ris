import React, { useState } from 'react';

// ============ Types ============
interface PatientInfo {
  name: string;
  gender: string;
  age: number;
  idNumber: string;
  phone: string;
}

interface ExamRecord {
  id: string;
  examItem: string;
  examDate: string;
  bodyPart: string;
  device: string;
  reportStatus: '已出报告' | '报告待出' | '审核中';
  hasImages: boolean;
  reportContent?: string;
}

interface ImagePreview {
  id: string;
  label: string;
  windowWidth: number;
  windowCenter: number;
  invert: boolean;
}

interface PushRecord {
  id: string;
  patientName: string;
  phone: string;
  examType: string;
  pushTime: string;
  channel: '短信' | '微信' | '邮件';
  status: '成功' | '失败' | '已查看';
  viewTime?: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
}

interface WeChatTemplate {
  id: string;
  name: string;
  content: string;
}

interface PatientReport {
  id: string;
  examType: string;
  examDate: string;
  status: '已出报告' | '报告待出';
  findings: string;
  diagnosis: string;
  advice: string;
  hasFilm: boolean;
}

// ============ Mock Data ============
const MOCK_PATIENT: PatientInfo = {
  name: '张三',
  gender: '男',
  age: 58,
  idNumber: '310101196805121234',
  phone: '138****5678',
};

const MOCK_EXAMS: ExamRecord[] = [
  {
    id: 'EXM20250501001',
    examItem: '胸部CT平扫',
    examDate: '2025-05-01',
    bodyPart: '胸部',
    device: 'GE Revolution CT',
    reportStatus: '已出报告',
    hasImages: true,
    reportContent: '检查描述：\n双肺野清晰，肺纹理走行自然，双肺门结构正常。纵隔居中，纵隔内未见明显肿大淋巴结。心脏大小形态正常。\n\n诊断意见：\n1. 双肺未见明显异常。\n2. 主动脉壁少许钙化。\n3. 肝内多发囊肿可能，建议进一步检查。',
  },
  {
    id: 'EXM20250415002',
    examItem: '颅脑MRI平扫',
    examDate: '2025-04-15',
    bodyPart: '颅脑',
    device: 'GE SIGNA Premier 3.0T',
    reportStatus: '已出报告',
    hasImages: true,
    reportContent: '检查描述：\n双侧大脑半球对称，灰白质分界清晰。脑室系统未见扩大，脑沟裂池未见增宽。中线结构居中。\n\n诊断意见：\n1. 颅脑MRI平扫未见明显异常。\n2. 左侧上颌窦囊肿。',
  },
  {
    id: 'EXM20250420003',
    examItem: '腹部彩超',
    examDate: '2025-04-20',
    bodyPart: '腹部',
    device: 'GE Voluson E10',
    reportStatus: '报告待出',
    hasImages: false,
  },
];

const MOCK_PUSH_RECORDS: PushRecord[] = [
  { id: 'P001', patientName: '张三', phone: '13812345678', examType: '胸部CT平扫', pushTime: '2025-05-01 14:30', channel: '短信', status: '已查看', viewTime: '2025-05-01 14:35' },
  { id: 'P002', patientName: '李四', phone: '13923456789', examType: '颅脑MRI平扫', pushTime: '2025-05-02 09:15', channel: '微信', status: '已查看', viewTime: '2025-05-02 09:20' },
  { id: 'P003', patientName: '王五', phone: '13734567890', examType: '腹部彩超', pushTime: '2025-05-02 10:00', channel: '邮件', status: '成功' },
  { id: 'P004', patientName: '赵六', phone: '13645678901', examType: '胸部CT平扫', pushTime: '2025-05-02 11:30', channel: '短信', status: '失败' },
  { id: 'P005', patientName: '钱七', phone: '13556789012', examType: '骨密度检测', pushTime: '2025-05-02 14:00', channel: '微信', status: '已查看', viewTime: '2025-05-02 14:10' },
  { id: 'P006', patientName: '孙八', phone: '13467890123', examType: '心脏彩超', pushTime: '2025-05-03 08:45', channel: '短信', status: '已查看', viewTime: '2025-05-03 08:50' },
  { id: 'P007', patientName: '周九', phone: '13378901234', examType: '颅脑MRI平扫', pushTime: '2025-05-03 09:30', channel: '邮件', status: '成功' },
  { id: 'P008', patientName: '吴十', phone: '13289012345', examType: '胸部CT平扫', pushTime: '2025-05-03 10:15', channel: '微信', status: '已查看', viewTime: '2025-05-03 10:25' },
  { id: 'P009', patientName: '郑十一', phone: '13190123456', examType: '腹部CT平扫', pushTime: '2025-05-03 11:00', channel: '短信', status: '失败' },
  { id: 'P010', patientName: '冯十二', phone: '13001234567', examType: '乳腺钼靶', pushTime: '2025-05-03 14:30', channel: '微信', status: '已查看', viewTime: '2025-05-03 14:35' },
  { id: 'P011', patientName: '陈十三', phone: '15812345678', examType: '胸部CT平扫', pushTime: '2025-05-04 08:00', channel: '邮件', status: '成功' },
  { id: 'P012', patientName: '褚十四', phone: '15723456789', examType: '颅脑MRI平扫', pushTime: '2025-05-04 09:00', channel: '短信', status: '已查看', viewTime: '2025-05-04 09:05' },
  { id: 'P013', patientName: '卫十五', phone: '15634567890', examType: '心脏CTA', pushTime: '2025-05-04 10:30', channel: '微信', status: '已查看', viewTime: '2025-05-04 10:40' },
  { id: 'P014', patientName: '蒋十六', phone: '15545678901', examType: '腹部彩超', pushTime: '2025-05-04 11:15', channel: '邮件', status: '成功' },
  { id: 'P015', patientName: '沈十七', phone: '15456789012', examType: '胸部CT平扫', pushTime: '2025-05-04 14:00', channel: '短信', status: '失败' },
  { id: 'P016', patientName: '韩十八', phone: '15367890123', examType: '骨盆CT平扫', pushTime: '2025-05-05 08:30', channel: '微信', status: '已查看', viewTime: '2025-05-05 08:35' },
  { id: 'P017', patientName: '杨十九', phone: '15278901234', examType: '颅脑MRI平扫', pushTime: '2025-05-05 09:15', channel: '短信', status: '已查看', viewTime: '2025-05-05 09:20' },
  { id: 'P018', patientName: '朱二十', phone: '15189012345', examType: '胸部CT平扫', pushTime: '2025-05-05 10:00', channel: '邮件', status: '成功' },
  { id: 'P019', patientName: '秦廿一', phone: '15090123456', examType: '颈部CT平扫', pushTime: '2025-05-05 11:30', channel: '微信', status: '已查看', viewTime: '2025-05-05 11:40' },
  { id: 'P020', patientName: '尤廿二', phone: '14901234567', examType: '腹部MRI平扫', pushTime: '2025-05-05 14:45', channel: '短信', status: '成功' },
];

const SMS_TEMPLATES: SMSTemplate[] = [
  { id: 'SMS001', name: '报告完成通知', content: '【医院通知】尊敬的{patientName}，您的{examType}检查报告已出具，请登录患者端查看。' },
  { id: 'SMS002', name: '危急值通知', content: '【紧急通知】尊敬的{patientName}，您的{examType}检查发现异常结果，请尽快联系主治医生。' },
  { id: 'SMS003', name: '复查提醒', content: '【医院提醒】尊敬的{patientName}，根据您上次检查情况，建议您于近期进行复查，请提前预约。' },
];

const WECHAT_TEMPLATES: WeChatTemplate[] = [
  { id: 'WX001', name: '电子胶片链接', content: '您的{examType}电子胶片已生成，点击查看：DICOM影像[链接]' },
  { id: 'WX002', name: '报告PDF', content: '您的{examType}检查报告已出具，点击下载PDF文件获取完整报告。' },
  { id: 'WX003', name: '注意事项', content: '检查完成后请注意：1. 多饮水促进造影剂排出；2. 如有不适请及时联系医生。' },
];

const MOCK_PATIENT_REPORTS: PatientReport[] = [
  {
    id: 'RPT001',
    examType: '胸部CT平扫',
    examDate: '2025-05-01',
    status: '已出报告',
    findings: '双肺野清晰，肺纹理走行自然，双肺门结构正常。纵隔居中，纵隔内未见明显肿大淋巴结。心脏大小形态正常。',
    diagnosis: '1. 双肺未见明显异常\n2. 主动脉壁少许钙化\n3. 肝内多发囊肿可能，建议进一步检查',
    advice: '建议定期体检，肝内囊肿可行腹部彩超随访。',
    hasFilm: true,
  },
  {
    id: 'RPT002',
    examType: '颅脑MRI平扫',
    examDate: '2025-04-15',
    status: '已出报告',
    findings: '双侧大脑半球对称，灰白质分界清晰。脑室系统未见扩大，脑沟裂池未见增宽。中线结构居中。',
    diagnosis: '1. 颅脑MRI平扫未见明显异常\n2. 左侧上颌窦囊肿',
    advice: '左侧上颌窦囊肿较小，建议定期复查，若增大可考虑五官科就诊。',
    hasFilm: true,
  },
  {
    id: 'RPT003',
    examType: '腹部彩超',
    examDate: '2025-04-20',
    status: '报告待出',
    findings: '',
    diagnosis: '',
    advice: '',
    hasFilm: false,
  },
];

// ============ Styles ============
const PRIMARY_COLOR = '#1e40af';
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#f8fafc',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  // Tab Navigation
  tabNav: {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px',
    backgroundColor: '#1e293b',
    padding: '4px',
    borderRadius: '10px',
  },
  tabBtn: (active: boolean) => ({
    flex: 1,
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: active ? PRIMARY_COLOR : 'transparent',
    color: active ? '#ffffff' : '#94a3b8',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  // Login Section
  loginCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '480px',
    margin: '80px auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#f8fafc',
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  loginSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  // Patient Info Card
  patientCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientAvatar: {
    width: '64px',
    height: '64px',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
  },
  patientInfo: {
    display: 'flex',
    gap: '48px',
  },
  patientField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase' as const,
  },
  fieldValue: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#f8fafc',
  },
  // Section Title
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '16px',
    paddingLeft: '12px',
    borderLeft: `4px solid ${PRIMARY_COLOR}`,
  },
  // Exam Table
  tableWrapper: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    textAlign: 'left' as const,
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#cbd5e1',
    borderBottom: '1px solid #1e293b',
  },
  statusBadge: (status: string) => ({
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    backgroundColor: status === '已出报告' ? '#166534' : status === '审核中' ? '#854d0e' : PRIMARY_COLOR,
    color: '#fff',
  }),
  pushStatusBadge: (status: string) => ({
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    backgroundColor: status === '已查看' ? '#166534' : status === '成功' ? '#1e40af' : '#991b1b',
    color: '#fff',
  }),
  channelBadge: (channel: string) => ({
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '4px',
    backgroundColor: channel === '短信' ? '#475569' : channel === '微信' ? '#16a34a' : '#dc2626',
    color: '#fff',
  }),
  linkBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resendBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: PRIMARY_COLOR,
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  // Stats Cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  statSubLabel: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px',
  },
  // Template Cards
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  templateSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
  },
  templateTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  templateCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #334155',
  },
  templateName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#f8fafc',
    marginBottom: '8px',
  },
  templateContent: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  templateTag: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: PRIMARY_COLOR,
    color: '#fff',
    borderRadius: '4px',
    marginTop: '8px',
  },
  // Patient Preview Styles
  mobilePreview: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '375px',
    margin: '0 auto',
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #334155',
  },
  mobileTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#f8fafc',
  },
  mobileBackBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  reportListItem: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    border: '1px solid #334155',
  },
  reportListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  reportListType: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#f8fafc',
  },
  reportListDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  reportDetailSection: {
    marginBottom: '20px',
  },
  reportDetailLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
  },
  reportDetailContent: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: 1.7,
    backgroundColor: '#0f172a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  filmBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    backgroundColor: PRIMARY_COLOR,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  shareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  shareBtn: (color: string) => ({
    padding: '12px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: color,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
  }),
  pushHistoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #334155',
  },
  pushHistoryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pushHistoryIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  pushHistoryText: {
    fontSize: '14px',
    color: '#cbd5e1',
  },
  pushHistoryTime: {
    fontSize: '12px',
    color: '#64748b',
  },
  // Image Preview Section
  imageSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  imageCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #334155',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    marginBottom: '12px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  imageLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  windowControls: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    width: '60px',
  },
  rangeInput: {
    flex: 1,
    height: '4px',
    appearance: 'none' as any,
    backgroundColor: '#334155',
    borderRadius: '2px',
    outline: 'none',
  },
  controlValue: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: 500,
    width: '50px',
    textAlign: 'right' as const,
  },
  // Report Section
  reportSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  reportTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  reportContent: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#cbd5e1',
    whiteSpace: 'pre-wrap' as const,
    backgroundColor: '#0f172a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  // Download Voucher
  voucherSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
  },
  voucherBtn: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  voucherCode: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#3b82f6',
    letterSpacing: '4px',
    fontFamily: 'monospace',
  },
  // Footer
  footer: {
    textAlign: 'center' as const,
    padding: '24px',
    fontSize: '13px',
    color: '#64748b',
    borderTop: '1px solid #1e293b',
    marginTop: '24px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#64748b',
    fontSize: '14px',
  },
};

// ============ Component ============
type TabType = 'exams' | 'push' | 'preview';

const PatientPortalPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phoneOrId, setPhoneOrId] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('exams');
  const [selectedPatientReport, setSelectedPatientReport] = useState<PatientReport | null>(null);
  const [images] = useState<ImagePreview[]>([
    { id: '1', label: '横断面', windowWidth: 400, windowCenter: 40, invert: false },
    { id: '2', label: '冠状面', windowWidth: 400, windowCenter: 40, invert: false },
    { id: '3', label: '矢状面', windowWidth: 400, windowCenter: 40, invert: false },
    { id: '4', label: '3D重建', windowWidth: 400, windowCenter: 40, invert: false },
  ]);

  const handleLogin = () => {
    if (phoneOrId.trim()) {
      setLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPhoneOrId('');
    setSelectedExam(null);
    setExpandedReport(null);
    setVoucherCode(null);
    setSelectedPatientReport(null);
    setActiveTab('exams');
  };

  const handleImageView = (exam: ExamRecord) => {
    setSelectedExam(exam);
  };

  const handleWindowChange = (id: string, type: 'width' | 'center', value: number) => {
    // Window change handler for image controls
  };

  const handleInvertToggle = (id: string) => {
    // Invert toggle handler
  };

  const generateVoucher = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setVoucherCode(code);
  };

  const handleResendPush = (recordId: string) => {
    alert(`重新推送记录: ${recordId}`);
  };

  const handleShare = (method: string) => {
    alert(`分享方式: ${method}`);
  };

  const handleViewFilm = () => {
    alert('正在打开电子胶片...');
  };

  // Calculate push statistics
  const smsCount = MOCK_PUSH_RECORDS.filter(r => r.channel === '短信').length;
  const wechatCount = MOCK_PUSH_RECORDS.filter(r => r.channel === '微信').length;
  const emailCount = MOCK_PUSH_RECORDS.filter(r => r.channel === '邮件').length;
  const successCount = MOCK_PUSH_RECORDS.filter(r => r.status === '成功' || r.status === '已查看').length;
  const successRate = Math.round((successCount / MOCK_PUSH_RECORDS.length) * 100);

  // ============ Login View ============
  if (!loggedIn) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🏥</div>
            <span style={styles.logoText}>GE患者影像门户</span>
          </div>
        </header>
        <main style={styles.main}>
          <div style={styles.loginCard}>
            <h1 style={styles.loginTitle}>患者登录</h1>
            <p style={styles.loginSubtitle}>请输入手机号或证件号查询您的影像资料</p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>手机号 / 证件号</label>
              <input
                type="text"
                style={styles.input}
                placeholder="请输入手机号或身份证号码"
                value={phoneOrId}
                onChange={e => setPhoneOrId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              style={styles.loginBtn}
              onClick={handleLogin}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              查询影像
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============ Tab Content Renderers ============
  const renderExamsTab = () => (
    <>
      {/* Patient Info Card */}
      <div style={styles.patientCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={styles.patientAvatar}>👤</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
              {MOCK_PATIENT.name}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              {MOCK_PATIENT.gender} · {MOCK_PATIENT.age}岁
            </div>
          </div>
        </div>
        <div style={styles.patientInfo}>
          <div style={styles.patientField}>
            <span style={styles.fieldLabel}>证件号码</span>
            <span style={styles.fieldValue}>{MOCK_PATIENT.idNumber}</span>
          </div>
          <div style={styles.patientField}>
            <span style={styles.fieldLabel}>手机号</span>
            <span style={styles.fieldValue}>{MOCK_PATIENT.phone}</span>
          </div>
        </div>
      </div>

      {/* Exam List */}
      <h2 style={styles.sectionTitle}>我的检查</h2>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>检查项目</th>
              <th style={styles.th}>检查日期</th>
              <th style={styles.th}>检查部位</th>
              <th style={styles.th}>设备</th>
              <th style={styles.th}>报告状态</th>
              <th style={styles.th}>影像</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_EXAMS.map(exam => (
              <tr key={exam.id}>
                <td style={styles.td}>{exam.examItem}</td>
                <td style={styles.td}>{exam.examDate}</td>
                <td style={styles.td}>{exam.bodyPart}</td>
                <td style={styles.td}>{exam.device}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(exam.reportStatus)}>
                    {exam.reportStatus}
                  </span>
                </td>
                <td style={styles.td}>
                  {exam.hasImages ? (
                    <button
                      style={styles.linkBtn}
                      onClick={() => handleImageView(exam)}
                    >
                      查看影像
                    </button>
                  ) : (
                    <span style={{ color: '#64748b' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Preview Section */}
      {selectedExam && (
        <div style={styles.imageSection}>
          <h2 style={styles.sectionTitle}>
            电子胶片 — {selectedExam.examItem}
          </h2>
          <div style={styles.imageGrid}>
            {images.map(img => (
              <div key={img.id} style={styles.imageCard}>
                <div style={styles.imageLabel}>{img.label}</div>
                <div
                  style={{
                    ...styles.imagePlaceholder,
                    filter: img.invert ? 'invert(1)' : 'none',
                    backgroundColor: '#1e293b',
                  }}
                >
                  🖼️
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      marginTop: '8px',
                    }}
                  >
                    DICOM Preview
                  </div>
                </div>
                <div style={styles.windowControls}>
                  <div style={styles.controlRow}>
                    <span style={styles.controlLabel}>窗宽</span>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      value={img.windowWidth}
                      onChange={e => handleWindowChange(img.id, 'width', parseInt(e.target.value))}
                      style={styles.rangeInput}
                    />
                    <span style={styles.controlValue}>{img.windowWidth}</span>
                  </div>
                  <div style={styles.controlRow}>
                    <span style={styles.controlLabel}>窗位</span>
                    <input
                      type="range"
                      min="-100"
                      max="500"
                      value={img.windowCenter}
                      onChange={e => handleWindowChange(img.id, 'center', parseInt(e.target.value))}
                      style={styles.rangeInput}
                    />
                    <span style={styles.controlValue}>{img.windowCenter}</span>
                  </div>
                  <button
                    onClick={() => handleInvertToggle(img.id)}
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      backgroundColor: img.invert ? '#3b82f6' : '#334155',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    {img.invert ? '取消反转' : '反转显示'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Section */}
      <div style={styles.reportSection}>
        <h2 style={styles.sectionTitle}>检查报告</h2>
        {MOCK_EXAMS.filter(e => e.reportContent).map(exam => (
          <div key={exam.id} style={{ marginBottom: '12px' }}>
            <div
              style={styles.reportHeader}
              onClick={() =>
                setExpandedReport(expandedReport === exam.id ? null : exam.id)
              }
            >
              <div style={styles.reportTitle}>
                <span>📋</span>
                <span>{exam.examItem}</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {exam.examDate}
                </span>
              </div>
              <span style={{ color: '#94a3b8' }}>
                {expandedReport === exam.id ? '▲' : '▼'}
              </span>
            </div>
            {expandedReport === exam.id && (
              <div style={styles.reportContent}>{exam.reportContent}</div>
            )}
          </div>
        ))}
      </div>

      {/* Download Voucher */}
      <div style={styles.voucherSection}>
        <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>
          影像下载凭证
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
          点击下方按钮生成下载凭证，凭此验证码可在自助终端领取您的影像光盘
        </p>
        {!voucherCode ? (
          <button
            style={styles.voucherBtn}
            onClick={generateVoucher}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            生成下载凭证
          </button>
        ) : (
          <div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
              您的下载凭证为：
            </div>
            <div style={styles.voucherCode}>{voucherCode}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              凭证有效期：24小时
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderPushTab = () => (
    <>
      {/* Push Statistics */}
      <h2 style={styles.sectionTitle}>推送渠道统计</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#64748b' }}>{smsCount}</div>
          <div style={styles.statLabel}>短信推送量</div>
          <div style={styles.statSubLabel}>占总推送 {Math.round((smsCount / MOCK_PUSH_RECORDS.length) * 100)}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#16a34a' }}>{wechatCount}</div>
          <div style={styles.statLabel}>微信推送量</div>
          <div style={styles.statSubLabel}>占总推送 {Math.round((wechatCount / MOCK_PUSH_RECORDS.length) * 100)}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#dc2626' }}>{emailCount}</div>
          <div style={styles.statLabel}>邮件推送量</div>
          <div style={styles.statSubLabel}>占总推送 {Math.round((emailCount / MOCK_PUSH_RECORDS.length) * 100)}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: PRIMARY_COLOR }}>{successRate}%</div>
          <div style={styles.statLabel}>总推送成功率</div>
          <div style={styles.statSubLabel}>成功 {successCount} / 总计 {MOCK_PUSH_RECORDS.length}</div>
        </div>
      </div>

      {/* Push Records Table */}
      <h2 style={styles.sectionTitle}>推送记录</h2>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>患者姓名</th>
              <th style={styles.th}>手机号</th>
              <th style={styles.th}>检查类型</th>
              <th style={styles.th}>推送时间</th>
              <th style={styles.th}>推送渠道</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>查看时间</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PUSH_RECORDS.map(record => (
              <tr key={record.id}>
                <td style={styles.td}>{record.patientName}</td>
                <td style={styles.td}>{record.phone}</td>
                <td style={styles.td}>{record.examType}</td>
                <td style={styles.td}>{record.pushTime}</td>
                <td style={styles.td}>
                  <span style={styles.channelBadge(record.channel)}>
                    {record.channel}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.pushStatusBadge(record.status)}>
                    {record.status}
                  </span>
                </td>
                <td style={styles.td}>{record.viewTime || '—'}</td>
                <td style={styles.td}>
                  <button
                    style={styles.resendBtn}
                    onClick={() => handleResendPush(record.id)}
                  >
                    重新推送
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Template Management */}
      <h2 style={styles.sectionTitle}>推送模板管理</h2>
      <div style={styles.templateGrid}>
        {/* SMS Templates */}
        <div style={styles.templateSection}>
          <div style={styles.templateTitle}>
            <span>💬</span>
            <span>短信模板</span>
          </div>
          {SMS_TEMPLATES.map(template => (
            <div key={template.id} style={styles.templateCard}>
              <div style={styles.templateName}>{template.name}</div>
              <div style={styles.templateContent}>{template.content}</div>
              <span style={styles.templateTag}>短信</span>
            </div>
          ))}
        </div>

        {/* WeChat Templates */}
        <div style={styles.templateSection}>
          <div style={styles.templateTitle}>
            <span>💚</span>
            <span>微信模板</span>
          </div>
          {WECHAT_TEMPLATES.map(template => (
            <div key={template.id} style={styles.templateCard}>
              <div style={styles.templateName}>{template.name}</div>
              <div style={styles.templateContent}>{template.content}</div>
              <span style={{ ...styles.templateTag, backgroundColor: '#16a34a' }}>微信</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderPreviewTab = () => (
    <>
      <h2 style={styles.sectionTitle}>患者端预览</h2>
      
      {selectedPatientReport ? (
        // Report Detail View
        <div style={styles.mobilePreview}>
          <div style={styles.mobileHeader}>
            <span style={styles.mobileTitle}>{selectedPatientReport.examType}</span>
            <button
              style={styles.mobileBackBtn}
              onClick={() => setSelectedPatientReport(null)}
            >
              ← 返回
            </button>
          </div>

          {selectedPatientReport.status === '已出报告' ? (
            <>
              {/* Report Details */}
              <div style={styles.reportDetailSection}>
                <div style={styles.reportDetailLabel}>检查所见</div>
                <div style={styles.reportDetailContent}>
                  {selectedPatientReport.findings}
                </div>
              </div>

              <div style={styles.reportDetailSection}>
                <div style={styles.reportDetailLabel}>诊断意见</div>
                <div style={styles.reportDetailContent}>
                  {selectedPatientReport.diagnosis}
                </div>
              </div>

              <div style={styles.reportDetailSection}>
                <div style={styles.reportDetailLabel}>建议</div>
                <div style={styles.reportDetailContent}>
                  {selectedPatientReport.advice}
                </div>
              </div>

              {/* Film Button */}
              {selectedPatientReport.hasFilm && (
                <button style={styles.filmBtn} onClick={handleViewFilm}>
                  🏥 查看电子胶片
                </button>
              )}

              {/* Share */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ ...styles.reportDetailLabel, marginBottom: '12px' }}>一键分享</div>
                <div style={styles.shareGrid}>
                  <button
                    style={styles.shareBtn('#16a34a')}
                    onClick={() => handleShare('微信')}
                  >
                    <span>💚</span>
                    <span>微信</span>
                  </button>
                  <button
                    style={styles.shareBtn('#64748b')}
                    onClick={() => handleShare('短信')}
                  >
                    <span>💬</span>
                    <span>短信</span>
                  </button>
                  <button
                    style={styles.shareBtn('#dc2626')}
                    onClick={() => handleShare('邮件')}
                  >
                    <span>✉️</span>
                    <span>邮件</span>
                  </button>
                </div>
              </div>

              {/* Precautions Push History */}
              <div>
                <div style={{ ...styles.reportDetailLabel, marginBottom: '12px' }}>注意事项推送记录</div>
                <div style={styles.pushHistoryItem}>
                  <div style={styles.pushHistoryLeft}>
                    <div style={{ ...styles.pushHistoryIcon, backgroundColor: '#16a34a' }}>💚</div>
                    <div>
                      <div style={styles.pushHistoryText}>微信推送 - 注意事项</div>
                      <div style={styles.pushHistoryTime}>2025-05-01 14:40</div>
                    </div>
                  </div>
                  <span style={{ ...styles.pushStatusBadge('已查看'), fontSize: '11px' }}>已查看</span>
                </div>
                <div style={styles.pushHistoryItem}>
                  <div style={styles.pushHistoryLeft}>
                    <div style={{ ...styles.pushHistoryIcon, backgroundColor: '#64748b' }}>💬</div>
                    <div>
                      <div style={styles.pushHistoryText}>短信推送 - 报告完成通知</div>
                      <div style={styles.pushHistoryTime}>2025-05-01 14:30</div>
                    </div>
                  </div>
                  <span style={{ ...styles.pushStatusBadge('已查看'), fontSize: '11px' }}>已查看</span>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              报告正在生成中，请稍后再来查看...
            </div>
          )}
        </div>
      ) : (
        // Report List View
        <div style={styles.mobilePreview}>
          <div style={styles.mobileHeader}>
            <span style={styles.mobileTitle}>我的报告</span>
          </div>

          {MOCK_PATIENT_REPORTS.map(report => (
            <div
              key={report.id}
              style={styles.reportListItem}
              onClick={() => setSelectedPatientReport(report)}
            >
              <div style={styles.reportListHeader}>
                <span style={styles.reportListType}>{report.examType}</span>
                <span style={report.status === '已出报告' ? styles.statusBadge('已出报告') : styles.statusBadge('报告待出')}>
                  {report.status}
                </span>
              </div>
              <div style={styles.reportListDate}>{report.examDate}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ============ Logged In View ============
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏥</div>
          <span style={styles.logoText}>GE患者影像门户</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          退出登录
        </button>
      </header>

      <main style={styles.main}>
        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          <button
            style={styles.tabBtn(activeTab === 'exams')}
            onClick={() => setActiveTab('exams')}
          >
            📋 我的检查
          </button>
          <button
            style={styles.tabBtn(activeTab === 'push')}
            onClick={() => setActiveTab('push')}
          >
            📨 报告推送管理
          </button>
          <button
            style={styles.tabBtn(activeTab === 'preview')}
            onClick={() => setActiveTab('preview')}
          >
            📱 患者端预览
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'exams' && renderExamsTab()}
        {activeTab === 'push' && renderPushTab()}
        {activeTab === 'preview' && renderPreviewTab()}
      </main>

      <footer style={styles.footer}>
        <p>GE Centricity Patient Portal · 患者影像查询系统</p>
        <p style={{ marginTop: '4px' }}>© 2025 医院信息系统 版权所有</p>
      </footer>
    </div>
  );
};

export default PatientPortalPage;
