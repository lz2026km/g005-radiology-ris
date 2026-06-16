# 11.1 Domestic Infrastructure (35 points)

## Directory: deploy/os/, server/db/

### deploy/os/ — Domestic OS Deployment (20 pts)
1. KylinOS V10 deployment script (ARM64)
2. UOS (UnionTech OS) deployment script
3. Domestic JDK (BiShengJDK / DCEVM) configuration
4. ARM64 Docker registry mirror (swr.cn-east-x)
5. Kunpeng / Phytium CPU optimization flags
6. Kylin Security (kysec) SELinux policy module
7. Systemd service unit for G005-RIS on KylinOS
8. UnionTech UEngine compatibility layer config
9. Domestic OS kernel parameter tuning (io, net, vm)
10. ARM64 cross-build CI workflow

### server/db/ — Domestic Database Support (15 pts)
1. DaMeng (DM8) adapter — connection pool, dialect, migration
2. KingbaseES (V8) adapter — connection pool, dialect, migration
3. GBase 8a adapter — connection pool, dialect, migration
4. Domestic DB health check endpoint
5. SQL snippet compatibility layer (LIMIT → ROWNUM, etc.)
6. Schema migration tool for domestic DBs
7. Domestic DB backup/restore scripts
8. Connection failover between domestic DBs
9. Domestic DB metrics collector
10. Hybrid DB routing (read-write separation)
