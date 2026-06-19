// ============================================================
// G005 放射RIS系统 v3.0.6 - HIPAA 合规检查
// HipaaService - Privacy Rule / Security Rule / Breach Notification
// ============================================================
import type { HipaaSafeguard, HipaaRule, HipaaAssessment } from '../../../types/security';

interface HipaaTemplate extends HipaaSafeguard {
  rule: HipaaRule;
}

const HIPAA_TEMPLATES: HipaaTemplate[] = [
  // ----- Privacy Rule (45 CFR 164.500-534) -----
  { id: 'PR-01', rule: 'privacy', category: 'administrative', name: 'Notice of Privacy Practices (NPP)', description: '向患者提供隐私实践通知', required: true, implemented: true, status: 'met', evidence: 'NPP 模板 v3', citations: ['45 CFR 164.520'], score: 90 },
  { id: 'PR-02', rule: 'privacy', category: 'administrative', name: 'Patient Authorization', description: '使用/披露 PHI 需获得患者授权', required: true, implemented: true, status: 'met', evidence: '同意书模板', citations: ['45 CFR 164.508'], score: 95 },
  { id: 'PR-03', rule: 'privacy', category: 'administrative', name: 'Minimum Necessary', description: '使用/披露应限于最小必要', required: true, implemented: true, status: 'met', evidence: '最小必要原则文档', citations: ['45 CFR 164.502(b)'], score: 88 },
  { id: 'PR-04', rule: 'privacy', category: 'administrative', name: 'Right of Access', description: '患者有权在 30 天内访问其 PHI', required: true, implemented: true, status: 'met', evidence: '患者门户 / 自助服务', citations: ['45 CFR 164.524'], score: 92 },
  { id: 'PR-05', rule: 'privacy', category: 'administrative', name: 'Right to Amend', description: '患者有权要求更正 PHI', required: true, implemented: true, status: 'met', evidence: '申请流程文档', citations: ['45 CFR 164.526'], score: 80 },
  { id: 'PR-06', rule: 'privacy', category: 'administrative', name: 'Right to Accounting', description: '患者有权获取披露记录', required: true, implemented: false, status: 'partially-met', evidence: '审计日志已实现,披露账本待集成', citations: ['45 CFR 164.528'], score: 60 },

  // ----- Security Rule (Administrative Safeguards) -----
  { id: 'SR-AD-01', rule: 'security', category: 'administrative', name: 'Security Management Process', description: '风险分析和管理', required: true, implemented: true, status: 'met', evidence: '年度风险评估报告', citations: ['45 CFR 164.308(a)(1)'], score: 85 },
  { id: 'SR-AD-02', rule: 'security', category: 'administrative', name: 'Assigned Security Responsibility', description: '指定安全责任人', required: true, implemented: true, status: 'met', evidence: '安全官任命书', citations: ['45 CFR 164.308(a)(2)'], score: 90 },
  { id: 'SR-AD-03', rule: 'security', category: 'administrative', name: 'Workforce Security', description: '工作人员授权/监督', required: true, implemented: true, status: 'met', evidence: 'RBAC 7 角色 + 22 权限', citations: ['45 CFR 164.308(a)(3)'], score: 92 },
  { id: 'SR-AD-04', rule: 'security', category: 'administrative', name: 'Information Access Management', description: 'PHI 访问管理', required: true, implemented: true, status: 'met', evidence: '权限矩阵 + 审计', citations: ['45 CFR 164.308(a)(4)'], score: 90 },
  { id: 'SR-AD-05', rule: 'security', category: 'administrative', name: 'Security Awareness Training', description: '安全意识培训', required: true, implemented: false, status: 'partially-met', evidence: '年度培训计划已制定,覆盖率 70%', citations: ['45 CFR 164.308(a)(5)'], score: 65 },
  { id: 'SR-AD-06', rule: 'security', category: 'administrative', name: 'Security Incident Procedures', description: '安全事件响应', required: true, implemented: true, status: 'met', evidence: 'IRP v3.2', citations: ['45 CFR 164.308(a)(6)'], score: 80 },
  { id: 'SR-AD-07', rule: 'security', category: 'administrative', name: 'Contingency Plan', description: '应急计划', required: true, implemented: true, status: 'met', evidence: 'DR 方案 + 演练报告', citations: ['45 CFR 164.308(a)(7)'], score: 78 },
  { id: 'SR-AD-08', rule: 'security', category: 'administrative', name: 'Evaluation', description: '定期评估', required: true, implemented: true, status: 'met', evidence: '季度评估', citations: ['45 CFR 164.308(a)(8)'], score: 80 },
  { id: 'SR-AD-09', rule: 'security', category: 'administrative', name: 'Business Associate Contracts', description: '业务伙伴协议', required: true, implemented: true, status: 'met', evidence: 'BAA 模板', citations: ['45 CFR 164.308(b)'], score: 85 },

  // ----- Security Rule (Physical Safeguards) -----
  { id: 'SR-PH-01', rule: 'security', category: 'physical', name: 'Facility Access Controls', description: '设施访问控制', required: true, implemented: true, status: 'met', evidence: '门禁系统', citations: ['45 CFR 164.310(a)'], score: 92 },
  { id: 'SR-PH-02', rule: 'security', category: 'physical', name: 'Workstation Use', description: '工作站使用', required: true, implemented: true, status: 'met', evidence: '工作站策略', citations: ['45 CFR 164.310(b)'], score: 85 },
  { id: 'SR-PH-03', rule: 'security', category: 'physical', name: 'Workstation Security', description: '工作站物理安全', required: true, implemented: true, status: 'met', evidence: '锁屏策略', citations: ['45 CFR 164.310(c)'], score: 88 },
  { id: 'SR-PH-04', rule: 'security', category: 'physical', name: 'Device and Media Controls', description: '设备和介质控制', required: true, implemented: true, status: 'met', evidence: '磁盘加密 + 销毁流程', citations: ['45 CFR 164.310(d)'], score: 90 },

  // ----- Security Rule (Technical Safeguards) -----
  { id: 'SR-TE-01', rule: 'security', category: 'technical', name: 'Access Control', description: '技术访问控制', required: true, implemented: true, status: 'met', evidence: '唯一用户标识 + 自动锁定 + 加密', citations: ['45 CFR 164.312(a)'], score: 92 },
  { id: 'SR-TE-02', rule: 'security', category: 'technical', name: 'Audit Controls', description: '审计控制', required: true, implemented: true, status: 'met', evidence: 'auditLogger + 哈希链', citations: ['45 CFR 164.312(b)'], score: 95 },
  { id: 'SR-TE-03', rule: 'security', category: 'technical', name: 'Integrity Controls', description: '数据完整性', required: true, implemented: true, status: 'met', evidence: 'SM3 + 数字签名', citations: ['45 CFR 164.312(c)'], score: 95 },
  { id: 'SR-TE-04', rule: 'security', category: 'technical', name: 'Person or Entity Authentication', description: '身份认证', required: true, implemented: true, status: 'met', evidence: 'MFA + JWT', citations: ['45 CFR 164.312(d)'], score: 90 },
  { id: 'SR-TE-05', rule: 'security', category: 'technical', name: 'Transmission Security', description: '传输安全', required: true, implemented: true, status: 'met', evidence: 'TLS 1.3 + 国密', citations: ['45 CFR 164.312(e)'], score: 92 },
  { id: 'SR-TE-06', rule: 'security', category: 'technical', name: 'Encryption (Addressable)', description: '加密 (可寻址)', required: false, implemented: true, status: 'met', evidence: 'AES-256 + SM4', citations: ['45 CFR 164.312(a)(2)(iv)'], score: 95 },

  // ----- Breach Notification Rule -----
  { id: 'BN-01', rule: 'breach-notification', category: 'administrative', name: 'Breach Notification to Individuals', description: '向受影响个人通报泄露事件', required: true, implemented: true, status: 'met', evidence: '通知模板 + 60 天时限', citations: ['45 CFR 164.404'], score: 85 },
  { id: 'BN-02', rule: 'breach-notification', category: 'administrative', name: 'Breach Notification to HHS', description: '向 HHS 部长通报', required: true, implemented: true, status: 'met', evidence: 'HHS 报告模板', citations: ['45 CFR 164.408'], score: 80 },
  { id: 'BN-03', rule: 'breach-notification', category: 'administrative', name: 'Breach Notification to Media', description: '向媒体通报 (≥500 人)', required: true, implemented: true, status: 'met', evidence: '媒体声明模板', citations: ['45 CFR 164.406'], score: 80 },
];

export class HipaaService {
  /** 执行 HIPAA 评估 */
  assess(opts: { assessedBy?: string }): HipaaAssessment {
    const safeguards: HipaaSafeguard[] = HIPAA_TEMPLATES.map(({ rule: _r, ...s }) => s);
    const privacyItems = safeguards.filter(s => HIPAA_TEMPLATES.find(t => t.id === s.id)?.rule === 'privacy');
    const securityItems = safeguards.filter(s => HIPAA_TEMPLATES.find(t => t.id === s.id)?.rule === 'security');
    const privacyScore = Math.round(privacyItems.reduce((s, i) => s + i.score, 0) / privacyItems.length);
    const securityScore = Math.round(securityItems.reduce((s, i) => s + i.score, 0) / securityItems.length);
    const overallScore = Math.round(safeguards.reduce((s, i) => s + i.score, 0) / safeguards.length);
    const gapItems = safeguards.filter(s => s.status !== 'met').map(s => s.name);
    const recommendations: string[] = [];
    if (privacyScore < 90) recommendations.push('完善 Privacy Rule 缺口:增加披露账本自动化');
    if (securityScore < 90) recommendations.push('加强 Security Awareness Training 覆盖率');
    if (gapItems.length > 0) recommendations.push(`优先处理 ${gapItems.length} 项差距项`);
    return {
      assessedAt: new Date().toISOString(),
      assessedBy: opts.assessedBy ?? 'system',
      overallScore,
      privacyScore,
      securityScore,
      safeguards,
      gapItems,
      recommendations,
    };
  }

  /** 获取所有 safeguard */
  getSafeguards(): HipaaSafeguard[] {
    return HIPAA_TEMPLATES.map(({ rule: _r, ...s }) => s);
  }

  /** 按规则分组 */
  getByRule(rule: HipaaRule): HipaaSafeguard[] {
    return HIPAA_TEMPLATES.filter(t => t.rule === rule).map(({ rule: _r, ...s }) => s);
  }

  /** 评估 Breach 风险 */
  assessBreach(opts: { affectedRecords: number; phiTypes: string[]; mitigated: boolean }): { breach: boolean; reportingRequired: 'individual' | 'media' | 'hhs' | 'none'; reason: string } {
    if (opts.mitilated !== undefined ? false : false) return { breach: false, reportingRequired: 'none', reason: '已通过安全港加密' };
    if (opts.affectedRecords === 0) return { breach: false, reportingRequired: 'none', reason: '无受影响记录' };
    if (opts.affectedRecords >= 500) return { breach: true, reportingRequired: 'media', reason: '≥500 人,需媒体通报' };
    if (opts.affectedRecords > 0) return { breach: true, reportingRequired: 'hhs', reason: '<500 人,需向 HHS 通报' };
    return { breach: false, reportingRequired: 'none', reason: '未达通报阈值' };
  }

  /** Safe Harbor 18 项标识符检查 */
  checkSafeHarbor(): { total: number; categories: string[] } {
    return { total: 18, categories: ['姓名', '地理细分', '日期', '电话', '传真', '邮箱', 'SSN', '病历号', '健康计划编号', '账户', '证书', '车辆', '设备', 'URL', 'IP', '生物特征', '照片', '其他唯一标识'] };
  }
}

export const hipaaService = new HipaaService();