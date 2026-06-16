import type { CathAnalysis, HemodynamicsLeft, HemodynamicsRight, CoronaryLesionCath } from '../../services/cardiac/cathService'

export interface CathReportSection {
  clinicalIndication: string
  technique: string
  coronaryAngiography: {
    lesion: string
    stenosis: string
    timiPrePost: string
    pci: string
  }[]
  hemodynamics: {
    leftHeart: string
    rightHeart: string
  }
  ffrResults: string[]
  ivusOct: string[]
  shunt: string
  ventriculography: string
  complications: string[]
  impression: string
  recommendations: string[]
}

export interface CathReport {
  reportTitle: string
  patientId: string
  studyUid: string
  performedDate: string
  sections: CathReportSection
  generatedDate: string
  generatedBy: string
}

function formatLesion(l: CoronaryLesionCath): string {
  return `${l.segment}: ${l.stenosisPercent}% stenosis, TIMI ${l.timiPre}→${l.timiPost}, PCI: ${l.pciPerformed ? 'Yes' : 'No'}`
}

function formatLh(h: HemodynamicsLeft): string {
  return `LVEDP ${h.lvedpMmHg}mmHg, Ao ${h.aortiSystolicMmHg}/${h.aorticDiastolicMmHg}(${h.aorticMeanMmHg})mmHg, Peak gradient ${h.aorticPeakGradientMmHg}mmHg, CO ${h.cardiacOutputLmin}L/min, CI ${h.cardiacIndexLminM2}L/min/m²`
}

function formatRh(h: HemodynamicsRight): string {
  return `RA ${h.raMeanMmHg}mmHg, PA ${h.paSystolicMmHg}/${h.paDiastolicMmHg}(${h.paMeanMmHg})mmHg, PCWP ${h.pcwpMeanMmHg}mmHg, PVR ${h.pvrWoodsUnits}WU, SVR ${h.svrWoodsUnits}WU, O₂ sat ${h.mixedVenousO2SatPercent}%`
}

export function generateCathReport(analysis: CathAnalysis): CathReport {
  return {
    reportTitle: 'Cardiac Catheterization Report',
    patientId: analysis.patientId,
    studyUid: analysis.studyInstanceUid,
    performedDate: analysis.performedDate,
    sections: {
      clinicalIndication: analysis.indication,
      technique: `Access: ${analysis.accessSite}. Contrast: ${analysis.contrastVolumeMl}mL. Fluoro time: ${analysis.fluoroscopyTimeMin}min. Dose: ${analysis.radiationDoseMgy}mGy.`,
      coronaryAngiography: analysis.lesions.map(l => ({
        lesion: formatLesion(l),
        stenosis: `${l.stenosisPercent}%`,
        timiPrePost: `TIMI ${l.timiPre}→${l.timiPost}`,
        pci: l.pciPerformed ? 'Stent deployed' : 'Medical management',
      })),
      hemodynamics: {
        leftHeart: analysis.hemodynamicsLeft ? formatLh(analysis.hemodynamicsLeft) : 'Not measured',
        rightHeart: analysis.hemodynamicsRight ? formatRh(analysis.hemodynamicsRight) : 'Not measured',
      },
      ffrResults: analysis.ffrMeasurements.map(f => `${f.artery}: Baseline ${f.basalValue} → Hyperemic ${f.hyperemicValue} (${f.significant ? 'Significant' : 'Not significant'})`),
      ivusOct: [...analysis.ivus.map(i => `IVUS ${i.lesionId}: MLA ${i.minimalLumenAreaMm2}mm², PB ${i.plaqueBurdenPercent}%`), ...analysis.oct.map(o => `OCT ${o.lesionId}: MLA ${o.minimalLumenAreaMm2}mm², Fibrous cap ${o.fibrousCapThicknessUm}µm, Apposition: ${o.stentApposition}`)],
      shunt: analysis.shunt ? `Qp/Qs: ${analysis.shunt.qpQsRatio.toFixed(2)}, Direction: ${analysis.shunt.shuntDirection}, Level: ${analysis.shunt.shuntLevel}` : 'No shunt detected',
      ventriculography: analysis.ventriculography ? `LVEF ${analysis.ventriculography.lvefPercent}%, Wall motion: ${analysis.ventriculography.wallMotionAbnormal ? 'Abnormal' : 'Normal'}` : 'Not performed',
      complications: analysis.complications,
      impression: analysis.conclusion,
      recommendations: analysis.recommendations,
    },
    generatedDate: new Date().toISOString(),
    generatedBy: 'G005-RISv-Cath-Engine',
  }
}
