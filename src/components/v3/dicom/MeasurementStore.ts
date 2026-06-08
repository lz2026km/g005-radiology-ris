/**
 * G005 放射RIS系统 v3.0.1 - 测量持久化存储
 * 对标 GE / 飞利浦 / 联影 — 持久化到 Dexie
 */
import Dexie, { type Table } from 'dexie'

export type MeasurementType = 'length' | 'angle' | 'area' | 'ct' | 'ellipse' | 'polygon'

export interface MeasurementRecord {
  id: string
  studyId: string
  seriesId: string
  instanceNumber: number
  type: MeasurementType
  label?: string
  value: number
  unit: string
  points: { x: number; y: number }[]
  color: string
  userId: string
  createdAt: number
  updatedAt: number
}

class MeasurementDB extends Dexie {
  measurements!: Table<MeasurementRecord, string>

  constructor() {
    super('G005_Measurements_v301')
    this.version(1).stores({
      measurements: 'id, studyId, seriesId, type, userId, createdAt',
    })
  }
}

let _db: MeasurementDB | null = null

const getDB = (): MeasurementDB => {
  if (!_db) _db = new MeasurementDB()
  return _db
}

export const generateMeasurementId = (): string =>
  `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const saveMeasurement = async (record: Omit<MeasurementRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeasurementRecord> => {
  const now = Date.now()
  const full: MeasurementRecord = {
    ...record,
    id: generateMeasurementId(),
    createdAt: now,
    updatedAt: now,
  }
  await getDB().measurements.add(full)
  return full
}

export const listMeasurementsByStudy = async (studyId: string): Promise<MeasurementRecord[]> => {
  return getDB().measurements.where('studyId').equals(studyId).reverse().sortBy('createdAt')
}

export const listMeasurementsBySeries = async (seriesId: string): Promise<MeasurementRecord[]> => {
  return getDB().measurements.where('seriesId').equals(seriesId).reverse().sortBy('createdAt')
}

export const deleteMeasurement = async (id: string): Promise<void> => {
  await getDB().measurements.delete(id)
}

export const clearStudyMeasurements = async (studyId: string): Promise<number> => {
  return getDB().measurements.where('studyId').equals(studyId).delete()
}

export const exportMeasurementsToJSON = async (studyId: string): Promise<string> => {
  const records = await listMeasurementsByStudy(studyId)
  return JSON.stringify(
    {
      v: 1,
      studyId,
      exportedAt: new Date().toISOString(),
      measurements: records,
    },
    null,
    2
  )
}

export interface UseMeasurementStoreReturn {
  save: typeof saveMeasurement
  listByStudy: typeof listMeasurementsByStudy
  listBySeries: typeof listMeasurementsBySeries
  remove: typeof deleteMeasurement
  clear: typeof clearStudyMeasurements
  exportJSON: typeof exportMeasurementsToJSON
}

export const useMeasurementStore = (): UseMeasurementStoreReturn => ({
  save: saveMeasurement,
  listByStudy: listMeasurementsByStudy,
  listBySeries: listMeasurementsBySeries,
  remove: deleteMeasurement,
  clear: clearStudyMeasurements,
  exportJSON: exportMeasurementsToJSON,
})

export const calcLength = (points: { x: number; y: number }[]): number => {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    total += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
  }
  return total
}

export const calcAngle = (points: { x: number; y: number }[]): number => {
  if (points.length < 3) return 0
  const a = points[0]!
  const b = points[1]!
  const c = points[2]!
  const ba = { x: a.x - b.x, y: a.y - b.y }
  const bc = { x: c.x - b.x, y: c.y - b.y }
  const dot = ba.x * bc.x + ba.y * bc.y
  const mag = Math.sqrt(ba.x ** 2 + ba.y ** 2) * Math.sqrt(bc.x ** 2 + bc.y ** 2)
  if (mag === 0) return 0
  return (Math.acos(dot / mag) * 180) / Math.PI
}

export const calcArea = (points: { x: number; y: number }[]): number => {
  if (points.length < 3) return 0
  let s = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]!
    const p2 = points[(i + 1) % points.length]!
    s += p1.x * p2.y - p2.x * p1.y
  }
  return Math.abs(s / 2)
}

export const calcEllipseArea = (rx: number, ry: number): number => Math.PI * rx * ry

export const calcPolygonArea = (points: { x: number; y: number }[]): number => calcArea(points)

export const formatMeasurement = (type: MeasurementType, value: number): string => {
  switch (type) {
    case 'length':
      return `${value.toFixed(1)} mm`
    case 'angle':
      return `${value.toFixed(1)}°`
    case 'area':
    case 'ellipse':
    case 'polygon':
      return `${value.toFixed(1)} mm²`
    case 'ct':
      return `${value.toFixed(0)} HU`
    default:
      return value.toFixed(2)
  }
}

export default {
  save: saveMeasurement,
  listByStudy: listMeasurementsByStudy,
  listBySeries: listMeasurementsBySeries,
  remove: deleteMeasurement,
  clear: clearStudyMeasurements,
  exportJSON: exportMeasurementsToJSON,
  calcLength,
  calcAngle,
  calcArea,
  calcEllipseArea,
  calcPolygonArea,
  formatMeasurement,
}
