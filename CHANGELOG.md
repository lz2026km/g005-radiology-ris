# Changelog

All notable changes to **G005 放射科 RIS 系统** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-06-06(技术重构启动 / 部分完成)

### 🔧 Technical Refactor(技术重构 — 对标十大 PACS 厂商前端能力)

> **重要更正**:用户明确要求"从技术层面重构这个软件,让它达到头部企业的标准",**不是商业化**。原"商业化重构"方案已重置为**纯技术重构方案**,对标十大 PACS 厂商前端能力,生产级代码质量,2-3 月密集交付。

#### Added — 技术文档(2 份主方案)
- ✨ `docs/v3.0.0-TECH-REFACTOR.md`:技术重构主方案(12 周 / 4 阶段 / 14 项维度)
- ✨ `docs/v3.0.0-FRONTEND-BENCHMARK.md`:十大 PACS 厂商前端能力对标矩阵(12 维度 × 10 厂商 = 120 单元格)
- ✨ `docs/工作日志/2026-06-06-G005-v3.0.0-技术重构启动.md`:本次启动日志

#### Added — 核心代码(W1 启动,密集落地)
- ✨ `package.json` 升 **3.0.0** + 加 12 个新依赖(antd/i18next/sentry/web-vitals/playwright/openapi-msw/i18next-scanner/lighthouse-ci/eslint9/types/globals)
- ✨ `tsconfig.json` 严格化(`noUncheckedIndexedAccess` + `noImplicitOverride` + `noUnusedLocals/Parameters` + `paths` 11 个别名)
- ✨ `vitest.config.ts` 覆盖率门禁 60%(statements/branches/functions/lines)+ 路径别名
- ✨ `src/test/setup.ts` 完整测试环境(Canvas/Mock/SpeechRecognition/IndexedDB/ResizeObserver/IntersectionObserver + i18n + a11y)
- ✨ `src/machines/reportMachine.ts` **报告 14 态 XState 5 状态机**(pendingAssignment → assigned → writing → submitted → reviewing → reviewed → signing → signed → published → amending → amended / withdrawn / rejected / archived)
- ✨ `src/machines/criticalValueMachine.ts` **危急值 5 节点 XState**(found → notified → acknowledged → resolving → resolved + escalated / cancelled)
- ✨ `src/machines/deviceMachine.ts` **设备 5 态 XState**(idle / inUse / maintenance / broken / offline)
- ✨ `src/machines/collaborationMachine.ts` **协同 5 态 XState**(disconnected / connecting / connected / syncing / error)
- ✨ `src/machines/index.ts` 4 大状态机统一导出
- ✨ `src/machines/__tests__/reportMachine.test.ts` 报告状态机单元测试(14 态全覆盖)
- ✨ `src/machines/__tests__/criticalValueMachine.test.ts` 危急值状态机单元测试
- ✨ `src/machines/__tests__/deviceMachine.test.ts` 设备状态机单元测试
- ✨ `src/machines/__tests__/collaborationMachine.test.ts` 协同状态机单元测试
- ✨ `src/i18n/index.ts` **i18next 替换自研**(LanguageDetector + Zod 校验 + 18 命名空间)
- ✨ `src/i18n/locales/zh_CN.json` **800+ key 中文完整**(common/nav/status/role/exam/report/patient/device/critical/dashboard/error/auth/template/review/collab/ai/dicom/worklist)
- ✨ `src/i18n/locales/en_US.json` **800+ key 英文完整对照**
- ✨ `src/i18n/__tests__/i18n.test.ts` i18n 完整单元测试
- ✨ `src/services/mockBackend/handlers.ts` **MSW 56 端点**(11 reports + 9 worklist + 6 patients + 5 devices + 7 dicom + 3 ai + 5 critical + 4 print + 4 stats + 2 terms)
- ✨ `src/services/mockBackend/worker.ts` MSW 浏览器端
- ✨ `src/services/mockBackend/server.ts` MSW Node 测试端
- ✨ `src/observability/sentry.ts` **Sentry 错误监控** + 医疗数据脱敏(15+ 敏感字段自动过滤)
- ✨ `src/observability/webVitals.ts` **Web Vitals 性能监控**(LCP/FID/CLS/INP/TTFB/FCP 6 指标)
- ✨ `src/observability/index.ts` 可观测性索引
- ✨ `src/security/csp.ts` **CSP 内容安全策略**(生产更严格,支持 dev 'unsafe-eval')
- ✨ `src/security/validation.ts` **Zod 输入校验**(15+ Schema:ReportInput/PatientInput/ExamInput/CriticalValueInput/LoginInput/ChangePassword/AIRequest 等)
- ✨ `src/security/sanitization.ts` **医疗数据脱敏**(姓名/身份证/手机/邮箱/诊断 + XSS/SQL 注入检测)
- ✨ `src/security/types.ts` + `src/security/index.ts` 安全模块索引
- ✨ `src/security/__tests__/validation.test.ts` 校验+脱敏完整测试
- ✨ `src/a11y/SkipLink.tsx` **a11y 辅助组件**(SkipLink/LiveRegion/useFocusTrap/useGlobalShortcuts/useCommandPalette/useScreenReaderAnnouncer)
- ✨ `src/hooks/useBreakpoint.ts` **响应式 hooks**(useBreakpoint/useIsMobile/useIsTablet/useIsDesktop/useViewportWidth/useOrientation/useIsTouchDevice)
- ✨ `src/utils/performance.ts` **性能工具**(useDebounce/useThrottle/useIntersection/prefetchRoute/preloadImage/runWhenIdle/getMemoryUsage)
- ✨ `src/components/stories/Button.stories.tsx` Button Storybook
- ✨ `src/components/stories/StatusBadge.stories.tsx` 报告 14 态徽章 Story
- ✨ `src/components/stories/CriticalValueState.stories.tsx` 危急值 5 节点 Story
- ✨ `src/components/stories/SkipLink.stories.tsx` a11y Story
- ✨ `src/components/stories/LanguageSwitcher.stories.tsx` i18n Story
- ✨ `vite.config.ts` **性能优化**(manualChunks 11 个分包:react-vendor / antd-vendor / dicom-vendor / three-vendor / collab-vendor / xstate-vendor / utils-vendor / charts-vendor / db-vendor / rules-vendor / pdf-vendor)
- ✨ `playwright.config.ts` Playwright E2E 配置(5 项目:chromium/firefox/webkit/mobile-chrome/mobile-safari)
- ✨ `e2e/auth.spec.ts` E2E 起步样例(登录/响应式/a11y)
- ✨ `.github/workflows/ci.yml` **完整 CI/CD**(7 步骤:lint/typecheck/test/build/e2e/lighthouse/security + all-green 汇总)

#### 关键决策
- **范围**:**仅前端**(不动后端)
- **对标**:**十大 PACS 厂商**(西门子/飞利浦/GE/联影/东软/卫宁/创业/岱嘉/锐科/英飞达)
- **代码质量**:**生产级**(可上三甲医院)
- **交付方式**:**2-3 月密集重构**(12 周)
- **技术栈新增**:antd 5 + i18next + XState 5 + Sentry + Web Vitals + Playwright + openapi-msw + Zod + Zustand + Lighthouse CI

#### 12 周里程碑
| W | 阶段 | 主题 | 状态 |
|---|------|------|------|
| T1 | W1-3 | 基础强化(tsconfig/@ts-nocheck/测试基础/MSW) | 🟡 30% 完成(本批) |
| T2 | W4-5 | 设计系统(antd/Storybook/Design Tokens) | 🟡 Storybook 起步 |
| T3 | W6-8 | 架构升级(XState/i18n/a11y/响应式) | 🟡 XState + i18n + a11y 完成 |
| T4 | W9-11 | 工程化(MSW/性能/CI/CD/Observability/安全) | 🟡 MSW/CI/Sentry/Security 完成 |
| T5 | W12 | 收尾验证 | ⬜ 待办 |

#### 技术 KPI(v2.1 → v3.0 目标)
- `@ts-nocheck` 45 → ≤ 3
- 测试覆盖 < 5% → 60%+
- Lighthouse Performance 60-70 → ≥ 90
- Lighthouse a11y 60-70 → ≥ 90
- 包大小 1.5-2MB → < 1MB(gzip)
- 首屏 LCP ~3s → < 1.5s
- i18n key 230 → 800+
- antd 业务组件 30+ 散 → 50+ 封装
- MSW 端点 4 → 56
- XState 状态机 0 → 4 大
- CI 步骤 0 → 7

#### Refs
- 主方案:`docs/v3.0.0-TECH-REFACTOR.md`
- 对标矩阵:`docs/v3.0.0-FRONTEND-BENCHMARK.md`
- v2.1.0 技术档案:`docs/v2.1.0-INDEX.md`
- 本次日志:`docs/工作日志/2026-06-06-G005-v3.0.0-技术重构启动.md`

---

## [2.1.0] - 2026-06-05

### 📚 Documentation(本次发布唯一变更)

> **重要声明**:`v2.1.0` 是**纯文档版本**,不改任何业务代码。代码层面自 v0.23.1 起未发生破坏性变更,本次升级主要用于系统化沉淀自 v0.9.0 以来的能力扩张。

#### Added
- ✨ 新增根目录 `CHANGELOG.md`(本文件)
- ✨ 新增 `docs/v2.1.0-INDEX.md`:**v2.1.0 文档主索引**(4 分册入口 + 按角色阅读路径)
- ✨ 新增 `docs/v2.1.0-DOCUMENTATION_OUTLINE.md`:v2.1.0 系统文档整体大纲(覆盖 § 1 - § 16 + 4 附录,撰写计划已全部完成)
- ✨ 新增 `docs/v2.1.0-01-ARCHITECTURE.md`:**分册 01 架构篇**(§ 1-4,800+ 行)
- ✨ 新增 `docs/v2.1.0-02-DATA-API-DICOM.md`:**分册 02 数据/API/DICOM 篇**(§ 5-7,700+ 行)
- ✨ 新增 `docs/v2.1.0-03-REPORT-AI-KNOWLEDGE.md`:**分册 03 报告/AI/知识库篇**(§ 12-14,1100+ 行)⭐ 核心
- ✨ 新增 `docs/v2.1.0-04-EXTENDED-ROADMAP.md`:**分册 04 扩展/路线图/附录篇**(§ 15-16 + 附录 A-D,1300+ 行)
- ✨ 新增 `docs/工作日志/2026-06-05-G005-v2.1.0-文档系统化.md`:本次升级工作日志

#### 核心覆盖
- ✅ § 1-4 系统架构 / 前端(30+ 库)/ 后端(过渡态)/ 数据库(类型映射 + Dexie)
- ✅ § 5-7 数据 Mock 全景(27+)/ API(OpenAPI 3.0 + MSW)/ DICOM(前端 Pro 5 文件 + SR 导出)
- ✅ § 8-11 服务器/部署/运维(沿用 v0.15.0)
- ✅ § 12 报告子系统(R0-R7 共 31 项能力,14/15 态,CA 签名,Merkle 审计链,Yjs 协同)
- ✅ § 13 AI 子系统(DeepSeek 客户端,8 类 Prompt,11 套 RADS,语音听写)
- ✅ § 14 术语与知识库(1247 词条,7 分类,70+ 器官,4 大标准映射)
- ✅ § 15 扩展子系统(32 节:CDR/DRG-DIP/HIE/危急值 15 类目录/设备三件套/...)
- ✅ § 16 路线图与完成度矩阵(v0.15.0 Phase 1-5 vs v2.1.0 实际)
- ✅ 附录 A 文档对比矩阵 / 附录 B 流程图清单 / 附录 C 速查手册(89 页面 / 30+ 组件 / 15 Hooks / 11 Services) / 附录 D FAQ(6 类 17 问)

#### Changed
- 📝 更新 `package.json` 版本号:`2.0.0` → `2.1.0`
- 📝 `docs/SYSTEM_DOCUMENTATION.md` 顶部新增"⚠️ 已过期"提示横幅 + 指向 v2.1.0 文档

#### Deprecated
- ⚠️ `docs/SYSTEM_DOCUMENTATION.md`(v0.15.0,2026-05-04)标记为**legacy**;新内容以 v2.1.0 系列文档为准

#### Not Changed
- ❌ 业务代码 / 依赖 / 配置 / 测试:保持 v0.23.1 状态
- ❌ 路线图 Phase 1-5:实际完成度不变

#### 文档规模
- **总文件数**:4 分册 + 1 索引 + 1 大纲 + 1 工作日志 = **7 个新文件**
- **总行数**:约 **4000+ 行**(分册 01-04 累计)+ 索引 + 大纲 + 工作日志
- **覆盖范围**:89 页面 / 30+ 组件 / 15 Hooks / 11 Services / 27+ Mock / 11 套 RADS / 1247 词条 / 14 态状态机

#### Refs
- 工作日志:`docs/工作日志/2026-06-05-G005-v2.1.0-文档系统化.md`
- 主入口:`docs/v2.1.0-INDEX.md`
- 对比矩阵:见分册 04 附录 A
- 速查手册:见分册 04 附录 C

---

## [2.0.0] - 2026-05-27(代码冻结点 / 文档未发布)

> ⚠️ 实际代码已演进至 v0.23.1,`package.json` 升 2.0.0 时未发布独立文档;以工作日志为准。

### Changed
- 报告子系统 R0-R7 收官
- DICOM Viewer Pro 集成 MPR/MIP/Annotation
- AI 子系统:DeepSeek 客户端 + 8 类 Prompt 模板
- 协同编辑:Yjs + y-webrtc
- 国际化:zh-CN + en-US
- 模板生命周期:管理/设计/继承/分类
- 术语库 1247 词 + RADS 11 套
- 共 89 个页面 / 30+ 组件 / 15 个 Hooks / 11 个 Services

---

## 历史片段(2026-04 ~ 2026-05 工作日志)

| 日期 | 版本 | 工作日志 | 主题 |
|------|------|----------|------|
| 2026-05-27 | v0.23.1 | `docs/工作日志/2026-05-27-G005-v0.23.1-数据修复.md` | 数据修复 |
| 2026-05-05 | v0.17.0 | `docs/工作日志/2026-05-05-G005-v0.17.0-全54页面验收.md` | 全 54 页面验收 |
| 2026-05-05 | v0.16.0 | `docs/工作日志/2026-05-05-G005-v0.16.0-InvalidHookCall根因修复.md` | InvalidHookCall 根因修复 |
| 2026-05-04 | v0.15.2 | `docs/工作日志/2026-05-04-G005-v0.15.2-构建bug根因修复.md` | 构建 bug 根因修复 |
| 2026-05-04 | v0.15.0 | `docs/SYSTEM_DOCUMENTATION.md` 发布 | 完整系统说明(现已过期) |

---

[Unreleased]: https://example.com/g005-radiology-ris/compare/v2.1.0...HEAD
[2.1.0]: https://example.com/g005-radiology-ris/compare/v2.0.0...v2.1.0
[2.0.0]: https://example.com/g005-radiology-ris/releases/tag/v2.0.0
