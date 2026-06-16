export interface DamengConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  schema: string
  poolMin: number
  poolMax: number
  connectTimeout: number
}

export type DomesticDbVendor = 'dameng' | 'kingbase' | 'gbase'

export interface DamengAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number }>
  healthCheck(): Promise<{ alive: boolean; latencyMs: number }>
}

export function createDamengAdapter(config: DamengConfig): DamengAdapter {
  const adapter: DamengAdapter = {
    async connect() { },
    async disconnect() { },
    async query(_sql, _params?) { return [] },
    async execute(_sql, _params?) { return { affectedRows: 0 } },
    async healthCheck() { return { alive: true, latencyMs: 0 } },
  }
  return adapter
}

export const DAMENG_DEFAULT_PORT = 5236
export const DAMENG_DIALECT: Record<string, string> = {
  limit: 'LIMIT',
  offset: 'OFFSET',
  ilike: 'LIKE',
  now: 'CURRENT_TIMESTAMP',
  uuid: 'RAWTOHEX(SYS_GUID())',
}
