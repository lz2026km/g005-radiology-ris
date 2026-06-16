import type { DamengAdapter } from './dameng'

export interface GbaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  node: string
  poolMin: number
  poolMax: number
}

export function createGbaseAdapter(config: GbaseConfig): DamengAdapter {
  const adapter: DamengAdapter = {
    async connect() { },
    async disconnect() { },
    async query(_sql, _params?) { return [] },
    async execute(_sql, _params?) { return { affectedRows: 0 } },
    async healthCheck() { return { alive: true, latencyMs: 0 } },
  }
  return adapter
}

export const GBASE_DEFAULT_PORT = 5258
export const GBASE_DIALECT: Record<string, string> = {
  limit: 'LIMIT',
  offset: 'OFFSET',
  ilike: 'LIKE',
  now: 'CURRENT_TIMESTAMP',
  uuid: 'UUID()',
}
