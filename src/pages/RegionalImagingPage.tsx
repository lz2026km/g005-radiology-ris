import React, { useState } from 'react';

// Types
interface AccessApplication {
  id: string;
  patientName: string;
  patientId: string;
  hospital: string;
  modality: string;
  studyDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applyDate: string;
}

interface ConsultationRequest {
  id: string;
  patientName: string;
  hospital: string;
  diagnosis: string;
  priority: 'normal' | 'urgent' | 'critical';
  status: 'open' | 'in-progress' | 'completed';
  createDate: string;
  expert?: string;
}

interface AccessRecord {
  id: string;
  patientName: string;
  patientId: string;
  studyType: string;
  hospital: string;
  accessTime: string;
  accessor: string;
  purpose: string;
}

// Mock Data
const mockApplications: AccessApplication[] = [
  { id: 'APP001', patientName: '张伟', patientId: '310101199001011234', hospital: '东华区第一医院', modality: 'CT', studyDate: '2026-04-28', reason: '复诊对比', status: 'pending', applyDate: '2026-05-02' },
  { id: 'APP002', patientName: '李娜', patientId: '310102198505052345', hospital: '国家医学中心直属医院', modality: 'MRI', studyDate: '2026-04-25', reason: '术前评估', status: 'approved', applyDate: '2026-05-01' },
  { id: 'APP003', patientName: '王强', patientId: '310103199203034567', hospital: '青浦区分院', modality: 'X-Ray', studyDate: '2026-04-30', reason: '急诊阅片', status: 'pending', applyDate: '2026-05-03' },
  { id: 'APP004', patientName: '赵敏', patientId: '310104198808088765', hospital: '东华区第一医院', modality: 'CT', studyDate: '2026-04-20', reason: '疗效评估', status: 'rejected', applyDate: '2026-04-30' },
];

const mockConsultations: ConsultationRequest[] = [
  { id: 'CON001', patientName: '孙丽', hospital: '东华区第一医院', diagnosis: '肺部结节待查', priority: 'urgent', status: 'in-progress', createDate: '2026-05-01', expert: '呼吸科专家-李明' },
  { id: 'CON002', patientName: '周杰', hospital: '青浦区分院', diagnosis: '脑梗死后遗症', priority: 'normal', status: 'open', createDate: '2026-05-02' },
  { id: 'CON003', patientName: '吴芳', hospital: '国家医学中心直属医院', diagnosis: '髋关节骨折', priority: 'critical', status: 'completed', createDate: '2026-04-28', expert: '骨科专家-张华' },
  { id: 'CON004', patientName: '郑涛', hospital: '东华区第一医院', diagnosis: '胃癌术后复查', priority: 'normal', status: 'open', createDate: '2026-05-03' },
];

const mockAccessRecords: AccessRecord[] = [
  { id: 'REC001', patientName: '张伟', patientId: '310101199001011234', studyType: '胸部CT', hospital: '东华区第一医院', accessTime: '2026-05-02 14:30', accessor: '王医生', purpose: '诊断参考' },
  { id: 'REC002', patientName: '李娜', patientId: '310102198505052345', studyType: '颅脑MRI', hospital: '国家医学中心直属医院', accessTime: '2026-05-01 09:15', accessor: '李主任', purpose: '会诊讨论' },
  { id: 'REC003', patientName: '刘洋', patientId: '310105199010107890', studyType: '腹部CT', hospital: '青浦区分院', accessTime: '2026-04-30 16:45', accessor: '张医生', purpose: '术后评估' },
  { id: 'REC004', patientName: '陈静', patientId: '310106198303031234', studyType: '心脏彩超', hospital: '东华区第一医院', accessTime: '2026-04-29 11:20', accessor: '心内科-赵主任', purpose: '治疗方案制定' },
  { id: 'REC005', patientName: '黄磊', patientId: '310107199506061234', studyType: '腰椎MRI', hospital: '国家医学中心直属医院', accessTime: '2026-04-28 08:00', accessor: '骨科-孙医生', purpose: '手术规划' },
];

// Tab Components
const ApplicationList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newApp, setNewApp] = useState({ patientName: '', patientId: '', hospital: '东华区第一医院', modality: 'CT', reason: '' });

  const handleSubmit = () => {
    setShowModal(false);
    setNewApp({ patientName: '', patientId: '', hospital: '东华区第一医院', modality: 'CT', reason: '' });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>调阅申请列表</h3>
        <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>+ 发起调阅申请</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>申请ID</th>
            <th style={styles.th}>患者姓名</th>
            <th style={styles.th}>患者ID</th>
            <th style={styles.th}>来源医院</th>
            <th style={styles.th}>检查类型</th>
            <th style={styles.th}>申请日期</th>
            <th style={styles.th}>状态</th>
          </tr>
        </thead>
        <tbody>
          {mockApplications.map((app) => (
            <tr key={app.id} style={styles.tableRow}>
              <td style={styles.td}>{app.id}</td>
              <td style={styles.td}>{app.patientName}</td>
              <td style={styles.td}>{app.patientId}</td>
              <td style={styles.td}>{app.hospital}</td>
              <td style={styles.td}>{app.modality}</td>
              <td style={styles.td}>{app.applyDate}</td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: app.status === 'pending' ? '#f59e0b' : app.status === 'approved' ? '#10b981' : '#ef4444' }}>
                  {app.status === 'pending' ? '待审批' : app.status === 'approved' ? '已通过' : '已拒绝'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitle}>发起调阅申请</h4>
            <div style={styles.formGroup}>
              <label style={styles.label}>患者姓名</label>
              <input style={styles.input} value={newApp.patientName} onChange={e => setNewApp({...newApp, patientName: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>身份证号</label>
              <input style={styles.input} value={newApp.patientId} onChange={e => setNewApp({...newApp, patientId: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>来源医院</label>
              <select style={styles.select} value={newApp.hospital} onChange={e => setNewApp({...newApp, hospital: e.target.value})}>
                <option>东华区第一医院</option>
                <option>国家医学中心直属医院</option>
                <option>青浦区分院</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>检查类型</label>
              <select style={styles.select} value={newApp.modality} onChange={e => setNewApp({...newApp, modality: e.target.value})}>
                <option>CT</option>
                <option>MRI</option>
                <option>X-Ray</option>
                <option>超声</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>申请理由</label>
              <textarea style={styles.textarea} value={newApp.reason} onChange={e => setNewApp({...newApp, reason: e.target.value})} />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button style={styles.primaryBtn} onClick={handleSubmit}>提交申请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReceiveList: React.FC = () => {
  const [apps, setApps] = useState(mockApplications);

  const handleApprove = (id: string) => {
    setApps(apps.map(app => app.id === id ? {...app, status: 'approved'} : app));
  };

  const handleReject = (id: string) => {
    setApps(apps.map(app => app.id === id ? {...app, status: 'rejected'} : app));
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>接收列表 - 待审批</h3>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>申请ID</th>
            <th style={styles.th}>患者姓名</th>
            <th style={styles.th}>来源医院</th>
            <th style={styles.th}>检查类型</th>
            <th style={styles.th}>申请理由</th>
            <th style={styles.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {apps.filter(a => a.status === 'pending').map((app) => (
            <tr key={app.id} style={styles.tableRow}>
              <td style={styles.td}>{app.id}</td>
              <td style={styles.td}>{app.patientName}</td>
              <td style={styles.td}>{app.hospital}</td>
              <td style={styles.td}>{app.modality}</td>
              <td style={styles.td}>{app.reason || '复诊对比'}</td>
              <td style={styles.td}>
                <button style={styles.approveBtn} onClick={() => handleApprove(app.id)}>批准</button>
                <button style={styles.rejectBtn} onClick={() => handleReject(app.id)}>拒绝</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ConsultationRequests: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newCon, setNewCon] = useState({ patientName: '', hospital: '东华区第一医院', diagnosis: '', priority: 'normal' });
  const [consultations, setConsultations] = useState(mockConsultations);

  const handleSubmit = () => {
    const con = {
      id: `CON${String(consultations.length + 1).padStart(3, '0')}`,
      ...newCon,
      status: 'open' as const,
      createDate: new Date().toISOString().split('T')[0]
    };
    setConsultations([...consultations, con]);
    setShowModal(false);
    setNewCon({ patientName: '', hospital: '东华区第一医院', diagnosis: '', priority: 'normal' });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>会诊请求</h3>
        <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>+ 发起会诊</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>会诊ID</th>
            <th style={styles.th}>患者姓名</th>
            <th style={styles.th}>发起医院</th>
            <th style={styles.th}>诊断</th>
            <th style={styles.th}>优先级</th>
            <th style={styles.th}>状态</th>
            <th style={styles.th}>专家</th>
          </tr>
        </thead>
        <tbody>
          {consultations.map((con) => (
            <tr key={con.id} style={styles.tableRow}>
              <td style={styles.td}>{con.id}</td>
              <td style={styles.td}>{con.patientName}</td>
              <td style={styles.td}>{con.hospital}</td>
              <td style={styles.td}>{con.diagnosis}</td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: con.priority === 'critical' ? '#dc2626' : con.priority === 'urgent' ? '#f59e0b' : '#6b7280' }}>
                  {con.priority === 'critical' ? '危急' : con.priority === 'urgent' ? '紧急' : '普通'}
                </span>
              </td>
              <td style={styles.td}>
                <span style={{ ...styles.badge, background: con.status === 'completed' ? '#10b981' : con.status === 'in-progress' ? '#3b82f6' : '#6b7280' }}>
                  {con.status === 'completed' ? '已完成' : con.status === 'in-progress' ? '进行中' : '待接诊'}
                </span>
              </td>
              <td style={styles.td}>{con.expert || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitle}>发起会诊请求</h4>
            <div style={styles.formGroup}>
              <label style={styles.label}>患者姓名</label>
              <input style={styles.input} value={newCon.patientName} onChange={e => setNewCon({...newCon, patientName: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>发起医院</label>
              <select style={styles.select} value={newCon.hospital} onChange={e => setNewCon({...newCon, hospital: e.target.value})}>
                <option>东华区第一医院</option>
                <option>国家医学中心直属医院</option>
                <option>青浦区分院</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>初步诊断</label>
              <input style={styles.input} value={newCon.diagnosis} onChange={e => setNewCon({...newCon, diagnosis: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>优先级</label>
              <select style={styles.select} value={newCon.priority} onChange={e => setNewCon({...newCon, priority: e.target.value as any})}>
                <option value="normal">普通</option>
                <option value="urgent">紧急</option>
                <option value="critical">危急</option>
              </select>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button style={styles.primaryBtn} onClick={handleSubmit}>提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DicomViewer: React.FC = () => {
  const [activeTool, setActiveTool] = useState('pan');
  const [activeImage, setActiveImage] = useState(0);

  const tools = [
    { id: 'pan', label: '平移' },
    { id: 'zoom', label: '缩放' },
    { id: 'window', label: '窗宽窗位' },
    { id: 'measure', label: '测量' },
    { id: 'annotate', label: '标注' },
  ];

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>DICOM图像查看器</h3>
        <div style={styles.toolbar}>
          {tools.map(tool => (
            <button
              key={tool.id}
              style={{ ...styles.toolBtn, ...(activeTool === tool.id ? styles.toolBtnActive : {}) }}
              onClick={() => setActiveTool(tool.id)}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.dicomGrid}>
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            style={{
              ...styles.dicomImage,
              ...(activeImage === idx ? styles.dicomImageActive : {})
            }}
            onClick={() => setActiveImage(idx)}
          >
            <div style={styles.dicomPlaceholder}>
              <div style={styles.dicomImageContent}>
                <span style={styles.dicomLabel}>IMG_{String(idx + 1).padStart(4, '0')}</span>
                <div style={styles.dicomMeasurements}>
                  <span>W: 400</span>
                  <span>L: 40</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.viewerInfo}>
        <span>患者: 张伟 | 检查: 胸部CT | 日期: 2026-04-28</span>
        <span>当前图像: {activeImage + 1} / 6</span>
      </div>
    </div>
  );
};

const AccessRecords: React.FC = () => {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>调阅记录历史</h3>
      </div>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>记录ID</th>
            <th style={styles.th}>患者姓名</th>
            <th style={styles.th}>身份证号</th>
            <th style={styles.th}>检查类型</th>
            <th style={styles.th}>来源医院</th>
            <th style={styles.th}>调阅时间</th>
            <th style={styles.th}>调阅人</th>
            <th style={styles.th}>调阅目的</th>
          </tr>
        </thead>
        <tbody>
          {mockAccessRecords.map((rec) => (
            <tr key={rec.id} style={styles.tableRow}>
              <td style={styles.td}>{rec.id}</td>
              <td style={styles.td}>{rec.patientName}</td>
              <td style={styles.td}>{rec.patientId}</td>
              <td style={styles.td}>{rec.studyType}</td>
              <td style={styles.td}>{rec.hospital}</td>
              <td style={styles.td}>{rec.accessTime}</td>
              <td style={styles.td}>{rec.accessor}</td>
              <td style={styles.td}>{rec.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Component
const RegionalImagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('applications');

  const tabs = [
    { id: 'applications', label: '申请列表' },
    { id: 'received', label: '接收列表' },
    { id: 'consultations', label: '会诊请求' },
    { id: 'viewer', label: '图像查看' },
    { id: 'records', label: '调阅记录' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'applications': return <ApplicationList />;
      case 'received': return <ReceiveList />;
      case 'consultations': return <ConsultationRequests />;
      case 'viewer': return <DicomViewer />;
      case 'records': return <AccessRecords />;
      default: return <ApplicationList />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>区域影像协同平台</h2>
        <p style={styles.subtitle}>东华区第一医院 · 国家医学中心直属医院 · 青浦区分院</p>
      </div>
      <div style={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#3b82f6',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '8px',
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#3b82f6',
    color: '#ffffff',
  },
  content: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f1f5f9',
    margin: 0,
  },
  primaryBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeaderRow: {
    background: '#0f172a',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
  },
  tableRow: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '12px 16px',
    color: '#e2e8f0',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#ffffff',
  },
  approveBtn: {
    padding: '6px 16px',
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '8px',
  },
  rejectBtn: {
    padding: '6px 16px',
    background: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    width: '480px',
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f1f5f9',
    margin: '0 0 20px 0',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  toolbar: {
    display: 'flex',
    gap: '8px',
  },
  toolBtn: {
    padding: '8px 16px',
    background: '#0f172a',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  toolBtnActive: {
    background: '#3b82f6',
    color: '#ffffff',
    border: '1px solid #3b82f6',
  },
  dicomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  dicomImage: {
    aspectRatio: '4/3',
    background: '#0f172a',
    borderRadius: '8px',
    border: '2px solid #334155',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  dicomImageActive: {
    border: '2px solid #3b82f6',
  },
  dicomPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  dicomImageContent: {
    textAlign: 'center',
  },
  dicomLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: '8px',
  },
  dicomMeasurements: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#64748b',
  },
  viewerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#94a3b8',
  },
};

export default RegionalImagingPage;
