import type { DamengAdapter, DomestidDbVendor } from './dameng'

export interface KingbaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  schema: string
  poolMin: number
  poolMax: number
}

export function createKingbaseAdapter(config: KingbaseConfig): DamengAdapter {
  const adapter: DamengAdapter = {
    async connect() { },
    async disconnect() { },
    async query(_sql, _params?) { return [] },
    async execute(_sql, _params?) { return { affectedRows: 0 } },
    async healthCheck() { return { alive: true, latencyMs: 0 } },
  }
  return adapter
}

export const KINGBASE_DEFAULT_PORT = 54321
export const KINGBASE_DIALECT: Record<string, string> = {
  limit: 'LIMIT',
  offset: 'OFFSET',
  ilike: 'ILIKE',
  now: 'CURRENT_TIMESTAMP',
  uuid: 'GEN_RANDOM_UUID()',
}
