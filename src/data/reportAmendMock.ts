/**
 * G005 放射RIS系统 v3.0.5.1 - R3.AMEND 修订 Mock 数据
 * A5-REPORT 模块 / 100 点
 *
 * 数据原则：所有患者姓名/ID/修订原因均虚构，禁止使用真实医院信息。
 */

import type {
  RevisionEntry,
  AmendApproval,
  SupplementEntry,
  ReportSnapshot,
  VersionDiff,
  FieldDiff,
  AmendmentKPI,
  AmendmentCompliance,
} from '../types/R3/R3.AMEND';

// ============================================================
// 报告快照（用于版本回滚 / 对比）
// ============================================================

const snapV1 = (ver: number): ReportSnapshot => ({
  version: ver,
  examFindings:
    '双肺纹理清晰，未见明显实质性病变。纵隔居中，气管支气管通畅。心影大小形态正常。膈肌光滑，胸膜未见增厚，胸腔未见积液。',
  diagnosis: '胸部 CT 平扫未见明显异常',
  impression: '未见明显异常，建议年度随访',
  recommendations: '12 个月后复查胸部 CT',
  qualityScore: 85,
  signedAt: '2026-06-01T10:23:45Z',
  signatureValue: 'MEUCIQCx9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4==',
  certificateSerial: '3A7F-9D2C-1145-E0B8',
  capturedAt: '2026-06-01T10:23:45Z',
});

const snapV2 = (ver: number): ReportSnapshot => ({
  version: ver,
  examFindings:
    '双肺纹理清晰，右肺下叶背段可见一磨玻璃密度结节，大小约 8mm×7mm，边界欠清，未见明显实性成分。余肺野未见明显实质性病变。纵隔居中，气管支气管通畅。心影大小形态正常。膈肌光滑，胸膜未见增厚，胸腔未见积液。',
  diagnosis: '右肺下叶背段磨玻璃结节（Lung-RADS 3 类）',
  impression: '右肺下叶磨玻璃结节，考虑为非典型腺瘤样增生或原位腺癌可能，建议 3 个月后复查。',
  recommendations: '3 个月后复查胸部 CT 平扫+靶扫描',
  qualityScore: 92,
  signedAt: '2026-06-05T09:15:20Z',
  signatureValue: 'MEUCIQCx9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f5==',
  certificateSerial: '3A7F-9D2C-1145-E0B8',
  capturedAt: '2026-06-05T09:15:20Z',
});

// ============================================================
// 修订历史（同一报告 3 次修订，达到上限）
// ============================================================

export const REVISION_ENTRIES: RevisionEntry[] = [
  {
    id: 'rev-ent-001',
    reportId: 'RP20260601001',
    version: 1,
    action: 'start',
    reason: '原报告遗漏右肺下叶磨玻璃结节',
    reasonCategory: 'missing-key-finding',
    authorId: 'D001',
    authorName: '张明远',
    authorTitle: '主任医师',
    createdAt: '2026-06-05T08:30:00Z',
    preSnapshot: snapV1(1),
    postSnapshot: snapV2(2),
    approvalId: 'apr-001',
  },
  {
    id: 'rev-ent-002',
    reportId: 'RP20260601001',
    version: 2,
    action: 'edit',
    reason: '补充 Lung-RADS 分类及随访建议',
    reasonCategory: 'missing-recommendation',
    authorId: 'D001',
    authorName: '张明远',
    authorTitle: '主任医师',
    createdAt: '2026-06-05T09:00:00Z',
    preSnapshot: snapV2(2),
    postSnapshot: {
      ...snapV2(2),
      impression:
        '右肺下叶磨玻璃结节（Lung-RADS 3 类），考虑为非典型腺瘤样增生或原位腺癌可能。建议 3 个月后复查胸部 CT 平扫+靶扫描，必要时穿刺活检。',
      qualityScore: 95,
      version: 3,
      signedAt: '2026-06-05T09:15:20Z',
    },
    parentVersion: 1,
    cosignId: 'cosign-001',
    reSignedAt: '2026-06-05T09:15:20Z',
    reSignCertificateSerial: '3A7F-9D2C-1145-E0B8',
  },
  {
    id: 'rev-ent-003',
    reportId: 'RP20260601001',
    version: 3,
    action: 'complete',
    reason: '完成修订并发布',
    reasonCategory: 'other',
    authorId: 'D001',
    authorName: '张明远',
    authorTitle: '主任医师',
    createdAt: '2026-06-05T10:00:00Z',
    parentVersion: 2,
    reSignedAt: '2026-06-05T10:00:00Z',
    reSignCertificateSerial: '3A7F-9D2C-1145-E0B8',
  },
  {
    id: 'rev-ent-004',
    reportId: 'RP20260602008',
    version: 1,
    action: 'start',
    reason: '病理回报：腺癌，需修订原报告',
    reasonCategory: 'terminology-error',
    authorId: 'D002',
    authorName: '李慧敏',
    authorTitle: '副主任医师',
    createdAt: '2026-06-03T15:30:00Z',
    preSnapshot: {
      version: 1,
      examFindings: '肝右叶可见一稍低密度灶，大小约 25mm×22mm',
      diagnosis: '肝右叶占位，考虑良性可能',
      impression: '建议随访',
      qualityScore: 80,
      signedAt: '2026-06-02T11:00:00Z',
      capturedAt: '2026-06-02T11:00:00Z',
    },
    approvalId: 'apr-002',
  },
  {
    id: 'rev-ent-005',
    reportId: 'RP20260602008',
    version: 2,
    action: 'edit',
    reason: '基于病理回报修改诊断意见',
    reasonCategory: 'terminology-error',
    authorId: 'D002',
    authorName: '李慧敏',
    authorTitle: '副主任医师',
    createdAt: '2026-06-03T16:30:00Z',
    postSnapshot: {
      version: 2,
      examFindings: '肝右叶可见一稍低密度灶，大小约 25mm×22mm',
      diagnosis: '肝右叶占位，病理证实腺癌（ICD-O 8170/3）',
      impression: '肝细胞癌可能，建议多学科会诊',
      qualityScore: 88,
      signedAt: '2026-06-03T17:00:00Z',
      capturedAt: '2026-06-03T17:00:00Z',
    },
    parentVersion: 1,
  },
  {
    id: 'rev-ent-006',
    reportId: 'RP20260603003',
    version: 1,
    action: 'start',
    reason: '左右位置描述错误，需立即修订',
    reasonCategory: 'left-right-confused',
    authorId: 'D003',
    authorName: '王建华',
    authorTitle: '主治医师',
    createdAt: '2026-06-04T14:00:00Z',
    approvalId: 'apr-003',
    cosignId: 'cosign-002',
  },
];

// ============================================================
// 审批（3 条：approved / pending / rejected）
// ============================================================

export const AMEND_APPROVALS: AmendApproval[] = [
  {
    id: 'apr-001',
    revisionId: 'rev-ent-001',
    reportId: 'RP20260601001',
    reason: '遗漏关键所见，需修订',
    requesterId: 'D001',
    requesterName: '张明远',
    approverId: 'D006',
    approverName: '赵雪琴',
    approverTitle: '主任医师',
    approvedAt: '2026-06-05T08:35:00Z',
    status: 'approved',
    isAutoApprove: false,
    createdAt: '2026-06-05T08:31:00Z',
  },
  {
    id: 'apr-002',
    revisionId: 'rev-ent-004',
    reportId: 'RP20260602008',
    reason: '病理回报触发修订',
    requesterId: 'D002',
    requesterName: '李慧敏',
    status: 'pending',
    isAutoApprove: false,
    createdAt: '2026-06-03T15:35:00Z',
  },
  {
    id: 'apr-003',
    revisionId: 'rev-ent-006',
    reportId: 'RP20260603003',
    reason: '左右位置描述错误',
    requesterId: 'D003',
    requesterName: '王建华',
    approverId: 'D001',
    approverName: '张明远',
    approverTitle: '主任医师',
    rejectedReason: '需双签，请补充科主任会签',
    status: 'rejected',
    isAutoApprove: false,
    createdAt: '2026-06-04T14:05:00Z',
  },
];

// ============================================================
// 双签（2 条）
// ============================================================

export const AMEND_COSIGNS = [
  {
    id: 'cosign-001',
    revisionId: 'rev-ent-002',
    reportId: 'RP20260601001',
    coSignerId: 'D006',
    coSignerName: '赵雪琴',
    coSignerTitle: '主任医师',
    coSignedAt: '2026-06-05T09:10:00Z',
    certificateSerial: '2F4D-8E1B-A039-7C58',
    signatureValue: 'MEUCIQCx9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f6==',
  },
  {
    id: 'cosign-002',
    revisionId: 'rev-ent-006',
    reportId: 'RP20260603003',
    coSignerId: 'D001',
    coSignerName: '张明远',
    coSignerTitle: '主任医师',
    coSignedAt: '2026-06-04T14:30:00Z',
    certificateSerial: '3A7F-9D2C-1145-E0B8',
    signatureValue: 'MEUCIQCx9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f7==',
  },
];

// ============================================================
// 补充（4 条，覆盖 pathology / comparison / follow-up / lab-result）
// ============================================================

export const SUPPLEMENT_ENTRIES: SupplementEntry[] = [
  {
    id: 'sup-001',
    reportId: 'RP20260601008',
    type: 'pathology',
    note: '病理回报：右肺下叶穿刺活检结果为非典型腺瘤样增生（AAH），建议继续随访观察。',
    authorId: 'D002',
    authorName: '李慧敏',
    createdAt: '2026-06-03T09:00:00Z',
    attachments: [
      {
        id: 'att-001',
        name: '病理报告-20260603.pdf',
        url: '/mock/attachments/pathology-20260603.pdf',
        mimeType: 'application/pdf',
        size: 245680,
        uploadedAt: '2026-06-03T09:00:00Z',
      },
    ],
    isCriticalLateMark: false,
    isMissedDx: false,
    reSignedAt: '2026-06-03T09:30:00Z',
    publishedAt: '2026-06-03T10:00:00Z',
  },
  {
    id: 'sup-002',
    reportId: 'RP20260602011',
    type: 'comparison-prior',
    note: '对比 2025 年 6 月 CT：原右肺上叶磨玻璃结节较前略增大（5mm → 7mm），需密切随访。',
    authorId: 'D005',
    authorName: '刘文博',
    createdAt: '2026-06-04T11:00:00Z',
    attachments: [
      {
        id: 'att-002',
        name: '历史CT-20250611.jpg',
        url: '/mock/attachments/prior-ct-20250611.jpg',
        mimeType: 'image/jpeg',
        size: 1240000,
        uploadedAt: '2026-06-04T11:00:00Z',
      },
    ],
    isCriticalLateMark: false,
    isMissedDx: false,
  },
  {
    id: 'sup-003',
    reportId: 'RP20260603012',
    type: 'follow-up',
    note: '3 个月随访结果：右肺下叶磨玻璃结节稳定，未见明显变化，继续按 Lung-RADS 3 类随访。',
    authorId: 'D001',
    authorName: '张明远',
    createdAt: '2026-06-04T15:00:00Z',
    attachments: [],
    isCriticalLateMark: false,
    isMissedDx: false,
    publishedAt: '2026-06-04T15:30:00Z',
  },
  {
    id: 'sup-004',
    reportId: 'RP20260604002',
    type: 'lab-result',
    note: '危急值补登：患者 D-二聚体显著升高（>5000 ng/mL），需立即通知临床。',
    authorId: 'D004',
    authorName: '陈晓燕',
    createdAt: '2026-06-04T18:00:00Z',
    attachments: [
      {
        id: 'att-003',
        name: 'D-二聚体-危急值.pdf',
        url: '/mock/attachments/critical-d-dimer-20260604.pdf',
        mimeType: 'application/pdf',
        size: 89320,
        uploadedAt: '2026-06-04T18:00:00Z',
      },
    ],
    isCriticalLateMark: true,
    isMissedDx: false,
    reSignedAt: '2026-06-04T18:30:00Z',
  },
];

// ============================================================
// Diff 模拟数据（v1 -> v2）
// ============================================================

export const VERSION_DIFFS: VersionDiff[] = [
  {
    id: 'diff-001',
    fromVersion: 1,
    toVersion: 2,
    fields: [
      {
        field: 'examFindings',
        before:
          '双肺纹理清晰，未见明显实质性病变。纵隔居中，气管支气管通畅。心影大小形态正常。膈肌光滑，胸膜未见增厚，胸腔未见积液。',
        after:
          '双肺纹理清晰，右肺下叶背段可见一磨玻璃密度结节，大小约 8mm×7mm，边界欠清，未见明显实性成分。余肺野未见明显实质性病变。纵隔居中，气管支气管通畅。心影大小形态正常。膈肌光滑，胸膜未见增厚，胸腔未见积液。',
        hunks: [
          { type: 'equal', text: '双肺纹理清晰，' },
          { type: 'insert', text: '右肺下叶背段可见一磨玻璃密度结节，大小约 8mm×7mm，边界欠清，未见明显实性成分。' },
          { type: 'equal', text: '余肺野' },
          { type: 'delete', text: '未见明显实质性病变' },
          { type: 'insert', text: '未见明显实质性病变' },
          { type: 'equal', text: '。纵隔居中，气管支气管通畅。' },
        ],
        additions: 1,
        deletions: 1,
      } as FieldDiff,
      {
        field: 'diagnosis',
        before: '胸部 CT 平扫未见明显异常',
        after: '右肺下叶背段磨玻璃结节（Lung-RADS 3 类）',
        hunks: [
          { type: 'delete', text: '胸部 CT 平扫未见明显异常' },
          { type: 'insert', text: '右肺下叶背段磨玻璃结节（Lung-RADS 3 类）' },
        ],
        additions: 1,
        deletions: 1,
      },
      {
        field: 'impression',
        before: '未见明显异常，建议年度随访',
        after: '右肺下叶磨玻璃结节，考虑为非典型腺瘤样增生或原位腺癌可能，建议 3 个月后复查。',
        hunks: [
          { type: 'delete', text: '未见明显异常，建议年度随访' },
          { type: 'insert', text: '右肺下叶磨玻璃结节，考虑为非典型腺瘤样增生或原位腺癌可能，建议 3 个月后复查。' },
        ],
        additions: 1,
        deletions: 1,
      },
    ],
    totalChanges: 3,
    addedChars: 78,
    removedChars: 18,
    computedAt: '2026-06-05T08:45:00Z',
  },
];

// ============================================================
// KPI
// ============================================================

export const AMEND_KPI: AmendmentKPI[] = [
  {
    period: 'today',
    totalAmendments: 4,
    totalSupplements: 3,
    avgAmendmentDurationHours: 3.5,
    amendmentRate: 0.05,
    reasonsBreakdown: {
      'description-unclear': 0,
      'terminology-error': 2,
      'left-right-confused': 1,
      'missing-key-finding': 1,
      'image-mismatch': 0,
      'missing-recommendation': 0,
      'critical-not-marked': 0,
      other: 0,
    },
  },
  {
    period: 'week',
    totalAmendments: 18,
    totalSupplements: 12,
    avgAmendmentDurationHours: 4.2,
    amendmentRate: 0.07,
    reasonsBreakdown: {
      'description-unclear': 1,
      'terminology-error': 6,
      'left-right-confused': 2,
      'missing-key-finding': 5,
      'image-mismatch': 1,
      'missing-recommendation': 2,
      'critical-not-marked': 0,
      other: 1,
    },
  },
  {
    period: 'month',
    totalAmendments: 72,
    totalSupplements: 48,
    avgAmendmentDurationHours: 5.1,
    amendmentRate: 0.083,
    reasonsBreakdown: {
      'description-unclear': 4,
      'terminology-error': 22,
      'left-right-confused': 8,
      'missing-key-finding': 18,
      'image-mismatch': 6,
      'missing-recommendation': 10,
      'critical-not-marked': 1,
      other: 3,
    },
  },
];

// ============================================================
// 合规审计
// ============================================================

export const AMEND_COMPLIANCE: AmendmentCompliance[] = [
  {
    reportId: 'RP20260601001',
    allSnapshotsRetained: true,
    signaturesPreserved: true,
    auditChainIntact: true,
    reasonCompliant: true,
    approvedWhenRequired: true,
  },
  {
    reportId: 'RP20260602008',
    allSnapshotsRetained: true,
    signaturesPreserved: true,
    auditChainIntact: true,
    reasonCompliant: true,
    approvedWhenRequired: false,
  },
  {
    reportId: 'RP20260603003',
    allSnapshotsRetained: true,
    signaturesPreserved: false,
    auditChainIntact: true,
    reasonCompliant: true,
    approvedWhenRequired: true,
  },
];

// ============================================================
// 修订模板（6 个）
// ============================================================

export const AMEND_TEMPLATES = [
  { id: 'tpl-amend-001', label: '遗漏关键所见', reason: '原报告遗漏 {finding}，已补入所见及诊断', category: 'missing-key-finding' },
  { id: 'tpl-amend-002', label: '术语修正', reason: '原 {old_term} 更正为 {new_term}', category: 'terminology-error' },
  { id: 'tpl-amend-003', label: '左右位置修正', reason: '原报告左右位置描述颠倒，已更正', category: 'left-right-confused' },
  { id: 'tpl-amend-004', label: '与图不符', reason: '原报告与影像所见不符，已重新核对', category: 'image-mismatch' },
  { id: 'tpl-amend-005', label: '缺建议', reason: '原报告未给出随访建议，已补充', category: 'missing-recommendation' },
  { id: 'tpl-amend-006', label: '其他', reason: '{reason}', category: 'other' },
] as const;

// ============================================================
// 修订热力（高频修订字段统计）
// ============================================================

export const AMEND_HOTSPOTS = [
  { field: 'diagnosis', count: 28, percent: 38.9 },
  { field: 'impression', count: 22, percent: 30.6 },
  { field: 'examFindings', count: 14, percent: 19.4 },
  { field: 'recommendations', count: 8, percent: 11.1 },
];

// ============================================================
// 患者告知书模板
// ============================================================

export const PATIENT_NOTICE_LETTER = {
  id: 'notice-template-001',
  title: '放射报告修订告知书',
  template: `尊敬的 {patientName}：

您的放射检查（{examItemName}，检查号 {accessionNumber}）报告已于 {originalSignedAt} 由 {originalSigner} 医师签发。

由于 {amendReason}，原报告已由 {amendSigner} 医师于 {amendSignedAt} 完成修订并重新发布。

如对本次修订有任何疑问，请联系您的临床主治医师或致电 G005 放射科（电话 010-xxxx-xxxx）。

特此告知。

G005 放射科
{noticeDate}`,
};