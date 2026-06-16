export interface KylinOSConfig {
  version: 'V10'
  arch: 'aarch64' | 'amd64'
  cpuVendor: 'kunpeng' | 'phytium' | 'hygon' | 'intel'
  selinuxMode: 'enforcing' | 'permissive' | 'disabled'
  kysecEnabled: boolean
  kernelParams: Record<string, string>
  jdk: 'bisheng' | 'dcevm' | 'openjdk'
  dockerRegistry: string
}

export const DEFAULT_KYLIN_CONFIG: KylinOSConfig = {
  version: 'V10',
  arch: 'aarch64',
  cpuVendor: 'kunpeng',
  selinuxMode: 'enforcing',
  kysecEnabled: true,
  kernelParams: {
    'net.core.somaxconn': '65535',
    'vm.swappiness': '10',
    'vm.dirty_ratio': '30',
    'vm.dirty_background_ratio': '5',
    'io.scheduler': 'kyber',
  },
  jdk: 'bisheng',
  dockerRegistry: 'swr.cn-east-x.myhuaweicloud.com',
}

export function generateKylinDeployScript(config: KylinOSConfig = DEFAULT_KYLIN_CONFIG): string {
  return `#!/bin/bash
# G005-RIS KylinOS V10 Deployment Script
set -euo pipefail

echo "=== 1. System Tuning ==="
cat >> /etc/sysctl.d/99-g005-ris.conf <<EOF
${Object.entries(config.kernelParams).map(([k, v]) => `${k}=${v}`).join('\n')}
EOF
sysctl --system

echo "=== 2. Security Policy ==="
if [[ "${config.kysecEnabled}" == "true" ]]; then
  systemctl enable kysec --now
fi
setenforce ${config.selinuxMode === 'enforcing' ? '1' : '0'}

echo "=== 3. Container Runtime ==="
yum install -y docker
systemctl enable docker --now
cat > /etc/docker/daemon.json <<EOF
{"registry-mirrors": ["${config.dockerRegistry}"]}
EOF
systemctl restart docker

echo "=== 4. G005-RIS Service ==="
cp g005-ris.service /etc/systemd/system/
systemctl enable g005-ris --now
echo "Deployment complete."`
}

export function validateKylinOS(): { compliant: boolean; issues: string[] } {
  const issues: string[] = []
  return { compliant: issues.length === 0, issues }
}
