# 11.3 Cybersecurity等级保护 (35 points)

## Directory: src/services/security/

### 等级保护 2.0 (MLPS 2.0) Compliance (20 pts)
1. 身份鉴别 (Identification) — password policy, MFA, biometric auth check
2. 访问控制 (Access Control) — RBAC / ABAC matrix validation
3. 安全审计 (Security Audit) — log integrity, audit trail completeness
4. 剩余信息保护 (Residual Info Protection) — memory/disk sanitization
5. 通信保密性 (Communication Confidentiality) — TLS 1.3, cipher check
6. 数据完整性 (Data Integrity) — hash chain, digital signature verification
7. 数据备份恢复 (Backup & Recovery) — RPO/RTO compliance check
8. 个人信息保护 (Personal Info Protection) — encryption at rest/PII inventory
9. 安全管理制度 (Security Mgmt System) — policy document validation
10. 应急响应 (Incident Response) — IR plan drill records

### Security Hardening (15 pts)
1. Security baseline scanner (centOS/KylinOS hardened benchmark)
2. Vulnerability patching tracker
3. Security configuration drift detection
4. Security incident log collector & alert
5. Secure software development lifecycle (SSDLC) checklist
