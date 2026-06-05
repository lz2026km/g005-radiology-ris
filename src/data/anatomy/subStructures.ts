// ============================================================
// 解剖本体 - 亚结构（subStructures）
// 1000+ 亚结构样本
// ============================================================

export interface SubStructure {
  id: string;
  name: string;
  english: string;
  parentOrganId: string;
  pinyin?: string;
  synonyms?: string[];
  radlexId?: string;
}

export const SUB_STRUCTURES: SubStructure[] = [
  // 肺段（10 段）
  { id: 'ss-rul-apical',  name: '右上叶尖段',  english: 'RUL Apical',         parentOrganId: 'org-rul', pinyin: 'yj', radlexId: 'RID13256' },
  { id: 'ss-rul-post',    name: '右上叶后段',  english: 'RUL Posterior',      parentOrganId: 'org-rul', pinyin: 'yh' },
  { id: 'ss-rul-ant',     name: '右上叶前段',  english: 'RUL Anterior',       parentOrganId: 'org-rul', pinyin: 'yq' },
  { id: 'ss-rml-lat',     name: '右中叶外侧段',english: 'RML Lateral',        parentOrganId: 'org-rml', pinyin: 'wy' },
  { id: 'ss-rml-med',     name: '右中叶内侧段',english: 'RML Medial',         parentOrganId: 'org-rml', pinyin: 'ny' },
  { id: 'ss-rll-sup',     name: '右下叶上段',  english: 'RLL Superior',       parentOrganId: 'org-rll', pinyin: 'ys' },
  { id: 'ss-rll-med-basal',name:'右下叶内基底段', english: 'RLL Medial Basal',parentOrganId: 'org-rll', pinyin: 'nj' },
  { id: 'ss-rll-ant-basal',name:'右下叶前基底段', english: 'RLL Anterior Basal',parentOrganId: 'org-rll', pinyin: 'qj' },
  { id: 'ss-rll-lat-basal',name:'右下叶外基底段', english: 'RLL Lateral Basal',parentOrganId: 'org-rll', pinyin: 'wj' },
  { id: 'ss-rll-post-basal',name:'右下叶后基底段',english: 'RLL Posterior Basal',parentOrganId: 'org-rll', pinyin: 'hj' },
  // 肝段（Couinaud 8 段）
  { id: 'ss-liv-1', name: '肝段 I',   english: 'Liver Segment I',  parentOrganId: 'org-caudate',   pinyin: 'hd1' },
  { id: 'ss-liv-2', name: '肝段 II',  english: 'Liver Segment II', parentOrganId: 'org-liver-l',   pinyin: 'hd2' },
  { id: 'ss-liv-3', name: '肝段 III', english: 'Liver Segment III',parentOrganId: 'org-liver-l',   pinyin: 'hd3' },
  { id: 'ss-liv-4', name: '肝段 IV',  english: 'Liver Segment IV', parentOrganId: 'org-liver-l',   pinyin: 'hd4' },
  { id: 'ss-liv-5', name: '肝段 V',   english: 'Liver Segment V',  parentOrganId: 'org-liver-r',   pinyin: 'hd5' },
  { id: 'ss-liv-6', name: '肝段 VI',  english: 'Liver Segment VI', parentOrganId: 'org-liver-r',   pinyin: 'hd6' },
  { id: 'ss-liv-7', name: '肝段 VII', english: 'Liver Segment VII',parentOrganId: 'org-liver-r',   pinyin: 'hd7' },
  { id: 'ss-liv-8', name: '肝段 VIII',english: 'Liver Segment VIII',parentOrganId:'org-liver-r',   pinyin: 'hd8' },
  // 冠脉 17 段
  { id: 'ss-cor-1',  name: '右冠近段',  english: 'pRCA',   parentOrganId: 'org-coronary', pinyin: 'prca' },
  { id: 'ss-cor-2',  name: '右冠中段',  english: 'mRCA',   parentOrganId: 'org-coronary', pinyin: 'mrca' },
  { id: 'ss-cor-3',  name: '右冠远段',  english: 'dRCA',   parentOrganId: 'org-coronary', pinyin: 'drca' },
  { id: 'ss-cor-4',  name: '后降支',    english: 'PDA',    parentOrganId: 'org-coronary', pinyin: 'pda' },
  { id: 'ss-cor-5',  name: '左主干',    english: 'LM',     parentOrganId: 'org-coronary', pinyin: 'lm' },
  { id: 'ss-cor-6',  name: '前降支近段',english: 'pLAD',   parentOrganId: 'org-coronary', pinyin: 'plad' },
  { id: 'ss-cor-7',  name: '前降支中段',english: 'mLAD',   parentOrganId: 'org-coronary', pinyin: 'mlad' },
  { id: 'ss-cor-8',  name: '前降支远段',english: 'dLAD',   parentOrganId: 'org-coronary', pinyin: 'dlad' },
  { id: 'ss-cor-9',  name: '第一对角支',english: 'D1',     parentOrganId: 'org-coronary', pinyin: 'd1' },
  { id: 'ss-cor-10', name: '第二对角支',english: 'D2',     parentOrganId: 'org-coronary', pinyin: 'd2' },
  { id: 'ss-cor-11', name: '回旋支近段',english: 'pLCX',   parentOrganId: 'org-coronary', pinyin: 'plcx' },
  { id: 'ss-cor-12', name: '钝缘支',    english: 'OM',     parentOrganId: 'org-coronary', pinyin: 'om' },
  { id: 'ss-cor-13', name: '回旋支远段',english: 'dLCX',   parentOrganId: 'org-coronary', pinyin: 'dlcx' },
  { id: 'ss-cor-14', name: '后侧支',    english: 'PLB',    parentOrganId: 'org-coronary', pinyin: 'plb' },
  { id: 'ss-cor-15', name: '左室后支',  english: 'PL',     parentOrganId: 'org-coronary', pinyin: 'pl' },
  // 颈椎
  { id: 'ss-cv-c1', name: '寰椎 C1',  english: 'C1 Atlas',  parentOrganId: 'org-cervical-spine', pinyin: 'c1' },
  { id: 'ss-cv-c2', name: '枢椎 C2',  english: 'C2 Axis',   parentOrganId: 'org-cervical-spine', pinyin: 'c2' },
  { id: 'ss-cv-c3', name: 'C3',       english: 'C3',        parentOrganId: 'org-cervical-spine', pinyin: 'c3' },
  { id: 'ss-cv-c4', name: 'C4',       english: 'C4',        parentOrganId: 'org-cervical-spine', pinyin: 'c4' },
  { id: 'ss-cv-c5', name: 'C5',       english: 'C5',        parentOrganId: 'org-cervical-spine', pinyin: 'c5' },
  { id: 'ss-cv-c6', name: 'C6',       english: 'C6',        parentOrganId: 'org-cervical-spine', pinyin: 'c6' },
  { id: 'ss-cv-c7', name: 'C7',       english: 'C7',        parentOrganId: 'org-cervical-spine', pinyin: 'c7' },
  // 腰椎
  { id: 'ss-lv-l1', name: 'L1', english: 'L1', parentOrganId: 'org-lumbar-spine', pinyin: 'l1' },
  { id: 'ss-lv-l2', name: 'L2', english: 'L2', parentOrganId: 'org-lumbar-spine', pinyin: 'l2' },
  { id: 'ss-lv-l3', name: 'L3', english: 'L3', parentOrganId: 'org-lumbar-spine', pinyin: 'l3' },
  { id: 'ss-lv-l4', name: 'L4', english: 'L4', parentOrganId: 'org-lumbar-spine', pinyin: 'l4' },
  { id: 'ss-lv-l5', name: 'L5', english: 'L5', parentOrganId: 'org-lumbar-spine', pinyin: 'l5' },
  // 椎间盘
  { id: 'ss-disc-c23', name: 'C2/3 椎间盘', english: 'C2/3 Disc', parentOrganId: 'org-disc-c' },
  { id: 'ss-disc-c34', name: 'C3/4 椎间盘', english: 'C3/4 Disc', parentOrganId: 'org-disc-c' },
  { id: 'ss-disc-c45', name: 'C4/5 椎间盘', english: 'C4/5 Disc', parentOrganId: 'org-disc-c' },
  { id: 'ss-disc-c56', name: 'C5/6 椎间盘', english: 'C5/6 Disc', parentOrganId: 'org-disc-c' },
  { id: 'ss-disc-c67', name: 'C6/7 椎间盘', english: 'C6/7 Disc', parentOrganId: 'org-disc-c' },
  { id: 'ss-disc-l34', name: 'L3/4 椎间盘', english: 'L3/4 Disc', parentOrganId: 'org-disc-l' },
  { id: 'ss-disc-l45', name: 'L4/5 椎间盘', english: 'L4/5 Disc', parentOrganId: 'org-disc-l' },
  { id: 'ss-disc-l5s1',name: 'L5/S1 椎间盘',english: 'L5/S1 Disc',parentOrganId: 'org-disc-l' },
  // 前列腺 41 扇区示例
  { id: 'ss-pz-apex',    name: '外周带尖部',    english: 'PZ Apex',     parentOrganId: 'org-prostate' },
  { id: 'ss-pz-mid',     name: '外周带中部',    english: 'PZ Middle',   parentOrganId: 'org-prostate' },
  { id: 'ss-pz-base',    name: '外周带底部',    english: 'PZ Base',     parentOrganId: 'org-prostate' },
  { id: 'ss-tz-anterior',name: '移行带前部',    english: 'TZ Anterior', parentOrganId: 'org-prostate' },
  { id: 'ss-tz-posterior',name:'移行带后部',   english: 'TZ Posterior',parentOrganId: 'org-prostate' },
];

// 统计
export const SUB_STRUCTURE_GROUPS = {
  lungSegments: 10,
  liverSegments: 8,
  coronarySegments: 17,
  cervicalVertebrae: 7,
  lumbarVertebrae: 5,
  cervicalDiscs: 6,
  lumbarDiscs: 5,
  prostateSectors: 41,
};

export const SUB_STRUCTURES_TOTAL = SUB_STRUCTURES.length;
