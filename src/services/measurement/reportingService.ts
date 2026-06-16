import type { MeasurementResult, TemporalComparison } from './measurementEngine'

export interface SrDocument {
  studyInstanceUid: string
  seriesInstanceUid: string
  sopInstanceUid: string
  measurements: SrMeasurement[]
  datetime: string
  observer: string
}

export interface SrMeasurement {
  trackingId: string
  findingType: string
  measurementType: string
  value: number
  unit: string
  method: string
  source: string
}

export function generateSrDocument(
  measurements: MeasurementResult[],
  lesions: { id: string; label: string; location: string }[],
  observer: string
): SrDocument {
  const uid = `1.2.840.${Date.now()}`
  return {
    studyInstanceUid: uid,
    seriesInstanceUid: `${uid}.1`,
    sopInstanceUid: `${uid}.1.1`,
    datetime: new Date().toISOString(),
    observer,
    measurements: measurements.map((m, i) => ({
      trackingId: `track-${i + 1}`,
      findingType: lesions.find(l => l.id === m.lesionId)?.label ?? 'Lesion',
      measurementType: m.standard,
      value: m.value,
      unit: m.unit,
      method: m.standard.toUpperCase(),
      source: 'G005_MeasurementEngine',
    })),
  }
}

export interface TemporalReport {
  comparison: TemporalComparison
  recommendation: string
}

export function generateTemporalReport(comparison: TemporalComparison): TemporalReport {
  const recommendationMap: Record<string, string> = {
    CR: 'Complete response — continue surveillance per protocol',
    PR: 'Partial response — confirm on next follow-up (4-8 weeks)',
    SD: 'Stable disease — continue current management',
    PD: 'Progressive disease — consider alternative therapy',
  }

  return {
    comparison,
    recommendation: recommendationMap[comparison.assessment] ?? 'Review required',
  }
}

export function exportSrToJson(sr: SrDocument): string {
  return JSON.stringify(sr, null, 2)
}

export async function exportSrToDicom(sr: SrDocument): Promise<Blob> {
  const header = {
    type: 'DICOM SR',
    version: '1.0',
    document: sr,
  }
  return new Blob([JSON.stringify(header, null, 2)], { type: 'application/dicom+json' })
}
