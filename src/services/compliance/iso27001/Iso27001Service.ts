// ============================================================
// G005 放射RIS系统 v3.0.6 - ISO 27001:2022 信息安全管理体系
// Iso27001Service - Statement of Applicability (SoA) + 控制成熟度
// ============================================================
import type { IsoControl, IsoControlCategory, IsoStatementApplicability } from '../../../types/security';

const ISO_27001_CONTROLS: Omit<IsoControl, 'applicable' | 'implemented' | 'maturityLevel' | 'evidence' | 'gaps'>[] = [
  // A.5 组织控制 (37 项中精选 12 项)
  { id: 'A.5.1', category: 'A.5-organizational', control: '信息安全策略', objective: '管理方向和意图', description: '定义并批准信息安全策略' },
  { id: 'A.5.2', category: 'A.5-organizational', control: '信息安全角色与责任', objective: '明确职责', description: '定义信息安全角色和责任' },
  { id: 'A.5.7', category: 'A.5-organizational', control: '威胁情报', objective: '了解威胁态势', description: '收集威胁情报并应用到防护' },
  { id: 'A.5.10', category: 'A.5-organizational', control: '信息和其他资产分类', objective: '识别和保护资产', description: '对信息资产进行分类分级' },
  { id: 'A.5.12', category: 'A.5-organizational', control: '信息访问限制', objective: '限制访问', description: '按业务需求限制信息和资产访问' },
  { id: 'A.5.15', category: 'A.5-organizational', control: '访问控制', objective: '管理访问', description: '按访问控制策略限制访问' },
  { id: 'A.5.16', category: 'A.5-organizational', control: '身份管理', objective: '管理身份', description: '完整管理身份生命周期' },
  { id: 'A.5.17', category: 'A.5-organizational', control: '认证信息', objective: '保护认证凭据', description: '保护认证信息以防滥用' },
  { id: 'A.5.23', category: 'A.5-organizational', control: '云服务安全', objective: '保护云端信息', description: '云服务采购与安全管理' },
  { id: 'A.5.30', category: 'A.5-organizational', control: '业务连续性 ICT 准备', objective: '保证业务连续性', description: '基于业务连续性要求规划 ICT' },
  { id: 'A.5.34', category: 'A.5-organizational', control: '隐私与 PII 保护', objective: '保护隐私', description: '识别并满足 PII 保护要求' },
  { id: 'A.5.36', category: 'A.5-organizational', control: '合规性', objective: '满足合规要求', description: '识别并遵守相关法律法规' },

  // A.6 人员控制 (8 项)
  { id: 'A.6.1', category: 'A.6-people', control: '人员筛选', objective: '人员可靠性', description: '背景调查与录用审核' },
  { id: 'A.6.2', category: 'A.6-people', control: '雇佣条款', objective: '责任明确', description: '雇佣合同明确安全责任' },
  { id: 'A.6.3', category: 'A.6-people', control: '安全意识培训', objective: '意识提升', description: '全员安全意识与培训' },
  { id: 'A.6.4', category: 'A.6-people', control: '纪律程序', objective: '违规处理', description: '违规事件处理流程' },
  { id: 'A.6.5', category: 'A.6-people', control: '离职/调岗', objective: '责任终止', description: '人员变动后的访问终止' },
  { id: 'A.6.6', category: 'A.6-people', control: '保密协议', objective: '信息保密', description: 'NDA 与保密责任' },
  { id: 'A.6.7', category: 'A.6-people', control: '远程工作安全', objective: '远程安全', description: '远程办公安全措施' },
  { id: 'A.6.8', category: 'A.6-people', control: '事件报告', objective: '及时响应', description: '员工安全事件报告机制' },

  // A.7 物理控制 (14 项精选 6 项)
  { id: 'A.7.1', category: 'A.7-physical', control: '物理边界', objective: '物理防护', description: '安全区域物理边界' },
  { id: 'A.7.2', category: 'A.7-physical', control: '物理入口', objective: '访问控制', description: '安全区域受控访问' },
  { id: 'A.7.3', category: 'A.7-physical', control: '办公室与房间', objective: '环境保护', description: '办公区域物理保护' },
  { id: 'A.7.4', category: 'A.7-physical', control: '物理安全监控', objective: '威慑与检测', description: '监控、报警系统' },
  { id: 'A.7.5', category: 'A.7-physical', control: '物理和环境威胁', objective: '环境防护', description: '防火、防水、防雷' },
  { id: 'A.7.12', category: 'A.7-physical', control: '布线安全', objective: '线路保护', description: '网络与电力线缆保护' },

  // A.8 技术控制 (34 项精选 12 项)
  { id: 'A.8.2', category: 'A.8-technological', control: '特权访问权', objective: '限制特权', description: '特权访问管理与监控' },
  { id: 'A.8.3', category: 'A.8-technological', control: '信息访问限制', objective: '限制访问', description: '按策略限制信息访问' },
  { id: 'A.8.5', category: 'A.8-technological', control: '安全认证', objective: '强认证', description: '多因素认证与强密码' },
  { id: 'A.8.7', category: 'A.8-technological', control: '恶意软件防护', objective: '防恶意代码', description: '恶意软件检测与防护' },
  { id: 'A.8.8', category: 'A.8-technological', control: '技术漏洞管理', objective: '漏洞修补', description: '漏洞识别与修补' },
  { id: 'A.8.12', category: 'A.8-technological', control: '数据泄漏防护', objective: '防泄漏', description: 'DLP 措施' },
  { id: 'A.8.15', category: 'A.8-technological', control: '日志记录', objective: '审计追踪', description: '完整日志记录' },
  { id: 'A.8.16', category: 'A.8-technological', control: '监控活动', objective: '异常检测', description: '系统监控与异常检测' },
  { id: 'A.8.21', category: 'A.8-technological', control: '网络安全服务', objective: '网络安全', description: '网络安全控制' },
  { id: 'A.8.23', category: 'A.8-technological', control: 'Web 过滤', objective: 'Web 安全', description: 'Web 访问过滤' },
  { id: 'A.8.24', category: 'A.8-technological', control: '密码使用', objective: '密码管理', description: '密码技术使用策略' },
  { id: 'A.8.28', category: 'A.8-technological', control: '安全编码', objective: '代码安全', description: '安全编码原则与实践' },

  // A.9 通信与运营 (本组视为组织控制)
  { id: 'A.9.1', category: 'A.9-communication', control: '操作规程', objective: '规范操作', description: '操作规程与变更管理' },
  { id: 'A.9.2', category: 'A.9-communication', control: '变更管理', objective: '变更控制', description: '系统变更管理' },
  { id: 'A.9.5', category: 'A.9-communication', control: '容量管理', objective: '容量规划', description: '容量规划与监控' },
  { id: 'A.9.7', category: 'A.9-communication', control: '备份', objective: '数据可用', description: '定期备份与恢复测试' },
];

// 模拟成熟度评估 (固定值, 真实场景应来自评估工具)
const MATURITY_MAP: Record<string, { implemented: boolean; level: 0 | 1 | 2 | 3 | 4 | 5; evidence: string; gaps: string[] }> = {
  'A.5.1': { implemented: true, level: 4, evidence: 'ISMS Policy v3.2 文档', gaps: [] },
  'A.5.2': { implemented: true, level: 4, evidence: 'CISO + 安全团队组织架构', gaps: [] },
  'A.5.7': { implemented: true, level: 3, evidence: '威胁情报订阅', gaps: ['缺少自动化情报消费'] },
  'A.5.10': { implemented: true, level: 4, evidence: '数据分类分级表', gaps: [] },
  'A.5.12': { implemented: true, level: 4, evidence: 'RBAC 7 角色', gaps: [] },
  'A.5.15': { implemented: true, level: 4, evidence: '访问控制策略', gaps: [] },
  'A.5.16': { implemented: true, level: 4, evidence: 'IAM 系统', gaps: [] },
  'A.5.17': { implemented: true, level: 3, evidence: '密码策略 + MFA', gaps: ['需扩展到所有系统'] },
  'A.5.23': { implemented: true, level: 3, evidence: '云服务商评估', gaps: ['需补充 SaaS 清单'] },
  'A.5.30': { implemented: true, level: 3, evidence: 'DR 演练报告', gaps: [] },
  'A.5.34': { implemented: true, level: 4, evidence: 'PIPL + GDPR 评估', gaps: [] },
  'A.5.36': { implemented: true, level: 3, evidence: '合规清单', gaps: [] },
  'A.6.1': { implemented: true, level: 3, evidence: '人事背景调查', gaps: [] },
  'A.6.2': { implemented: true, level: 3, evidence: '劳动合同', gaps: [] },
  'A.6.3': { implemented: true, level: 2, evidence: '年度培训', gaps: ['覆盖率不足'] },
  'A.6.4': { implemented: true, level: 3, evidence: '纪律程序文档', gaps: [] },
  'A.6.5': { implemented: true, level: 4, evidence: 'IT 自动禁用流程', gaps: [] },
  'A.6.6': { implemented: true, level: 4, evidence: 'NDA 模板', gaps: [] },
  'A.6.7': { implemented: true, level: 3, evidence: 'VPN + DLP', gaps: [] },
  'A.6.8': { implemented: true, level: 4, evidence: '事件上报流程', gaps: [] },
  'A.7.1': { implemented: true, level: 4, evidence: '机房边界', gaps: [] },
  'A.7.2': { implemented: true, level: 5, evidence: '人脸识别 + 刷卡', gaps: [] },
  'A.7.3': { implemented: true, level: 4, evidence: '门禁 + 监控', gaps: [] },
  'A.7.4': { implemented: true, level: 5, evidence: '24/7 监控中心', gaps: [] },
  'A.7.5': { implemented: true, level: 4, evidence: 'FM200 + 烟感', gaps: [] },
  'A.7.12': { implemented: true, level: 3, evidence: '桥架布线', gaps: [] },
  'A.8.2': { implemented: true, level: 4, evidence: '堡垒机 + PAM', gaps: [] },
  'A.8.3': { implemented: true, level: 4, evidence: '细粒度权限', gaps: [] },
  'A.8.5': { implemented: true, level: 4, evidence: 'MFA 部署', gaps: [] },
  'A.8.7': { implemented: true, level: 4, evidence: 'EDR 全量部署', gaps: [] },
  'A.8.8': { implemented: true, level: 4, evidence: '季度漏洞扫描', gaps: [] },
  'A.8.12': { implemented: true, level: 4, evidence: 'DLP 服务', gaps: [] },
  'A.8.15': { implemented: true, level: 5, evidence: 'Merkle + 区块链', gaps: [] },
  'A.8.16': { implemented: true, level: 4, evidence: 'SIEM 平台', gaps: [] },
  'A.8.21': { implemented: true, level: 4, evidence: '下一代防火墙', gaps: [] },
  'A.8.23': { implemented: true, level: 4, evidence: 'Web 过滤网关', gaps: [] },
  'A.8.24': { implemented: true, level: 4, evidence: 'TLS 1.3 + 国密', gaps: [] },
  'A.8.28': { implemented: true, level: 3, evidence: 'SDL 流程', gaps: ['覆盖率不足'] },
  'A.9.1': { implemented: true, level: 4, evidence: 'Runbook', gaps: [] },
  'A.9.2': { implemented: true, level: 4, evidence: 'CAB 评审', gaps: [] },
  'A.9.5': { implemented: true, level: 3, evidence: '容量监控', gaps: [] },
  'A.9.7': { implemented: true, level: 4, evidence: '每日备份 + 演练', gaps: [] },
};

export class Iso27001Service {
  /** 生成 SoA (Statement of Applicability) */
  generateSoA(opts: { organization?: string; scope?: string }): IsoStatementApplicability {
    const controls: IsoControl[] = ISO_27001_CONTROLS.map(c => {
      const m = MATURITY_MAP[c.id] ?? { implemented: false, level: 0, evidence: '', gaps: ['未实施'] };
      return {
        ...c,
        applicable: true,
        implemented: m.implemented,
        maturityLevel: m.level,
        evidence: m.evidence,
        gaps: m.gaps,
      };
    });
    const implemented = controls.filter(c => c.implemented);
    const avgMaturity = implemented.length > 0
      ? Math.round((implemented.reduce((s, c) => s + c.maturityLevel, 0) / implemented.length) * 10) / 10
      : 0;
    return {
      version: '2022',
      generatedAt: new Date().toISOString(),
      organization: opts.organization ?? 'G005 放射 RIS',
      scope: opts.scope ?? '放射科信息系统开发、运维、服务',
      controls,
      overallMaturity: avgMaturity,
      risksAccepted: controls.filter(c => c.implemented && c.maturityLevel >= 3).length,
      risksTreated: controls.filter(c => c.implemented && c.maturityLevel >= 4).length,
    };
  }

  /** 获取所有控制 */
  getControls(category?: IsoControlCategory): IsoControl[] {
    return this.generateSoA().controls.filter(c => !category || c.category === category);
  }

  /** 按类别统计 */
  statsByCategory(): Record<IsoControlCategory, { total: number; implemented: number; avgMaturity: number }> {
    const soa = this.generateSoA();
    const grouped: Record<string, { total: number; implemented: number; sumMaturity: number }> = {};
    for (const c of soa.controls) {
      const k = c.category;
      const entry = grouped[k] ?? { total: 0, implemented: 0, sumMaturity: 0 };
      entry.total++;
      if (c.implemented) entry.implemented++;
      entry.sumMaturity += c.maturityLevel;
      grouped[k] = entry;
    }
    const out: Record<IsoControlCategory, { total: number; implemented: number; avgMaturity: number }> = {
      'A.5-organizational': { total: 0, implemented: 0, avgMaturity: 0 },
      'A.6-people': { total: 0, implemented: 0, avgMaturity: 0 },
      'A.7-physical': { total: 0, implemented: 0, avgMaturity: 0 },
      'A.8-technological': { total: 0, implemented: 0, avgMaturity: 0 },
      'A.9-communication': { total: 0, implemented: 0, avgMaturity: 0 },
    };
    for (const k of Object.keys(grouped) as IsoControlCategory[]) {
      const e = grouped[k]!;
      out[k] = { total: e.total, implemented: e.implemented, avgMaturity: e.total > 0 ? Math.round((e.sumMaturity / e.total) * 10) / 10 : 0 };
    }
    return out;
  }

  /** 风险差距识别 */
  identifyGaps(): { id: string; control: string; gap: string; severity: 'low' | 'medium' | 'high' }[] {
    const soa = this.generateSoA();
    const gaps: { id: string; control: string; gap: string; severity: 'low' | 'medium' | 'high' }[] = [];
    for (const c of soa.controls) {
      if (c.maturityLevel < 3) {
        gaps.push({
          id: c.id,
          control: c.control,
          gap: `成熟度仅 ${c.maturityLevel}/5, 低于基准 3`,
          severity: c.maturityLevel === 0 ? 'high' : c.maturityLevel === 1 ? 'high' : 'medium',
        });
      }
      for (const g of c.gaps) gaps.push({ id: c.id, control: c.control, gap: g, severity: 'low' });
    }
    return gaps;
  }
}

export const iso27001Service = new Iso27001Service();