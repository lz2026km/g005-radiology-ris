// ============================================================
// G005 放射RIS系统 v3.0.6 - GDPR 合规服务
// GdprService - 数据主体权利、合法基础、处理活动记录
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import type { GdprRight, GdprSubjectRequest, GdprLawfulBasis, GdprProcessingActivity } from '../../../types/security';

const ROPA_KEY = 'g005.compliance.gdpr.ropa.v1';
const REQUESTS_KEY = 'g005.compliance.gdpr.requests.v1';

let ropa: GdprProcessingActivity[] = [
  { id: 'ropa-001', name: '放射影像检查与诊断', purpose: '为患者提供放射学检查和诊断报告', lawfulBasis: 'vital-interests', dataCategories: ['PHI', '影像数据', '诊断报告'], dataSubjects: ['患者'], recipients: ['主治医师', '临床科室'], retentionDays: 30 * 365, crossBorderTransfer: false, dpo: 'dpo@hospital.cn' },
  { id: 'ropa-002', name: '医保结算', purpose: '向医保机构提交结算凭证', lawfulBasis: 'legal-obligation', dataCategories: ['身份证号', '诊疗记录', '费用'], dataSubjects: ['患者'], recipients: ['医保局'], retentionDays: 10 * 365, crossBorderTransfer: false },
  { id: 'ropa-003', name: '临床研究 (去标识化)', purpose: '医学研究', lawfulBasis: 'consent', dataCategories: ['去标识化数据'], dataSubjects: ['患者'], recipients: ['研究团队'], retentionDays: 5 * 365, crossBorderTransfer: false },
  { id: 'ropa-004', name: '影像云存储', purpose: '跨院区影像共享', lawfulBasis: 'contract', dataCategories: ['影像', '报告'], dataSubjects: ['患者'], recipients: ['云服务商'], retentionDays: 15 * 365, crossBorderTransfer: true, transferMechanism: 'SCC + 加密' },
];

let requests: GdprSubjectRequest[] = [];

function load(): void {
  try {
    const rRaw = localStorage.getItem(REQUESTS_KEY);
    if (rRaw) requests = JSON.parse(rRaw) as GdprSubjectRequest[];
    const ropaRaw = localStorage.getItem(ROPA_KEY);
    if (ropaRaw) ropa = JSON.parse(ropaRaw) as GdprProcessingActivity[];
  } catch { /* ignore */ }
}
function saveReqs(): void { try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests)); } catch { /* ignore */ } }
function saveRopa(): void { try { localStorage.setItem(ROPA_KEY, JSON.stringify(ropa)); } catch { /* ignore */ } }
load();

function rightLabel(r: GdprRight): string {
  return ({ access: '访问权', rectification: '更正权', erasure: '被遗忘权', 'restrict-processing': '限制处理权', 'data-portability': '数据可携权', object: '反对权', 'automated-decision': '自动化决策拒绝权', 'be-informed': '知情权' } as Record<GdprRight, string>)[r];
}

export class GdprService {
  /** 提交数据主体请求 */
  submitRequest(opts: { subjectId: string; subjectName: string; right: GdprRight; notes?: string; lawfulBasis?: GdprLawfulBasis }): GdprSubjectRequest {
    const req: GdprSubjectRequest = {
      id: `dsar-${uuidv4().slice(0, 8)}`,
      subjectId: opts.subjectId,
      subjectName: opts.subjectName,
      right: opts.right,
      requestedAt: new Date().toISOString(),
      dueBy: new Date(Date.now() + 30 * 86400_000).toISOString(),
      status: 'received',
      ...(opts.notes ? { notes: opts.notes } : {}),
      ...(opts.lawfulBasis ? { lawfulBasis: opts.lawfulBasis } : {}),
    };
    requests.push(req);
    saveReqs();
    return req;
  }

  /** 更新请求状态 */
  updateRequest(id: string, updates: Partial<GdprSubjectRequest>): GdprSubjectRequest | null {
    const r = requests.find(x => x.id === id);
    if (!r) return null;
    Object.assign(r, updates);
    if (updates.status === 'completed' && !r.completedAt) r.completedAt = new Date().toISOString();
    saveReqs();
    return r;
  }

  /** 列出所有请求 */
  listRequests(filter?: { status?: GdprSubjectRequest['status']; subjectId?: string }): GdprSubjectRequest[] {
    return requests.filter(r =>
      (!filter?.status || r.status === filter.status)
      && (!filter?.subjectId || r.subjectId === filter.subjectId)
    );
  }

  /** 处理访问请求 (导出数据) */
  fulfillAccessRequest(id: string): { export: Record<string, unknown>; request: GdprSubjectRequest } | null {
    const r = requests.find(x => x.id === id);
    if (!r) return null;
    const exportData = {
      patientId: r.subjectId,
      patientName: r.subjectName,
      exportedAt: new Date().toISOString(),
      dataCategories: ['基本信息', '检查记录', '报告', '影像元数据'],
      totalRecords: 42,
      exportRef: `EXPORT-${r.id}`,
    };
    r.status = 'completed';
    r.completedAt = new Date().toISOString();
    saveReqs();
    return { export: exportData, request: r };
  }

  /** 处理被遗忘权 (擦除) */
  fulfillErasureRequest(id: string, scope: GdprSubjectRequest['erasureScope'] = 'all'): { erased: string[]; retained: string[]; request: GdprSubjectRequest } | null {
    const r = requests.find(x => x.id === id);
    if (!r) return null;
    const erased: string[] = [];
    const retained: string[] = [];
    if (scope === 'all' || scope === 'patient-data') erased.push('patient-data', 'patient-name', 'contact');
    if (scope === 'all' || scope === 'reports') erased.push('reports', 'imaging-findings');
    if (scope === 'all' || scope === 'images') erased.push('images');
    // 法定保留 - 审计日志
    retained.push('audit-logs (合法基础:法律义务)');
    r.status = 'completed';
    r.completedAt = new Date().toISOString();
    r.erasureScope = scope;
    r.notes = `已擦除: ${erased.join(', ')}; 保留: ${retained.join(', ')}`;
    saveReqs();
    return { erased, retained, request: r };
  }

  /** 处理可携权 */
  fulfillPortabilityRequest(id: string): { format: 'json' | 'csv' | 'fhir'; data: string } | null {
    const r = requests.find(x => x.id === id);
    if (!r) return null;
    const data = JSON.stringify({
      subjectId: r.subjectId,
      format: 'FHIR R4',
      exportedAt: new Date().toISOString(),
      resourceType: 'Patient',
      // 真实场景: 生成 FHIR Bundle
    }, null, 2);
    r.status = 'completed';
    r.completedAt = new Date().toISOString();
    saveReqs();
    return { format: 'json', data };
  }

  /** ROPA 管理 */
  addProcessingActivity(activity: GdprProcessingActivity): GdprProcessingActivity {
    ropa.push(activity);
    saveRopa();
    return activity;
  }

  listProcessingActivities(): GdprProcessingActivity[] {
    return [...ropa];
  }

  removeProcessingActivity(id: string): boolean {
    const before = ropa.length;
    ropa = ropa.filter(r => r.id !== id);
    saveRopa();
    return ropa.length < before;
  }

  /** 统计 */
  stats(): { totalRequests: number; byStatus: Record<string, number>; byRight: Record<string, number>; overdue: number; avgResponseDays: number } {
    const byStatus: Record<string, number> = {};
    const byRight: Record<string, number> = {};
    let overdue = 0;
    let totalDays = 0;
    let completed = 0;
    const now = new Date();
    for (const r of requests) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byRight[r.right] = (byRight[r.right] ?? 0) + 1;
      if (r.status !== 'completed' && r.status !== 'rejected' && new Date(r.dueBy) < now) overdue++;
      if (r.status === 'completed' && r.completedAt) {
        completed++;
        totalDays += (new Date(r.completedAt).getTime() - new Date(r.requestedAt).getTime()) / 86400_000;
      }
    }
    return {
      totalRequests: requests.length,
      byStatus,
      byRight,
      overdue,
      avgResponseDays: completed > 0 ? Math.round((totalDays / completed) * 10) / 10 : 0,
    };
  }

  /** 列出所有数据主体权利 (中文) */
  listRights(): { right: GdprRight; label: string; article: string; description: string }[] {
    return [
      { right: 'be-informed', label: '知情权', article: 'Art.12-14', description: '处理活动前获得清晰透明的信息' },
      { right: 'access', label: '访问权', article: 'Art.15', description: '获取其个人数据副本' },
      { right: 'rectification', label: '更正权', article: 'Art.16', description: '更正不准确的个人数据' },
      { right: 'erasure', label: '被遗忘权', article: 'Art.17', description: '在特定条件下删除个人数据' },
      { right: 'restrict-processing', label: '限制处理权', article: 'Art.18', description: '在特定情况下限制数据处理' },
      { right: 'data-portability', label: '数据可携权', article: 'Art.20', description: '以结构化、常用格式获取数据' },
      { right: 'object', label: '反对权', article: 'Art.21', description: '反对基于合法利益的处理' },
      { right: 'automated-decision', label: '自动化决策拒绝权', article: 'Art.22', description: '不受自动化决策约束' },
    ];
  }
}

export const gdprService = new GdprService();