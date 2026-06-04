# Phase R0：数据模型与状态机重构

> **Phase 编号**：R0
> **工期**：1-2 周
> **优先级**：P0
> **依赖**：无
> **状态**：✅ 用户批准（2026-06-04），进入 Build 模式
> **目标版本**：v1.0.1

---

## 1. 目标

将放射报告全生命周期状态机从 **6 态** 升级为 **14 态**，并在 `RadiologyReport` 上扩展关键字段，为后续 Phase R1-R7 奠定数据基础。

---

## 2. 范围

### 2.1 包含

- ✅ `src/types/index.ts` — 扩展 `ReportStatus` 枚举 + 新增 5 个接口
- ✅ `src/data/initialData.ts` — `initialRadiologyReports` 扩充（20 → 50 条），覆盖 14 态
- ✅ `src/data/reportSubsystemMock.ts` — 新建（独立 mock 文件，500+ 条）
- ✅ `src/components/report/StatusBadge.tsx` — 新建（状态徽标组件）
- ✅ `src/components/report/StatusTimeline.tsx` — 新建（状态时间线组件）
- ✅ `src/components/report/index.ts` — 新建（统一导出）
- ✅ `src/pages/ReportPage.tsx` — 改造（接入 14 态状态机）

### 2.2 不包含

- ❌ 富文本编辑器（Phase R1）
- ❌ 结构化字段表单（Phase R1）
- ❌ 关键字纠错（Phase R1）
- ❌ 模板设计器（Phase R2）
- ❌ 审核/修订/协同（Phase R3）
- ❌ CA 签名（Phase R6）

---

## 3. 详细任务

### 3.1 类型扩展

#### 3.1.1 报告状态枚举

**文件**：`src/types/index.ts`

**改动**：将 `ReportStatus` 从 6 态升级到 14 态

**原 6 态**：
```ts
export type ReportStatus = '未开始' | '书写中' | '待审核' | '已审核' | '已发布' | '已驳回';
```

**新 14 态**：
```ts
export type ReportStatus =
  | '待分配' | '已分配' | '书写中' | '已提交'
  | '初审中' | '初审通过' | '终审中' | '已审核'
  | '签发中' | '已签发' | '已发布'
  | '修订中' | '已修订' | '已撤回' | '已驳回' | '已归档';
```

**兼容性**：保留 6 态中除"未开始"外的 5 态别名（通过类型联合实现向后兼容；旧 mock 数据将逐步迁移）。

#### 3.1.2 `RadiologyReport` 扩展字段

```ts
// 在原接口基础上新增（不破坏现有字段）
export interface RadiologyReport {
  // ... 原有字段 ...

  // 新增：任务分配
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedTime?: string;

  // 新增：审核流程
  initialAuditDoctorId?: string;
  initialAuditDoctorName?: string;
  initialAuditTime?: string;
  initialAuditSuggestion?: string;
  finalAuditDoctorId?: string;
  finalAuditDoctorName?: string;
  finalAuditTime?: string;

  // 新增：报告溯源
  reportSource: 'manual' | 'template' | 'ai-assist' | 'voice';
  wordCount?: number;
  draftSavedAt?: string;

  // 新增：时效监控
  timelinessFlag?: 'onTime' | 'late' | 'overdue';
  expectedFinishTime?: string; // 期望完成时间
}
```

#### 3.1.3 新增接口（仅类型定义，不实现业务逻辑）

```ts
// 结构化字段值
export interface StructuredField {
  templateFieldId: string;
  fieldKey: string;
  fieldLabel: string;
  value: string | number | string[];
  unit?: string;
  dataType: 'text' | 'number' | 'enum' | 'multi-enum' | 'date' | 'scale' | 'boolean';
  options?: { label: string; value: string; color?: string }[];
  category?: string;
}

// 病灶测量
export interface Measurement {
  id: string;
  type: 'length' | 'area' | 'volume' | 'angle' | 'density';
  value: number;
  unit: string;
  location: string;
  lesionNumber: number;
  imageSliceIndex: number;
  coordinates: { x: number; y: number; z?: number }[];
  isTarget: boolean;
}

// 图像标注
export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rect' | 'text' | 'ruler' | 'freehand';
  coordinates: any;
  color: string;
  label?: string;
  authorId: string;
  timestamp: string;
}

// 报告图
export interface ReportImage {
  id: string;
  seriesInstanceUid: string;
  sopInstanceUid: string;
  thumbnailUrl: string;
  caption?: string;
  measurementIds?: string[];
}

// 数字签名
export interface DigitalSignature {
  certificateId: string;
  signerName: string;
  signerTitle: string;
  signedAt: string;
  signatureValue: string;
  certificateChain: string[];
  timestampAuthority: string;
  algorithm: 'RSA-SHA256' | 'SM3-SM2';
}
```

### 3.2 Mock 数据扩充

#### 3.2.1 `initialData.ts` 迁移

将原有 `initialRadiologyReports` 从 20 条扩充到 50 条，确保每种状态至少 2-3 条样本。

| 状态 | 数量 | 备注 |
|---|---|---|
| 待分配 | 4 | 急诊/批量 |
| 已分配 | 4 | 待书写 |
| 书写中 | 4 | 草稿 |
| 已提交 | 4 | 待初审 |
| 初审中 | 4 | |
| 初审通过 | 3 | |
| 终审中 | 3 | |
| 已审核 | 4 | 待签发 |
| 签发中 | 3 | |
| 已签发 | 4 | 待发布 |
| 已发布 | 5 | 已发布（含历史） |
| 修订中 | 2 | |
| 已修订 | 2 | |
| 已撤回 | 1 | |
| 已驳回 | 2 | |
| 已归档 | 1 | |
| **合计** | **50** | |

#### 3.2.2 新建 `reportSubsystemMock.ts`

```ts
// 集中管理报告子系统扩展数据
export const extendedReportMock: RadiologyReport[] = [...]; // 50 条
export const statusTransitionLog = [...]; // 状态变迁日志
export const reportAuditTimeline = [...]; // 审核时间线
```

### 3.3 组件新建

#### 3.3.1 `StatusBadge.tsx`

**职责**：显示 14 态之一的状态徽标（不同颜色 + 图标）

**Props**：
```ts
interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}
```

**实现要点**：
- 14 态颜色映射
- 14 态图标映射（lucide-react）
- 复用现有 design-system 风格

#### 3.3.2 `StatusTimeline.tsx`

**职责**：显示报告从创建到当前的状态变迁

**Props**：
```ts
interface StatusTimelineProps {
  report: RadiologyReport;
  showAuditInfo?: boolean;
}
```

**实现要点**：
- 横向时间线
- 每个节点：状态徽标 + 时间 + 操作人
- 当前状态高亮
- 已驳回/已撤回特殊样式

#### 3.3.3 `index.ts`（统一导出）

```ts
export { StatusBadge } from './StatusBadge';
export { StatusTimeline } from './StatusTimeline';
export { REPORT_STATUS_META } from './statusMeta';
```

#### 3.3.4 `statusMeta.ts`（共享元数据）

**职责**：14 态的颜色、图标、文案集中管理

```ts
export const REPORT_STATUS_META: Record<ReportStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string; // lucide icon name
  order: number; // 状态机顺序
  group: 'draft' | 'review' | 'sign' | 'published' | 'special';
}> = {
  '待分配':   { label: '待分配',   color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', icon: 'Inbox',       order: 1,  group: 'draft' },
  '已分配':   { label: '已分配',   color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', icon: 'UserCheck',   order: 2,  group: 'draft' },
  '书写中':   { label: '书写中',   color: '#1e40af', bg: '#dbeafe', border: '#93c5fd', icon: 'Edit3',       order: 3,  group: 'draft' },
  '已提交':   { label: '已提交',   color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd', icon: 'Send',        order: 4,  group: 'review' },
  '初审中':   { label: '初审中',   color: '#7c2d12', bg: '#fed7aa', border: '#fdba74', icon: 'Eye',         order: 5,  group: 'review' },
  '初审通过': { label: '初审通过', color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: 'CheckCircle', order: 6,  group: 'review' },
  '终审中':   { label: '终审中',   color: '#a16207', bg: '#fef3c7', border: '#fcd34d', icon: 'Shield',      order: 7,  group: 'review' },
  '已审核':   { label: '已审核',   color: '#0891b2', bg: '#cffafe', border: '#67e8f9', icon: 'CheckCheck',  order: 8,  group: 'review' },
  '签发中':   { label: '签发中',   color: '#be185d', bg: '#fce7f3', border: '#f9a8d4', icon: 'Pen',         order: 9,  group: 'sign' },
  '已签发':   { label: '已签发',   color: '#047857', bg: '#d1fae5', border: '#6ee7b7', icon: 'Signature',   order: 10, group: 'sign' },
  '已发布':   { label: '已发布',   color: '#059669', bg: '#d1fae5', border: '#6ee7b7', icon: 'Globe',       order: 11, group: 'published' },
  '修订中':   { label: '修订中',   color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: 'RefreshCw',   order: 12, group: 'special' },
  '已修订':   { label: '已修订',   color: '#0891b2', bg: '#cffafe', border: '#67e8f9', icon: 'FileEdit',    order: 13, group: 'special' },
  '已撤回':   { label: '已撤回',   color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', icon: 'Undo2',       order: 14, group: 'special' },
  '已驳回':   { label: '已驳回',   color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5', icon: 'XCircle',     order: 15, group: 'special' },
  '已归档':   { label: '已归档',   color: '#374151', bg: '#e5e7eb', border: '#9ca3af', icon: 'Archive',     order: 16, group: 'special' },
};
```

### 3.4 `ReportPage.tsx` 改造

**改动点**：

1. **导入新组件**：
   ```ts
   import { StatusBadge, StatusTimeline } from '../components/report';
   import { REPORT_STATUS_META } from '../components/report/statusMeta';
   ```

2. **状态筛选下拉**：从 5 态扩到 16 选项（含"全部"）

3. **状态分组展示**：
   - 草稿组：待分配/已分配/书写中
   - 审核组：已提交/初审中/初审通过/终审中/已审核
   - 签发组：签发中/已签发/已发布
   - 特殊组：修订中/已修订/已撤回/已驳回/已归档

4. **新增 Tab**：在"待审核"/"待签发"/"待修订"分组基础上扩展

5. **详情面板**：嵌入 `StatusTimeline` 组件

6. **状态统计卡片**：14 态每态计数（替代原"待审核/已审核/已发布"3 卡片）

---

## 4. 验收清单

| # | 项 | 验证方法 |
|---|---|---|
| 1 | TypeScript | `npx tsc --noEmit` 0 errors |
| 2 | Lint | `npm run lint` 0 errors |
| 3 | Build | `npm run build` 成功 |
| 4 | 状态机 14 态 | ReportPage 状态筛选下拉显示 16 选项（含"全部"） |
| 5 | 状态徽标 | StatusBadge 14 态全可渲染，颜色/图标正确 |
| 6 | 状态时间线 | StatusTimeline 在报告详情面板显示 |
| 7 | 状态分组 | ReportPage 4 组（草稿/审核/签发/特殊）可独立筛选 |
| 8 | Mock 数据 | 50 条记录覆盖 14 态 |
| 9 | 兼容性 | 旧 5 态数据（书写中/待审核/已审核/已发布/已驳回）仍可显示 |
| 10 | 路由不破坏 | `/reports` 仍可访问，14 态切换无白屏 |

---

## 5. 风险与回退

| 风险 | 缓解 | 回退 |
|---|---|---|
| 14 态枚举破坏现有 mock | 类型联合保留旧 5 态；新 14 态为扩展 | 删除新枚举即可回退 |
| ReportPage 改动过大 | 仅改 4 处：导入/筛选下拉/状态分组/详情面板 | 还原 ReportPage.tsx 即可 |
| 组件命名冲突 | `src/components/report/` 子目录隔离 | 删除子目录即可 |

---

## 6. 文件变更清单

```
新增：
  src/data/reportSubsystemMock.ts                          (~250 行)
  src/components/report/StatusBadge.tsx                    (~80 行)
  src/components/report/StatusTimeline.tsx                 (~120 行)
  src/components/report/statusMeta.ts                      (~80 行)
  src/components/report/index.ts                           (~5 行)

修改：
  src/types/index.ts                                       (+5 接口, +字段 ~80 行)
  src/data/initialData.ts                                  (initialRadiologyReports: 20→50 条)
  src/pages/ReportPage.tsx                                 (4 处改造)
  package.json                                             (0.23.0 → 1.0.1)
  src/App.tsx                                              (注释版本号 v0.5.0 → v1.0.1)
  index.html                                               (title 版本号)
  WORK_LOG.md                                              (追加 v1.0.1 记录)
  docs/REPORT_SYSTEM_PLAN.md                               (新建)
  docs/REPORT_MATRIX.md                                    (新建)
  docs/REPORT_PHASE_R0_DATA_MODEL.md                       (本文件)
```

---

**最后更新**：2026-06-04
**版本**：v1.0.1
**状态**：✅ 用户批准，进入 Build 模式
