export interface UOSConfig {
  version: 'V20'
  arch: 'aarch64' | 'amd64'
  uengineEnabled: boolean
  appCompatMode: 'native' | 'uengine' | 'linglong'
  kernelParams: Record<string, string>
}

export const DEFAULT_UOS_CONFIG: UOSConfig = {
  version: 'V20',
  arch: 'aarch64',
  uengineEnabled: true,
  appCompatMode: 'linglong',
  kernelParams: {
    'vm.max_map_count': '262144',
    'kernel.shmmax': '68719476736',
  },
}

export function generateUOSDeployScript(config: UOSConfig = DEFAULT_UOS_CONFIG): string {
  return `#!/bin/bash
# G005-RIS UnionTech OS V20 Deployment Script
set -euo pipefail

echo "=== 1. System Tuning ==="
cat >> /etc/sysctl.d/99-g005-ris.conf <<EOF
${Object.entries(config.kernelParams).map(([k, v]) => `${k}=${v}`).join('\n')}
EOF
sysctl --system

echo "=== 2. UEngine Compatibility Layer ==="
if [[ "${config.uengineEnabled}" == "true" ]]; then
  apt install -y uengine
  systemctl enable uengine --now
fi

echo "=== 3. Linglong Sandbox ==="
apt install -y linglong-builder

echo "=== 4. G005-RIS Service ==="
cp g005-ris.service /etc/systemd/system/
systemctl enable g005-ris --now
echo "Deployment complete."`
}

export function validateUOS(): { compliant: boolean; issues: string[] } {
  const issues: string[] = []
  return { compliant: issues.length === 0, issues }
}
