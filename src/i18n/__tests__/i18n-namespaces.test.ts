/**
 * G005 放射RIS系统 v3.0.2.1 - i18n 命名空间完整性验证
 * 遍历 NAMESPACES 数组,确保每个 ns 在 zh_CN.json 和 en_US.json 都有对应 object
 * 防止新加 ns 漏 key
 */
import { describe, it, expect } from 'vitest'
import { NAMESPACES } from '../index'
import zhCN from '../locales/zh_CN.json'
import enUS from '../locales/en_US.json'

describe('i18n 命名空间完整性 (v3.0.2.1)', () => {
  it('zh_CN.json 包含所有命名空间', () => {
    for (const ns of NAMESPACES) {
      expect(zhCN, `zh_CN.json 缺少命名空间: ${ns}`).toHaveProperty(ns)
      expect(typeof (zhCN as Record<string, unknown>)[ns]).toBe('object')
    }
  })

  it('en_US.json 包含所有命名空间', () => {
    for (const ns of NAMESPACES) {
      expect(enUS, `en_US.json 缺少命名空间: ${ns}`).toHaveProperty(ns)
      expect(typeof (enUS as Record<string, unknown>)[ns]).toBe('object')
    }
  })

  it('zh_CN / en_US 命名空间数量一致', () => {
    const zhNs = Object.keys(zhCN)
    const enNs = Object.keys(enUS)
    expect(zhNs.length).toBe(enNs.length)
    expect(zhNs.sort().join(',')).toBe(enNs.sort().join(','))
  })

  it('命名空间数量 >= 50(防回归)', () => {
    expect(NAMESPACES.length).toBeGreaterThanOrEqual(50)
  })

  it('每个命名空间至少有 1 个 key', () => {
    for (const ns of NAMESPACES) {
      const obj = (zhCN as Record<string, Record<string, unknown>>)[ns]
      if (obj && typeof obj === 'object') {
        expect(Object.keys(obj).length, `${ns} 应至少有 1 个 key`).toBeGreaterThan(0)
      }
    }
  })
})
