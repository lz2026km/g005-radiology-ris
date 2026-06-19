export type NationalStandardId =
  | 'GB/T 14396-2016'
  | 'GB/T 15657-2021'
  | 'GB/T 21715-2020'
  | 'WS 363-2011'
  | 'WS 365-2011'
  | 'WS 445-2014'

export interface NationalStandard {
  id: NationalStandardId
  name: string
  scope: string
  version: string
  implementingDate: string
  category: 'disease_code' | 'tcm_code' | 'patient_id' | 'data_element' | 'health_record' | 'emr_dataset'
}

export interface DiseaseCodeMapping {
  sourceCode: string
  sourceSystem: 'ICD-10' | 'SNOMED'
  targetCode: string
  targetSystem: NationalStandardId
  name: string
  accuracy: number
}

export interface StandardCodeLookup {
  code: string
  name: string
  standard: NationalStandardId
  parentCode?: string
  children?: StandardCodeLookup[]
}

export const NATIONAL_STANDARDS: NationalStandard[] = [
  { id: 'GB/T 14396-2016', name: '疾病分类与代码', scope: 'Disease classification coding', version: '2016', implementingDate: '2017-02-01', category: 'disease_code' },
  { id: 'GB/T 15657-2021', name: '中医病证分类与代码', scope: 'TCM syndrome classification', version: '2021', implementingDate: '2021-10-01', category: 'tcm_code' },
  { id: 'GB/T 21715-2020', name: '患者标识', scope: 'Patient identification', version: '2020', implementingDate: '2021-01-01', category: 'patient_id' },
  { id: 'WS 363-2011', name: '卫生信息数据元目录', scope: 'Health info data element catalog', version: '2011', implementingDate: '2012-02-01', category: 'data_element' },
  { id: 'WS 365-2011', name: '城乡居民健康档案基本数据集', scope: 'Basic health record dataset', version: '2011', implementingDate: '2012-02-01', category: 'health_record' },
  { id: 'WS 445-2014', name: '电子病历基本数据集', scope: 'EMR basic dataset', version: '2014', implementingDate: '2015-01-01', category: 'emr_dataset' },
]

const DISEASE_MAPPINGS: DiseaseCodeMapping[] = [
  { sourceCode: 'I10', sourceSystem: 'ICD-10', targetCode: 'I10.x01', targetSystem: 'GB/T 14396-2016', name: '原发性高血压', accuracy: 0.95 },
  { sourceCode: 'E11', sourceSystem: 'ICD-10', targetCode: 'E11.x01', targetSystem: 'GB/T 14396-2016', name: '2型糖尿病', accuracy: 0.95 },
  { sourceCode: 'J15', sourceSystem: 'ICD-10', targetCode: 'J15.x01', targetSystem: 'GB/T 14396-2016', name: '细菌性肺炎', accuracy: 0.90 },
]

export function getStandards(): NationalStandard[] {
  return [...NATIONAL_STANDARDS]
}

export function getStandard(id: NationalStandardId): NationalStandard | undefined {
  return NATIONAL_STANDARDS.find(s => s.id === id)
}

export function mapDiseaseCode(sourceCode: string, sourceSystem: 'ICD-10' | 'SNOMED'): DiseaseCodeMapping | undefined {
  return DISEASE_MAPPINGS.find(m => m.sourceCode === sourceCode && m.sourceSystem === sourceSystem)
}

export function getAllMappings(): DiseaseCodeMapping[] {
  return [...DISEASE_MAPPINGS]
}

/** @deprecated Mock implementation — does not query real standard database */
export function lookupCode(standard: NationalStandardId, query: string): StandardCodeLookup[] {
  console.warn('[GBT-MOCK] Standard database not connected — returning empty result');
  return []
}

/** @deprecated Mock implementation — does not validate against real standard */
export function validateAgainstStandard(data: Record<string, any>, standard: NationalStandardId): { valid: boolean; errors: string[] } {
  console.warn('[GBT-MOCK] Standard validation not connected — returning valid');
  return { valid: true, errors: [] }
}
