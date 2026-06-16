import type { EchoAnalysis, LvEfMeasurement, ValveAssessment } from '../../services/cardiac/echoService'

export interface EchoReportSection {
  clinicalIndication: string
  technique: string
  lvSystolicFunction: {
    ef: string
    method: string
    wmsi?: number
  }
  lvDiastolicFunction: string
  leftAtrium: string
  rightHeart: string
  valves: string[]
  strain: string
  stressEcho: string
  pericardium: string
  extraCardiac: string[]
  conclusion: string
}

export interface EchoReport {
  reportTitle: string
  patientId: string
  studyUid: string
  performedDate: string
  sections: EchoReportSection
  generatedDate: string
  generatedBy: string
}

function formatEf(m: LvEfMeasurement): string {
  return `LVEF ${m.efPercent}% (${m.method}), EDV ${m.edvMl}mL, ESV ${m.esvMl}mL, SV ${m.svMl}mL`
}

function formatValve(v: ValveAssessment): string {
  return `${v.valve} ${v.lesionType}: ${v.severity}, Peak/Mean gradient ${v.peakGradientMmHg}/${v.meanGradientMmHg}mmHg, Velocity ${v.peakVelocityMsec}m/s`
}

export function generateEchoReport(analysis: EchoAnalysis): EchoReport {
  return {
    reportTitle: 'Echocardiography Report',
    patientId: analysis.patientId,
    studyUid: analysis.studyInstanceUid,
    performedDate: analysis.performedDate,
    sections: {
      clinicalIndication: '',
      technique: `Views: ${analysis.viewsAcquired.join(', ')}. Image quality: ${analysis.imageQuality}. HR: ${analysis.heartRateBpm}bpm.`,
      lvSystolicFunction: {
        ef: analysis.lvEf.map(formatEf).join('; '),
        method: analysis.lvEf[0]?.method || 'N/A',
        wmsi: analysis.wmsi?.wmsi,
      },
      lvDiastolicFunction: analysis.diastolicFunction ? `Grade: ${analysis.diastolicFunction.grade}, E/A ratio: ${analysis.diastolicFunction.eAPeakRatio.toFixed(2)}, E/e': ${analysis.diastolicFunction.eEPrimeRatio.toFixed(1)}` : 'Not assessed',
      leftAtrium: '',
      rightHeart: `RA pressure: ${analysis.raPressureMmHg}mmHg, PASP: ${analysis.paspMmHg}mmHg, IVC: ${analysis.ivcSizeMm}mm (collapsibility ${analysis.ivcCollapsibilityPercent}%)`,
      valves: analysis.valves.map(formatValve),
      strain: analysis.speckleTracking ? `GLS: ${analysis.speckleTracking.glsPercent}%` : 'Not performed',
      stressEcho: analysis.stressEcho ? `Protocol: ${analysis.stressEcho.protocol}, Conclusion: ${analysis.stressEcho.conclusion}` : 'Not performed',
      pericardium: analysis.pericardialEffusion.present ? `Effusion: ${analysis.pericardialEffusion.sizeMm}mm (${analysis.pericardialEffusion.tamponade ? 'with' : 'without'} tamponade)` : 'Normal',
      extraCardiac: [],
      conclusion: analysis.conclusion,
    },
    generatedDate: new Date().toISOString(),
    generatedBy: 'G005-RISv-Echo-Engine',
  }
}
