/**
 * G005 放射RIS系统 v3.0.1 - MeasurementStore 单元(算法 + 格式化)
 */
import { describe, it, expect } from 'vitest'
import {
  calcLength,
  calcAngle,
  calcArea,
  calcEllipseArea,
  calcPolygonArea,
  formatMeasurement,
  generateMeasurementId,
  type MeasurementType,
} from '../MeasurementStore'

describe('MeasurementStore algorithms', () => {
  it('calcLength: 2 点距离', () => {
    const d = calcLength([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ])
    expect(d).toBeCloseTo(5, 5)
  })

  it('calcLength: 多点累加', () => {
    const d = calcLength([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ])
    expect(d).toBeCloseTo(2, 5)
  })

  it('calcAngle: 直角 = 90°', () => {
    const a = calcAngle([
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ])
    expect(a).toBeCloseTo(90, 1)
  })

  it('calcAngle: 平角 = 180°', () => {
    const a = calcAngle([
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: -1, y: 0 },
    ])
    expect(a).toBeCloseTo(180, 1)
  })

  it('calcArea: 矩形', () => {
    const a = calcArea([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
      { x: 0, y: 3 },
    ])
    expect(a).toBe(12)
  })

  it('calcEllipseArea: π·rx·ry', () => {
    expect(calcEllipseArea(2, 3)).toBeCloseTo(Math.PI * 6, 5)
  })

  it('calcPolygonArea: 三角形', () => {
    const a = calcPolygonArea([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ])
    expect(a).toBe(6)
  })

  it('formatMeasurement 各类型', () => {
    const cases: [MeasurementType, number, RegExp][] = [
      ['length', 12.345, /^12\.3 mm$/],
      ['angle', 90, /^90\.0°$/],
      ['area', 100, /^100\.0 mm²$/],
      ['ellipse', 50, /^50\.0 mm²$/],
      ['polygon', 80, /^80\.0 mm²$/],
      ['ct', 42.7, /^43 HU$/],
    ]
    for (const [t, v, re] of cases) {
      expect(formatMeasurement(t, v)).toMatch(re)
    }
  })

  it('generateMeasurementId 唯一且含前缀', () => {
    const a = generateMeasurementId()
    const b = generateMeasurementId()
    expect(a).toMatch(/^m_/)
    expect(b).toMatch(/^m_/)
    expect(a).not.toBe(b)
  })

  it('边界: 1 点 / 0 点', () => {
    expect(calcLength([])).toBe(0)
    expect(calcLength([{ x: 0, y: 0 }])).toBe(0)
    expect(calcAngle([{ x: 0, y: 0 }])).toBe(0)
    expect(calcArea([])).toBe(0)
  })
})
