// 6.9 Structured Reports (15 pts)
import type { MammoLaterality, BreastDensity } from '../../services/mammo/mammoWorkflow'
import type { BUSBiRadsCategory, BUSLesion } from '../../services/mammo/breastUltrasound'
import type { MRIBiRadsCategory, MRILesion } from '../../services/mammo/breastMri'

export type MammoReportType = 'screening' | 'diagnostic' | 'breast-ultrasound' | 'breast-mri' | 'tomosynthesis' | 'biopsy'

export interface MammoReportTemplate {
  id: string
  name: string
  type: MammoReportType
  sections: MammoReportSection[]
  version: string
  isActive: boolean
}

export interface MammoReportSection {
  id: string
  order: number
  title: string
  content: string
  required: boolean
  fields: MammoReportField[]
}

export interface MammoReportField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'boolean' | 'radio' | 'multiselect' | 'textarea'
  options?: string[]
  required: boolean
  defaultValue?: string
  placeholder?: string
}

export interface MammoReportData {
  patientInfo: {
    name: string
    age: number
    gender: string
    patientId: string
    accessionNumber: string
  }
  clinicalIndications: string[]
  laterality: MammoLaterality
  breastDensity: BreastDensity
  acquisitionType: string
  findings: string
  comparisonToPrior: string
  biRadsCategory: BUSBiRadsCategory | MRIBiRadsCategory | string
  assessment: string
  recommendation: string
  keyImages: string[]
  reportType: MammoReportType
}

// BI-RADS Assessment Categories for structured reports
export const BIRADS_CATEGORIES = [
  { code: '0', description: 'Incomplete - Need additional imaging evaluation', risk: 'N/A' },
  { code: '1', description: 'Negative', risk: '0%' },
  { code: '2', description: 'Benign', risk: '0%' },
  { code: '3', description: 'Probably Benign', risk: '<2%' },
  { code: '4A', description: 'Low suspicion for malignancy', risk: '2-10%' },
  { code: '4B', description: 'Moderate suspicion for malignancy', risk: '10-50%' },
  { code: '4C', description: 'High suspicion for malignancy', risk: '50-95%' },
  { code: '5', description: 'Highly suggestive of malignancy', risk: '>95%' },
  { code: '6', description: 'Known biopsy-proven malignancy', risk: '100%' },
] as const

// ACR Breast Density categories
export const BREAST_DENSITY_CATEGORIES = [
  { code: 'a', description: 'Almost entirely fatty' },
  { code: 'b', description: 'Scattered fibroglandular densities' },
  { code: 'c', description: 'Heterogeneously dense' },
  { code: 'd', description: 'Extremely dense' },
] as const

export const SCREENING_TEMPLATES: MammoReportTemplate[] = [
  {
    id: 'mammo-screen',
    name: 'Screening Mammography Report',
    type: 'screening',
    version: '1.0',
    isActive: true,
    sections: [
      {
        id: 'clinical-info', order: 1, title: 'Clinical Information', required: true,
        content: 'Indications for screening:',
        fields: [
          { key: 'indications', label: 'Indications', type: 'multiselect', options: ['Routine screening', 'High-risk screening', 'Baseline', 'Follow-up'], required: true },
          { key: 'priorStudies', label: 'Prior studies available', type: 'select', options: ['Yes', 'No', 'Not reviewed'], required: true },
          { key: 'menopausalStatus', label: 'Menopausal status', type: 'select', options: ['Premenopausal', 'Postmenopausal', 'Unknown'], required: false },
        ],
      },
      {
        id: 'technique', order: 2, title: 'Technique', required: true,
        content: 'Standard 2-view mammography with tomosynthesis:',
        fields: [
          { key: 'views', label: 'Views acquired', type: 'multiselect', options: ['CC', 'MLO', 'LM', 'ML', 'XCCL'], required: true },
          { key: 'tomo', label: 'Tomosynthesis performed', type: 'boolean', required: true, defaultValue: 'true' },
          { key: 'dose', label: 'AGD (mGy)', type: 'number', required: false, placeholder: 'Avg glandular dose' },
        ],
      },
      {
        id: 'findings', order: 3, title: 'Findings', required: true,
        content: 'Breast composition:',
        fields: [
          { key: 'breastDensity', label: 'Breast density', type: 'select', options: ['a', 'b', 'c', 'd'], required: true },
          { key: 'mass', label: 'Mass', type: 'text', required: false, placeholder: 'Describe mass if present' },
          { key: 'calcifications', label: 'Calcifications', type: 'text', required: false, placeholder: 'Describe calcifications if present' },
          { key: 'asymmetry', label: 'Asymmetry', type: 'text', required: false },
          { key: 'architecturalDistortion', label: 'Architectural distortion', type: 'text', required: false },
        ],
      },
      {
        id: 'assessment', order: 4, title: 'Assessment', required: true,
        content: '',
        fields: [
          { key: 'biRads', label: 'BI-RADS Category', type: 'select', options: BIRADS_CATEGORIES.map(c => `${c.code} - ${c.description}`), required: true },
          { key: 'assessment', label: 'Assessment', type: 'textarea', required: true, placeholder: 'Overall assessment impression' },
          { key: 'recommendation', label: 'Recommendation', type: 'textarea', required: true, placeholder: 'Follow-up recommendation' },
        ],
      },
    ],
  },
  {
    id: 'breast-us',
    name: 'Breast Ultrasound Report',
    type: 'breast-ultrasound',
    version: '1.0',
    isActive: true,
    sections: [
      {
        id: 'clinical-info', order: 1, title: 'Clinical Information', required: true,
        content: 'Indication for ultrasound:',
        fields: [
          { key: 'indications', label: 'Indications', type: 'multiselect', options: ['Palpable mass', 'Mammographic finding', 'Nipple discharge', 'Pain', 'High-risk screening'], required: true },
        ],
      },
      {
        id: 'technique', order: 2, title: 'Technique', required: true,
        content: 'High-resolution real-time ultrasound:',
        fields: [
          { key: 'probe', label: 'Probe frequency', type: 'select', options: ['12-18 MHz', '10-12 MHz', '7-10 MHz'], required: true },
          { key: 'views', label: 'Views', type: 'multiselect', options: ['Radial', 'Anti-radial', 'Sagittal', 'Transverse'], required: true },
        ],
      },
      {
        id: 'findings', order: 3, title: 'Findings', required: true,
        content: 'Lesion characterization per BI-RADS lexicon:',
        fields: [
          { key: 'breastComposition', label: 'Breast composition', type: 'select', options: ['Homogeneous', 'Heterogeneous'], required: true },
          { key: 'lesionLocation', label: 'Lesion location', type: 'text', required: false },
          { key: 'lesionSize', label: 'Lesion size (mm)', type: 'text', required: false },
          { key: 'shape', label: 'Shape', type: 'select', options: ['Oval', 'Round', 'Irregular'], required: false },
          { key: 'margin', label: 'Margin', type: 'select', options: ['Circumscribed', 'Indistinct', 'Angular', 'Microlobulated', 'Spiculated'], required: false },
          { key: 'echoPattern', label: 'Echo pattern', type: 'select', options: ['Anechoic', 'Hyperechoic', 'Hypoechoic', 'Isoechoic', 'Complex'], required: false },
        ],
      },
      {
        id: 'assessment', order: 4, title: 'Assessment', required: true,
        fields: [
          { key: 'biRads', label: 'BI-RADS Category', type: 'select', options: BIRADS_CATEGORIES.map(c => `${c.code} - ${c.description}`), required: true },
          { key: 'recommendation', label: 'Recommendation', type: 'textarea', required: true },
        ],
      },
    ],
  },
  {
    id: 'breast-mri',
    name: 'Breast MRI Report',
    type: 'breast-mri',
    version: '1.0',
    isActive: true,
    sections: [
      {
        id: 'clinical-info', order: 1, title: 'Clinical Information', required: true,
        fields: [
          { key: 'indications', label: 'Indications', type: 'multiselect', options: ['High-risk screening', 'Problem solving', 'Staging', 'Post-op surveillance', 'Implant evaluation'], required: true },
          { key: 'contrast', label: 'Contrast agent', type: 'text', required: true, defaultValue: 'Gadobutrol' },
        ],
      },
      {
        id: 'technique', order: 2, title: 'Technique', required: true,
        fields: [
          { key: 'sequences', label: 'Sequences', type: 'multiselect', options: ['T1', 'T2', 'DWI', 'DCE', 'STIR', '3D T1 GRE'], required: true },
          { key: 'fieldStrength', label: 'Field strength', type: 'select', options: ['1.5T', '3T'], required: true },
        ],
      },
      {
        id: 'findings', order: 3, title: 'Findings', required: true,
        fields: [
          { key: 'bpe', label: 'Background parenchymal enhancement', type: 'select', options: ['Minimal', 'Mild', 'Moderate', 'Marked'], required: true },
          { key: 'massDescription', label: 'Mass / NME description', type: 'textarea', required: false },
          { key: 'kinetics', label: 'Kinetic curve assessment', type: 'select', options: ['Type I - persistent', 'Type II - plateau', 'Type III - washout'], required: false },
        ],
      },
      {
        id: 'assessment', order: 4, title: 'Assessment', required: true,
        fields: [
          { key: 'biRads', label: 'BI-RADS Category', type: 'select', options: BIRADS_CATEGORIES.map(c => `${c.code} - ${c.description}`), required: true },
          { key: 'recommendation', label: 'Recommendation', type: 'textarea', required: true },
        ],
      },
    ],
  },
]

export function getTemplateByType(type: MammoReportType): MammoReportTemplate | undefined {
  return SCREENING_TEMPLATES.find(t => t.type === type)
}

export function renderReportSection(section: MammoReportSection, data: Record<string, string>): string {
  let output = `### ${section.title}\n`
  if (section.content) output += `${section.content}\n`
  for (const field of section.fields) {
    const value = data[field.key]
    if (value && value !== '') {
      output += `- **${field.label}:** ${value}\n`
    }
  }
  return output
}

export function generateStructuredReport(template: MammoReportTemplate, data: MammoReportData): string {
  const lines: string[] = []
  lines.push(`# ${template.name}`)
  lines.push(`**Patient:** ${data.patientInfo.name} (${data.patientInfo.age}y) | **Accession:** ${data.patientInfo.accessionNumber}`)
  lines.push('')
  lines.push(`**Laterality:** ${data.laterality === 'B' ? 'Bilateral' : data.laterality === 'L' ? 'Left' : 'Right'}`)
  lines.push(`**Breast density:** ${data.breastDensity}`)
  lines.push(`**Indications:** ${data.clinicalIndications.join(', ')}`)
  lines.push('')
  lines.push('## Findings')
  lines.push(data.findings)
  lines.push('')
  if (data.comparisonToPrior) {
    lines.push('## Comparison')
    lines.push(data.comparisonToPrior)
    lines.push('')
  }
  lines.push(`## Assessment: ${data.biRadsCategory}`)
  lines.push(data.assessment)
  lines.push('')
  lines.push(`## Recommendation`)
  lines.push(data.recommendation)
  lines.push('')
  lines.push('---')
  lines.push(`*Report generated: ${new Date().toISOString()}*`)
  return lines.join('\n')
}

export function validateReportCompleteness(report: MammoReportData): { valid: boolean; missingFields: string[] } {
  const missing: string[] = []
  if (!report.patientInfo.name) missing.push('Patient name')
  if (!report.laterality) missing.push('Laterality')
  if (!report.breastDensity) missing.push('Breast density')
  if (!report.biRadsCategory) missing.push('BI-RADS category')
  if (!report.assessment) missing.push('Assessment')
  if (!report.recommendation) missing.push('Recommendation')
  return { valid: missing.length === 0, missingFields: missing }
}
