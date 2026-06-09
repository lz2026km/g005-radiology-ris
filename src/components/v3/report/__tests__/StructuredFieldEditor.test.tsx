/**
 * G005 放射RIS系统 v3.0.2 - StructuredFieldEditor 单测
 */
import { describe, it, expect } from 'vitest'
import { BI_RADS_SCHEMA } from '../StructuredFieldEditor'

describe('StructuredFieldEditor Schema', () => {
  it('BI_RADS_SCHEMA 包含 7+ 字段', () => {
    expect(BI_RADS_SCHEMA.fields.length).toBeGreaterThanOrEqual(7)
  })

  it('每字段必有 key + label + type', () => {
    for (const f of BI_RADS_SCHEMA.fields) {
      expect(f.key).toBeTruthy()
      expect(f.label).toBeTruthy()
      expect(f.type).toBeTruthy()
    }
  })

  it('RADS Schema 全部 5 类', async () => {
    const mod = await import('../StructuredFieldEditor')
    expect(mod.RAD_SCHEMAS['BI-RADS']).toBeDefined()
    expect(mod.RAD_SCHEMAS['LI-RADS']).toBeDefined()
    expect(mod.RAD_SCHEMAS['TI-RADS']).toBeDefined()
    expect(mod.RAD_SCHEMAS['PI-RADS']).toBeDefined()
    expect(mod.RAD_SCHEMAS['CAD-RADS']).toBeDefined()
  })
})
