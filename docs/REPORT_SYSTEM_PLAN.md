# G005 放射报告子系统 — 全面构建与完善 PLAN

> **文档版本**：v1.0.1
> **更新日期**：2026-06-04
> **目标版本**：v1.0.1（Phase R0 起）
> **子系统**：放射科报告全生命周期（不含预约/设备/物资等外延模块）
> **状态**：✅ 用户批准 / 进入 Build 模式

---

## 目录

1. [子系统现状画像](#1-子系统现状画像)
2. [国内厂商对标 — 报告子系统核心功能矩阵](#2-国内厂商对标--报告子系统核心功能矩阵)
3. [目标架构](#3-目标架构)
4. [Phase 计划](#4-phase-计划-8-个-phase-约-18-20-周)
5. [跨 Phase 贯穿工作](#5-跨-phase-贯穿工作)
6. [文件落点](#6-文件落点)
7. [验收标准](#7-验收标准)
8. [风险与缓解](#8-风险与缓解)

---

## 1. 子系统现状画像

| 维度 | 当前状态 |
|---|---|
| 报告相关页面数 | **15 个**（`ReportPage` / `ReportWritePage` / `TemplateManagementPage` / `QCPage` / `AIQCPage` / `AIAssistPage` / `AIStructuredReportPage` / `AIMedicalDevicePage` / `CriticalValuePage` / `ConsultationPage` / `FindingLibraryPage` / `TypicalCasesPage` / `TermLibraryPage` / `PETQCPage` / `DataReportCenterPage`） |
| 核心页面规模 | `ReportPage.tsx` ~2107 行；`ReportWritePage.tsx` ~11637 行 |
| 报告数据结构 | `RadiologyReport` 含 6 状态（`未开始/书写中/待审核/已审核/已发布/已驳回`），缺：分配、修订、撤回、归档 |
| 模板结构 | `ReportTemplate` 字段较薄，缺：部位、性别/年龄限制、字段类型、必填规则、占位符 |
| 报告分项字段 | 当前用 `examFindings` 单段文本，**无结构化字段**（BI-RADS、Lung-RADS、RECIST 等分类挂载不到） |
| 报告修订 | 有 `isAddendum` 布尔，**无版本树/对比 UI** |
| 审核流程 | 有审核人字段，**无双审/终审/审核时效** |
| 危急值 | 5 状态链路有，缺：自动识别、10 分钟通报率可视化、按病种分桶 |
| 质量评分 | 有 `qualityScore`，缺：维度评分、缺陷分类详情、AI 评分 |
| 术语库 | 有 `TermItem`，缺：同义词图谱、智能联想、ICD 联动 |
| 签名 | **完全缺**（CA / 区块链） |
| 导出 | **完全缺**（PDF / Word / 带图报告） |
| 协同 | **完全缺**（多人、版本对比、@提醒） |
| 图像标注 | **完全缺**（箭头/测量/ROI） |
| 语音录入 | 仅有 F2 触发 UI，**无真实语音识别** |
| 报告对比 | 仅有 F10 入口占位，**无同患者多次对比视图** |
| KPI 统计 | 缺：及时率、修改率、误诊率、医生/科室工作量排名 |

---

## 2. 国内厂商对标 — 报告子系统核心功能矩阵

详细大表见 [`REPORT_MATRIX.md`](./REPORT_MATRIX.md)。本节给出汇总。

### 2.1 对标厂商清单

| 厂商 | 代表产品 | 报告子系统强项 |
|---|---|---|
| **卫宁健康** | WiNEX RIS | 全生命周期 / 模板库 / 双审 / 危急值闭环 / 医保联动 |
| **东软** | Neusoft RIS | PACS 集成 / 修订痕迹 / 质控 |
| **联影** | uAI + uCloud RIS | AI 结构化 / 自动初稿 / Lung-RADS / 骨龄 |
| **GE** | Centricity RIS | F1-F12 快捷键 / 历史报告对比 / KPI |
| **飞利浦** | IntelliSpace | 多学科会诊 / PI-RADS / 心脏 CTA |
| **卡易** | KareEasy | 微信推送 / 电子胶片 |
| **锐珂** | Carestream Vue RIS | 患者门户 / 云胶片 |
| **久远银海** | 银海 RIS | 模板 / 评分 / 医保 |
| **一脉阳光** | 影像中心云平台 | 第三方影像中心运营 |
| **英飞达** | EBM RIS | 设备-报告-医生关联分析 |

### 2.2 核心能力汇总（≥ 7 家厂商覆盖 vs 当前 G005）

| 能力 | 厂商覆盖 | G005 当前 | 优先级 |
|---|---|---|---|
| 全生命周期 10+ 状态机 | 10/10 | ⚠️ 6 状态 | P0 |
| 富文本所见即所得 | 10/10 | ❌ 纯文本 | P0 |
| 结构化报告（字段化） | 10/10 | ⚠️ AI 结构化页 | P0 |
| 模板可视化设计 | 9/10 | ⚠️ 列表管理 | P0 |
| 多人协同编辑 | 8/10 | ❌ | P0 |
| 双审 / 终末质控 | 10/10 | ⚠️ 单审 | P0 |
| 危急值自动识别 | 9/10 | ⚠️ 关键字 | P0 |
| 关键字纠错 | 10/10 | ❌ | P0 |
| 图像标注/测量 | 10/10 | ❌ | P0 |
| CA 电子签名 | 10/10 | ❌ | P0 |
| PDF 导出 | 10/10 | ❌ | P0 |
| BI-RADS / Lung-RADS / PI-RADS / CAD-RADS | 8/10 | ✅ 已定义 | P1 |
| TI-RADS / RECIST 1.1 | 6/10 | ❌ | P1 |
| 区块链签名 | 3/10 | ❌ | P2 |
| 移动端签发 | 7/10 | ❌ | P2 |

---

## 3. 目标架构

### 3.1 报告全生命周期（14 状态机）

```
开单申请 → 待分配 → 已分配 → 书写中 → 已提交
                                  ↓
            初审中 → 初审通过 → 终审中 → 已审核 → 签发中 → 已签发 → 已发布
              ↓          ↑                                    ↓
            驳回 ← ─ ─ ─ ─                                修订/补发 → 修订中 → 已修订
                                                              ↓
                                                          撤回 ← 已撤回 → 归档 → 已归档
```

新增枚举：

```ts
export type ReportStatus =
  | '待分配' | '已分配' | '书写中' | '已提交'
  | '初审中' | '初审通过' | '终审中' | '已审核'
  | '签发中' | '已签发' | '已发布'
  | '修订中' | '已修订' | '已撤回' | '已驳回' | '已归档'
```

### 3.2 报告数据模型（扩展）

在 `RadiologyReport` 上扩展：

```ts
// 报告主表
interface RadiologyReport {
  // 原有字段
  // ...
  // 新增（Phase R0 落地）
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedTime?: string;
  initialAuditDoctorId?: string;
  initialAuditDoctorName?: string;
  initialAuditTime?: string;
  initialAuditSuggestion?: string;
  finalAuditDoctorId?: string;
  finalAuditDoctorName?: string;
  finalAuditTime?: string;
  reportSource: 'manual' | 'template' | 'ai-assist' | 'voice';
  wordCount?: number;
  draftSavedAt?: string;
  timelinessFlag?: 'onTime' | 'late' | 'overdue';

  // 新增（后续 Phase 落地）
  structuredFields?: StructuredField[];
  measurements?: Measurement[];
  annotations?: Annotation[];
  images?: ReportImage[];
  voiceTranscript?: string;
  signature?: DigitalSignature;
  blockchainHash?: string;
  addendumChain?: string[];
}

// 结构化字段值
interface StructuredField {
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
interface Measurement {
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
interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rect' | 'text' | 'ruler' | 'freehand';
  coordinates: any;
  color: string;
  label?: string;
  authorId: string;
  timestamp: string;
}

// 报告图
interface ReportImage {
  id: string;
  seriesInstanceUid: string;
  sopInstanceUid: string;
  thumbnailUrl: string;
  caption?: string;
  measurementIds?: string[];
}

// 数字签名
interface DigitalSignature {
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

### 3.3 报告子系统模块地图（升级后）

```
报告子系统
├── 报告生命周期
│   ├── ReportListPage          ✅ → 升级（14 状态/智能分诊/批量）
│   ├── ReportWritePage         ✅ → 升级（富文本/结构化/标注/协同）
│   ├── ReportReviewPage        ❌ 新增（双审/终末质控/审核时效）
│   ├── ReportRevisionsPage     ❌ 新增（修订链/版本对比）
│   └── ReportArchivePage       ❌ 新增（归档库/检索）
│
├── 报告模板
│   ├── TemplateManagementPage  ✅ → 升级（可视化设计/字段化）
│   ├── TemplateDesignerPage    ❌ 新增（拖拽字段/类型/规则）
│   ├── TemplateInheritancePage ❌ 新增（克隆/继承/版本）
│   └── TemplateCategoryPage    ❌ 新增（按部位/病种）
│
├── 报告质量
│   ├── QCPage                  ✅ → 升级（多维/缺陷分类/AI）
│   ├── AIQCPage                ✅ → 增强
│   ├── KeywordCheckPage        ❌ 新增（关键字纠错引擎）
│   ├── ReportScoreRulePage     ❌ 新增（评分规则配置）
│   └── ReportDefectLibraryPage ❌ 新增（缺陷分类字典）
│
├── AI 辅助
│   ├── AIAssistPage            ✅ → 升级
│   ├── AIStructuredReportPage  ✅ → 升级
│   ├── AIReportDraftPage       ❌ 新增（自动初稿）
│   └── AIMedicalDevicePage     ✅
│
├── 危急值
│   ├── CriticalValuePage       ✅ → 升级（自动识别/按病种）
│   ├── CriticalValueRulePage   ❌ 新增（危急值规则配置）
│   └── CriticalValueStatsPage  ❌ 新增（10 分钟通报率/分桶）
│
├── 会诊
│   ├── ConsultationPage        ✅ → 升级
│   ├── InternalConsultPage     ❌ 新增（院内多学科）
│   └── ExternalConsultPage     ❌ 新增（远程视频会诊）
│
├── 知识库
│   ├── FindingLibraryPage      ✅ → 升级（联动/案例）
│   ├── TypicalCasesPage        ✅ → 升级
│   ├── TermLibraryPage         ✅ → 升级（同义词/联想）
│   ├── TermSynonymGraphPage    ❌ 新增（同义词图谱）
│   └── ReportPhraseBankPage    ❌ 新增（报告短语库）
│
├── 报告分送
│   ├── ReportDeliveryPage      ❌ 新增（推送/电子胶片/二维码）
│   ├── PatientReportPortalPage ❌ 新增（患者端）
│   └── ReportExportPage        ❌ 新增（PDF/Word/批量）
│
├── 特殊分类评估
│   ├── BIRADSAssessmentPage    ❌ 新增（乳腺专项）
│   ├── LungRADSAssessmentPage  ❌ 新增（肺结节专项）
│   ├── PIRADSAssessmentPage    ❌ 新增（前列腺专项）
│   ├── CADRADSAssessmentPage   ❌ 新增（冠脉专项）
│   ├── TIRADSAssessmentPage    ❌ 新增（甲状腺专项）
│   ├── RECISTAssessmentPage    ❌ 新增（实体瘤疗效）
│   ├── BoneAgePage             ❌ 新增（骨龄 TW3/中华05）
│   └── CardiacCTPage           ❌ 新增（心脏 CTA 专项）
│
├── 协同与签名
│   ├── CollaborationPage       ❌ 新增（多人协同/光标/@）
│   ├── CASignaturePage         ❌ 新增（数字签名）
│   ├── BlockchainProofPage     ❌ 新增（区块链存证）
│   └── ReportSealPage          ❌ 新增（电子盖章）
│
└── 统计与监控
    ├── ReportKpiDashboardPage  ❌ 新增（KPI 大盘）
    ├── DoctorWorkloadPage      ❌ 新增（医生工作量）
    ├── DiagnosisAccuracyPage   ❌ 新增（诊断符合率）
    ├── ReportTimelinessPage    ❌ 新增（及时率/超时预警）
    └── ReportSearchPage        ❌ 新增（高级检索）
```

---

## 4. Phase 计划（8 个 Phase，约 18-20 周）

### Phase R0：数据模型与状态机重构（第 1-2 周）
> **基础，所有后续 Phase 依赖**

- `src/types/index.ts` 扩展 `ReportStatus` 增到 14 态；新增 `StructuredField` / `Measurement` / `Annotation` / `ReportImage` / `DigitalSignature` 接口
- `src/data/initialData.ts` `initialRadiologyReports` 数据迁移（20 → 50 条，覆盖所有状态）
- `src/data/structuredFieldTemplates.ts` 新增（CT/MR/DR/乳腺/肺结节等部位字段集）
- 公共组件：`src/components/StatusTimeline.tsx`（状态时间线）、`StatusBadge.tsx`（状态徽标）
- 改造 `ReportPage.tsx`：接入新状态机

**Phase R0 验收**：tsc/lint/build 全过；状态机 14 态全可点；ReportPage 状态筛选覆盖 14 态

---

### Phase R1：报告书写 — 富文本 + 结构化（第 3-5 周）
> **核心功能重写**

- `src/components/editor/` 富文本编辑器（基于 Tiptap/ProseMirror + AntD 主题，医疗专用工具栏）
  - 段落、表格、列表、加粗/斜体/下划线、上下标（化学式 m²、CO₂）、特殊符号（° ′ ″ ± ≤ ≥ μg α β γ）
  - 图像插入（序列截图）
  - 测量值嵌入
  - 术语联想气泡
  - 关键字高亮警告
- `src/components/StructuredFieldForm.tsx` 结构化字段表单
  - 字段类型：text/number/enum/multi-enum/date/scale/boolean
  - 字段校验、必填、单位、选项
  - 联动计算（如 BI-RADS 自动汇总）
- 改造 `ReportWritePage.tsx`：
  - 三栏布局：左（影像缩略图/历史）/ 中（富文本+结构化字段双 Tab）/ 右（模板/术语/AI 辅助）
  - F1-F12 快捷键保留 + 新增（Ctrl+S 自动保存/Ctrl+Enter 提交/Ctrl+Shift+C 协同）
  - 自动保存（每 30s）
  - 草稿恢复（断网/关闭后）
  - 字数、剩余时间、关键发现计数实时显示
- `src/utils/keywordChecker.ts` 关键字纠错引擎
  - 左右/上下、阴/阳、否定词检测
  - 病灶关键词缺失提示
  - 自定义规则

**Phase R1 验收**：富文本/结构化并存；10 个模板字段可视化；关键字纠错演示通过

---

### Phase R2：报告模板可视化设计（第 6-7 周）

- `TemplateDesignerPage.tsx`（新增）：拖拽式模板设计器
  - 左侧：字段库（text/number/enum/measurements/计算公式）
  - 中间：画布（章节+字段）
  - 右侧：属性面板（标签/键名/单位/必填/规则/默认值）
  - 顶部：模板元数据（名称/分类/部位/设备/性别/年龄范围）
- `TemplateInheritancePage.tsx`（新增）：
  - 模板克隆/继承（"胸部 CT 平扫" → "胸部 CT 增强"）
  - 版本管理
  - 使用统计
- `TemplateCategoryPage.tsx`（新增）：分类树（按设备/部位/病种）
- 改造 `TemplateManagementPage.tsx`：链接到设计器

**Phase R2 验收**：可视化设计 1 个 CT 模板；克隆 1 个变体；3 个分类

---

### Phase R3：审核 + 修订 + 协同（第 8-10 周）

- `ReportReviewPage.tsx`（新增）：
  - 审核工作台（待初审/待终审/待签发）
  - 初审（高年资主治）/终审（副主任以上）双审
  - 审核时效 KPI（24h 内）
  - 驳回 + 意见
  - 审核历史时间线
- `ReportRevisionsPage.tsx`（新增）：
  - 修订链
  - 版本对比（Diff 视图）
  - 补发/勘误
  - 患者告知
- `CollaborationPage.tsx`（新增）：
  - 多人协同（光标位置/选区高亮）
  - @提醒
  - 评论/批注
  - WebSocket mock（轮询/SSE/BroadcastChannel）
- 改造 `ReportPage.tsx`：新增"待审核"/"待签发"/"待修订" Tab

**Phase R3 验收**：双审流程通过；版本对比通过；@协同提示

---

### Phase R4：质量评分 + AI 增强（第 11-12 周）

- `KeywordCheckPage.tsx`（新增）：
  - 全量关键字扫描
  - 规则库管理
  - 报告缺陷分类
- `ReportScoreRulePage.tsx`（新增）：
  - 多维评分规则（完整性、规范性、准确性、及时性、术语规范）
  - 权重配置
  - 评级映射
- `ReportDefectLibraryPage.tsx`（新增）：
  - 缺陷字典（描述不清/错别字/漏诊/过度诊断/术语不规范…）
  - 与评分联动
- 改造 `QCPage.tsx`：
  - 多维评分
  - 缺陷分类详情
  - 复评闭环
- 改造 `AIQCPage.tsx`：
  - AI 0-100 评分细化
  - 误诊/漏诊风险预警
  - 自动建议
- `AIReportDraftPage.tsx`（新增）：
  - 一键自动初稿（基于历史 + AI）
  - 初稿 vs 终稿对比

**Phase R4 验收**：5 维评分演示；AI 评分与人工评分对照；自动初稿生成 1 份

---

### Phase R5：危急值 + 特殊分类评估（第 13-15 周）

- 升级 `CriticalValuePage.tsx`：
  - 自动识别（基于关键字/AI/规则）
  - 危急值规则配置
  - 10 分钟通报率 KPI 仪表盘
  - 按病种/科室/医生分桶
  - 闭环可视化
- `CriticalValueRulePage.tsx`（新增）：规则编辑（关键字/影像特征/检验联动）
- `CriticalValueStatsPage.tsx`（新增）：统计大屏
- 8 个特殊分类评估页（BI-RADS/Lung-RADS/PI-RADS/CAD-RADS/TI-RADS/RECIST/骨龄/心脏 CTA）
  - 集成 `src/data/ReportingStandards.ts` 现有数据
  - 自动计算分类
  - 评估报告卡（输出到结构化字段）
  - 趋势图

**Phase R5 验收**：危急值 5 节点闭环；8 种分类评估各 1 份

---

### Phase R6：分送 + 导出 + 签名（第 16-17 周）

- `ReportExportPage.tsx`（新增）：
  - PDF 导出（带图带签名 + 二维码）
  - Word 导出（.docx，可编辑）
  - 批量打包
  - 模板可定制
- `ReportDeliveryPage.tsx`（新增）：
  - 微信/短信/邮件推送
  - 电子胶片包（DICOM + 报告）
  - 二维码分享
  - 患者查看日志
- `PatientReportPortalPage.tsx`（新增）：
  - 患者 H5 模拟
  - 实名验证
  - 报告 + 影像查看
  - 收藏/分享
- `CASignaturePage.tsx`（新增）：
  - 数字证书生成（模拟）
  - 报告签名（RSA-SHA256 + 国密 SM2-SM3）
  - 签名验证
  - 时间戳
  - 证书链展示
- `BlockchainProofPage.tsx`（新增）：
  - 报告上链（Hash 存证）
  - 区块浏览器
  - 验证真伪

**Phase R6 验收**：PDF 导出 1 份；CA 签名 1 份；区块链存证 1 份

---

### Phase R7：知识库 + 统计 + 监控（第 18-20 周）

- 升级 `TermLibraryPage.tsx`：
  - 1000+ 词条
  - 同义词图谱（词 → 同义词 → 相关词 → ICD）
  - 智能联想（输入触发）
  - 使用频次/医生偏好
- `TermSynonymGraphPage.tsx`（新增）：图谱可视化
- `ReportPhraseBankPage.tsx`（新增）：报告短语库（"双肺纹理清晰" 等常用整句）
- 升级 `FindingLibraryPage.tsx` / `TypicalCasesPage.tsx`：
  - 与报告结构化字段联动
  - 一键插入到报告
- 5 个统计页：
  - `ReportKpiDashboardPage.tsx` — KPI 大盘（及时率/修改率/缺陷率/AI 使用率）
  - `DoctorWorkloadPage.tsx` — 医生工作量（按日/周/月/季）
  - `DiagnosisAccuracyPage.tsx` — 诊断符合率（与病理/手术对照）
  - `ReportTimelinessPage.tsx` — 及时率 + 超时预警
  - `ReportSearchPage.tsx` — 高级检索（全文+结构化字段）

**Phase R7 验收**：KPI 大盘数据完整；高级检索命中；1000+ 术语

---

## 5. 跨 Phase 贯穿工作

| 主题 | 内容 |
|---|---|
| **设计系统** | AntD 5 主题（已确认），富文本工具栏用 AntD `Button/Tooltip` 封装 |
| **测试** | Vitest + RTL + Playwright；新页面/工具函数覆盖率 ≥ 60% |
| **i18n** | 词条随新功能同步（zh-CN/en-US 必做，ar/ja 占位） |
| **Mock 数据** | `src/data/reportSubsystemMock.ts` 集中管理（> 100 条/模块） |
| **审计** | 所有写操作有 HIPAA 审计埋点 |
| **性能** | 报告列表虚拟化（> 1000 行）、富文本懒加载 |
| **可访问性** | WCAG 2.1 AA |

---

## 6. 文件落点

```
docs/
  REPORT_SYSTEM_PLAN.md                 # 本文件
  REPORT_MATRIX.md                       # 国内厂商对标详细表
  REPORT_PHASE_R0_DATA_MODEL.md          # Phase R0 详细拆解
  REPORT_PHASE_R1_EDITOR.md
  REPORT_PHASE_R2_TEMPLATE.md
  REPORT_PHASE_R3_REVIEW.md
  REPORT_PHASE_R4_QUALITY.md
  REPORT_PHASE_R5_CRITICAL.md
  REPORT_PHASE_R6_DELIVERY.md
  REPORT_PHASE_R7_KNOWLEDGE.md
  CHANGELOG_REPORT.md

src/types/index.ts                       # 扩展 ReportStatus + 新接口
src/data/
  reportSubsystemMock.ts                 # 集中 mock（5000+ 条）
  structuredFieldTemplates.ts            # 结构化字段模板
  measurementRules.ts                    # 测量规则
  keywordRules.ts                        # 关键字纠错规则
  criticalValueRules.ts                  # 危急值规则
  termSynonyms.ts                        # 同义词
  phraseBank.ts                          # 报告短语库

src/components/editor/                   # 新增（Phase R1）
  RichTextEditor.tsx
  EditorToolbar.tsx
  StructuredFieldForm.tsx
  MeasurementWidget.tsx
  AnnotationLayer.tsx
  TermSuggestion.tsx
  KeywordWarning.tsx
  DraftAutoSave.tsx

src/components/report/                   # 新增
  StatusTimeline.tsx                     # Phase R0
  StatusBadge.tsx                        # Phase R0
  ReportVersionDiff.tsx                  # Phase R3
  ReportCollaborator.tsx                 # Phase R3
  CAStamp.tsx                            # Phase R6
  BlockchainBadge.tsx                    # Phase R6
  BIRADSCard.tsx                         # Phase R5
  LungRADSCard.tsx                       # Phase R5
  PIRADSCard.tsx                         # Phase R5
  CADRADSCard.tsx                        # Phase R5
  TIRADSCard.tsx                         # Phase R5
  RECISTCard.tsx                         # Phase R5

src/pages/                               # 新增（约 25 个）
  ReportReviewPage.tsx                   # R3
  ReportRevisionsPage.tsx                # R3
  ReportArchivePage.tsx                  # R3
  TemplateDesignerPage.tsx               # R2
  TemplateInheritancePage.tsx            # R2
  TemplateCategoryPage.tsx               # R2
  KeywordCheckPage.tsx                   # R4
  ReportScoreRulePage.tsx                # R4
  ReportDefectLibraryPage.tsx            # R4
  AIReportDraftPage.tsx                  # R4
  CriticalValueRulePage.tsx              # R5
  CriticalValueStatsPage.tsx             # R5
  BIRADSAssessmentPage.tsx               # R5
  LungRADSAssessmentPage.tsx             # R5
  PIRADSAssessmentPage.tsx               # R5
  CADRADSAssessmentPage.tsx              # R5
  TIRADSAssessmentPage.tsx               # R5
  RECISTAssessmentPage.tsx               # R5
  BoneAgeAssessmentPage.tsx              # R5
  CardiacCTPage.tsx                      # R5
  CollaborationPage.tsx                  # R3
  CASignaturePage.tsx                    # R6
  BlockchainProofPage.tsx                # R6
  ReportSealPage.tsx                     # R6
  ReportExportPage.tsx                   # R6
  ReportDeliveryPage.tsx                 # R6
  PatientReportPortalPage.tsx            # R6
  TermSynonymGraphPage.tsx               # R7
  ReportPhraseBankPage.tsx               # R7
  ReportKpiDashboardPage.tsx             # R7
  DoctorWorkloadPage.tsx                 # R7
  DiagnosisAccuracyPage.tsx              # R7
  ReportTimelinessPage.tsx               # R7
  ReportSearchPage.tsx                   # R7

src/utils/                                # 新增
  keywordChecker.ts                       # R1
  draftAutoSave.ts                        # R1
  pdfExport.ts                            # R6
  wordExport.ts                           # R6
  caSignature.ts                          # R6
  blockchainHash.ts                       # R6
  recistCalculator.ts                     # R5
  biradsCalculator.ts                     # R5
  lungRadsCalculator.ts                   # R5
  piRadsCalculator.ts                     # R5
  cadRadsCalculator.ts                    # R5
  tiRadsCalculator.ts                     # R5
  boneAgeCalculator.ts                    # R5
  reportTimeliness.ts                     # R5

src/hooks/                                # 新增
  useRichTextEditor.ts                    # R1
  useStructuredField.ts                   # R1
  useReportCollaboration.ts               # R3
  useCASignature.ts                       # R6
  useReportDraft.ts                       # 增强（R1）
```

---

## 7. 验收标准（每 Phase 末）

1. `npx tsc --noEmit` → 0 errors
2. `npm run lint` → 0 errors
3. `npm run build` → 成功
4. Playwright E2E → 新增/修改路径全过
5. i18n → 中英文 100% 覆盖
6. 审计埋点 → 所有写操作有 log
7. Mock 数据 → 新模块 ≥ 100 条
8. 关键功能演示通过：
   - R0：14 状态机
   - R1：富文本 + 结构化字段 + 关键字纠错
   - R2：可视化模板设计
   - R3：双审 + 协同 + 版本对比
   - R4：5 维评分 + AI 自动初稿
   - R5：危急值闭环 + 8 种分类评估
   - R6：PDF 导出 + CA 签名 + 区块链
   - R7：KPI 大盘 + 1000+ 术语

---

## 8. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 富文本编辑器集成 Tiptap 增加包体 | 按需懒加载（仅 ReportWritePage 加载） |
| 报告字段扩展破坏现有 mock | R0 做一次数据迁移脚本，保留 `isAddendum` 兼容 |
| 多状态机改动量大 | R0 集中处理；后置 Phase 复用 |
| CA/区块链 真实集成难 | 全部 mock 演示，算法实现但留接口位 |
| 1000+ 术语 mock 数据量大 | 分批导入（500 + 500） |
| 多人协同 WebSocket mock 复杂 | 用 BroadcastChannel（同浏览器多 Tab 演示） |
| 现有 11637 行 ReportWritePage 重构风险 | 分阶段迁移，先加新功能再瘦身 |

---

**最后更新**：2026-06-04
**版本**：v1.0.1
**状态**：✅ 用户批准，进入 Build 模式
