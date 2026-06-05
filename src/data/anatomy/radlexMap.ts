// ============================================================
// 解剖本体 - RadLex 映射
// RSNA RadLex 放射学术语集
// ============================================================

export interface RadLexMapping {
  radlexId: string;
  name: string;
  pinyin: string;
  category: 'anatomic' | 'modifier' | 'imaging' | 'finding' | 'procedure';
  relatedOrganIds: string[];
}

export const RADLEX_MAP: RadLexMapping[] = [
  // 解剖
  { radlexId: 'RID6430', name: 'Brain',           pinyin: 'n',  category: 'anatomic', relatedOrganIds: ['org-brain'] },
  { radlexId: 'RID6253', name: 'Cerebellum',      pinyin: 'xn', category: 'anatomic', relatedOrganIds: ['org-cerebellum'] },
  { radlexId: 'RID7020', name: 'Brain Stem',      pinyin: 'ng', category: 'anatomic', relatedOrganIds: ['org-brainstem'] },
  { radlexId: 'RID6515', name: 'Pituitary',       pinyin: 'ct', category: 'anatomic', relatedOrganIds: ['org-pituitary'] },
  { radlexId: 'RID4655', name: 'Thyroid',         pinyin: 'jzx',category: 'anatomic', relatedOrganIds: ['org-thyroid'] },
  { radlexId: 'RID13006',name: 'Lung',            pinyin: 'f',  category: 'anatomic', relatedOrganIds: ['org-lung'] },
  { radlexId: 'RID13256',name: 'RUL Apical',      pinyin: 'yj', category: 'anatomic', relatedOrganIds: ['org-rul'] },
  { radlexId: 'RID4990', name: 'Heart',           pinyin: 'xz', category: 'anatomic', relatedOrganIds: ['org-heart'] },
  { radlexId: 'RID4989', name: 'Liver',           pinyin: 'gz', category: 'anatomic', relatedOrganIds: ['org-liver'] },
  { radlexId: 'RID5240', name: 'Pancreas',        pinyin: 'yx', category: 'anatomic', relatedOrganIds: ['org-pancreas'] },

  // 修饰词
  { radlexId: 'RID5761', name: 'Right',           pinyin: 'y',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5762', name: 'Left',            pinyin: 'z',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5815', name: 'Upper',           pinyin: 's',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5816', name: 'Lower',           pinyin: 'x',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5846', name: 'Middle',          pinyin: 'z',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5791', name: 'Proximal',        pinyin: 'j',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5793', name: 'Distal',          pinyin: 'y',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5758', name: 'Anterior',        pinyin: 'q',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5760', name: 'Posterior',       pinyin: 'h',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5764', name: 'Medial',          pinyin: 'n',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5763', name: 'Lateral',         pinyin: 'w',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5877', name: 'Increased',       pinyin: 'z',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5880', name: 'Decreased',       pinyin: 'j',  category: 'modifier', relatedOrganIds: [] },
  { radlexId: 'RID5663', name: 'Normal',          pinyin: 'zc', category: 'modifier', relatedOrganIds: [] },

  // 影像所见
  { radlexId: 'RID5599', name: 'Nodule',          pinyin: 'jj', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID3874', name: 'Mass',            pinyin: 'zk', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID4961', name: 'Lesion',          pinyin: 'bz', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5160', name: 'Opacity',         pinyin: 'md', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID3900', name: 'Cyst',            pinyin: 'nz', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID4857', name: 'Calcification',   pinyin: 'gh', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5711', name: 'Edema',           pinyin: 'sz', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID6043', name: 'Hemorrhage',      pinyin: 'cx', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5741', name: 'Stenosis',        pinyin: 'xz', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5707', name: 'Occlusion',       pinyin: 'bs', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5340', name: 'Fracture',        pinyin: 'gz', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5742', name: 'Effusion',        pinyin: 'jy', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID3886', name: 'Pneumothorax',    pinyin: 'qx', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5769', name: 'Enhancement',     pinyin: 'qh', category: 'finding', relatedOrganIds: [] },
  { radlexId: 'RID5913', name: 'Restriction of Diffusion', pinyin: 'msx', category: 'finding', relatedOrganIds: [] },
];

export const RADLEX_BY_ID: Record<string, RadLexMapping> = RADLEX_MAP.reduce((acc, m) => {
  acc[m.radlexId] = m;
  return acc;
}, {} as Record<string, RadLexMapping>);

export const RADLEX_TOTAL = RADLEX_MAP.length;
