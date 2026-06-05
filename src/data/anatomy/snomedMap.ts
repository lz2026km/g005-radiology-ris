// ============================================================
// 解剖本体 - SNOMED CT 映射
// 简化版映射，覆盖关键解剖结构
// ============================================================

export interface SnomedMapping {
  organId: string;
  organName: string;
  snomedId: string;
  snomedName: string;
  snomedType: 'body structure' | 'morphologic abnormality' | 'finding' | 'procedure';
}

export const SNOMED_MAP: SnomedMapping[] = [
  // Body structures
  { organId: 'org-brain',    snomedId: '12738006', snomedName: 'Brain structure',          snomedType: 'body structure', organName: '脑' },
  { organId: 'org-cerebrum', snomedId: '83685006', snomedName: 'Cerebral hemisphere',      snomedType: 'body structure', organName: '大脑' },
  { organId: 'org-cerebellum',snomedId: '113305005',snomedName: 'Cerebellar structure',     snomedType: 'body structure', organName: '小脑' },
  { organId: 'org-brainstem',snomedId: '119234007', snomedName: 'Brainstem structure',      snomedType: 'body structure', organName: '脑干' },
  { organId: 'org-pituitary',snomedId: '56329008',  snomedName: 'Pituitary structure',      snomedType: 'body structure', organName: '垂体' },
  { organId: 'org-eye',      snomedId: '81745001',  snomedName: 'Eye structure',           snomedType: 'body structure', organName: '眼' },
  { organId: 'org-thyroid',  snomedId: '69748006',  snomedName: 'Thyroid structure',       snomedType: 'body structure', organName: '甲状腺' },
  { organId: 'org-lung',     snomedId: '39607008',  snomedName: 'Lung structure',          snomedType: 'body structure', organName: '肺' },
  { organId: 'org-rul',      snomedId: '44087008',  snomedName: 'Right upper lobe',        snomedType: 'body structure', organName: '右肺上叶' },
  { organId: 'org-rml',      snomedId: '72481006',  snomedName: 'Right middle lobe',       snomedType: 'body structure', organName: '右肺中叶' },
  { organId: 'org-rll',      snomedId: '67105007',  snomedName: 'Right lower lobe',        snomedType: 'body structure', organName: '右肺下叶' },
  { organId: 'org-lul',      snomedId: '75753009',  snomedName: 'Left upper lobe',         snomedType: 'body structure', organName: '左肺上叶' },
  { organId: 'org-lll',      snomedId: '168537006', snomedName: 'Left lower lobe',         snomedType: 'body structure', organName: '左肺下叶' },
  { organId: 'org-heart',    snomedId: '80891009',  snomedName: 'Heart structure',         snomedType: 'body structure', organName: '心脏' },
  { organId: 'org-lv',       snomedId: '87878005',  snomedName: 'Left ventricle',          snomedType: 'body structure', organName: '左心室' },
  { organId: 'org-rv',       snomedId: '53085002',  snomedName: 'Right ventricle',         snomedType: 'body structure', organName: '右心室' },
  { organId: 'org-aorta',    snomedId: '15825003',  snomedName: 'Aorta',                   snomedType: 'body structure', organName: '主动脉' },
  { organId: 'org-coronary', snomedId: '41801008',  snomedName: 'Coronary artery',         snomedType: 'body structure', organName: '冠脉' },
  { organId: 'org-breast',   snomedId: '76752008',  snomedName: 'Breast structure',        snomedType: 'body structure', organName: '乳腺' },
  { organId: 'org-liver',    snomedId: '10200004',  snomedName: 'Liver structure',         snomedType: 'body structure', organName: '肝' },
  { organId: 'org-gallbladder',snomedId: '28231008', snomedName: 'Gallbladder structure',   snomedType: 'body structure', organName: '胆囊' },
  { organId: 'org-pancreas', snomedId: '15776009',  snomedName: 'Pancreatic structure',    snomedType: 'body structure', organName: '胰腺' },
  { organId: 'org-spleen',   snomedId: '78961009',  snomedName: 'Splenic structure',       snomedType: 'body structure', organName: '脾' },
  { organId: 'org-stomach',  snomedId: '69695003',  snomedName: 'Stomach structure',       snomedType: 'body structure', organName: '胃' },
  { organId: 'org-kidney',   snomedId: '64033007',  snomedName: 'Renal structure',         snomedType: 'body structure', organName: '肾' },
  { organId: 'org-kidney-l', snomedId: '18639004',  snomedName: 'Left kidney',             snomedType: 'body structure', organName: '左肾' },
  { organId: 'org-kidney-r', snomedId: '28410008',  snomedName: 'Right kidney',            snomedType: 'body structure', organName: '右肾' },
  { organId: 'org-adrenal',  snomedId: '23451007',  snomedName: 'Adrenal structure',       snomedType: 'body structure', organName: '肾上腺' },
  { organId: 'org-bladder',  snomedId: '89837001',  snomedName: 'Bladder structure',       snomedType: 'body structure', organName: '膀胱' },
  { organId: 'org-prostate', snomedId: '41216001',  snomedName: 'Prostatic structure',     snomedType: 'body structure', organName: '前列腺' },
  { organId: 'org-uterus',   snomedId: '35039007',  snomedName: 'Uterine structure',       snomedType: 'body structure', organName: '子宫' },
  { organId: 'org-ovary',    snomedId: '15497006',  snomedName: 'Ovarian structure',       snomedType: 'body structure', organName: '卵巢' },
  { organId: 'org-cervix',   snomedId: '71252005',  snomedName: 'Cervix structure',        snomedType: 'body structure', organName: '宫颈' },
  { organId: 'org-rectum',   snomedId: '34402009',  snomedName: 'Rectal structure',        snomedType: 'body structure', organName: '直肠' },
  { organId: 'org-cervical-spine', snomedId: '122494005', snomedName: 'Cervical vertebral column', snomedType: 'body structure', organName: '颈椎' },
  { organId: 'org-lumbar-spine', snomedId: '122496007', snomedName: 'Lumbar vertebral column',  snomedType: 'body structure', organName: '腰椎' },
  { organId: 'org-thoracic-spine', snomedId: '122495006', snomedName: 'Thoracic vertebral column',snomedType: 'body structure', organName: '胸椎' },
  { organId: 'org-spinal-cord', snomedId: '2748008', snomedName: 'Spinal cord structure',     snomedType: 'body structure', organName: '脊髓' },
];

// SNOMED 索引 - 双向查询
export const SNOMED_BY_ID: Record<string, SnomedMapping> = SNOMED_MAP.reduce((acc, m) => {
  acc[m.snomedId] = m;
  return acc;
}, {} as Record<string, SnomedMapping>);

export const SNOMED_BY_ORGAN: Record<string, SnomedMapping> = SNOMED_MAP.reduce((acc, m) => {
  acc[m.organId] = m;
  return acc;
}, {} as Record<string, SnomedMapping>);

export const SNOMED_TOTAL = SNOMED_MAP.length;
