# G005 放射RIS系统 v2.1.0

> 专业级放射信息工作站 · v2.1.0 · Phase R9-R13 完整升级

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)]()
[![Tests](https://img.shields.io/badge/tests-158%2F158-green.svg)]()
[![TypeScript](https://img.shields.io/badge/tsc-0%20errors-blue.svg)]()

## 概述

G005 放射RIS是一套面向三甲医院的**专业级放射信息工作站**，覆盖从检查预约到报告签发/审核的全流程。

**v2.1.0 升级重点（Phase R9-R13）**：
- **R9 协同**: Y.js CRDT + WebRTC P2P + Web Crypto CA + Merkle 审计链
- **R10 影像**: Cornerstone3D 真 DICOM 渲染 + MPR/MIP/VR + 标注 + DICOM-SR
- **R11 AI**: DeepSeek 流式 LLM + Vision 多模态 + 9 任务放射助手
- **R12 数据**: 500 真实放射报告 + 2000 术语库
- **R13 接入**: MSW Mock + OpenAPI 3.0 规范 + Docker/Nginx 部署

## 快速开始

```bash
# 安装
npm ci

# 开发
npm run dev

# 类型检查
npm run typecheck

# 单元测试
npm test

# 构建
npm run build
```

## 文档

| 文档 | 内容 |
|---|---|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | 生产部署指南 (Nginx/Docker/静态) |
| [REPORT_PHASE_R8_*.md](docs/) | R8 专业级升级交付 |
| [REPORT_PHASE_R9_*.md](docs/) | R9 协同/CA/审计 |
| [REPORT_PHASE_R10_*.md](docs/) | R10 影像集成 |
| [REPORT_PHASE_R11_*.md](docs/) | R11 LLM AI 助手 |
| [REPORT_PHASE_R12_*.md](docs/) | R12 真实数据 |
| [REPORT_PHASE_R13_*.md](docs/) | R13 API/部署 |

## 技术栈

### 前端
- **React 18** + **TypeScript 5** (strict)
- **Vite 5** 构建
- **React Router 6** 路由
- **Zustand** + **XState 5** 状态管理
- **Tailwind / 内联样式** 主题

### 影像 (R10)
- **Cornerstone3D 4.22** 真 DICOM 渲染
- **dicom-parser 1.8** + **dcmjs 0.52** DICOM 标准
- **comlink 4.4** Web Worker 桥接

### 协同 (R9)
- **Yjs 13.6** CRDT
- **y-webrtc 10.3** P2P
- **Web Crypto API** RSA-2048 + SHA-256

### 数据
- **Dexie 4** (IndexedDB 包装)
- **pinyin-pro** 拼音搜索
- **D3 / Recharts** 可视化

### AI (R11)
- **DeepSeek Chat/VL** 流式响应
- 9 任务模板 (生成/摘要/翻译/质控/RADS/扩写/Vision/鉴别/自定义)

### 测试
- **Vitest 2** + **@testing-library/react**
- **jsdom** + canvas getContext mock
- **158 测试 100% 通过**

## 核心指标

| 指标 | 值 |
|---|---|
| 源代码 | ~50,000 行 |
| 测试用例 | **158** 个 (覆盖核心逻辑 + UI) |
| 类型检查 | **0** 错误 |
| 测试通过率 | **100%** |
| Git commits | 18+ (R8 5 + R9 1 + R10 3 + R11 1 + R12 1 + R13 1) |

## 部署

参见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)：
- 静态部署 (Nginx/Apache/S3)
- Docker
- Vercel/Netlify

## 安全

- HTTPS + HSTS 强制
- CSP 策略
- CA 私钥 IndexedDB 加密存储
- 审计链 Merkle 根 + 签名
- 危急值多通道通知

## 许可

MIT
