// 用 node 替换 v3.0.6.8-32 -> v3.0.6.8-33
const fs = require('fs');
const path = 'E:/opencode work/FS/G005-RISv-3.0.0/src/i18n/appI18n.ts';
let c = fs.readFileSync(path, 'utf8');
const before = c;
c = c.replace(/v3\.0\.6\.8-32/g, 'v3.0.6.8-33');
// 替换版本说明
c = c.replace(
  'v3.0.6.8-33 · 后端增强 — 5 阶段: 数据层基础 + 主数据池接入 (1720 实体) + 业务逻辑层 (状态机/SLA/双签) + API client DTO 同步 + 高级特性端点 (8 个) + 文档测试 (API.md 18/18)',
  'v3.0.6.8-33 · 眼科专科增强 — 8 Module + 178 端点 + 28 集合 + 35 RBAC 资源点 (对标 Topcon Synergy + Medisoft mediSIGHT)'
);
c = c.replace(
  'v3.0.6.8-33 · Backend Enhancement — 5 phases: data layer + master data pool (1720 entities) + business logic (state machine/SLA/cosign) + API client DTO sync + 8 advanced endpoints + docs & tests (API.md 18/18)',
  'v3.0.6.8-33 · Eye Specialty Enhancement — 8 modules + 178 endpoints + 28 collections + 35 RBAC points (Topcon Synergy + Medisoft mediSIGHT benchmark)'
);
fs.writeFileSync(path, c, 'utf8');
console.log('Changes:', before === c ? 'NONE' : 'OK');
console.log('v3.0.6.8-32 remaining:', (c.match(/v3\.0\.6\.8-32/g) || []).length);
console.log('v3.0.6.8-33 count:', (c.match(/v3\.0\.6\.8-33/g) || []).length);
