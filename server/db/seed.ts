/**
 * G005 RIS - 服务端数据种子 v3.0.2.9
 * npm run server 时自动填充测试数据
 */
import { randomUUID } from 'crypto';

function uid() { return randomUUID().slice(0, 8); }
function now(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const NAMES = ['张志刚','李秀英','王建国','赵晓敏','周玉芬','孙伟','吴婷','郑丽','钱伟明','陈丽华'];
const DEPARTMENTS = ['放射科','急诊科','神经内科','心内科','骨科','呼吸科','消化科','肿瘤科'];

export function seedData() {
  const patients = NAMES.map((name, i) => ({
    id: `P${String(i + 1).padStart(3, '0')}`,
    name,
    gender: i % 2 === 0 ? '男' : '女',
    age: 35 + Math.floor(Math.random() * 40),
    birthDate: `19${70 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    phone: `138${String(10000000 + Math.floor(Math.random() * 89999999)).padStart(8, '0')}`,
    patientType: ['门诊','住院','体检'][Math.floor(Math.random() * 3)],
  }));

  const MODALITIES = ['CT','MR','DR','DSA','乳腺钼靶'];
  const BODY_PARTS = ['头颅','胸部','腹部','盆腔','脊柱','四肢'];
  const STATUSES = ['已登记','待检查','检查中','待报告','已报告','已发布','已取消'];
  const PRIORITIES = ['普通','紧急','危重','会诊'];

  const exams = [];
  for (let i = 0; i < 50; i++) {
    const modality = MODALITIES[Math.floor(Math.random() * MODALITIES.length)];
    const bodyPart = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const patient = patients[Math.floor(Math.random() * patients.length)];
    exams.push({
      id: `EX-${uid()}`,
      examId: `EX${String(i + 1).padStart(4, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      gender: patient.gender,
      age: patient.age,
      modality,
      bodyPart,
      status,
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      patientType: patient.patientType,
      scheduledAt: now(Math.floor(Math.random() * 7)),
      createdAt: now(Math.floor(Math.random() * 7)),
      updatedAt: now(),
    });
  }

  const REPORT_STATUSES = ['待分配','已分配','书写中','已提交','初审中','初审通过','终审中','已审核','已签发','已发布','已驳回'];
  const reports = [];
  for (let i = 0; i < 50; i++) {
    const exam = exams[Math.floor(Math.random() * exams.length)];
    const status = REPORT_STATUSES[Math.floor(Math.random() * REPORT_STATUSES.length)];
    const doctorNames = ['张明远','李芳华','王秀峰','刘建国','陈志强'];
    const doctorName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
    const rpt = {
      id: `RPT-${uid()}`,
      reportId: `RP${String(i + 1).padStart(4, '0')}`,
      examId: exam.id,
      patientId: exam.patientId,
      patientName: exam.patientName,
      modality: exam.modality,
      bodyPart: exam.bodyPart,
      status,
      findings: '影像所见：...\n诊断意见：...\n建议：...',
      diagnosis: '符合临床诊断',
      impression: '未见明显异常',
      doctorId: `D${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      doctorName,
      qualityScore: 70 + Math.floor(Math.random() * 30),
      reportSource: ['manual','template','ai-assist','voice'][Math.floor(Math.random() * 4)],
      isPositive: Math.random() > 0.6,
      isCritical: Math.random() > 0.85,
      createdTime: now(Math.floor(Math.random() * 30)),
      updatedTime: now(),
    };
    if (['已审核','已签发','已发布'].includes(status)) {
      rpt.initialAuditDoctorId = `D${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`;
      rpt.initialAuditDoctorName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
      rpt.initialAuditTime = now(Math.floor(Math.random() * 10));
      rpt.initialAuditScore = 80 + Math.floor(Math.random() * 20);
      rpt.initialAuditSuggestion = '同意';
    }
    if (['已签发','已发布'].includes(status)) {
      rpt.signedTime = now(Math.floor(Math.random() * 5));
      rpt.reportVerificationCode = `V${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    if (status === '已发布') {
      rpt.publishedTime = now(Math.floor(Math.random() * 2));
      rpt.publishedBy = 'system';
    }
    reports.push(rpt);
  }

  const USERS = NAMES.slice(0, 6).map((name, i) => ({
    id: `U${String(i + 1).padStart(3, '0')}`,
    name,
    username: name,
    role: ['医生','技师','护士','管理员','主任','医生'][i],
    department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    title: ['主任医师','副主任医师','主治医师','技师','护士','主任'][i],
  }));

  const DEVICES = [
    { id: 'DEV-CT-01', name: 'CT-1（GE Revolution）', modality: 'CT', status: '使用中', manufacturer: 'GE', utilization: 85 },
    { id: 'DEV-CT-02', name: 'CT-2（西门子Force）', modality: 'CT', status: '空闲', manufacturer: 'Siemens', utilization: 72 },
    { id: 'DEV-MR-01', name: 'MR-1（西门子Vida）', modality: 'MR', status: '使用中', manufacturer: 'Siemens', utilization: 90 },
    { id: 'DEV-DR-01', name: 'DR-1（飞利浦）', modality: 'DR', status: '空闲', manufacturer: 'Philips', utilization: 65 },
    { id: 'DEV-DR-02', name: 'DR-2（GE）', modality: 'DR', status: '维护中', manufacturer: 'GE', utilization: 40 },
    { id: 'DEV-DSA-01', name: 'DSA-1（飞利浦）', modality: 'DSA', status: '空闲', manufacturer: 'Philips', utilization: 55 },
    { id: 'DEV-MG-01', name: '乳腺钼靶（GE）', modality: '乳腺钼靶', status: '空闲', manufacturer: 'GE', utilization: 48 },
  ];

  const criticalValues = [];
  for (let i = 0; i < 10; i++) {
    const exam = exams[Math.floor(Math.random() * exams.length)];
    criticalValues.push({
      id: `CV-${uid()}`,
      examId: exam.id,
      patientName: exam.patientName,
      finding: ['主动脉夹层','急性肺栓塞','蛛网膜下腔出血','气胸','心包积液'][Math.floor(Math.random() * 5)],
      severity: ['high','critical','medium'][Math.floor(Math.random() * 3)],
      status: ['pending','notified','acknowledged','resolved'][Math.floor(Math.random() * 4)],
      triggeredAt: now(Math.floor(Math.random() * 7)),
      doctorId: `D${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
    });
  }

  const appointments = [];
  for (let i = 0; i < 20; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const modality = MODALITIES[Math.floor(Math.random() * MODALITIES.length)];
    appointments.push({
      id: `APT-${uid()}`,
      patientId: patient.id,
      patientName: patient.name,
      modality,
      bodyPart: BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)],
      scheduledAt: now(Math.floor(Math.random() * 14)),
      status: ['pending','confirmed','checked_in','completed','cancelled'][Math.floor(Math.random() * 5)],
      priority: 'normal',
    });
  }

  const queueCalls = [];
  for (let i = 0; i < 8; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    queueCalls.push({
      id: `QC-${uid()}`,
      examId: exams[Math.floor(Math.random() * exams.length)].id,
      patientName: patient.name,
      roomId: `ROOM-CT${Math.floor(Math.random() * 2) + 1}`,
      roomName: `CT室${Math.floor(Math.random() * 2) + 1}`,
      status: ['waiting','called','in_service','completed'][Math.floor(Math.random() * 4)],
      queueNumber: `A${String(i + 1).padStart(3, '0')}`,
    });
  }

  return { patients, exams, reports, users: USERS, devices: DEVICES, criticalValues, appointments, queueCalls, printJobs: [], deliveryRecords: [] };
}
