export { generateKylinDeployScript, validateKylinOS } from './kylin'
export type { KylinOSConfig } from './kylin'
export { generateUOSDeployScript, validateUOS } from './uos'
export type { UOSConfig } from './uos'

export type DomesticOS = 'kylin-v10' | 'uos-v20'

export interface DomesticOSHealth {
  os: DomesticOS
  version: string
  arch: string
  selinux: 'enforcing' | 'permissive' | 'disabled'
  dockerRunning: boolean
  kernelTuned: boolean
}
