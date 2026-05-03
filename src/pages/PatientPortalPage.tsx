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

// ============ Styles ============
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
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
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
    borderLeft: '4px solid #3b82f6',
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
    borderCollapse: 'collapse',
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
    backgroundColor: status === '已出报告' ? '#166534' : status === '审核中' ? '#854d0e' : '#1e40af',
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
    appearance: 'none',
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
};

// ============ Component ============
const PatientPortalPage: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [phoneOrId, setPhoneOrId] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [images, setImages] = useState<ImagePreview[]>([
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
  };

  const handleImageView = (exam: ExamRecord) => {
    setSelectedExam(exam);
  };

  const handleWindowChange = (id: string, type: 'width' | 'center', value: number) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id
          ? { ...img, [type === 'width' ? 'windowWidth' : 'windowCenter']: value }
          : img
      )
    );
  };

  const handleInvertToggle = (id: string) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, invert: !img.invert } : img
      )
    );
  };

  const generateVoucher = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setVoucherCode(code);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已出报告':
        return '#166534';
      case '审核中':
        return '#854d0e';
      default:
        return '#1e40af';
    }
  };

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
                      backgroundColor: img.invert ? '#1e293b' : '#1e293b',
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
      </main>

      <footer style={styles.footer}>
        <p>GE Centricity Patient Portal · 患者影像查询系统</p>
        <p style={{ marginTop: '4px' }}>© 2025 医院信息系统 版权所有</p>
      </footer>
    </div>
  );
};

export default PatientPortalPage;
