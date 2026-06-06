# G005 放射科RIS系统 — 完整系统说明文档

> **文档版本**：v0.15.0
> **更新日期**：2026-05-04
> **系统名称**：汉东省人民医院放射科信息系统
> **技术栈**：React 18 + TypeScript + Vite + Ant Design 5 + Apache ECharts

---

> ## ⚠️ 重要提示:本文件已过期(Legacy)
>
> **本文件最后更新于 2026-05-04(v0.15.0),与当前系统偏差已超 80%**。
>
> - 实际代码已演进至 **v0.23.1**(2026-05-27)→ 包版本 **v2.0.0** → 文档版本 **v2.1.0**(2026-06-05)
> - 文档中部分技术栈描述已不正确(实际图表用 **recharts** 而非 ECharts;影像库 **@cornerstonejs 4.x** 而非 3.x;新增 Dexie / Yjs / XState 等)
> - 仅描述 60+ 页面;实际 **89 个页面 / 30+ 组件 / 15 Hooks / 11 Services / 27+ Mock**
> - 仅描述 6 态报告状态;实际 **14/15 态**
> - 未涵盖:DeepSeek LLM 集成 / 11 套 RADS / CA 签名 / Merkle 审计链 / 协同编辑 / 1247 词条 / DRG-DIP / HIE / CDR 等 20+ 子系统
>
> ### ✅ 请使用新文档
>
> 完整新文档已发布(2026-06-05):
>
> - **主入口**:`docs/v2.1.0-INDEX.md`
> - **分册 01 架构**:[`docs/v2.1.0-01-ARCHITECTURE.md`](./v2.1.0-01-ARCHITECTURE.md)(§ 1-4)
> - **分册 02 数据/API/DICOM**:[`docs/v2.1.0-02-DATA-API-DICOM.md`](./v2.1.0-02-DATA-API-DICOM.md)(§ 5-7)
> - **分册 03 报告/AI/知识库**:[`docs/v2.1.0-03-REPORT-AI-KNOWLEDGE.md`](./v2.1.0-03-REPORT-AI-KNOWLEDGE.md)(§ 12-14)
> - **分册 04 扩展/路线图/附录**:[`docs/v2.1.0-04-EXTENDED-ROADMAP.md`](./v2.1.0-04-EXTENDED-ROADMAP.md)(§ 15-16 + 附录)
> - **变更日志**:`CHANGELOG.md`
>
> 本文件保留作为**历史快照**,仅供查阅 2026-05-04 当时的设计思路。后续所有维护、新人入门、产品决策请以 v2.1.0 文档为准。
>
> ---

---

## 目录

1. [系统架构总览](#1-系统架构总览)
2. [前端技术架构](#2-前端技术架构)
3. [后端技术架构（必须配置）](#3-后端技术架构必须配置)
4. [数据库设计](#4-数据库设计)
5. [API接口规范](#5-api接口规范)
6. [服务器配置](#6-服务器配置)
7. [DICOM服务集成](#7-dicom服务集成)
8. [所有功能模块详解](#8-所有功能模块详解)
9. [部署指南](#9-部署指南)
10. [系统运维](#10-系统运维)
11. [开发路线图](#11-开发路线图)

---

## 1. 系统架构总览

### 1.1 当前状态

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
│              (Chrome/Edge/Firefox)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    当前状态：纯前端SPA                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     React + Vite + Ant Design + ECharts             │   │
│  │     数据来源：src/data/*.ts（静态模拟数据）          │   │
│  │     状态管理：React Context + useState              │   │
│  │     路由：React Router v6                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ⚠️ 需要配置 ↓↓↓↓
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      生产环境（需要配置）                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Node.js  │  │ PostgreSQL│  │ Redis    │  │ DICOM    │  │
│  │ Express  │  │ 数据库    │  │ 缓存     │  │ PACS     │  │
│  │ API服务  │  │          │  │          │  │ 服务器   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 完整系统架构（目标状态）

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层                                    │
│   医生工作站 ─── 技师工作站 ─── 主任管理 ─── 临床科室 ─── 患者  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS (Nginx反向代理)
                              │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Nginx         │  │   API Gateway   │  │   WebSocket     │
│   静态资源/CDN   │  │   (Node.js)     │  │   实时通信      │
│   端口: 5191    │  │   端口: 3001     │  │   端口: 3002    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │   Redis         │  │   DICOM PACS    │
│   主数据库      │  │   缓存/会话     │  │   Orthanc/OHIF  │
│   端口: 5432    │  │   端口: 6379    │  │   端口: 4242   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   文件存储      │  │   HL7/FHIR     │  │   第三方系统    │
│   MinIO/OSS    │  │   消息队列      │  │   HIS/EMR/LIS  │
│               │  │   RabbitMQ     │  │   接口对接      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 2. 前端技术架构

### 2.1 技术栈详情

| 层级 | 技术 | 版本 | 作用 |
|------|------|------|------|
| 框架 | React | 18.x | UI框架 |
| 构建 | Vite | 5.x | 快速构建工具 |
| 语言 | TypeScript | 5.x | 类型安全 |
| UI库 | Ant Design | 5.x | 企业级组件库 |
| 图表 | Apache ECharts | 5.x | 数据可视化 |
| 路由 | React Router | 6.x | 页面路由 |
| 状态 | React Context | 内置 | 轻量状态管理 |
| 图标 | Lucide React | 最新 | SVG图标 |
| DICOM | cornerstone.js | 3.x | 医学影像渲染 |
| 日期 | day.js | 1.x | 日期处理 |

### 2.2 目录结构

```
src/
├── main.tsx                 # 入口文件
├── App.tsx                  # 根组件 + 路由配置 + 侧边栏
├── types/
│   └── index.ts            # TypeScript类型定义
├── data/                   # ⚠️ 静态模拟数据（生产需替换为API）
│   ├── initialData.ts      # 首页/工作列表/设备/统计初始数据
│   ├── printQueue.ts       # 打印队列模拟数据
│   ├── typicalData.ts      # 典型病例/征象数据
│   └── ReportingStandards.ts # 报告标准/模板数据
├── pages/                  # 页面组件（60+个）
│   ├── HomePage.tsx        # 首页概览
│   ├── WorklistPage.tsx    # 检查工作列表
│   ├── ReportPage.tsx      # 报告列表
│   ├── ReportWritePage.tsx # 报告书写
│   ├── DicomViewerPage.tsx # DICOM影像浏览器
│   ├── AIAssistPage.tsx    # AI辅助诊断
│   ├── StatisticsPage.tsx  # 统计分析
│   ├── DevicePage.tsx      # 设备效率分析
│   ├── CriticalValuePage.tsx # 危急值管理
│   ├── AppointmentPage.tsx # 检查预约
│   ├── QueueCallPage.tsx   # 排队叫号
│   ├── RegionalImagingPage.tsx # 区域影像协同
│   ├── RegionalReportPage.tsx  # 区域报告
│   └── ... (60个页面)
├── utils/
│   ├── DicomManager.ts     # DICOM文件管理器（ cornerstone.js封装）
│   └── WindowPresets.ts    # 窗宽窗位预设配置
└── assets/                 # 静态资源
```

### 2.3 当前数据流（静态模拟）

```typescript
// 当前：数据硬编码在 initialData.ts
const initialData = {
  todayStats: {
    totalExams: 247,
    pendingReports: 97,
    completedReports: 150,
    criticalValues: 10
  },
  worklist: [
    { patientId: 'P001', patientName: '张三', modality: 'CT', status: '检查中' },
    // ...
  ],
  // ...
}

// 生产环境：应替换为API调用
// const response = await fetch('/api/worklist/today');
// const data = await response.json();
```

---

## 3. 后端技术架构（必须配置）

### 3.1 为什么必须后端？

**当前问题**：
- 所有数据是静态的，关掉浏览器就重置
- 无法多人同时使用
- 无法持久化存储
- 没有权限控制
- DICOM影像无法真实加载
- 打印任务无法发送到真实打印机
- 报告无法电子签名/归档

### 3.2 推荐技术栈

| 组件 | 推荐方案 | 备选方案 |
|------|----------|----------|
| 运行时 | Node.js 20 LTS | Java 17 / Python 3.11 |
| API框架 | Express.js / NestJS | Spring Boot / FastAPI |
| 数据库 | PostgreSQL 15 | MySQL 8 / Oracle |
| 缓存 | Redis 7 | Memcached |
| ORM | Prisma / TypeORM | Hibernate / SQLAlchemy |
| 认证 | JWT | OAuth2 / LDAP |
| 文件存储 | MinIO (S3兼容) | 阿里云OSS / 七牛云 |
| DICOM | Orthanc / DCM4CHEE | Cornerstone.js WADO-RS |
| 消息队列 | RabbitMQ | Kafka / Redis Pub/Sub |
| 日志 | Winston / ELK | Log4j / Python logging |
| 容器 | Docker + Docker Compose | K8s |

### 3.3 项目初始化（Node.js + Express + PostgreSQL）

```bash
# 1. 创建后端项目
mkdir g005-backend && cd g005-backend
npm init -y

# 2. 安装核心依赖
npm install express cors helmet morgan dotenv
npm install pg prisma @prisma/client bcryptjs jsonwebtoken
npm install express-validator swagger-jsdoc swagger-ui-express
npm install bull redis socket.io
npm install dayjs uuid

# 3. 开发依赖
npm install -D typescript ts-node nodemon @types/node @types/express
npm install -D jest supertest @types/jest
npm install -D prisma

# 4. 初始化TypeScript
npx tsc --init

# 5. 初始化Prisma
npx prisma init
```

### 3.4 目录结构

```
g005-backend/
├── src/
│   ├── index.ts                 # 入口文件
│   ├── app.ts                   # Express应用配置
│   ├── config/
│   │   ├── database.ts          # PostgreSQL连接配置
│   │   ├── redis.ts             # Redis连接配置
│   │   └── jwt.ts               # JWT密钥配置
│   ├── routes/
│   │   ├── auth.routes.ts       # 认证路由
│   │   ├── worklist.routes.ts   # 工作列表路由
│   │   ├── report.routes.ts    # 报告路由
│   │   ├── patient.routes.ts   # 患者路由
│   │   ├── device.routes.ts    # 设备路由
│   │   ├── dicom.routes.ts     # DICOM路由
│   │   ├── print.routes.ts     # 打印路由
│   │   ├── statistics.routes.ts # 统计路由
│   │   ├── critical.routes.ts  # 危急值路由
│   │   └── admin.routes.ts     # 管理路由
│   ├── controllers/
│   │   └── *.controller.ts     # 业务逻辑
│   ├── services/
│   │   └── *.service.ts         # 服务层
│   ├── models/
│   │   └── prisma/              # Prisma数据模型
│   ├── middlewares/
│   │   ├── auth.middleware.ts   # JWT认证中间件
│   │   ├── role.middleware.ts   # 角色权限中间件
│   │   ├── error.middleware.ts  # 错误处理中间件
│   │   └── logging.middleware.ts # 日志中间件
│   ├── utils/
│   │   ├── dicom.ts             # DICOM工具函数
│   │   ├── hl7.ts              # HL7消息处理
│   │   └── pdf.ts              # PDF报告生成
│   ├── sockets/
│   │   └── realtime.ts          # WebSocket实时通信
│   └── types/
│       └── express.d.ts         # Express类型扩展
├── prisma/
│   └── schema.prisma            # 数据库模型
├── uploads/                     # 文件上传目录
├── logs/                        # 日志目录
├── .env                         # 环境变量
├── Dockerfile
├── docker-compose.yml
└── tsconfig.json
```

---

## 4. 数据库设计

### 4.1 Prisma数据模型（schema.prisma）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === 用户与认证 ===
model User {
  id            String    @id @default(uuid())
  username      String    @unique
  password      String    // bcrypt加密
  realName      String
  role          Role      @default(RADIOLOGIST)
  department    String
  title         String?   // 主任医师/副主任医师等
  phone         String?
  email         String?
  avatar        String?
  status        UserStatus @default(ACTIVE)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关系
  reports       Report[]       // 该医生写的报告
  worklistOps   WorklistOp[]   // 工作列表操作记录
  loginLogs     LoginLog[]
}

enum Role {
  ADMIN        // 系统管理员
  RADIOLOGIST  // 放射科医生
  TECHNICIAN   // 技师
  DIRECTOR     // 主任
  NURSE        // 护士
  CLINICIAN    // 临床医生（只读）
  PATIENT      // 患者（受限）
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

// === 患者 ===
model Patient {
  id              String    @id @default(uuid())
  patientId       String    @unique  // 医院内部ID，如 P20260504001
  name            String
  gender          Gender
  birthDate       DateTime
  idCard          String?   @unique
  phone           String?
  address         String?
  allergies       String?    // 过敏史
  pregnancyStatus String?    // 孕情
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // 关系
  exams           Exam[]
  reports         Report[]
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

// === 检查（工作列表条目）===
model Exam {
  id              String      @id @default(uuid())
  examId          String      @unique  // 检查ID，如 EX20260504001
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id])
  
  modality        Modality    // CT/MR/DR/DSA/钼靶等
  examType        String      // 检查类型：颅脑CT/胸部DR
  examBodyPart    String      // 检查部位
  
  priority        Priority    @default(NORMAL)
  status          ExamStatus  @default(SCHEDULED)
  
  scheduledAt     DateTime?   // 预约时间
  checkedInAt     DateTime?   // 报到时间
  startedAt       DateTime?   // 检查开始时间
  completedAt     DateTime?   // 检查完成时间
  
  requestingDept  String      // 申请科室
  requestingDoctor String?    // 申请医生
  clinicalDiagnosis String?    // 临床诊断
  
  deviceId        String?     // 检查设备
  technicianId    String?     // 技师ID
  
  fee             Decimal?    @db.Decimal(10,2)
  paymentStatus   PaymentStatus @default(UNPAID)
  
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // 关系
  report          Report?
  worklistOps     WorklistOp[]
}

enum Modality {
  DR      // 数字化X线摄影
  CR      // 计算机X线摄影
  CT      // 计算机断层扫描
  MR      // 磁共振成像
  DSA     // 数字减影血管造影
  MG      // 乳腺钼靶
  RF      // 胃肠造影
  US      // 超声
  PET_CT  // PET-CT
  SPECT   // 核医学
  OTHERS  // 其他
}

enum Priority {
  ROUTINE   // 常规
  URGENT    // 紧急
  EMERGENCY // 急诊
  STAT      // 特急（床边）
}

enum ExamStatus {
  SCHEDULED      // 已预约
  CHECKED_IN     // 已报到
  IN_PROGRESS    // 检查中
  COMPLETED      // 已完成
  REPORT_PENDING // 待写报告
  REPORT_DRAFT   // 报告草稿
  REPORT_REVIEW  // 报告审核中
  REPORT_FINAL   // 报告已完成
  REPORT_REJECTED // 报告被驳回
  CANCELLED      // 已取消
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

// === 影像报告 ===
model Report {
  id              String      @id @default(uuid())
  reportId        String      @unique  // 报告ID，如 RP20260504001
  
  examId          String      @unique
  exam            Exam        @relation(fields: [examId], references: [id])
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id])
  
  radiologistId   String      // 报告医生
  radiologist     User        @relation(fields: [radiologistId], references: [id])
  
  findings        String      @db.Text  // 影像所见
  diagnosis       String      @db.Text  // 诊断意见
  impression      String?     @db.Text  // 印象/结论
  
  // AI辅助
  aiFindings      String?     @db.Text  // AI辅助所见
  aiDiagnosis     String?     @db.Text  // AI辅助诊断
  aiConfidence    Float?      // AI置信度
  
  // Lung-RADS / PI-RADS 等分级
  classification  String?     // AI分类结果
  
  // 报告状态
  status          ReportStatus @default(DRAFT)
  
  // 审核
  reviewerId      String?
  reviewedAt      DateTime?
  reviewComment   String?
  
  // 危急值
  criticalFinding Boolean     @default(false)
  criticalNotifiedAt DateTime?
  
  // 电子签名
  signedAt        DateTime?
  signatureHash   String?     // 签名哈希（防篡改）
  
  // 修订
  revisedAt       DateTime?
  revisionReason  String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum ReportStatus {
  DRAFT       // 草稿
  SUBMITTED   // 已提交（待审核）
  REVIEWED    // 已审核（待签发）
  FINAL       // 已签发（最终）
  AMENDED     // 已修正（修订版）
  CANCELLED   // 已取消
}

// === 工作列表操作日志 ===
model WorklistOp {
  id          String    @id @default(uuid())
  examId      String
  exam        Exam      @relation(fields: [examId], references: [id])
  
  operatorId  String
  operator    User      @relation(fields: [operatorId], references: [id])
  
  action      WorklistAction
  fromStatus  ExamStatus?
  toStatus    ExamStatus?
  notes       String?
  
  ipAddress   String?
  deviceInfo  String?   // 浏览器/工作站信息
  
  createdAt   DateTime  @default(now())
}

enum WorklistAction {
  CREATE
  SCHEDULE
  CHECK_IN
  START
  COMPLETE
  CANCEL
  REASSIGN
  UPDATE
}

// === 危急值记录 ===
model CriticalValue {
  id              String      @id @default(uuid())
  examId          String      // 关联检查
  patientId       String
  patientName     String
  patientPhone    String?
  
  modality        Modality
  finding         String      @db.Text  // 危急值描述
  
  reportedBy      String      // 报告医生
  reportedAt      DateTime
  
  notifiedTo      String?     // 通知对象
  notifiedAt      DateTime?   // 通知时间
  notificationMethod String?  // 通知方式：电话/短信/系统
  
  acknowledgment   String?     // 收到确认
  acknowledgedBy  String?
  acknowledgedAt  DateTime?
  
  resolved        Boolean     @default(false)
  resolvedAt      DateTime?
  
  notes           String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// === 设备管理 ===
model Device {
  id            String    @id @default(uuid())
  deviceCode    String    @unique  // 设备编码：CT-1/MR-2
  deviceName    String    // 设备名称
  modality      Modality
  manufacturer   String    // 厂商：GE/Siemens/Philips
  
  department     String    @default("放射科")
  location       String    // 位置：CT室1
  
  status         DeviceStatus @default(IDLE)
  
  // 效率指标
  todayExams     Int       @default(0)
  todayUsageMins Int       @default(0)
  utilizationRate Float   @default(0)
  
  // 维护
  lastMaintenance DateTime?
  nextMaintenance DateTime?
  maintenanceNotes String?
  
  isActive      Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // 关系
  exams         Exam[]
}

enum DeviceStatus {
  IDLE       // 空闲
  IN_USE     // 使用中
  MAINTENANCE // 维护中
  BROKEN     // 故障
  OFFLINE    // 离线
}

// === 打印管理 ===
model PrintJob {
  id            String    @id @default(uuid())
  jobId         String    @unique  // 打印任务ID
  
  examId        String
  patientName   String
  modality       Modality
  filmSpec      String    // 胶片规格：14x17/10x12
  filmCount     Int       @default(1)
  
  printerId     String?   // 打印机ID
  printerName   String?   // 打印机名称
  printerIP     String?   // 打印机IP
  
  status        PrintStatus @default(QUEUED)
  
  requestedBy   String
  requestedAt   DateTime  @default(now())
  printedAt     DateTime?
  
  errorMessage  String?
  
  priority      Priority  @default(NORMAL)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum PrintStatus {
  QUEUED      // 队列中
  PRINTING    // 打印中
  COMPLETED   // 已完成
  FAILED      // 失败
  CANCELLED   // 已取消
}

// === 统计分析 ===
model DailyStat {
  id            String    @id @default(uuid())
  statDate      DateTime  @db.Date
  department    String
  
  totalExams    Int       @default(0)
  completedExams Int      @default(0)
  pendingReports Int      @default(0)
  finalReports   Int      @default(0)
  criticalValues  Int     @default(0)
  
  revenue       Decimal?  @db.Decimal(12,2)
  
  // 按设备统计
  deviceStats   Json?     // {"CT-1": 25, "MR-1": 18}
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([statDate, department])
}

// === 预约管理 ===
model Appointment {
  id              String    @id @default(uuid())
  appointmentId   String    @unique
  
  patientId       String
  patientName     String
  patientPhone    String?
  
  modality        Modality
  examType        String
  bodyPart         String
  
  requestedDept   String
  requestingDoctor String?
  reason          String?   // 预约原因
  
  appointmentDate DateTime
  timeSlot        String?   // 上午/下午/具体时间段
  
  deviceId        String?   // 指定设备
  deviceName      String?
  
  status          AppointmentStatus @default(SCHEDULED)
  
  checkInCode     String?   // 报到码
  
  notes           String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum AppointmentStatus {
  SCHEDULED
  CHECKED_IN
  COMPLETED
  CANCELLED
  NO_SHOW
}

// === DICOM文件索引 ===
model DicomFile {
  id              String    @id @default(uuid())
  studyUid        String    @unique  // DICOM Study UID
  seriesUid       String    @unique  // Series UID
  sopUid          String    @unique  // SOP Instance UID
  
  examId          String    // 关联检查
  patientId       String
  patientName     String
  patientBirthDate DateTime?
  
  modality        Modality
  studyDate       DateTime
  studyDesc       String?
  
  filePath        String    // 文件存储路径
  fileSize        BigInt    // 文件大小
  
  thumbnailPath   String?   // 缩略图路径
  
  transferred     Boolean   @default(false)
  transferAt      DateTime?
  
  createdAt       DateTime  @default(now())
}

// === 区域协同 ===
model RegionalRequest {
  id              String    @id @default(uuid())
  requestId       String    @unique
  
  sourceHospital  String    // 源医院
  targetHospital  String?   // 目标医院（可选）
  
  patientId       String
  patientName     String
  gender          Gender
  birthDate       DateTime
  
  modality        Modality
  examType        String
  
  clinicalInfo    String?   @db.Text
  attachedFiles   Json?     // 附件文件列表
  
  status          RegionalStatus @default(PENDING)
  
  requestedBy     String
  requestedAt     DateTime  @default(now())
  
  reviewedBy      String?
  reviewedAt      DateTime?
  reviewComment   String?
  
  completedAt     DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum RegionalStatus {
  PENDING       // 待处理
  REVIEWING     // 审核中
  APPROVED      // 已通过
  REJECTED      // 已拒绝
  COMPLETED     // 已完成
  CANCELLED     // 已取消
}

// === 系统配置 ===
model SystemConfig {
  id            String    @id @default(uuid())
  configKey     String    @unique
  configValue   String    @db.Text
  description   String?
  category      String    @default("general")
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// === 登录日志 ===
model LoginLog {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  ipAddress   String?
  userAgent   String?
  loginStatus LoginStatus
  
  errorMessage String?
  
  createdAt   DateTime  @default(now())
}

enum LoginStatus {
  SUCCESS
  FAILED
  LOCKED
}
```

### 4.2 数据库初始化SQL

```sql
-- 创建数据库
CREATE DATABASE g005_ris;
CREATE USER g005_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE g005_ris TO g005_admin;
\c g005_ris

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 模糊搜索

-- 性能优化配置
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- 索引优化
CREATE INDEX idx_exam_status ON "Exam"(status);
CREATE INDEX idx_exam_modality ON "Exam"(modality);
CREATE INDEX idx_exam_scheduled ON "Exam"(scheduledAt);
CREATE INDEX idx_exam_patient ON "Exam"(patientId);
CREATE INDEX idx_report_status ON "Report"(status);
CREATE INDEX idx_report_radiologist ON "Report"(radiologistId);
CREATE INDEX idx_worklist_exam ON "WorklistOp"(examId);
CREATE INDEX idx_critical_exam ON "CriticalValue"(examId);
CREATE INDEX idx_dicom_study ON "DicomFile"(studyUid);
CREATE INDEX idx_appointment_date ON "Appointment"(appointmentDate);
```

---

## 5. API接口规范

### 5.1 API基础路径

```
生产环境：https://api.hospital.com/g005/v1
测试环境：https://api-test.hospital.com/g005/v1
本地开发：http://localhost:3001/api/v1
```

### 5.2 认证接口

```
POST   /api/v1/auth/login          # 用户登录
POST   /api/v1/auth/logout         # 用户登出
POST   /api/v1/auth/refresh        # 刷新Token
GET    /api/v1/auth/me             # 获取当前用户信息
PUT    /api/v1/auth/password       # 修改密码
```

**登录请求示例**：
```json
POST /api/v1/auth/login
{
  "username": "liminghui",
  "password": "encrypted_password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": "uuid",
      "username": "liminghui",
      "realName": "李明辉",
      "role": "DIRECTOR",
      "department": "放射科",
      "title": "主任医师"
    }
  }
}
```

### 5.3 工作列表接口

```
GET    /api/v1/worklist                  # 获取工作列表（支持分页/筛选）
GET    /api/v1/worklist/:id              # 获取单个检查详情
POST   /api/v1/worklist                  # 创建检查记录
PUT    /api/v1/worklist/:id              # 更新检查信息
PUT    /api/v1/worklist/:id/status       # 更新检查状态
POST   /api/v1/worklist/:id/checkin      # 报到
POST   /api/v1/worklist/:id/start        # 开始检查
POST   /api/v1/worklist/:id/complete     # 完成检查
POST   /api/v1/worklist/:id/cancel       # 取消检查
GET    /api/v1/worklist/stats/today      # 今日统计
```

**工作列表查询参数**：
```
?date=2026-05-04              # 日期
?modality=CT,MR               # 设备类型（多选）
?status=IN_PROGRESS,PENDING  # 状态（多选）
?priority=EMERGENCY            # 优先级
?device=CT-1                   # 设备
?search=张三                   # 患者姓名/ID搜索
?page=1&pageSize=20           # 分页
?sort=scheduledAt&order=desc # 排序
```

### 5.4 报告接口

```
GET    /api/v1/reports                 # 报告列表
GET    /api/v1/reports/:id             # 报告详情
POST   /api/v1/reports                 # 创建报告（写报告）
PUT    /api/v1/reports/:id             # 更新报告
POST   /api/v1/reports/:id/submit     # 提交报告（提交审核）
POST   /api/v1/reports/:id/review     # 审核报告
POST   /api/v1/reports/:id/sign       # 签发报告（电子签名）
POST   /api/v1/reports/:id/reject     # 驳回报告
POST   /api/v1/reports/:id/revise     # 修订报告
GET    /api/v1/reports/:id/print      # 获取打印数据
POST   /api/v1/reports/:id/critical   # 标记危急值
```

### 5.5 患者接口

```
GET    /api/v1/patients                # 患者列表
GET    /api/v1/patients/:id            # 患者详情
GET    /api/v1/patients/:id/exams     # 患者检查历史
GET    /api/v1/patients/:id/reports   # 患者报告历史
POST   /api/v1/patients                # 创建患者
PUT    /api/v1/patients/:id            # 更新患者信息
GET    /api/v1/patients/search         # 患者搜索（模糊查询）
```

### 5.6 设备接口

```
GET    /api/v1/devices                 # 设备列表
GET    /api/v1/devices/:id             # 设备详情
PUT    /api/v1/devices/:id/status      # 更新设备状态
GET    /api/v1/devices/stats/today     # 今日设备使用统计
GET    /api/v1/devices/:id/utilization # 设备效率分析
GET    /api/v1/devices/schedule        # 设备预约排班
```

### 5.7 DICOM接口

```
GET    /api/v1/dicom/studies/:studyUid                  # 获取检查影像
GET    /api/v1/dicom/series/:seriesUid                  # 获取系列影像
GET    /api/v1/dicom/instances/:sopUid                 # 获取单张影像
GET    /api/v1/dicom/studies/:studyUid/thumbnail        # 获取缩略图
POST   /api/v1/dicom/upload                             # 上传DICOM文件
GET    /api/v1/dicom/viewer/:studyUid                   # 获取OHIF Viewer配置
DELETE /api/v1/dicom/studies/:studyUid                 # 删除影像
```

### 5.8 打印接口

```
GET    /api/v1/print/queue                   # 打印队列
POST   /api/v1/print/jobs                    # 创建打印任务
GET    /api/v1/print/jobs/:id                # 打印任务详情
PUT    /api/v1/print/jobs/:id/cancel         # 取消打印
POST   /api/v1/print/jobs/:id/retry          # 重试打印
GET    /api/v1/print/printers                # 可用打印机列表
POST   /api/v1/print/printers                # 添加打印机
```

### 5.9 统计接口

```
GET    /api/v1/stats/daily                   # 日报
GET    /api/v1/stats/weekly                  # 周报
GET    /api/v1/stats/monthly                 # 月报
GET    /api/v1/stats/yearly                  # 年报
GET    /api/v1/stats/workload                # 工作量统计
GET    /api/v1/stats/revenue                 # 收入统计
GET    /api/v1/stats/device-efficiency        # 设备效率
GET    /api/v1/stats/turnaround-time         # 完成时间统计
GET    /api/v1/stats/report-quality          # 报告质量统计
```

### 5.10 危急值接口

```
GET    /api/v1/critical                       # 危急值列表
GET    /api/v1/critical/:id                   # 危急值详情
POST   /api/v1/critical                       # 创建危急值记录
PUT    /api/v1/critical/:id/notify            # 记录通知
PUT    /api/v1/critical/:id/acknowledge       # 确认收到
PUT    /api/v1/critical/:id/resolve           # 处理完成
```

### 5.11 预约接口

```
GET    /api/v1/appointments                   # 预约列表
GET    /api/v1/appointments/:id              # 预约详情
POST   /api/v1/appointments                  # 创建预约
PUT    /api/v1/appointments/:id              # 修改预约
DELETE /api/v1/appointments/:id              # 取消预约
POST   /api/v1/appointments/:id/checkin      # 预约报到
GET    /api/v1/appointments/available-slots  # 可用时间段
```

### 5.12 区域协同接口

```
GET    /api/v1/regional                       # 协同请求列表
GET    /api/v1/regional/:id                   # 请求详情
POST   /api/v1/regional                       # 创建协同请求
PUT    /api/v1/regional/:id                   # 更新请求
POST   /api/v1/regional/:id/submit            # 提交请求
POST   /api/v1/regional/:id/review           # 审核请求
POST   /api/v1/regional/:id/complete         # 完成协同
GET    /api/v1/regional/hospitals            # 协作医院列表
```

### 5.13 响应格式规范

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },       // 或数组 [ ... ]
  "meta": {              // 分页信息（可选）
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入验证失败",
    "details": [
      { "field": "patientName", "message": "患者姓名不能为空" }
    ]
  }
}

// 错误码
VALIDATION_ERROR      // 输入验证错误
UNAUTHORIZED          // 未认证
FORBIDDEN             // 无权限
NOT_FOUND             // 资源不存在
CONFLICT              // 资源冲突
INTERNAL_ERROR        // 服务器内部错误
```

---

## 6. 服务器配置

### 6.1 服务器要求

| 环境 | 最低配置 | 推荐配置 |
|------|----------|----------|
| 开发/测试 | 2核4G | 4核8G |
| 生产（单机构） | 4核8G | 8核16G |
| 生产（区域协同） | 8核16G | 16核32G |
| 存储 | 100GB SSD | 500GB+ SSD |
| 数据库 | 50GB SSD | 200GB+ SSD |

**操作系统**：Ubuntu 22.04 LTS / CentOS 8 / Debian 12

### 6.2 基础环境配置

```bash
# === 1. 系统更新 ===
apt update && apt upgrade -y

# === 2. 安装基础软件 ===
apt install -y curl wget git unzip vim htop net-tools
apt install -y nginx certbot python3-certbot-nginx

# === 3. 安装Node.js 20 LTS ===
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # v20.x.x
npm --version   # 10.x.x

# === 4. 安装PostgreSQL 15 ===
apt install -y postgresql-15 postgresql-contrib-15

# 启动并设置开机启动
systemctl enable postgresql
systemctl start postgresql

# 配置PostgreSQL
sudo -u postgres psql << 'EOF'
-- 创建数据库
CREATE DATABASE g005_ris;
CREATE USER g005_admin WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE g005_ris TO g005_admin;

-- 连接数据库
\c g005_ris

-- 授权
GRANT ALL ON SCHEMA public TO g005_admin;

-- 退出
\q
EOF

# === 5. 安装Redis ===
apt install -y redis-server
systemctl enable redis-server
systemctl start redis

# 配置Redis
redis-cli ping  # 应返回 PONG

# === 6. 安装Docker和Docker Compose ===
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
docker --version

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 6.3 后端服务配置

```bash
# 创建项目目录
mkdir -p /www/g005-backend
cd /www/g005-backend

# 创建环境变量文件
cat > .env << 'EOF'
# 数据库
DATABASE_URL="postgresql://g005_admin:YourSecurePassword123!@localhost:5432/g005_ris?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_EXPIRES_IN="7d"

# 服务端口
PORT=3001
NODE_ENV=production

# 文件上传
UPLOAD_DIR="/www/g005-backend/uploads"
MAX_FILE_SIZE=500MB

# DICOM存储
DICOM_STORAGE="/www/g005-dicom"

# 邮件服务（发送危急值通知）
SMTP_HOST="smtp.163.com"
SMTP_PORT=465
SMTP_USER="kmlz2026@163.com"
SMTP_PASS="your-authorization-code"
SMTP_FROM="放射科信息系统 <kmlz2026@163.com>"

# CORS白名单
CORS_ORIGINS="https://g005.hospital.com,https://g005-test.hospital.com"

# 日志级别
LOG_LEVEL="info"
EOF

# 创建上传目录
mkdir -p uploads logs uploads/dicom uploads/thumbnails
chmod 755 uploads uploads/dicom uploads/thumbnails logs
```

### 6.4 PM2进程管理配置

```bash
# 安装PM2
npm install -g pm2

# 创建PM2配置文件 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'g005-api',
      script: 'dist/index.js',
      cwd: '/www/g005-backend',
      instances: 2,           // 生产环境2个实例
      exec_mode: 'cluster',   // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // 资源限制
      max_memory_restart: '1G',
      // 日志
      log_file: '/www/g005-backend/logs/combined.log',
      out_file: '/www/g005-backend/logs/out.log',
      error_file: '/www/g005-backend/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // 自动重启
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // 零秒停机部署
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    },
    // WebSocket服务（可选，独立进程）
    {
      name: 'g005-socket',
      script: 'dist/sockets/index.js',
      cwd: '/www/g005-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        SOCKET_PORT: 3002
      }
    }
  ]
};
EOF

# 启动服务
pm2 start ecosystem.config.js --env production

# 设置开机启动
pm2 startup
pm2 save

# 常用PM2命令
pm2 status                    # 查看状态
pm2 logs g005-api --lines 50 # 查看日志
pm2 restart g005-api          # 重启
pm2 reload g005-api           # 零停机重载
pm2 stop g005-api             # 停止
pm2 monit                     # 监控面板
```

### 6.5 Nginx反向代理配置

```bash
# 创建Nginx配置文件
cat > /etc/nginx/sites-available/g005 << 'EOF'
# 前端静态资源
upstream g005_frontend {
    server 127.0.0.1:5191;
}

# 后端API
upstream g005_api {
    server 127.0.0.1:3001;
}

# WebSocket
upstream g005_socket {
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name g005.hospital.com;

    # 强制HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name g005.hospital.com;

    # SSL证书（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/g005.hospital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/g005.hospital.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/g005.hospital.com/chain.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 前端静态资源
    location / {
        proxy_pass http://g005_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://g005_frontend;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # API请求
    location /api/ {
        proxy_pass http://g005_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 请求超时
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Body大小限制
        client_max_body_size 500M;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://g005_socket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache off;
    }

    # DICOM文件访问
    location /dicom/ {
        alias /www/g005-dicom/;
        autoindex off;
        
        # 认证头转发
        proxy_set_header X-User-Id $http_x_user_id;
        proxy_set_header X-User-Role $http_x_user_role;
        
        # 大文件下载优化
        tcp_nodelay off;
        gzip off;
    }

    # 健康检查
    location /health {
        proxy_pass http://g005_api;
        access_log off;
    }

    # 日志
    access_log /var/log/nginx/g005_access.log;
    error_log /var/log/nginx/g005_error.log;
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/g005 /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl reload nginx
```

### 6.6 Docker Compose一键部署（可选）

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: g005-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: g005_ris
      POSTGRES_USER: g005_admin
      POSTGRES_PASSWORD: YourSecurePassword123!
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U g005_admin -d g005_ris"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: g005-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass RedisPassword123!
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "RedisPassword123!", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: g005-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://g005_admin:YourSecurePassword123!@postgres:5432/g005_ris
      REDIS_URL: redis://:RedisPassword123!@redis:6379
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: g005-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./dist:/usr/share/nginx/html:ro
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

---

## 7. DICOM服务集成

### 7.1 DICOM服务概述

DICOM（Digital Imaging and Communications in Medicine）是医学影像的标准格式和传输协议。一个完整的RIS系统需要与PACS（Picture Archiving and Communication System）集成。

### 7.2 部署Orthanc DICOM服务器

```bash
# 使用Docker部署Orthanc（推荐）
cat > docker-compose.orthanc.yml << 'EOF'
version: '3.8'

services:
  orthanc:
    image: jodogne/orthanc-plugins:24.3.1
    container_name: g005-orthanc
    restart: unless-stopped
    ports:
      - "4242:4242"   # DICOM协议端口
      - "8042:8042"   # Web管理界面
    volumes:
      - orthanc_db:/var/lib/orthanc/db
      - ./orthanc_config.json:/etc/orthanc.json:ro
      - ./orthanc_storage:/storage
    environment:
      - ORTHANC_NAME=G005-PACS
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--spider", "http://localhost:8042/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  orthanc_db:
EOF

# Orthanc配置文件
cat > orthanc_config.json << 'EOF'
{
  "Name": "G005-PACS",
  "RemoteAccessAllowed": true,
  "SslEnabled": false,
  "AuthenticationEnabled": true,
  "RegisteredUsers": {
    "admin": "orthanc_password"
  },
  
  "DicomPort": 4242,
  "WebServicePort": 8042,
  
  "StorageRoot": "/storage",
  "IndexStorageSize": 256,
  
  "MaximumStorageSize": 500000,
  "MaximumPatientCount": 10000,
  
  "OsimisResourcesEnabled": true,
  "ServeAet": true,
  "ThisAET": "G005_PACS",
  "AllowedAET": ["G005_RIS", "MODALITY_CT", "MODALITY_MR"],
  
  "TransferSyntaxAllowed": [
    "1.2.840.10008.1.2",      # Implicit VR Little Endian
    "1.2.840.10008.1.2.1",    # Explicit VR Little Endian
    "1.2.840.10008.1.2.4.50", # JPEG Baseline (Process 1)
    "1.2.840.10008.1.2.4.70"  # JPEG Lossless
  ],
  
  "MediaArchive": {
    "Enabled": true,
    "StoragePath": "/storage/archive",
    "IndexPath": "/var/lib/orthanc/db/media"
  },
  
  "PostgreSQL": {
    "EnableDatabase": false,
    "Host": "localhost",
    "Port": 5432,
    "Database": "orthanc",
    "Username": "orthanc",
    "Password": "orthanc_password"
  },
  
  "LuaScripts": [],
  
  "UserMetadata": {
    "0": "WindowCenter"
  },
  
  "UserTags": {
    "0": "Institution"
  }
}
EOF

docker-compose -f docker-compose.orthanc.yml up -d
```

### 7.3 DICOM网络配置（工作列表MWL）

放射科设备（CT/MR）需要从RIS获取工作列表（Modality Worklist），需要配置MWL SCP：

```bash
# 在Orthanc配置中添加MWL插件
# 编辑 orthanc_config.json，添加：
{
  "WorklistDatabaseEnabled": true,
  "WorklistName": "G005-RIS-MWL"
}

# 或者使用DCM4CHEE进行MWL管理
# DCM4CHEE是一个更完整的DICOM服务器，支持完整的MWL功能
```

### 7.4 DICOM Viewer集成（OHIF）

OHIF Viewer是一个开源的DICOM查看器，可以集成到React前端：

```bash
# 安装OHIF
npm install @ohif/viewer

# 在DicomViewerPage.tsx中使用
import { Viewer } from '@ohif/viewer';

const DicomViewerPage = ({ studyUid }) => {
  const config = {
    servers: {
      dicomWeb: [
        {
          name: 'G005-PACS',
          wadoUriRoot: 'https://pacs.hospital.com/dicom-web',
          qidoRoot: 'https://pacs.hospital.com/dicom-web',
          wadoRoot: 'https://pacs.hospital.com/dicom-web',
          qidoSupportsIncludeField: true,
          imageRendering: 'wadors',
          thumbnailRendering: 'wadors'
        }
      ]
    }
  };

  return (
    <Viewer
      config={config}
      studyInstanceUID={studyUid}
    />
  );
};
```

---

## 8. 所有功能模块详解

### 8.1 首页概览（HomePage）

**功能描述**：展示今日工作核心指标和实时状态

**数据来源（当前/需改造）**：
```typescript
// 当前：静态数据
const todayStats = {
  totalExams: 247,
  pendingReports: 97,
  completedReports: 150,
  criticalValues: 10
};

// 生产：API调用
const response = await fetch('/api/v1/worklist/stats/today');
const data = await response.json();
// { totalExams: 247, pendingReports: 97, ... }
```

**展示内容**：
- 今日检查量概览（总检查数、待报告数、已完成数）
- 危急值待处理数量
- 设备使用率（4/9台使用中）
- 今日收入统计
- 检查量实时趋势图（ECharts折线图）
- 本周检查量统计（柱状图）
- 设备状态监控卡片
- 待处理检查列表（急诊优先）

### 8.2 检查工作列表（WorklistPage）

**功能描述**：显示所有检查条目，支持筛选、搜索、状态更新

**当前实现**：静态模拟数据
```typescript
const mockWorklist = [
  {
    id: 'EX001',
    patientName: '黄丽',
    patientId: 'P001',
    modality: 'DR',
    examType: '骨盆平片',
    priority: 'EMERGENCY',
    status: '待检查',
    device: 'DR-1',
    scheduledTime: '17:20',
    requestingDept: '急诊科'
  },
  // ...
];
```

**生产功能**：
- 实时从API获取工作列表
- WebSocket推送实时更新（新检查、状态变更）
- 支持按设备/状态/日期/患者筛选
- 一键扫码报到
- 批量操作（批量分配设备、批量打印）
- 检查详情弹窗（患者信息、临床诊断、历史检查）

### 8.3 报告书写（ReportWritePage）

**功能描述**：医生书写影像报告的核心功能

**当前实现**：纯前端表单
```typescript
// 当前
const [report, setReport] = useState({
  findings: '',
  diagnosis: '',
  impression: ''
});
```

**生产功能**：
- 报告模板选择（从词库/模板库加载）
- AI辅助诊断（调用后端AI推理接口）
- 典型病例参考（调用历史病例库）
- 危急值一键标记（自动通知临床）
- 图像标注（在DICOM图像上标注病灶）
- 多媒体报告（嵌入超声视频、动态图像）
- 报告时限提醒（30分钟未写报告提醒）
- 电子签名（数字证书签名）
- 修订记录（所有修改有审计追踪）

### 8.4 DICOM影像浏览（DicomViewerPage）

**功能描述**：查看医学影像（DICOM格式）

**当前实现**：cornerstone.js基础加载器
```typescript
// DicomManager.ts
export class DicomManager {
  static async loadImage(file: File) {
    const imageId = cornerstoneWADOImageLoader.fileManager.add(file);
    const image = await cornerstone.loadImage(imageId);
    return image;
  }
}
```

**生产功能**：
- 从PACS服务器（WADO-RS协议）获取影像
- 窗宽窗位调整（CT/MR专有）
- 缩放、旋转、翻转
- 长度/角度测量
- 病灶标注
- 多平面重建（MPR）
- 最大密度投影（MIP）
- 体绘制（VR）- 3D视图
- 胶片打印布局

### 8.5 AI辅助诊断（AIAssistPage）

**功能描述**：AI模型辅助影像诊断

**AI功能清单**：
- **肺结节检测**：基于深度学习自动检测肺部结节，计算Lung-RADS分级
- **乳腺钼靶分析**：乳腺癌筛查，PI-RADS分级
- **骨折检测**：X线骨折自动检测
- **脑出血检测**：CT脑出血快速识别
- **糖尿病视网膜病变筛查**：眼底图像分析
- **骨龄评估**：儿童手腕X片骨龄评估

**后端AI服务架构**：
```
前端 --POST--> /api/v1/ai/detect-lung-nodules
                |
                v
         API Gateway
                |
                v
         AI Inference Server (GPU服务器)
                |
                v
         PyTorch/TensorFlow模型
         - 输入：DICOM图像
         - 输出：结节位置、大小、良恶性概率、Lung-RADS分级
```

### 8.6 设备效率分析（DevicePage）

**功能描述**：监控设备使用状态和效率指标

**指标定义**：
```typescript
interface DeviceStats {
  deviceCode: string;      // CT-1
  deviceName: string;       // 64排CT
  modality: 'CT';
  status: 'IN_USE' | 'IDLE' | 'MAINTENANCE';
  currentPatient?: string;
  todayExams: number;       // 今日检查数
  totalTime: number;        // 总运行时长（分钟）
  idleTime: number;         // 空闲时长
  utilizationRate: number; // 利用率 = (总时间-空闲)/总时间
  avgTurnaround: number;    // 平均周转时间（分钟）
}
```

**生产数据来源**：
- 设备接口：获取设备运行状态（DICOM MPPS协议）
- 检查记录：统计每台设备的检查数量
- 时间戳：检查开始/结束时间计算运行时长

### 8.7 危急值管理（CriticalValuePage）

**功能描述**：放射科发现危急值后通知临床科室

**危急值标准**：
- 气胸（大量）
- 肺栓塞
- 主动脉夹层
- 脑出血（急性）
- 张力性气胸
- 消化道穿孔
- 骨折（开放性、股骨等）
- 其他危及生命的发现

**通知流程**：
```
发现危急值
    ↓
系统自动/医生手动创建危急值记录
    ↓
发送通知（电话→短信→系统通知）
    ↓
临床医生确认收到
    ↓
记录确认时间和确认人
    ↓
危急值处理完毕
```

**生产实现**：
```typescript
// POST /api/v1/critical
{
  examId: 'EX001',
  finding: '左侧大量气胸，左肺压缩约80%',
  urgencyLevel: 'IMMEDIATE',
  notifyMethods: ['PHONE', 'SMS', 'SYSTEM'],
  contactDept: '急诊科',
  contactDoctor: '王医生'
}
```

### 8.8 检查预约（AppointmentPage）

**功能描述**：患者预约检查时间段

**生产功能**：
- 预约日历（按设备展示可用时间段）
- 自动冲突检测
- 预约提醒（短信/微信）
- 预约报到（扫码签到）
- 预约取消/改期
- 等候名单管理

### 8.9 排队叫号（QueueCallPage）

**功能描述**：检查室叫号系统

**生产功能**：
- 大屏幕显示叫号信息
- 语音播报（集成TTS）
- 医生操作终端（叫号、跳过、重呼）
- 患者手机端查询（当前排队号、预计等待时间）
- 预约优先通道

### 8.10 区域影像协同（RegionalImagingPage）

**功能描述**：与其他医疗机构共享影像和报告

**场景**：
- 基层医院拍片 → 上级医院读片
- 患者转诊 → 影像资料跟随
- 医联体远程会诊

**数据交换标准**：
- DICOM WADO-RS（影像）
- DICOM QIDO（查询）
- HL7 FHIR（患者/报告信息）
- IHE XDS（文档共享）

**API设计**：
```typescript
// 创建区域协同请求
POST /api/v1/regional
{
  sourceHospital: '东华区第一医院',
  patientName: '张三',
  modality: 'CT',
  examType: '胸部CT平扫',
  clinicalInfo: '咳嗽待查',
  attachedDicomStudies: ['study-uid-1', 'study-uid-2'],
  targetHospital: '国家医学中心',  // 可选
  priority: 'URGENT'
}
```

### 8.11 统计分析（StatisticsPage）

**统计维度**：
- **工作量统计**：检查数量、报告数量、人均工作量
- **收入统计**：按设备、按检查类型、按月/季度/年
- **设备效率**：利用率、周转时间、停机时间
- **报告质量**：报告及时率、修改率、合格率
- **危急值统计**：发生率、通知及时率
- **患者满意度**：来自评价系统的数据

**图表类型**：
- 折线图：趋势分析
- 柱状图：对比分析
- 饼图：构成比
- 热力图：时段分布
- 仪表盘：目标达成率

### 8.12 其他管理功能

| 模块 | 功能描述 |
|------|----------|
| **权限管理** | 用户角色配置、权限分配 |
| **模板管理** | 报告模板、申请模板维护 |
| **词库管理** | 报告常用词、标准术语 |
| **典型病例库** | 典型病例学习库 |
| **典型征象库** | 影像征象图谱 |
| **操作日志** | 记录所有操作行为（审计） |
| **系统配置** | 系统参数配置 |
| **耗材管理** | 胶片/造影剂等耗材库存 |
| **DICOM打印** | 胶片打印服务器管理 |

---

## 9. 部署指南

### 9.1 完整部署流程

```bash
# === 阶段1：服务器准备 ===
# 参照第6章完成基础环境配置

# === 阶段2：后端部署 ===
cd /www/g005-backend

# 克隆代码（如果使用Git）
# git clone https://your-git-server/g005-backend.git
# cd g005-backend

# 安装依赖
npm install

# 初始化Prisma
npx prisma generate
npx prisma db push    # 同步数据库结构
npx prisma db seed    # 种子数据

# 构建
npm run build

# 使用PM2启动
pm2 start ecosystem.config.js --env production

# 验证API
curl http://localhost:3001/api/v1/health

# === 阶段3：前端部署 ===
cd /home/admin/hermes-agent/web/G005

# 修改API地址（重要！）
# 编辑 src/config/api.ts
export const API_BASE_URL = 'https://g005.hospital.com/api/v1';

# 构建
npm run build

# 部署到Nginx目录
cp -r dist/* /var/www/g005/

# === 阶段4：配置Nginx SSL ===
certbot --nginx -d g005.hospital.com

# === 阶段5：配置防火墙 ===
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# === 阶段6：验证 ===
# 1. 访问前端
curl -I https://g005.hospital.com

# 2. 访问API
curl https://g005.hospital.com/api/v1/health

# 3. 浏览器测试
# 打开 https://g005.hospital.com
```

### 9.2 数据库种子数据

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 创建超级管理员
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: '$2a$10$...', // bcrypt hash of 'admin123'
      realName: '系统管理员',
      role: 'ADMIN',
      department: '放射科'
    }
  });

  // 创建测试医生
  const doctor = await prisma.user.upsert({
    where: { username: 'liminghui' },
    update: {},
    create: {
      username: 'liminghui',
      password: '$2a$10$...', // bcrypt hash of 'password123'
      realName: '李明辉',
      role: 'DIRECTOR',
      department: '放射科',
      title: '主任医师'
    }
  });

  // 创建设备
  await prisma.device.createMany({
    data: [
      { deviceCode: 'CT-1', deviceName: '64排CT', modality: 'CT', manufacturer: 'GE', location: 'CT室1', status: 'IDLE' },
      { deviceCode: 'CT-2', deviceName: '128排CT', modality: 'CT', manufacturer: 'Siemens', location: 'CT室2', status: 'IN_USE' },
      { deviceCode: 'MR-1', deviceName: '3.0T MRI', modality: 'MR', manufacturer: 'Siemens', location: 'MR室1', status: 'IN_USE' },
      { deviceCode: 'MR-2', deviceName: '1.5T MRI', modality: 'MR', manufacturer: 'Philips', location: 'MR室2', status: 'MAINTENANCE' },
      { deviceCode: 'DR-1', deviceName: 'DR系统', modality: 'DR', manufacturer: 'Philips', location: 'DR室1', status: 'IN_USE' },
      { deviceCode: 'DR-2', deviceName: 'DR系统', modality: 'DR', manufacturer: 'GE', location: 'DR室2', status: 'IDLE' },
      { deviceCode: 'DSA-1', deviceName: 'DSA', modality: 'DSA', manufacturer: 'Philips', location: 'DSA室1', status: 'IN_USE' },
      { deviceCode: 'MG-1', deviceName: '乳腺钼靶', modality: 'MG', manufacturer: 'GE', location: '钼靶室1', status: 'IDLE' },
      { deviceCode: 'RF-1', deviceName: '胃肠造影', modality: 'RF', manufacturer: 'Shimadzu', location: '造影室1', status: 'IDLE' }
    ]
  });

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 10. 系统运维

### 10.1 日常运维

```bash
# === 服务状态检查 ===
pm2 status                    # API服务状态
systemctl status nginx        # Nginx状态
systemctl status postgresql  # 数据库状态
systemctl status redis       # Redis状态
docker ps                     # Docker容器

# === 日志查看 ===
pm2 logs g005-api --lines 100    # API日志
tail -100 /var/log/nginx/g005_access.log  # 访问日志
journalctl -u postgresql -n 50   # 数据库日志

# === 数据库备份 ===
pg_dump -U g005_admin g005_ris > /backup/g005_$(date +%Y%m%d).sql

# === Redis备份 ===
redis-cli -a RedisPassword123! SAVE

# === 定时备份脚本 ===
# crontab -e
0 2 * * * /scripts/backup.sh  # 每天凌晨2点备份
0 */6 * * * /scripts/healthcheck.sh  # 每6小时健康检查
```

### 10.2 监控告警

```bash
# === 安装监控工具 ===
npm install -g pm2-pm2
pm2 install pm2-server-monit

# === PM2 Plus云监控（免费额度） ===
pm2 link <key> <id>  # 注册监控

# === 健康检查脚本 ===
cat > /scripts/healthcheck.sh << 'EOF'
#!/bin/bash
# 检查所有服务
services=("nginx" "postgresql" "redis" "pm2-g005-api")

for service in "${services[@]}"; do
  if ! systemctl is-active --quiet "$service"; then
    echo "ALERT: $service is down!" | mail -s "G005 Alert" admin@hospital.com
  fi
done

# 检查API响应时间
response=$(curl -o /dev/null -s -w '%{http_code}' https://g005.hospital.com/api/v1/health)
if [ "$response" != "200" ]; then
  echo "ALERT: API is not responding properly!" | mail -s "G005 Alert" admin@hospital.com
fi
EOF
```

### 10.3 灾难恢复

```bash
# === 数据库恢复 ===
pg_restore -U g005_admin -d g005_ris /backup/g005_20260504.sql

# === 完全重建服务 ===
cd /www/g005-backend
pm2 stop all
git pull
npm install
npm run build
npx prisma db push
pm2 restart all

# 或者使用Docker
cd /www/g005-backend
docker-compose down
docker-compose pull
docker-compose up -d
```

---

## 11. 开发路线图

### Phase 1：基础后端（1-2周）
- [x] 数据库设计与初始化
- [x] 用户认证（JWT）
- [x] 工作列表CRUD
- [x] 报告CRUD
- [x] 患者管理
- [ ] WebSocket实时推送

### Phase 2：DICOM集成（2-3周）
- [ ] Orthanc部署
- [ ] DICOM存储与检索
- [ ] OHIF Viewer集成
- [ ] 窗宽窗位/MIP/VR
- [ ] DICOM打印

### Phase 3：AI能力（2-3周）
- [ ] AI服务架构设计
- [ ] 肺结节检测模型
- [ ] Lung-RADS自动分级
- [ ] 乳腺钼靶AI分析
- [ ] AI结果展示

### Phase 4：区域协同（1-2周）
- [ ] 区域协同API
- [ ] FHIR/HL7接口
- [ ] 跨机构影像共享
- [ ] 会诊流程

### Phase 5：高级功能（持续）
- [ ] 移动端App
- [ ] 微信患者端
- [ ] 语音录入报告
- [ ] 区块链电子签名
- [ ] 大数据分析

---

## 附录

### A. 快速检查清单

```
□ PostgreSQL运行正常
□ Redis运行正常
□ Nginx反向代理配置正确
□ SSL证书已配置
□ 后端API可访问
□ 前端静态资源加载正常
□ 数据库结构同步完成
□ 用户认证功能正常
□ 工作列表数据正常显示
□ DICOM服务配置完成
□ 打印服务配置完成
□ 监控告警配置完成
```

### B. 常见问题排查

```
1. API返回500错误
   - 检查数据库连接
   - 查看API日志: pm2 logs g005-api

2. 前端无法连接API
   - 检查Nginx代理配置
   - 检查CORS配置
   - 检查API服务是否运行

3. DICOM影像加载失败
   - 检查Orthanc服务
   - 检查WADO-RS地址
   - 检查网络连通性

4. 打印任务失败
   - 检查打印机服务
   - 检查DICOM Print SCP
   - 查看打印队列状态
```

### C. 技术支持

- 系统管理员：请联系 IT 部门
- 紧急故障：186-XXXX-XXXX
- 邮件支持：support@hospital.com

---

**文档编写**：Hermes Agent
**最后更新**：2026-05-04
**版本**：v1.0
