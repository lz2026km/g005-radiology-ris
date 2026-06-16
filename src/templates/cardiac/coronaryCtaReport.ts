import type { CoronaryCtaAnalysis, CadRadsCategory } from '../../services/cardiac/coronaryCtaService'

export interface CoronaryCtaReport {
  reportTitle: string
  patientId: string
  studyUid: string
  performedDate: string
  sections: {
    clinicalIndication: string
    technique: string
    calciumScore: {
      totalScore: number
      category: string
      percentile: number
    }
    coronaryAnatomy: {
      dominance: string
      segmentsVisualized: string[]
      anomalousOrigin?: string
    }
    segmentalAnalysis: {
      segment: string
      stenosis: string
      plaqueType: string
      sizeLimitation?: string
    }[]
    cadRads: {
      category: CadRadsCategory
      modifier?: string
    }
    highRiskPlaque: string
    ffrCtResult: string
    stentEvaluation: string[]
    bypassGraftEvaluation: string[]
    nonCoronaryFindings: string[]
    impression: string
    recommendations: string[]
  }
  generatedDate: string
  generatedBy: string
}

export function generateCoronaryCtaReport(analysis: CoronaryCtaAnalysis): CoronaryCtaReport {
  return {
    reportTitle: 'Coronary CT Angiography Report',
    patientId: analysis.patientId,
    studyUid: analysis.studyInstanceUid,
    performedDate: analysis.performedDate,
    sections: {
      clinicalIndication: '',
      technique: `Retrospective/prospective ECG-gated CCTA. Contrast volume: ${analysis.contrastVolumeMl}mL. HR: ${analysis.heartRateBpm}bpm. Image quality: ${analysis.imageQuality}. Radiation: ${analysis.radiationDoseMgy}mGy (DLP ${analysis.dlpMgyCm}mGy·cm).`,
      calciumScore: {
        totalScore: analysis.calciumScore.totalAgatstonScore,
        category: analysis.calciumScore.riskCategory,
        percentile: analysis.calciumScore.percentileAgeSex,
      },
      coronaryAnatomy: {
        dominance: analysis.coronaryDominance,
        segmentsVisualized: analysis.segmentsVisualized.map(s => s),
      },
      segmentalAnalysis: analysis.lesions.map(l => ({
        segment: l.segment,
        stenosis: `${l.stenosisGrade} (${l.stenosisPercent}%)`,
        plaqueType: l.plaqueType,
      })),
      cadRads: { category: analysis.cadRads },
      highRiskPlaque: analysis.highRiskPlaqueFeatures ? 'Present' : 'Absent',
      ffrCtResult: analysis.ffrCt.computed ? `FFR-CT: ${analysis.ffrCt.value}` : 'Not computed',
      stentEvaluation: analysis.stents.map(s => `${s.segment}: ${s.patent ? 'Patent' : 'In-stent restenosis'}`),
      bypassGraftEvaluation: analysis.bypassGrafts.map(g => `${g.type}→${g.targetVessel}: ${g.patent ? 'Patent' : `Stenosis: ${g.stenosisGrade}`}`),
      nonCoronaryFindings: [],
      impression: analysis.impression,
      recommendations: analysis.recommendations,
    },
    generatedDate: new Date().toISOString(),
    generatedBy: 'G005-RISv-CCTA-Engine',
  }
}
