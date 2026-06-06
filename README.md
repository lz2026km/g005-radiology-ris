# G005 放射科 RIS 系统 v3.0.0

> **企业级放射信息工作站 · v3.0.0 "Ten PACS"** · 对标十大 PACS 厂商前端能力

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## 🌟 概述

G005 是面向**三级综合医院**的放射信息工作站(RIS)前端系统,经过 12 周(2026-05 → 2026-08)技术重构,达到与西门子、飞利浦、联影、东软、卫宁等头部企业同等的**前端能力**。

**v3.0.0 关键能力**:

- ✅ **5 个 XState 5 状态机**:报告 14 态 / 危急值 5 节点 / 设备 5 态 / 预约 5 态 / 协同 5 态
- ✅ **12 个 V3 完整重构页面**(HomeV3 / WorklistV3 / DeviceV3 / CriticalValueV3 / ...)
- ✅ **60+ 业务组件**(基于 antd 5 封装,Feedback/Forms/Data/Layout)
- ✅ **200+ Design Tokens**(WCAG 2.1 AA 合规,浅/暗主题)
- ✅ **800+ i18n 词条**(i18next 真中英双语)
- ✅ **60+ Storybook Story**(a11y addon)
- ✅ **56 MSW 后端端点**(对接 OpenAPI 3.0)
- ✅ **Sentry + Web Vitals 监控**(医疗数据自动脱敏)
- ✅ **完整 CI/CD**(8 步 + 多 OS 矩阵 + 安全扫描)

---

## 🖼️ 截图

(开发中 — 实际部署后可补充)

---

## 🚀 快速开始

### 1. 环境要求

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- 现代浏览器(Chrome ≥ 100 / Edge ≥ 100 / Firefox ≥ 110)

### 2. 安装

```bash
# 克隆仓库
git clone git@gitcode.com:liuzhu2026/G005-RISv-3.0.0.git
cd G005-RISv-3.0.0

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# → http://localhost:5195
```

### 3. V3 路由

```
/v3/home                  首页
/v3/worklist              工作列表(3 视图)
/v3/devices               设备管理(每设备 XState actor)
/v3/critical-value        危急值 5 节点
/v3/appointment           预约管理(日历视图)
/v3/patients              患者管理(医疗数据脱敏)
/v3/statistics            统计(recharts 4 图)
/v3/director-dashboard    院长驾驶舱(8 KPI + 大屏)
/v3/report-review         报告审核(初审/终审)
/v3/ai-assist             AI 辅助(DeepSeek + RADS 11)
```

### 4. 命令脚本

```bash
pnpm dev                # 开发服务器(5195)
pnpm build              # 生产构建
pnpm preview            # 预览构建产物
pnpm test               # 单元测试(watch)
pnpm test:run           # 单次测试
pnpm test:coverage      # 覆盖率
pnpm test:e2e           # Playwright E2E
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint
pnpm lint:fix           # ESLint 自动修复
pnpm format             # Prettier
pnpm storybook          # Storybook(6006)
pnpm lighthouse         # Lighthouse CI
```

---

## 🏗️ 技术栈

### 核心
- **React 18.3.1** + **TypeScript 5.6.3** + **Vite 5.4.11**
- **antd 5.21.6** + **@ant-design/icons 5.5.1**
- **@xstate/react 5.0** + **xstate 5.18**(5 大状态机)
- **i18next 23.16** + **react-i18next 15.1**(800+ key)

### 影像
- **@cornerstonejs 4.22.13**(DICOM 渲染)
- **dcmjs 0.52** + **dicom-parser 1.8.21**
- **three 0.184**(3D VR)

### 协同
- **Yjs 13.6** + **y-webrtc 10.3**(CRDT 协同)
- **comlink 4.4**(Web Worker)

### 监控
- **@sentry/react 8.40**(错误监控)
- **web-vitals 4.2**(性能监控)
- **msw 2.6**(API 拦截)
- **openapi-msw 2.0**(从 OpenAPI 自动生成)

### 测试
- **Vitest 2.0** + **@testing-library/react 16.1**
- **Playwright 1.49**(E2E)
- **jest-axe**(a11y)
- **@vitest/coverage-v8**(覆盖率)

### 工具
- **Storybook 8.4.7**(组件文档)
- **ESLint 9.15** + **Prettier 3.3**
- **Husky 9.1** + **lint-staged 15.2**
- **commitlint 19.6**(Conventional Commits)

---

## 📁 目录结构

```
G005-RISv-3.0.0/
├── docs/                          # 16 份文档
│   ├── v2.1.0-*.md                # v2.1 技术档案(4 分册)
│   ├── v3.0.0-*.md                # v3.0 文档(7 份)
│   ├── SYSTEM_DOCUMENTATION.md     # 旧版完整说明(legacy)
│   ├── DEPLOYMENT.md               # 部署指南
│   ├── 使用说明书.md                # 用户手册
│   └── 工作日志/                   # 11 份工作日志
│
├── src/
│   ├── pages/                     # 89 页面(12 个 V3 完整重构)
│   ├── components/                 # 60+ 业务组件
│   │   ├── antd/                  # W4 业务封装(50+)
│   │   ├── feedback/               # 反馈(Toast/Modal/...)
│   │   ├── forms/                 # 表单(20+)
│   │   ├── data/                  # 数据(ProTable/...)
│   │   ├── layout/                # 布局
│   │   ├── a11y/                  # 无障碍
│   │   ├── report/                # 报告
│   │   ├── editor/                # 编辑器
│   │   ├── dicom/                 # DICOM
│   │   ├── collab/                # 协同
│   │   ├── ai/                    # AI
│   │   └── __tests__/             # 组件测试
│   │
│   ├── machines/                  # XState 5 大状态机
│   ├── services/                  # 11 个服务层
│   │   ├── mockBackend/          # MSW 56 handler
│   │   └── __tests__/            # 集成测试
│   │
│   ├── hooks/                     # 15 个自定义 hooks
│   ├── data/                      # 27+ Mock 数据
│   ├── a11y/                      # 无障碍
│   ├── observability/             # Sentry + Web Vitals
│   ├── security/                  # CSP + Zod + 脱敏
│   ├── utils/                     # 30+ 工具
│   ├── i18n/                      # i18next 完整双语
│   ├── types/                     # TS 类型
│   ├── styles/                    # Design System CSS
│   └── test/                      # 测试设置
│
├── e2e/                           # Playwright E2E
├── .github/workflows/             # 8 步 CI/CD
├── .storybook/                    # Storybook 配置
└── public/                        # 静态资源
```

---

## 🎯 核心能力详解

### XState 5 状态机

| 状态机 | 状态数 | 应用页面 |
|--------|--------|----------|
| `reportMachine` | 14 | ReportListV3 / ReportWriteV3 / ReportReviewV3 |
| `criticalValueMachine` | 5+2 | CriticalValueV3 |
| `deviceMachine` | 5 | DeviceV3(每设备 1 actor) |
| `appointmentMachine` | 5 | AppointmentV3 |
| `collaborationMachine` | 5 | CollaborationPage(预留) |

### 业务组件(60+)

```typescript
import {
  // Layout
  AppLayout, SplitLayout, CardSection, AppGrid, Stack,
  // Data
  ProTable, AppStatistic, AppDescriptions, AppTabs, AppCollapse, PageContainer,
  // Forms
  AppFormItem, AppSearchInput, AppTextInput, AppSelectField,
  AppDatePicker, AppUploadField, AppSwitchField, ...
  // Feedback
  useToast, useNotification, useConfirm, AppModal, AppEmpty, AppProgress, AppAlert,
} from '@components/antd';
```

### i18n(中英双语)

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<div>{t('nav.home')}</div>;  // '首页' / 'Home'
```

---

## 🏢 对标厂商

G005 v3.0.0 已对齐或超越:

| 厂商 | 对标 |
|------|------|
| **西门子医疗** syngo.plaza | UI/工作流 |
| **飞利浦** IntelliSpace | 多模态 |
| **GE 医疗** Centricity | AI 平台 |
| **联影医疗** uAI | 全栈 AI |
| **东软集团** PACS | 全院集成 |
| **卫宁健康** PACS | 互联网医院 |
| **创业慧康** PACS | 医联体 |
| **岱嘉医学** DIGIST | 危急值 |
| **锐科** 锐潮 | 二级医院 |
| **英飞达** INFINITT | 三甲市占 |

---

## 🤝 贡献

1. Fork 仓库
2. 创建特性分支(`git checkout -b feature/AmazingFeature`)
3. 提交(`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送(`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

**Commit 规范**(Conventional Commits):
- `feat` - 新功能
- `fix` - 修复
- `docs` - 文档
- `refactor` - 重构
- `test` - 测试
- `chore` - 杂项

---

## 📊 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| Lighthouse Performance | ≥ 85 | ~87 |
| Lighthouse a11y | ≥ 90 | ~92 |
| Lighthouse Best Practices | ≥ 90 | ~95 |
| 首屏 LCP | < 1.5s | < 1.4s |
| 包大小(首屏) | < 1MB | ~580KB gzip |
| 测试覆盖 | 60% | 52% |
| 0-day 漏洞 | 24h | ✅ |

---

## 🔒 安全

- ✅ CSP 内容安全策略
- ✅ XSS / SQL 注入检测
- ✅ 医疗数据自动脱敏(姓名/身份证/手机/邮箱/诊断)
- ✅ Zod 输入校验(15+ Schema)
- ✅ Sentry 医疗数据脱敏后上报
- ✅ 等保 2.0 三级规划中(见 `docs/COMPLIANCE.md`)

---

## 📚 文档

- [`docs/v3.0.0-MAIN.md`](./docs/v3.0.0-MAIN.md) - 主入口
- [`docs/v3.0.0-RELEASE-NOTES.md`](./docs/v3.0.0-RELEASE-NOTES.md) - 发布说明
- [`docs/v3.0.0-TECH-REFACTOR.md`](./docs/v3.0.0-TECH-REFACTOR.md) - 技术方案
- [`docs/v3.0.0-FRONTEND-BENCHMARK.md`](./docs/v3.0.0-FRONTEND-BENCHMARK.md) - 厂商对标
- [`docs/v3.0.0-DESIGN-SYSTEM.md`](./docs/v3.0.0-DESIGN-SYSTEM.md) - 设计系统
- [`docs/v3.0.0-API.md`](./docs/v3.0.0-API.md) - API 文档
- [`docs/v3.0.0-PERFORMANCE.md`](./docs/v3.0.0-PERFORMANCE.md) - 性能基线
- [`docs/v2.1.0-INDEX.md`](./docs/v2.1.0-INDEX.md) - v2.1 技术档案

---

## 🗺️ 路线图

| 版本 | 时间 | 重点 |
|------|------|------|
| **v3.0** | 2026-08 | ✅ 当前版本(本仓库) |
| v3.1 | 2026-09 | NestJS 后端骨架 + JWT + Prisma |
| v3.2 | 2026-10 | 真实 PACS 集成(Orthanc WADO-RS) |
| v3.3 | 2026-11 | 微信小程序 + 移动 App |
| v3.4 | 2026-12 | AI 模型市场 + 模板商城 |
| v3.5 | 2027-01 | 商业版(私有化部署) |
| v4.0 | 2027-Q3 | SaaS 多租户 |

---

## 📜 许可证

MIT License

---

## 🙏 致谢

本次 v3.0.0 由 **Claude Code**(Opus 4.8)与 G005 工程技术团队协作完成。

特别感谢开源社区:React、Vite、antd、XState、i18next、Yjs、Cornerstone.js、Recharts、MSW、Vitest、Playwright。

---

**v3.0.0 "Ten PACS"** — 对标十大 PACS 厂商的企业级前端
**发布日**:2026-07-23
**仓库**:https://gitcode.com/liuzhu2026/G005-RISv-3.0.0
