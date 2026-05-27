/**
 * SNOMED CT / LOINC 国际标准编码对照 - I9
 * G005 Radiology RIS System
 */

// SNOMED CT 影像检查类型编码
export const SNOMED_CT_MODALITY: Record<string, { code: string; name: string; nameEn: string }> = {
  'Xray': { code: '3981000175108', name: 'X线摄影', nameEn: 'X-ray' },
  'CT': { code: '3981000175109', name: '计算机断层扫描', nameEn: 'Computed Tomography' },
  'MR': { code: '3981000175110', name: '磁共振成像', nameEn: 'Magnetic Resonance' },
  'US': { code: '3981000175111', name: '超声检查', nameEn: 'Ultrasound' },
  'NM': { code: '3981000175112', name: '核医学成像', nameEn: 'Nuclear Medicine' },
  'PET': { code: '3981000175113', name: '正电子发射断层扫描', nameEn: 'PET' },
  'RF': { code: '3981000175114', name: '射频消融', nameEn: 'Radiofrequency Ablation' },
  'MG': { code: '3981000175115', name: '乳腺摄影', nameEn: 'Mammography' },
  'DX': { code: '3981000175116', name: '数字化X线摄影', nameEn: 'Digital Radiography' },
  'CR': { code: '3981000175117', name: '计算机X线摄影', nameEn: 'Computed Radiography' },
  'DF': { code: '3981000175118', name: '数字荧光摄影', nameEn: 'Digital Fluoroscopy' },
  'PT': { code: '3981000175119', name: 'PET/CT', nameEn: 'PET/CT' },
};

// LOINC 检查项目编码
export const LOINC_CODES: Record<string, { code: string; name: string; nameEn: string }> = {
  'chest_xray': { code: '30522-7', name: '胸部X线', nameEn: 'Chest X-ray' },
  'abdomen_ct': { code: '36475-6', name: '腹部CT', nameEn: 'Abdomen CT' },
  'brain_mri': { code: '36310-5', name: '脑部MRI', nameEn: 'Brain MRI' },
  'spine_mri': { code: '36311-3', name: '脊柱MRI', nameEn: 'Spine MRI' },
  'cardiac_ct': { code: '36475-6', name: '心脏CT', nameEn: 'Cardiac CT' },
  'pelvis_ct': { code: '36481-4', name: '盆腔CT', nameEn: 'Pelvis CT' },
  'breast_mammo': { code: '39156-5', name: '乳腺摄影', nameEn: 'Mammography' },
  'bone_dxa': { code: '38475-4', name: '骨密度DXA', nameEn: 'Bone Densitometry' },
  'thyroid_us': { code: '40976-4', name: '甲状腺超声', nameEn: 'Thyroid Ultrasound' },
  'abdominal_us': { code: '40977-2', name: '腹部超声', nameEn: 'Abdominal Ultrasound' },
  'carotid_us': { code: '40978-0', name: '颈动脉超声', nameEn: 'Carotid Ultrasound' },
  'echocardiogram': { code: '40979-8', name: '超声心动图', nameEn: 'Echocardiography' },
  'lung_pet': { code: '42904-6', name: '肺部PET', nameEn: 'Lung PET' },
  'bone_scan': { code: '40982-2', name: '骨扫描', nameEn: 'Bone Scan' },
  'renal_scan': { code: '40983-0', name: '肾脏扫描', nameEn: 'Renal Scan' },
  'hepatic_imaging': { code: '40984-8', name: '肝脏成像', nameEn: 'Hepatic Imaging' },
  'ct_angiography': { code: '36227-1', name: 'CT血管造影', nameEn: 'CT Angiography' },
  'mr_angiography': { code: '36331-1', name: 'MR血管造影', nameEn: 'MR Angiography' },
};

// 检查部位编码
export const BODY_PART_CODES: Record<string, { snomed: string; loinc: string; name: string; nameEn: string }> = {
  'head': { snomed: '89545001', loinc: 'RA.1.1', name: '头部', nameEn: 'Head' },
  'neck': { snomed: '45048007', loinc: 'RA.1.2', name: '颈部', nameEn: 'Neck' },
  'chest': { snomed: '51185008', loinc: 'RA.1.3', name: '胸部', nameEn: 'Chest' },
  'abdomen': { snomed: '81687009', loinc: 'RA.1.4', name: '腹部', nameEn: 'Abdomen' },
  'pelvis': { snomed: '82563009', loinc: 'RA.1.5', name: '盆腔', nameEn: 'Pelvis' },
  'spine': { snomed: '274143001', loinc: 'RA.1.6', name: '脊柱', nameEn: 'Spine' },
  'upper_limb': { snomed: '40983000', loinc: 'RA.1.7', name: '上肢', nameEn: 'Upper Limb' },
  'lower_limb': { snomed: '77650008', loinc: 'RA.1.8', name: '下肢', nameEn: 'Lower Limb' },
  'cardiac': { snomed: '40781008', loinc: 'RA.1.9', name: '心脏', nameEn: 'Cardiac' },
  'vascular': { snomed: '25785001', loinc: 'RA.1.10', name: '血管', nameEn: 'Vascular' },
};

/**
 * 获取检查类型的标准编码
 */
export function getModalityCode(modality: string): { snomed: string; loinc: string; name: string; nameEn: string } {
  const normalized = modality.toUpperCase();
  const snomedEntry = Object.entries(SNOMED_CT_MODALITY).find(([key]) => key.toUpperCase() === normalized);
  if (snomedEntry) {
    return {
      snomed: snomedEntry[1].code,
      loinc: '',
      name: snomedEntry[1].name,
      nameEn: snomedEntry[1].nameEn,
    };
  }
  return { snomed: '', loinc: '', name: modality, nameEn: modality };
}

/**
 * 查找LOINC编码
 */
export function findLoincCode(key: string): { code: string; name: string; nameEn: string } | null {
  return LOINC_CODES[key] || null;
}

/**
 * 获取部位编码信息
 */
export function getBodyPartCode(bodyPart: string): { snomed: string; loinc: string; name: string; nameEn: string } {
  const normalized = bodyPart.toLowerCase();
  return BODY_PART_CODES[normalized] || {
    snomed: '',
    loinc: '',
    name: bodyPart,
    nameEn: bodyPart,
  };
}