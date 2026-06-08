# G005 RIS Backend v3.0.1 - NestJS + Prisma

## 启动

```bash
cd backend
cp .env.example .env

# 安装依赖
pnpm install

# 生成 Prisma client
pnpm prisma:generate

# 启动数据库(PostgreSQL 15,可用 docker-compose)
docker compose up -d postgres

# 初始化 schema + 种子
pnpm prisma:migrate
pnpm prisma:seed

# 启动 dev server
pnpm start:dev
```

服务运行在 http://localhost:3001/api
Swagger 文档: http://localhost:3001/api/docs (集成 @nestjs/swagger)

## 模块

| 模块 | 路径 | 说明 |
|------|------|------|
| Auth | /api/auth | 登录 / 当前用户 / 修改密码(JWT) |
| Users | /api/users | 用户管理 |
| Reports | /api/reports | 报告 14 态 CRUD + 状态转移 |
| Health | /api/health | 健康检查 |

## 测试

```bash
pnpm test          # 单元
pnpm test:e2e      # 端到端(需 .env 中 DATABASE_URL)
```

## v3.0.0 → v3.0.1 变更

- ✅ 新增 `nestjs-pino` 依赖(修复 LoggerModule 启动失败)
- ✅ 新增 `ReportsModule`(修复 `./reports/reports.module` 缺失)
- ✅ 新增 `prisma/seed.ts` 种子脚本
- ✅ 新增 `prisma/migrations/0_init/migration.sql` 初始 SQL
- ✅ 新增 `test/jest-e2e.json` + `test/health.e2e-spec.ts`
- ✅ 新增 HealthController (`/api/health` liveness + readiness)
- ✅ 新增 UsersModule + UsersService + UsersController
