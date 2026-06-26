# CHANGELOG

## v3.0.6.8-32 (2026-06-26) — 后端增强

> **强大的后端**: 100% 主数据池覆盖 + IndexedDB 持久化 + RBAC + 限流 + 审计 + 业务逻辑层 + 高级特性

### Phase 1: 数据层基础 (5 新文件)
- `src/services/mockBackend/adapters.ts` (360 行) - 11 DTO 适配函数 + 字段映射
- `src/services/mockBackend/store.ts` (303 行) - Dexie/IndexedDB 11 表 + 内存 Map CRUD
- `src/services/mockBackend/queryBuilder.ts` (151 行) - 分页/排序/搜索/过滤
- `src/services/mockBackend/businessLogic.ts` (269 行) - 报告状态机 + SLA 升级 + 双签触发 + 维护周期 + 限流
- `src/services/mockBackend/audit.ts` (130 行) - 审计日志包装

### Phase 2: 主数据池接入 (12 handlers 改写)
- patientHandlers: 6 → 14 端点 (25 字段 DTO + timeline/stats/bulk-import)
- deviceHandlers: 5 → 14 端点 (35 设备 + maintenance-history/workload/qrcode)
- userHandlers: 6 → 14 端点 (75 医生 + by-role/by-dept/schedule/performance)
- worklistHandlers: 9 → 14 端点 (600 报告 + 6 状态机 + batch-reassign)
- statsHandlers: 4 → 12 端点 (30 天 KPI + workload/quality/dashboard/by-modality)
- scheduleHandlers: 3 → 7 端点 (医生排班 + 冲突检测)
- doseHandlers: 4 → 11 端点 (按模态剂量 + 趋势 + DRL 对比 + 基准 + 告警)
- queueHandlers: 5 → 8 端点 (按 status 队列 + 设备 room)
- materialsHandlers: 5 → 8 端点 (对比剂库存 + stock-in/out)
- notificationHandlers: 3 → 8 端点 (危急值 + 待审核 + 未读数)
- consultationHandlers: 5 → 9 端点 (派生危急值报告)
- reportHandlers: 11 → 17 端点 (含 sign-cert/cosign-track/audit-trail/diff)

### Phase 3: 业务逻辑层 (业务规则)
- 报告状态机: draft → submitted → reviewed → cosigned → published (7 状态, 13 转移)
- 工作列表状态机: pending → checkedIn → inProgress → completed (5 状态)
- 危急值 SLA: 4 严重度 × 5 升级链 (life-threatening 5min/级)
- 双签触发: 6 条件优先级 (junior/critical/special/VIP/complex/low-quality)
- 影像质控: SNR/CNR/均匀度/伪影 → A/B/C/D 等级
- 限流: sliding window 100 req/min/key
- 维护周期: 季度/半年/年度/按需

### Phase 4: API client DTO 同步 (4 client 扩展)
- patientApi: +11 字段 (bloodType/department/diagnosis/lastVisitAt/...) + 6 方法
- deviceApi: +10 字段 (room/building/grade/maintenance/...) + 6 方法
- reportApi: +12 字段 (qcGrade/defectCount/icd10/signatureHash/...) + 4 方法
- statsApi: +4 字段 + 6 方法 (dashboard/byModality/trend/topModalities)
- consultationApi: +12 字段 (consultationType/isRemote/requestingDepartment/...) + 5 方法
- examApi: +deviceName/examItemName 别名 (DicomViewerPage 兼容)

### Phase 5: 高级特性端点 (8 新端点)
- GET  /api/v1/workflow-events (全院审计)
- GET  /api/v1/audit-log (按 user/resource/action 过滤)
- GET  /api/v1/critical/sla-status (80 危急值聚合)
- POST /api/v1/critical/:id/escalate (手动升级)
- POST /api/v1/image-quality/grade (输入 SNR/CNR/均匀度/伪影 → A/B/C/D)
- GET  /api/v1/rate-limit-status
- GET  /api/v1/system/health (集合大小 + 审计日志数)
- GET  /api/v1/system/storage (IDB 状态)

### Phase 6: 测试 + 文档
- API.md (450+ 行 v32 API 完整文档)
- test-v32-e2e.mjs (18/18 通过: 数据池 + 业务逻辑 + 高级端点 + 状态机 + IDB)
- test-deep-v23e.mjs (159/159 页面 deep audit 0 FAIL)
- test-nan.mjs (无 NaN)
- test-hrefs.mjs (侧栏 151 链接)

### Bug 修复
- ConsultationPage 错误: 补全 consultationType/isRemote/requestingDepartment/consultedDepartment/consultedDoctorName/requestReason 字段
- DicomViewerPage 错误: toExamDto 添加 deviceName/examItemName 别名
- Dexie/SW 兼容性: `typeof window` → `typeof indexedDB`
- stats/daily 兼容: 同时返回旧 DTO (totalExams/completedExams/pendingReports/criticalValues) + 新 DTO
- 路由优先级: advancedHandlers 移到 handlers 数组首位,避免 /critical/:id 拦截 /critical/sla-status

### 部署
- 推送: GitCode + GitHub SSH (main 分支)
- 部署: GitHub Pages gh-pages 分支 (commit 3c3d9f8)
- 预览: http://127.0.0.1:5199/g005-radiology-ris/

### 统计
- 端点: 411 → 350-400 (聚焦核心,移除冗余 fhir/dicom-sr/realtime)
- 主数据池: 1720 实体
- 预生成数据: 1910 条
- 页面测试: 159/159 通过
- E2E 测试: 18/18 通过

---

## v3.0.6.8-31 (2026-06-25) — doseTrack 修复
- 修复 useTranslation("v3exam") 懒加载不触发
- 5 文件改用 t() from appI18n
- 修复 sed 操作破坏的中文字符
- 修复 vite.config.ts 重复 plugins 数组

## v3.0.6.8-30 (2026-06-25) — doseTrack 翻译
- 补全 69 个 doseTrack.* 键

## v3.0.6.8-29 (2026-06-25) — 侧栏 i18n
- 补全 3 个新质控页面 nav 键

## v3.0.6.8-28 (2026-06-25) — 旧页面重构主数据池
- StatisticsPage/QCPage/EquipmentEfficiencyPage/DirectorDashboardPage
- 41 个硬编码数组 → 主数据池派生

## v3.0.6.8-27 (2026-06-25) — 质控数据扩充
- 4 主数据池 + 6 生成器 + 6 mock 扩充
- 3 新质控页面 (RadiologyQCDashboard/ImageQualityControl/RadiologistAnnualQC)
- 侧栏 i18n

## v3.0.6.8-26 (2026-06-24) — UI 标准化
- 16 页面按钮/样式统一

## v3.0.6.8-25 (2026-06-23) — 框架升级
- React 18 + Vite 5 + Antd 5
