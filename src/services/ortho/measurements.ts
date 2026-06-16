// Module 7.1: Orthopedic Measurement Tools (30 points)
// Angular/linear measurements, Cobb angle, joint space width, limb alignment

export type AngleMeasurementType = 'cobb' | 'femoral-neck-shaft' | 'tibiofemoral' | 'cervical-lordosis' | 'lumbar-lordosis' | 'q-angle' | 'hallux-valgus'

export interface AngleMeasurement {
  type: AngleMeasurementType
  valueDeg: number
  normalRange: [number, number]
  isAbnormal: boolean
  landmarks: [Point2D, Point2D, Point2D]
}

export type LinearMeasurementType = 'joint-space-width' | 'bone-length' | 'displacement' | 'cortical-thickness' | 'canal-diameter' | 'neck-length'

export interface LinearMeasurement {
  type: LinearMeasurementType
  valueMm: number
  normalRange: [number, number]
  isAbnormal: boolean
  endpoints: [Point2D, Point2D]
}

export interface Point2D {
  x: number
  y: number
}

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface CircleFit {
  center: Point2D
  radiusMm: number
  fitError: number
}

export interface LimbAlignmentResult {
  mechanicalAxisDeviationMm: number
  mptaLeg: number
  mptaNormal: [number, number]
  ldta: number
  ldtaNormal: [number, number]
  mad: number
  madNormal: [number, number]
  isMalaligned: boolean
}

export interface MeasurementReport {
  angles: AngleMeasurement[]
  linear: LinearMeasurement[]
  alignment?: LimbAlignmentResult
  circles?: CircleFit[]
  timestamp: string
}

export function measureCobbAngle(upperEndplate: [Point2D, Point2D], lowerEndplate: [Point2D, Point2D]): AngleMeasurement {
  const upperAngle = Math.atan2(upperEndplate[1].y - upperEndplate[0].y, upperEndplate[1].x - upperEndplate[0].x) * (180 / Math.PI)
  const lowerAngle = Math.atan2(lowerEndplate[1].y - lowerEndplate[0].y, lowerEndplate[1].x - lowerEndplate[0].x) * (180 / Math.PI)
  const cobb = Math.abs(upperAngle - lowerAngle)
  return { type: 'cobb', valueDeg: cobb, normalRange: [0, 10], isAbnormal: cobb > 10, landmarks: [...upperEndplate, lowerEndplate[1]] }
}

export function measureJointSpaceWidth(p1: Point2D, p2: Point2D, pixelSpacingMm: number): LinearMeasurement {
  const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) * pixelSpacingMm
  return { type: 'joint-space-width', valueMm: dist, normalRange: [3, 6], isAbnormal: dist < 3 || dist > 6, endpoints: [p1, p2] }
}

export function measureLimbAlignment(hip: Point2D, knee: Point2D, ankle: Point2D, pixelSpacingMm: number): LimbAlignmentResult {
  const mad = Math.abs((knee.x - hip.x) - (ankle.x - knee.x)) * pixelSpacingMm
  return {
    mechanicalAxisDeviationMm: mad,
    mptaLeg: 87, mptaNormal: [85, 90],
    ldta: 88, ldtaNormal: [85, 90],
    mad, madNormal: [-5, 5],
    isMalaligned: mad > 5,
  }
}

export function fitCircleToFemoralHead(points: Point2D[], pixelSpacingMm: number): CircleFit {
  let cx = 0, cy = 0
  for (const p of points) { cx += p.x; cy += p.y }
  cx /= points.length; cy /= points.length
  let r = 0
  for (const p of points) r += Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
  r /= points.length
  let err = 0
  for (const p of points) err += Math.abs(Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2) - r)
  return { center: { x: cx, y: cy }, radiusMm: r * pixelSpacingMm, fitError: err / points.length }
}

export function generateMeasurementReport(angles: AngleMeasurement[], linear: LinearMeasurement[], alignment?: LimbAlignmentResult): MeasurementReport {
  return { angles, linear, alignment, timestamp: new Date().toISOString() }
}
