/**
 * G005 RIS v3.0.5.1 - R3.REVIEW INITIAL CHECK 初核清单类型定义
 * 对应章节 1.1 初核清单(80 点)
 *   包含 15+ 检查项、实时校验、必填高亮、批量、自定义项、SLA 计时、负载统计、一键通过/驳回
 */
import type {
  ReviewTask,
  Reviewer,
  ReviewerRole,
  WorkloadStat,
  SLAMetrics,
} from './R3.REVIEW';

export type CheckItemCategory =
  | 'completeness'
  | 'terminology'
  | 'consistency'
  | 'clinical'
  | 'safety'
  | 'compliance'
  | 'format';

export type CheckItemSeverity = 'info' | 'warning' | 'error' | 'critical';

export type CheckItemResultStatus = 'pending' | 'passed' | 'failed' | 'waived' | 'skipped';

/** 单个检查项定义 */
export interface InitialCheckItem {
  id: string;
  code: string;
  category: CheckItemCategory;
  /** 简短名(展示在列表) */
  name: string;
  /** 详细说明(hover/tooltip 显示) */
  description: string;
  /** 是否必填(影响一键通过按钮的可用性) */
  required: boolean;
  /** 严重程度(失败时高亮颜色) */
  severity: CheckItemSeverity;
  /** 默认是否启用 */
  enabledByDefault: boolean;
  /** 是否可由用户临时禁用 */
  userToggleable: boolean;
  /** 该项最大分值(用于自动评分,可选) */
  maxScore?: number;
  /** 该项失败时建议填写的拒绝原因分类 */
  suggestRejectCategory?: string;
  /** 该项自动校验函数需要的字段 key(报告内容) */
  sourceField?:
    | 'findings'
    | 'impression'
    | 'diagnosis'
    | 'recommendation'
    | 'clinicalHistory'
    | 'patientInfo'
    | 'studyInfo';
  /** 关键字列表:任意命中即视为通过(简易实现) */
  keywords?: string[];
  /** 正则列表:任意命中即视为通过 */
  patterns?: string[];
  /** 最小长度限制 */
  minLength?: number;
  /** 最大长度限制 */
  maxLength?: number;
  /** 是否为系统项(系统项不可删除) */
  isSystem: boolean;
  /** 适用模态(空表示通用) */
  applicableModalities?: string[];
  /** i18n 资源 key */
  i18nKey?: string;
  /** 自定义项(由 reviewer 创建)的所属 reviewer */
  createdBy?: string;
  createdAt?: string;
}

/** 单个检查项的执行结果(针对一个具体 report) */
export interface InitialCheckResult {
  itemId: string;
  itemCode: string;
  status: CheckItemResultStatus;
  /** 命中关键字或模式(用于显示反馈) */
  matchedText?: string;
  /** 自动评分(0-100) */
  autoScore?: number;
  /** 失败原因 */
  reason?: string;
  /** 备注(reviewer 填写) */
  note?: string;
  /** 是否被用户手动标记 passed/failed(覆盖自动结果) */
  overridden: boolean;
  /** 校验时间 */
  checkedAt: string;
}

/** 初核清单执行实例 */
export interface InitialCheckListInstance {
  id: string;
  reportId: string;
  taskId: string;
  /** 该报告关联的检查项(由模板 + 自定义项合并而成) */
  items: InitialCheckItem[];
  /** 各项结果(按 itemId 索引) */
  results: Record<string, InitialCheckResult>;
  /** 整体状态 */
  overallStatus: 'in-progress' | 'ready-to-approve' | 'approved' | 'rejected';
  /** 必填项是否全部通过 */
  requiredAllPassed: boolean;
  /** 必填项通过率 0-1 */
  requiredPassRate: number;
  /** 总通过率 0-1 */
  passRate: number;
  /** 自动评分(0-100) */
  autoScore: number;
  /** 关联 reviewer */
  reviewerId: string;
  reviewerName: string;
  reviewerTitle?: string;
  /** SLA 截止时间(ISO) */
  slaDeadline: string;
  /** SLA 剩余分钟数(正数=剩余,负数=超时) */
  slaRemainingMinutes: number;
  /** 是否已超时 */
  isOverdue: boolean;
  /** SLA 警告阈值(剩余 < 该值 时高亮,单位分钟) */
  slaWarnMinutes: number;
  /** 创建/更新时间 */
  createdAt: string;
  updatedAt: string;
  /** 最终通过/驳回决策 */
  decision?: 'approve' | 'reject';
  decisionAt?: string;
  decisionComment?: string;
}

/** 初核清单操作日志(用于 Audit Chain) */
export interface InitialCheckAuditEntry {
  id: string;
  listId: string;
  reportId: string;
  action:
    | 'created'
    | 'item-toggled'
    | 'item-overridden'
    | 'batch-validated'
    | 'approved'
    | 'rejected'
    | 'custom-item-added'
    | 'custom-item-removed'
    | 'sla-warned'
    | 'sla-breached'
    | 'batch-approve'
    | 'batch-reject';
  actorId: string;
  actorName: string;
  detail?: string;
  itemId?: string;
  timestamp: string;
}

/** SLA 配置(可按 reviewer 等级/stage 自定义) */
export interface InitialCheckSLAConfig {
  id: string;
  stage: 'initial';
  /** 默认 4h(分钟) */
  defaultMinutes: number;
  /** 按优先级 */
  byPriority: Record<'stat' | 'critical' | 'urgent' | 'routine', number>;
  /** 按模态 */
  byModality: Record<string, number>;
  /** 警告阈值(分钟) */
  warnMinutes: number;
  /** 超时自动升级 reviewer 等级 */
  autoEscalateOnBreach: boolean;
  /** 升级目标角色 */
  escalateToRole?: ReviewerRole;
  /** 升级延迟(分钟) */
  escalateAfterMinutes: number;
  updatedAt: string;
  updatedBy: string;
}

/** 批量初核请求 */
export interface InitialCheckBatchRequest {
  reportIds: string[];
  taskIds: string[];
  /** 决策 */
  decision: 'approve' | 'reject';
  /** 必填检查项全部通过(强制) */
  requireAllRequiredPass: boolean;
  /** 仅必填项通过即可 */
  onlyRequiredItems: boolean;
  /** 备注 */
  comment?: string;
  /** 拒绝分类(decision=reject 时必填) */
  rejectCategory?: string;
  /** 执行 reviewer */
  reviewerId: string;
  reviewerName: string;
  reviewerTitle?: string;
}

/** 批量初核响应 */
export interface InitialCheckBatchResult {
  total: number;
  approved: number;
  rejected: number;
  skipped: number;
  details: {
    listId: string;
    reportId: string;
    status: 'approved' | 'rejected' | 'skipped';
    reason?: string;
  }[];
  startedAt: string;
  completedAt: string;
}

/** 初核工作量统计 */
export interface InitialCheckWorkloadStats {
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: ReviewerRole;
  /** 今日完成初核数 */
  completedToday: number;
  /** 进行中 */
  inProgress: number;
  /** 待初核 */
  pending: number;
  /** 按时率 0-1 */
  onTimeRate: number;
  /** 平均耗时(分钟) */
  avgMinutes: number;
  /** 一键通过率(必填全过即通过的占比) */
  oneClickPassRate: number;
  /** 超时数 */
  overdue: number;
  /** 危急值处理数 */
  criticalHandled: number;
}

/** 自定义检查项(用户创建) */
export interface InitialCheckCustomItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  item: InitialCheckItem;
  /** 共享范围:private / department / global */
  scope: 'private' | 'department' | 'global';
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 初核仪表盘汇总 */
export interface InitialCheckSummary {
  total: number;
  pending: number;
  inProgress: number;
  approvedToday: number;
  rejectedToday: number;
  overdue: number;
  /** 必填项通过率(所有清单) */
  requiredPassRate: number;
  /** 一键通过率(所有清单) */
  oneClickPassRate: number;
  /** 平均耗时(分钟) */
  avgMinutes: number;
  /** 危急值占比 */
  criticalRatio: number;
  byModality: { modality: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  reviewerBreakdown: InitialCheckWorkloadStats[];
  slaMetrics: SLAMetrics;
  slaBreachByReviewer: { reviewerId: string; reviewerName: string; breachCount: number }[];
  trend: { date: string; approved: number; rejected: number; passRate: number }[];
}

/** 过滤参数 */
export interface InitialCheckFilter {
  stage?: 'initial';
  status?: 'all' | 'in-progress' | 'ready-to-approve' | 'approved' | 'rejected';
  priority?: 'all' | 'stat' | 'critical' | 'urgent' | 'routine';
  modality?: string;
  reviewerId?: string;
  overdueOnly?: boolean;
  requiredIncompleteOnly?: boolean;
  search?: string;
  customOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'deadline' | 'priority' | 'createdAt' | 'passRate';
  sortOrder?: 'asc' | 'desc';
}

/** 一键通过校验结果 */
export interface OneClickValidation {
  canPass: boolean;
  missing: string[];
  warnings: string[];
  passRate: number;
  requiredPassRate: number;
}

/** 复用的载荷 */
export type InitialCheckPayload = {
  task: ReviewTask;
  reviewer?: Reviewer;
  workload?: WorkloadStat;
};
