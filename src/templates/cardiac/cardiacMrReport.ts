import type { CardiacMrAnalysis, VentricularVolumes, FlowQuantification } from '../../services/cardiac/cardiacMrService'

export interface CardiacMrReportSection {
  clinicalIndication: string
  technique: string
  ventricularVolumes: {
    chamber: string
    edv: string
    esv: string
    sv: string
    ef: string
    mass: string
  }[]
  wallMotion: {
    wmsi: number
    regionalAnomalies: string
  }
  myocardialTissue: {
    t1Mapping: string
    t2Mapping: string
    t2Star: string
    lge: string
  }
  perfusion: string
  strain: string
  flowQuantification: string[]
  extraCardiac: string[]
  impression: string
}

export interface CardiacMrReport {
  reportTitle: string
  patientId: string
  studyUid: string
  performedDate: string
  sections: CardiacMrReportSection
  generatedDate: string
  generatedBy: string
}

function formatVolumes(v: VentricularVolumes): CardiacMrReportSection['ventricularVolumes'][0] {
  return {
    chamber: v.chamber,
    edv: `${v.edvMl}mL (${v.edvIndexedMlM2}mL/m²)`,
    esv: `${v.esvMl}mL (${v.esvIndexedMlM2}mL/m²)`,
    sv: `${v.svMl}mL (${v.svIndexedMlM2}mL/m²)`,
    ef: `${v.efPercent}%`,
    mass: `${v.myocardialMassG}g (${v.massIndexedGM2}g/m²)`,
  }
}

function formatFlow(f: FlowQuantification): string {
  return `${f.valve}: Forward ${f.forwardVolumeMl}mL, Regurgitant fraction ${f.regurgitantFractionPercent}%, Peak velocity ${f.peakVelocityMsec}m/s, Mean gradient ${f.meanGradientMmHg}mmHg`
}

export function generateCardiacMrReport(analysis: CardiacMrAnalysis): CardiacMrReport {
  return {
    reportTitle: 'Cardiac Magnetic Resonance Report',
    patientId: analysis.patientId,
    studyUid: analysis.studyInstanceUid,
    performedDate: analysis.performedDate,
    sections: {
      clinicalIndication: '',
      technique: `Sequences: ${analysis.sequencesAcquired.join(', ')}. HR: ${analysis.heartRateAvg}bpm. Image quality: ${analysis.imageQuality}.`,
      ventricularVolumes: analysis.ventricularVolumes.map(formatVolumes),
      wallMotion: {
        wmsi: analysis.wallMotionScoreIndex,
        regionalAnomalies: analysis.wallMotion.filter(w => w.score > 1).map(w => `Segment ${w.segment}: score ${w.score}`).join('; ') || 'Normal',
      },
      myocardialTissue: {
        t1Mapping: analysis.t1Mapping ? `Native T1: ${analysis.t1Mapping.nativeT1Ms}ms, ECV: ${analysis.t1Mapping.ecvPercent}%` : 'Not performed',
        t2Mapping: analysis.t2Mapping ? `Global T2: ${analysis.t2Mapping.globalT2Ms}ms` : 'Not performed',
        t2Star: analysis.t2StarMapping ? `Global T2*: ${analysis.t2StarMapping.globalT2StarMs}ms` : 'Not performed',
        lge: analysis.lge ? `${analysis.lge.present ? 'Present' : 'Absent'} (${analysis.lge.totalScarPercentLV}% LV mass)` : 'Not performed',
      },
      perfusion: analysis.perfusion ? `Stress defect: ${analysis.perfusion.stressMpiDefect}, Reversible: ${analysis.perfusion.reversibleDefect}, MPR: ${analysis.perfusion.myocardialPerfusionReserveIndex}` : 'Not performed',
      strain: analysis.strain ? `GLS: ${analysis.strain.glsPercent}%, GCS: ${analysis.strain.gcsPercent}%, GRS: ${analysis.strain.grsPercent}%` : 'Not performed',
      flowQuantification: analysis.flowQuantification.map(formatFlow),
      extraCardiac: [],
      impression: analysis.impression,
    },
    generatedDate: new Date().toISOString(),
    generatedBy: 'G005-RISv-CMR-Engine',
  }
}
