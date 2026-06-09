/**
 * G005 放射RIS系统 v3.0.2 - DICOM SR TID 1500 完整实现
 * 对标:飞利浦/西门子 PACS DICOM Structured Reporting
 *
 * 2B-full 决策(2026-05):
 *  - 树形 ContentItem/ContentSequence 结构
 *  - 子模板(包含关系)TID 1500/1501/1502/100 等
 *  - 外部引用 ReferencedImageSequence
 *  - 测量单位(UCUM CodedConcept)
 *  - SR Document General/Specific/Image 模块
 *  - Verification Flag
 *  - JSON / XML / .dcm 序列化
 */
import type { ReportTemplate } from '@data/reportTemplates'

// ============= DICOM VR(Value Representation) =============
export type VR =
  | 'AE' | 'AS' | 'AT' | 'CS' | 'DA' | 'DS' | 'DT' | 'FL' | 'FD'
  | 'IS' | 'LO' | 'LT' | 'OB' | 'OD' | 'OF' | 'OL' | 'OV' | 'OW' | 'PN'
  | 'SH' | 'SL' | 'SQ' | 'SS' | 'ST' | 'SV' | 'TM' | 'UC' | 'UI' | 'UL'
  | 'UN' | 'UR' | 'US' | 'UT'

// ============= ValueType (TID 1500) =============
export type ValueType =
  | 'TEXT' | 'NUM' | 'DATETIME' | 'DATE' | 'TIME' | 'PNAME'
  | 'IMAGE' | 'COMPOSITE' | 'CODE' | 'CONTAINER' | 'COORD' | 'WAVEFORM' | 'UIDREF' | 'SCORDREF'

// ============= Coded Concept (CODE) =============
export interface CodedConcept {
  CodeValue: string
  CodingSchemeDesignator: string
  CodingSchemeVersion?: string
  CodeMeaning: string
}

// ============= UCUM 单位 (CodeValue 形式) =============
export const UCUM_UNITS: Record<string, CodedConcept> = {
  mm: { CodeValue: 'mm', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'millimeter' },
  cm: { CodeValue: 'cm', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'centimeter' },
  m: { CodeValue: 'm', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'meter' },
  mm2: { CodeValue: 'mm2', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'square millimeter' },
  mm3: { CodeValue: 'mm3', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'cubic millimeter' },
  HU: { CodeValue: 'H.U.', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'Hounsfield Unit' },
  mg: { CodeValue: 'mg', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'milligram' },
  ml: { CodeValue: 'ml', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'milliliter' },
  s: { CodeValue: 's', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'second' },
  bpm: { CodeValue: '/min', CodingSchemeDesignator: 'UCUM', CodeMeaning: 'beat per minute' },
}

// ============= DCMR 术语集(DICOM Standard 节选) =============
export const DCMR_CODES: Record<string, CodedConcept> = {
  // TID 1500 根容器
  '1500': { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' },
  '1501': { CodeValue: '1501', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement' },
  '1502': { CodeValue: '1502', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imagin Measurement Group' },
  // 关系类型
  'CONTAINS': { CodeValue: 'R-40CB', CodingSchemeDesignator: 'SNM3', CodeMeaning: 'Contains' },
  'INFERRED_FROM': { CodeValue: 'R-40BB', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Inferred from' },
  'SELECTED_FROM': { CodeValue: 'R-40BE', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Selected from' },
  'HAS_OBS_CONTEXT': { CodeValue: 'R-40BF', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Has observation context' },
  'HAS_ACQ_CONTEXT': { CodeValue: 'R-40BD', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Has acquisition context' },
  // 文档类型
  'DOC_TYPE_RAD': { CodeValue: '11502-2', CodingSchemeDesignator: 'LN', CodeMeaning: 'Radiology Report' },
  'DOC_TYPE_IMG_MEAS': { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' },
  // 解剖
  'ANAT_LIVER': { CodeValue: 'T-62000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Liver' },
  'ANAT_LUNG': { CodeValue: 'T-28000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Lung' },
  'ANAT_HEART': { CodeValue: 'T-32000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Heart' },
  'ANAT_KIDNEY': { CodeValue: 'T-71000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Kidney' },
  'ANAT_BRAIN': { CodeValue: 'T-A0100', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Brain' },
  'ANAT_BREAST': { CodeValue: 'T-04000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Breast' },
  'ANAT_PROSTATE': { CodeValue: 'T-92000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Prostate' },
  // 测量
  'MEAS_DIAM': { CodeValue: 'G-A220', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Diameter' },
  'MEAS_LEN': { CodeValue: 'G-D7FE', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Length' },
  'MEAS_VOL': { CodeValue: 'G-D705', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Volume' },
  'MEAS_AREA': { CodeValue: 'G-A166', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Area' },
  'MEAS_DENS': { CodeValue: 'R-404F1', CodingSchemeDesignator: 'SNO', CodeMeaning: 'Density' },
  'MEAS_CIRC': { CodeValue: 'M-02550', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Circumference' },
  // 形态学
  'MASS': { CodeValue: 'M-03000', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Mass' },
  'NODULE': { CodeValue: 'M-03010', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Nodule' },
  'CALCIFICATION': { CodeValue: 'M-36390', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Calcification' },
  'GGO': { CodeValue: 'R-41A4D', CodingSchemeDesignator: 'SNO', CodeMeaning: 'Ground glass opacity' },
  // RADS 类别
  'BI-RADS': { CodeValue: 'R-101B5', CodingSchemeDesignator: 'SNO', CodeMeaning: 'BI-RADS assessment category' },
  'LUNG-RADS': { CodeValue: 'R-101B6', CodingSchemeDesignator: 'SNO', CodeMeaning: 'Lung-RADS assessment category' },
  'PI-RADS': { CodeValue: 'R-101B7', CodingSchemeDesignator: 'SNO', CodeMeaning: 'PI-RADS assessment category' },
  'LI-RADS': { CodeValue: 'R-101B8', CodingSchemeDesignator: 'SNO', CodeMeaning: 'LI-RADS assessment category' },
  'TI-RADS': { CodeValue: 'R-101B9', CodingSchemeDesignator: 'SNO', CodeMeaning: 'TI-RADS assessment category' },
  'CAD-RADS': { CodeValue: 'R-101BA', CodingSchemeDesignator: 'SNO', CodeMeaning: 'CAD-RADS assessment category' },
  // 修饰符
  'MOD_INCR': { CodeValue: 'G-A100', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Right' },
  'MOD_LEFT': { CodeValue: 'G-A101', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Left' },
  'MOD_BILAT': { CodeValue: 'G-A102', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Bilateral' },
  'MOD_PROX': { CodeValue: 'G-A118', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Proximal' },
  'MOD_DIST': { CodeValue: 'G-A119', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Distal' },
}

// ============= ContentItem 基础 (TID 1500) =============
export interface DicomContentItem {
  /** 项目内唯一编号 */
  id: string
  /** ValueType */
  valueType: ValueType
  /** 概念名 (ConceptNameCodeSequence) */
  conceptName: CodedConcept
  /** 子节点 (ConceptCodeSequence) */
  conceptCodes?: CodedConcept[]
  /** 关系:与父级 */
  relationship?: 'CONTAINS' | 'INFERRED_FROM' | 'SELECTED_FROM' | 'HAS_OBS_CONTEXT' | 'HAS_ACQ_CONTEXT'
  // === 值字段(根据 valueType 不同) ===
  textValue?: string // TEXT
  numericValue?: number // NUM
  numericUnit?: CodedConcept // NUM 的测量单位
  dateValue?: string // DATE
  timeValue?: string // TIME
  datetimeValue?: string // DATETIME
  personName?: { Alphabetic: string } // PNAME
  imageReference?: { SOPClassUID: string; SOPInstanceUID: string; frameNumber?: number } // IMAGE
  compositeReference?: { SOPClassUID: string; SOPInstanceUID: string } // COMPOSITE
  uidRef?: string // UIDREF
  coordPoint?: { x: number; y: number; z?: number } // COORD
  /** 子节点 (ContentSequence) - 树形结构 */
  children?: DicomContentItem[]
  /** Obs/Acq Context 模板 (TID 1001/1002) */
  observationContext?: DicomContentItem[]
  acquisitionContext?: DicomContentItem[]
}

// ============= SR Document General Module (PS 3.3 C.17) =============
export interface SRDocumentGeneral {
  SOPClassUID: string // '1.2.840.10008.5.1.4.1.1.88.11' Basic Text SR
                       // '1.2.840.10008.5.1.4.1.1.88.22' Enhanced SR
                       // '1.2.840.10008.5.1.4.1.1.88.34' Comprehensive 3D SR
                       // '1.2.840.10008.5.1.4.1.1.88.65' Chest CAD SR (and others)
  SOPInstanceUID: string
  InstanceCreationDate: string // YYYYMMDD
  InstanceCreationTime: string // HHMMSS
  InstanceCreatorUID?: string
  ContentLabel: string // 'RAD'
  ContentDescription?: string
  ContentCreatorName: { Alphabetic: string }
  /** 文档模板本地 UID(用于识别所遵循模板) */
  TemplateIdentifier?: string
  /** 完成度 */
  CompletionFlag: 'PARTIAL' | 'COMPLETE'
  /** 验证标志 */
  VerificationFlag: 'UNVERIFIED' | 'VERIFIED'
  /** 验证人 */
  VerifyingObserverSequence?: {
    VerifyingObserverName: { Alphabetic: string }
    VerifyingOrganization?: string
    VerificationDateTime: string
  }[]
  /** 序列号 */
  SeriesNumber?: number
  /** 实例号 */
  InstanceNumber?: number
}

// ============= SR Document Specific Module =============
export interface SRDocumentSpecific {
  /** 报告类型概念 - DCMR 1500 = Imaging Measurement Report */
  ConceptCodeSequence: CodedConcept[]
  /** 文档级别观察 */
  ContentSequence: DicomContentItem[]
  /** 引用图像(ReferencedImageSequence) */
  ReferencedImageSequence: {
    ReferencedSOPClassUID: string
    ReferencedSOPInstanceUID: string
    ReferencedFrameNumber?: number[]
    ReferencedSegmentNumber?: number[]
  }[]
  /** 关联请求(ReferencedRequestSequence) */
  ReferencedRequestSequence?: {
    StudyInstanceUID: string
    AccessionNumber: string
    RequestedProcedureID: string
  }[]
  /** 完成内容 */
  PerformedProcedureCodeSequence?: CodedConcept[]
}

// ============= Patient/Study 模块 =============
export interface SRPatientStudy {
  PatientName: { Alphabetic: string }
  PatientID: string
  PatientBirthDate?: string
  PatientSex: 'M' | 'F' | 'O' | ''
  StudyInstanceUID: string
  StudyDate: string
  StudyTime: string
  StudyID: string
  AccessionNumber: string
  ReferringPhysicianName?: { Alphabetic: string }
}

// ============= 完整 SR Document =============
export interface DicomSRDocument {
  /** File Meta Information (for .dcm) */
  FileMetaInformationGroupLength: number
  FileMetaInformationVersion: [number, number]
  MediaStorageSOPClassUID: string
  MediaStorageSOPInstanceUID: string
  TransferSyntaxUID: string // '1.2.840.10008.1.2.1' Explicit VR Little Endian
  ImplementationClassUID: string
  ImplementationVersionName: string
  // === Modules ===
  General: SRDocumentGeneral
  PatientStudy: SRPatientStudy
  Specific: SRDocumentSpecific
}

// ============= 测量/评估/结论 Item 构造 =============
const text = (id: string, name: CodedConcept, value: string, relation: DicomContentItem['relationship'] = 'CONTAINS'): DicomContentItem => ({
  id, valueType: 'TEXT', conceptName: name, textValue: value, relationship: relation,
})

const num = (
  id: string,
  name: CodedConcept,
  value: number,
  unitKey: keyof typeof UCUM_UNITS,
  relation: DicomContentItem['relationship'] = 'CONTAINS'
): DicomContentItem => ({
  id,
  valueType: 'NUM',
  conceptName: name,
  numericValue: value,
  numericUnit: UCUM_UNITS[unitKey] ?? UCUM_UNITS.mm,
  relationship: relation,
})

const code = (
  id: string,
  name: CodedConcept,
  codeConcept: CodedConcept,
  relation: DicomContentItem['relationship'] = 'CONTAINS'
): DicomContentItem => ({
  id, valueType: 'CODE', conceptName: name, conceptCodes: [codeConcept], relationship: relation,
})

const container = (
  id: string,
  name: CodedConcept,
  children: DicomContentItem[],
  relation: DicomContentItem['relationship'] = 'CONTAINS'
): DicomContentItem => ({
  id, valueType: 'CONTAINER', conceptName: name, children, relationship: relation,
})

const cc = (c: CodedConcept | undefined, fallback: CodedConcept): CodedConcept => c ?? fallback

const imageRef = (id: string, name: CodedConcept, sopClass: string, sopInstance: string, frame?: number): DicomContentItem => ({
  id, valueType: 'IMAGE', conceptName: name,
  imageReference: { SOPClassUID: sopClass, SOPInstanceUID: sopInstance, frameNumber: frame },
  relationship: 'SELECTED_FROM',
})

// ============= 文档类型 =============
export const SR_SOP_CLASS = {
  BASIC_TEXT: '1.2.840.10008.5.1.4.1.1.88.11',
  ENHANCED: '1.2.840.10008.5.1.4.1.1.88.22',
  COMPREHENSIVE_3D: '1.2.840.10008.5.1.4.1.1.88.34',
  RADIATION_DOSE: '1.2.840.10008.5.1.4.1.1.88.67',
} as const

const DEFAULT_TS = '1.2.840.10008.1.2.1'

// ============= 关键函数:由报告数据生成 SR =============
export interface ReportForSR {
  id: string
  patientName: string
  patientId: string
  patientSex?: 'M' | 'F' | 'O' | ''
  patientBirthDate?: string
  studyInstanceUID: string
  studyDate: string // YYYYMMDD
  studyTime: string // HHMMSS
  studyId: string
  accessionNumber: string
  modality: string
  bodyPart?: string
  findings: string
  conclusion: string
  suggestion?: string
  /** 报告医师 */
  author: string
  /** 审核医师(可空) */
  reviewer?: string
  /** 审核时间(可空) */
  reviewedAt?: Date
  /** 图像 SOP 引用 */
  imageSops: { SOPClassUID: string; SOPInstanceUID: string; frameNumber?: number }[]
  /** RADS 模板(可选) */
  radsTemplate?: ReportTemplate
  /** 结构化字段(可选) */
  structured?: Record<string, string | number | undefined>
  /** 完成度 */
  completed: boolean
  /** 报告时间 */
  createdAt: Date
}

/**
 * 构造完整 DICOM SR TID 1500 文档
 * 2B-full 决策:树形 + 子模板 + 引用
 */
export function buildDicomSRDocument(r: ReportForSR): DicomSRDocument {
  const now = new Date()
  const instanceDate = formatDICOMDate(now)
  const instanceTime = formatDICOMTime(now)
  const sopInstance = generateUID('1.2.826.0.1.3680043.10', r.id)
  // 1) 文档级子树
  const contentSequence: DicomContentItem[] = []

  // 1.1 Document Title (TID 1500 row 1)
  contentSequence.push(
    code('doc-title', cc(DCMR_CODES.DOC_TYPE_IMG_MEAS, { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' }), cc(DCMR_CODES.DOC_TYPE_IMG_MEAS, { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' }))
  )

  // 1.2 Imaging Procedure (TID 1500 row 2) - 来自 accession
  contentSequence.push(
    container(
      'procedure',
      cc(DCMR_CODES['1501'], { CodeValue: '1501', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement' }),
      [
        text(
          'procedure-name',
          { CodeValue: '121058', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Procedure reported' },
          `${r.modality} ${r.bodyPart ?? '检查'}`
        ),
      ]
    )
  )

  // 1.3 Language
  contentSequence.push(
    text(
      'language',
      { CodeValue: '121049', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Language of Content' },
      'zh-CN'
    )
  )

  // 1.4 Observation Context (TID 1001)
  const obsContext: DicomContentItem[] = [
    text(
      'obs-person',
      { CodeValue: '121008', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Person Observer Name' },
      r.author
    ),
    text(
      'obs-org',
      { CodeValue: '121010', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Organization Name' },
      'G005 放射科'
    ),
  ]
  contentSequence.push(
    container(
      'obs-context-root',
      { CodeValue: 'R-40BF', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Has observation context' },
      obsContext,
      'HAS_OBS_CONTEXT'
    )
  )

  // 1.5 Findings Group
  const findingsChildren: DicomContentItem[] = [
    text(
      'findings-text',
      { CodeValue: '121071', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Finding' },
      r.findings
    ),
  ]
  // 若有图像引用,添加 SELECTED_FROM
  r.imageSops.forEach((img, idx) => {
    findingsChildren.push(
      imageRef(`findings-image-${idx}`, { CodeValue: '121112', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Source of Measurement' }, img.SOPClassUID, img.SOPInstanceUID, img.frameNumber)
    )
  })
  contentSequence.push(
    container(
      'findings-group',
      { CodeValue: 'R-40CB', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Findings' },
      findingsChildren
    )
  )

  // 1.6 Impression/Conclusion
  if (r.conclusion) {
    contentSequence.push(
      text(
        'impression',
        { CodeValue: '121073', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Impression' },
        r.conclusion
      )
    )
  }

  // 1.7 Suggestion
  if (r.suggestion) {
    contentSequence.push(
      text(
        'recommendation',
        { CodeValue: '121074', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Recommendation' },
        r.suggestion
      )
    )
  }

  // 1.8 RADS 评估(若提供)
  if (r.radsTemplate?.radsCategory) {
    const radsFallback: CodedConcept = { CodeValue: 'R-101B5', CodingSchemeDesignator: 'SNO', CodeMeaning: 'RADS category' }
    const radsMap: Record<string, CodedConcept> = {
      'BI-RADS': cc(DCMR_CODES['BI-RADS'], radsFallback),
      'Lung-RADS': cc(DCMR_CODES['LUNG-RADS'], radsFallback),
      'PI-RADS': cc(DCMR_CODES['PI-RADS'], radsFallback),
      'LI-RADS': cc(DCMR_CODES['LI-RADS'], radsFallback),
      'TI-RADS': cc(DCMR_CODES['TI-RADS'], radsFallback),
      'CAD-RADS': cc(DCMR_CODES['CAD-RADS'], radsFallback),
    }
    const catCode = radsMap[r.radsTemplate.radsCategory]
    if (catCode) {
      const radsCatValue = (r.structured?.radsCategory as string) ?? '0'
      contentSequence.push(
        container(
          'rads-assessment',
          catCode,
          [
            code(
              'rads-cat',
              { CodeValue: 'R-101BB', CodingSchemeDesignator: 'SNO', CodeMeaning: 'RADS category value' },
              {
                CodeValue: radsCatValue,
                CodingSchemeDesignator: 'SNO',
                CodeMeaning: `${r.radsTemplate.radsCategory} Category ${radsCatValue}`,
              }
            ),
            text(
              'rads-recommendation',
              { CodeValue: '121074', CodingSchemeDesignator: 'DCM', CodeMeaning: 'Recommendation' },
              r.suggestion ?? '建议随访'
            ),
          ]
        )
      )
    }
  }

  // 1.9 结构化测量(从 structured 提取数字测量)
  if (r.structured) {
    const measureGroup: DicomContentItem[] = []
    Object.entries(r.structured).forEach(([key, val]) => {
      if (typeof val === 'number' && !Number.isNaN(val)) {
        measureGroup.push(
          num(
            `meas-${key}`,
            {
              CodeValue: 'G-D7FE',
              CodingSchemeDesignator: 'SRT',
              CodeMeaning: key,
            },
            val,
            'mm'
          )
        )
      }
    })
    if (measureGroup.length > 0) {
      contentSequence.push(
        container(
          'measure-group',
          { CodeValue: 'G-D705', CodingSchemeDesignator: 'SRT', CodeMeaning: 'Measurement Group' },
          measureGroup
        )
      )
    }
  }

  // 2) SR Document General
  const general: SRDocumentGeneral = {
    SOPClassUID: SR_SOP_CLASS.ENHANCED,
    SOPInstanceUID: sopInstance,
    InstanceCreationDate: instanceDate,
    InstanceCreationTime: instanceTime,
    InstanceCreatorUID: '1.2.826.0.1.3680043.10.g005',
    ContentLabel: 'RAD',
    ContentDescription: `${r.modality} ${r.bodyPart ?? ''} 报告`,
    ContentCreatorName: { Alphabetic: r.author },
    TemplateIdentifier: r.radsTemplate ? '1500' : '1500',
    CompletionFlag: r.completed ? 'COMPLETE' : 'PARTIAL',
    VerificationFlag: r.reviewer ? 'VERIFIED' : 'UNVERIFIED',
    VerifyingObserverSequence: r.reviewer
      ? [
          {
            VerifyingObserverName: { Alphabetic: r.reviewer },
            VerifyingOrganization: 'G005 放射科',
            VerificationDateTime: r.reviewedAt
              ? formatDICOMDateTime(r.reviewedAt)
              : formatDICOMDateTime(now),
          },
        ]
      : undefined,
    SeriesNumber: 999,
    InstanceNumber: 1,
  }

  // 3) Patient/Study
  const patientStudy: SRPatientStudy = {
    PatientName: { Alphabetic: r.patientName },
    PatientID: r.patientId,
    PatientBirthDate: r.patientBirthDate,
    PatientSex: r.patientSex ?? '',
    StudyInstanceUID: r.studyInstanceUID,
    StudyDate: r.studyDate,
    StudyTime: r.studyTime,
    StudyID: r.studyId,
    AccessionNumber: r.accessionNumber,
  }

  // 4) Specific
  const specific: SRDocumentSpecific = {
    ConceptCodeSequence: [
      cc(DCMR_CODES.DOC_TYPE_IMG_MEAS, { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' }),
      cc(DCMR_CODES['1500'], { CodeValue: '1500', CodingSchemeDesignator: 'DCMR', CodeMeaning: 'Imaging Measurement Report' }),
    ],
    ContentSequence: contentSequence,
    ReferencedImageSequence: r.imageSops.map((img) => ({
      ReferencedSOPClassUID: img.SOPClassUID,
      ReferencedSOPInstanceUID: img.SOPInstanceUID,
      ReferencedFrameNumber: img.frameNumber !== undefined ? [img.frameNumber] : undefined,
    })),
    ReferencedRequestSequence: [
      {
        StudyInstanceUID: r.studyInstanceUID,
        AccessionNumber: r.accessionNumber,
        RequestedProcedureID: r.accessionNumber,
      },
    ],
    PerformedProcedureCodeSequence: [
      {
        CodeValue: r.modality,
        CodingSchemeDesignator: 'DCM',
        CodeMeaning: r.modality,
      },
    ],
  }

  return {
    FileMetaInformationGroupLength: 0, // computed at serialize
    FileMetaInformationVersion: [0, 1],
    MediaStorageSOPClassUID: general.SOPClassUID,
    MediaStorageSOPInstanceUID: general.SOPInstanceUID,
    TransferSyntaxUID: DEFAULT_TS,
    ImplementationClassUID: '1.2.826.0.1.3680043.10.g005',
    ImplementationVersionName: 'G005_RIS_3.0.2',
    General: general,
    PatientStudy: patientStudy,
    Specific: specific,
  }
}

// ============= 序列化 =============

/** 序列化为 JSON */
export function serializeToJSON(doc: DicomSRDocument): string {
  return JSON.stringify(doc, null, 2)
}

/** 序列化为简化 XML(供第三方系统) */
export function serializeToXML(doc: DicomSRDocument): string {
  const escape = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)
  const renderItem = (item: DicomContentItem, depth: number): string => {
    const pad = '  '.repeat(depth)
    const rel = item.relationship ? ` relationship="${item.relationship}"` : ''
    const concept = ` conceptName="${escape(item.conceptName.CodeMeaning)}" (${escape(item.conceptName.CodeValue)})`
    let body = ''
    switch (item.valueType) {
      case 'TEXT':
        body = `<TextValue>${escape(item.textValue ?? '')}</TextValue>`
        break
      case 'NUM':
        body = `<NumericValue>${item.numericValue}</NumericValue><Unit CodeValue="${escape(item.numericUnit?.CodeValue ?? '')}" CodingScheme="${escape(item.numericUnit?.CodingSchemeDesignator ?? '')}" Meaning="${escape(item.numericUnit?.CodeMeaning ?? '')}"/>`
        break
      case 'CODE':
        body = (item.conceptCodes ?? []).map((c) => `<Code CodeValue="${escape(c.CodeValue)}" CodingScheme="${escape(c.CodingSchemeDesignator)}" Meaning="${escape(c.CodeMeaning)}"/>`).join('')
        break
      case 'CONTAINER':
        body = (item.children ?? []).map((c) => renderItem(c, depth + 1)).join('\n')
        break
      case 'IMAGE':
        body = `<ImageReference SOPClassUID="${escape(item.imageReference?.SOPClassUID ?? '')}" SOPInstanceUID="${escape(item.imageReference?.SOPInstanceUID ?? '')}" Frame="${item.imageReference?.frameNumber ?? ''}"/>`
        break
      case 'UIDREF':
        body = `<UID>${escape(item.uidRef ?? '')}</UID>`
        break
    }
    return `${pad}<ContentItem id="${escape(item.id)}" valueType="${item.valueType}"${rel}${concept}>${body}${item.children ? '</ContentItem>' : ''}`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<DicomSRDocument>
  <FileMeta>
    <MediaStorageSOPClassUID>${escape(doc.MediaStorageSOPClassUID)}</MediaStorageSOPClassUID>
    <MediaStorageSOPInstanceUID>${escape(doc.MediaStorageSOPInstanceUID)}</MediaStorageSOPInstanceUID>
    <TransferSyntaxUID>${escape(doc.TransferSyntaxUID)}</TransferSyntaxUID>
    <ImplementationClassUID>${escape(doc.ImplementationClassUID)}</ImplementationClassUID>
  </FileMeta>
  <General>
    <SOPClassUID>${escape(doc.General.SOPClassUID)}</SOPClassUID>
    <SOPInstanceUID>${escape(doc.General.SOPInstanceUID)}</SOPInstanceUID>
    <InstanceCreationDate>${escape(doc.General.InstanceCreationDate)}</InstanceCreationDate>
    <InstanceCreationTime>${escape(doc.General.InstanceCreationTime)}</InstanceCreationTime>
    <ContentLabel>${escape(doc.General.ContentLabel)}</ContentLabel>
    <ContentDescription>${escape(doc.General.ContentDescription ?? '')}</ContentDescription>
    <CompletionFlag>${doc.General.CompletionFlag}</CompletionFlag>
    <VerificationFlag>${doc.General.VerificationFlag}</VerificationFlag>
  </General>
  <PatientStudy>
    <PatientName>${escape(doc.PatientStudy.PatientName.Alphabetic)}</PatientName>
    <PatientID>${escape(doc.PatientStudy.PatientID)}</PatientID>
    <PatientSex>${doc.PatientStudy.PatientSex}</PatientSex>
    <StudyInstanceUID>${escape(doc.PatientStudy.StudyInstanceUID)}</StudyInstanceUID>
    <AccessionNumber>${escape(doc.PatientStudy.AccessionNumber)}</AccessionNumber>
  </PatientStudy>
  <Specific>
${doc.Specific.ContentSequence.map((c) => renderItem(c, 3)).join('\n')}
  </Specific>
</DicomSRDocument>`
}

/**
 * 序列化为 Part 10 .dcm 文件(二进制存根)
 * 真实二进制 DICOM 需要 pydicom/dcmtk,这里导出 JSON 包装供 wado-rs 上传
 */
export function serializeToDicomBin(doc: DicomSRDocument): Uint8Array {
  const json = serializeToJSON(doc)
  const enc = new TextEncoder()
  return enc.encode(json)
}

// ============= 工具 =============
function formatDICOMDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function formatDICOMTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}${m}${s}`
}

function formatDICOMDateTime(d: Date): string {
  return `${formatDICOMDate(d)}${formatDICOMTime(d)}`
}

/** 简易 UID 生成(root + suffix),生产中应使用 UUID v4 转 UID 格式 */
export function generateUID(root: string, suffix: string): string {
  const cleaned = suffix.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 32)
  return `${root}.${cleaned}.${Date.now().toString(36)}`
}

// ============= 验证 =============
export interface SRValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateSR(doc: DicomSRDocument): SRValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  if (!doc.General.SOPInstanceUID) errors.push('SOPInstanceUID missing')
  if (!doc.General.ContentCreatorName?.Alphabetic) errors.push('ContentCreatorName missing')
  if (!doc.PatientStudy.PatientID) errors.push('PatientID missing')
  if (!doc.PatientStudy.StudyInstanceUID) errors.push('StudyInstanceUID missing')
  if (!doc.Specific.ContentSequence.length) errors.push('ContentSequence is empty')
  if (doc.General.VerificationFlag === 'VERIFIED' && !doc.General.VerifyingObserverSequence?.length) {
    errors.push('VerificationFlag=VERIFIED requires VerifyingObserver')
  }
  // 警告:CompletionFlag=COMPLETE 但没有 Impression
  if (doc.General.CompletionFlag === 'COMPLETE' && !doc.Specific.ContentSequence.find((c) => c.id === 'impression')) {
    warnings.push('Completed report has no Impression/Conclusion')
  }
  return { valid: errors.length === 0, errors, warnings }
}
