import type { DamengAdapter, DomesticDbVendor } from './dameng'

export type { DomesticDbVendor } from './dameng'

export interface DomesticDbInstance {
  vendor: DomesticDbVendor
  adapter: DamengAdapter
  config: Record<string, any>
}

const instances: Map<DomesticDbVendor, DomesticDbInstance> = new Map()

export function registerDomesticDb(vendor: DomesticDbVendor, adapter: DamengAdapter, config: Record<string, any>): void {
  instances.set(vendor, { vendor, adapter, config })
}

export function getDomesticDb(vendor: DomesticDbVendor): DomesticDbInstance | undefined {
  return instances.get(vendor)
}

export function getAllDomesticDbs(): DomesticDbInstance[] {
  return Array.from(instances.values())
}

export async function domesticDbHealthCheck(): Promise<Record<DomesticDbVendor, { alive: boolean; latencyMs: number }>> {
  const results: Record<string, any> = {}
  for (const [vendor, instance] of instances) {
    results[vendor] = await instance.adapter.healthCheck()
  }
  return results as Record<DomesticDbVendor, { alive: boolean; latencyMs: number }>
}

export function getDomesticDbDialect(vendor: DomesticDbVendor): Record<string, string> {
  const dialects: Record<DomesticDbVendor, Record<string, string>> = {
    dameng: { limit: 'LIMIT', offset: 'OFFSET', ilike: 'LIKE', now: 'CURRENT_TIMESTAMP', uuid: 'RAWTOHEX(SYS_GUID())' },
    kingbase: { limit: 'LIMIT', offset: 'OFFSET', ilike: 'ILIKE', now: 'CURRENT_TIMESTAMP', uuid: 'GEN_RANDOM_UUID()' },
    gbase: { limit: 'LIMIT', offset: 'OFFSET', ilike: 'LIKE', now: 'CURRENT_TIMESTAMP', uuid: 'UUID()' },
  }
  return dialects[vendor] ?? {}
}

export function translateToDomesticSql(sql: string, vendor: DomesticDbVendor): string {
  const dialect = getDomesticDbDialect(vendor)
  let result = sql
  result = result.replace(/\bNOW\b/gi, dialect.now)
  result = result.replace(/\bGEN_RANDOM_UUID\b/gi, dialect.uuid)
  return result
}
