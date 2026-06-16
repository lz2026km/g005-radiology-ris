// ============================================================
// G005 放射科RIS系统 v1.0.1 - 报告状态元数据
// Phase R0：14 态状态机的颜色/图标/分组/顺序集中管理
// ============================================================

import type { ReportStatus, ReportStatusGroup } from '../../types';
import {
  Inbox, UserCheck, Edit3, Send,
  Eye, CheckCircle, Shield, CheckCheck,
  Pen, Signature, Globe,
  RefreshCw, FileEdit, Undo2, XCircle, Archive,
  type LucideIcon,
} from 'lucide-react';

export interface ReportStatusMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
  order: number;
  group: ReportStatusGroup;
  description: string;
}

export const REPORT_STATUS_META: Record<ReportStatus, ReportStatusMeta> = {
  '待分配': {
    label: '待分配', color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db',
    icon: Inbox, order: 1, group: 'draft',
    description: '检查已完成，待分配报告医生',
  },
  '已分配': {
    label: '已分配', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc',
    icon: UserCheck, order: 2, group: 'draft',
    description: '已分派给报告医生，等待书写',
  },
  '书写中': {
    label: '书写中', color: '#1e40af', bg: '#dbeafe', border: '#93c5fd',
    icon: Edit3, order: 3, group: 'draft',
    description: '医生正在书写报告',
  },
  '已提交': {
    label: '已提交', color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd',
    icon: Send, order: 4, group: 'review',
    description: '已提交，等待初审',
  },
  '初审中': {
    label: '初审中', color: '#7c2d12', bg: '#fed7aa', border: '#fdba74',
    icon: Eye, order: 5, group: 'review',
    description: '高年资主治医师正在初审',
  },
  '初审通过': {
    label: '初审通过', color: '#15803d', bg: '#dcfce7', border: '#86efac',
    icon: CheckCircle, order: 6, group: 'review',
    description: '初审通过，待终审',
  },
  '终审中': {
    label: '终审中', color: '#a16207', bg: '#fef3c7', border: '#fcd34d',
    icon: Shield, order: 7, group: 'review',
    description: '副主任以上医师终审中',
  },
  '已审核': {
    label: '已审核', color: '#0891b2', bg: '#cffafe', border: '#67e8f9',
    icon: CheckCheck, order: 8, group: 'review',
    description: '终审通过，待签发',
  },
  '签发中': {
    label: '签发中', color: '#be185d', bg: '#fce7f3', border: '#f9a8d4',
    icon: Pen, order: 9, group: 'sign',
    description: '医生正在电子签发（CA 签名）',
  },
  '已签发': {
    label: '已签发', color: '#047857', bg: '#d1fae5', border: '#6ee7b7',
    icon: Signature, order: 10, group: 'sign',
    description: '报告已签发，待发布',
  },
  '已发布': {
    label: '已发布', color: '#059669', bg: '#d1fae5', border: '#6ee7b7',
    icon: Globe, order: 11, group: 'published',
    description: '已发布给临床/患者',
  },
  '修订中': {
    label: '修订中', color: '#d97706', bg: '#fef3c7', border: '#fcd34d',
    icon: RefreshCw, order: 12, group: 'special',
    description: '已发布报告正在补充/勘误',
  },
  '已修订': {
    label: '已修订', color: '#0891b2', bg: '#cffafe', border: '#67e8f9',
    icon: FileEdit, order: 13, group: 'special',
    description: '报告已修订完成',
  },
  '已撤回': {
    label: '已撤回', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1',
    icon: Undo2, order: 14, group: 'special',
    description: '已发布报告被撤回',
  },
  '已驳回': {
    label: '已驳回', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5',
    icon: XCircle, order: 15, group: 'special',
    description: '审核未通过，报告退回',
  },
  '已归档': {
    label: '已归档', color: '#374151', bg: '#e5e7eb', border: '#9ca3af',
    icon: Archive, order: 16, group: 'special',
    description: '报告已归档到长期存储',
  },
  '已暂停': {
    label: '已暂停', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d',
    icon: RefreshCw, order: 17, group: 'special',
    description: '检查流程已暂停',
  },
  '质控退回': {
    label: '质控退回', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5',
    icon: XCircle, order: 18, group: 'special',
    description: '质控审核未通过，已退回',
  },
};

// 状态显示顺序（按状态机推进顺序）
export const REPORT_STATUS_ORDER: ReportStatus[] = [
  '待分配', '已分配', '书写中', '已提交',
  '初审中', '初审通过', '终审中', '已审核',
  '签发中', '已签发', '已发布',
  '修订中', '已修订', '已撤回', '已驳回', '已归档',
  '已暂停', '质控退回',
];

// 状态分组（用于 UI Tab/筛选）
export const REPORT_STATUS_GROUPS: Record<ReportStatusGroup, {
  label: string;
  statuses: ReportStatus[];
}> = {
  draft:     { label: '草稿',     statuses: ['待分配', '已分配', '书写中'] },
  review:    { label: '审核',     statuses: ['已提交', '初审中', '初审通过', '终审中', '已审核'] },
  sign:      { label: '签发',     statuses: ['签发中', '已签发'] },
  published: { label: '已发布',   statuses: ['已发布'] },
  special:   { label: '特殊',     statuses: ['修订中', '已修订', '已撤回', '已驳回', '已归档', '已暂停', '质控退回'] },
};

// 兼容旧 5 态别名（用于平滑迁移）
export const LEGACY_STATUS_ALIAS: Record<string, ReportStatus> = {
  '未开始':  '待分配',
  '书写中':  '书写中',
  '待审核':  '已提交',
  '已审核':  '已审核',
  '已发布':  '已发布',
  '已驳回':  '已驳回',
  '已修改':  '已修订',
  '已退回':  '已驳回',
  '已暂停':  '已暂停',
  '质控退回': '质控退回',
};

// 兼容性别名转换
export function normalizeReportStatus(status: string): ReportStatus {
  return (LEGACY_STATUS_ALIAS[status] || status) as ReportStatus;
}
