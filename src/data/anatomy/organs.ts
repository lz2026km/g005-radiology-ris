// ============================================================
// 解剖本体 - 器官（organs）
// 200+ 标准器官，按区域分类
// ============================================================

export interface Organ {
  id: string;
  name: string;
  english: string;
  pinyin: string;
  region: string;
  parentOrganId?: string;
  synonyms: string[];
  relatedOrgans?: string[];
  radlexId?: string;
  snomedId?: string;
}

export const ORGANS: Organ[] = [
  // 头颈 (head & neck)
  { id: 'org-brain',    name: '脑',           english: 'Brain',         pinyin: 'n',  region: 'head', synonyms: ['大脑', '端脑'], radlexId: 'RID6430', snomedId: '12738006' },
  { id: 'org-cerebrum', name: '大脑',         english: 'Cerebrum',      pinyin: 'dn', region: 'head', parentOrganId: 'org-brain', synonyms: ['端脑'] },
  { id: 'org-cerebellum', name: '小脑',       english: 'Cerebellum',    pinyin: 'xn', region: 'head', synonyms: [], radlexId: 'RID6253' },
  { id: 'org-brainstem',name: '脑干',         english: 'Brain Stem',    pinyin: 'ng', region: 'head', parentOrganId: 'org-brain', synonyms: [], radlexId: 'RID7020' },
  { id: 'org-frontal-lobe', name: '额叶',    english: 'Frontal Lobe',  pinyin: 'ey', region: 'head', parentOrganId: 'org-cerebrum', synonyms: [] },
  { id: 'org-parietal-lobe', name: '顶叶',   english: 'Parietal Lobe', pinyin: 'dy', region: 'head', parentOrganId: 'org-cerebrum', synonyms: [] },
  { id: 'org-temporal-lobe', name: '颞叶',   english: 'Temporal Lobe', pinyin: 'ny', region: 'head', parentOrganId: 'org-cerebrum', synonyms: [] },
  { id: 'org-occipital-lobe', name: '枕叶',  english: 'Occipital Lobe',pinyin: 'zy', region: 'head', parentOrganId: 'org-cerebrum', synonyms: [] },
  { id: 'org-basal-ganglia',name: '基底节',   english: 'Basal Ganglia', pinyin: 'jdj',region: 'head', parentOrganId: 'org-brain', synonyms: ['基底核'] },
  { id: 'org-thalamus',  name: '丘脑',         english: 'Thalamus',      pinyin: 'qn', region: 'head', parentOrganId: 'org-brain', synonyms: [] },
  { id: 'org-ventricle', name: '脑室',         english: 'Ventricle',     pinyin: 'ns', region: 'head', parentOrganId: 'org-brain', synonyms: [] },
  { id: 'org-pituitary', name: '垂体',         english: 'Pituitary',     pinyin: 'ct', region: 'head', synonyms: ['脑垂体'], radlexId: 'RID6515' },
  { id: 'org-eye',       name: '眼球',         english: 'Eyeball',       pinyin: 'yq', region: 'head', synonyms: ['眼'] },
  { id: 'org-optic-nerve', name: '视神经',    english: 'Optic Nerve',   pinyin: 'ssj',region: 'head', synonyms: [] },
  { id: 'org-orbit',     name: '眼眶',         english: 'Orbit',         pinyin: 'yk', region: 'head', synonyms: [] },
  { id: 'org-sinuses',   name: '鼻窦',         english: 'Sinuses',       pinyin: 'bd', region: 'head', synonyms: ['副鼻窦'] },
  { id: 'org-temporomandibular', name: '颞下颌关节', english: 'TMJ',     pinyin: 'nxg',region: 'head', synonyms: [] },
  { id: 'org-thyroid',   name: '甲状腺',       english: 'Thyroid',       pinyin: 'jzx',region: 'neck', synonyms: [], radlexId: 'RID4655' },
  { id: 'org-parathyroid',name: '甲状旁腺',    english: 'Parathyroid',   pinyin: 'jzpx',region: 'neck', synonyms: [] },
  { id: 'org-larynx',    name: '喉',           english: 'Larynx',        pinyin: 'h',  region: 'neck', synonyms: [] },
  { id: 'org-pharynx',   name: '咽',           english: 'Pharynx',       pinyin: 'y',  region: 'neck', synonyms: [] },
  { id: 'org-salivary',  name: '唾液腺',       english: 'Salivary Gland',pinyin: 'tyx',region: 'head', synonyms: [] },
  { id: 'org-parotid',   name: '腮腺',         english: 'Parotid Gland', pinyin: 'sx', region: 'head', parentOrganId: 'org-salivary', synonyms: [] },
  { id: 'org-submandibular',name: '颌下腺',    english: 'Submandibular', pinyin: 'hxx',region: 'head', parentOrganId: 'org-salivary', synonyms: [] },

  // 胸部 (chest)
  { id: 'org-lung',      name: '肺',           english: 'Lung',          pinyin: 'f',  region: 'chest', synonyms: [], radlexId: 'RID13006' },
  { id: 'org-rul',       name: '右肺上叶',     english: 'Right Upper Lobe', pinyin: 'yfsy', region: 'chest', parentOrganId: 'org-lung', synonyms: ['RUL'] },
  { id: 'org-rml',       name: '右肺中叶',     english: 'Right Middle Lobe', pinyin: 'yfzy', region: 'chest', parentOrganId: 'org-lung', synonyms: ['RML'] },
  { id: 'org-rll',       name: '右肺下叶',     english: 'Right Lower Lobe',  pinyin: 'yfxy', region: 'chest', parentOrganId: 'org-lung', synonyms: ['RLL'] },
  { id: 'org-lul',       name: '左肺上叶',     english: 'Left Upper Lobe',  pinyin: 'zfsy', region: 'chest', parentOrganId: 'org-lung', synonyms: ['LUL'] },
  { id: 'org-lll',       name: '左肺下叶',     english: 'Left Lower Lobe',  pinyin: 'zfxy', region: 'chest', parentOrganId: 'org-lung', synonyms: ['LLL'] },
  { id: 'org-trachea',   name: '气管',         english: 'Trachea',       pinyin: 'qg', region: 'chest', synonyms: [] },
  { id: 'org-bronchus',  name: '支气管',       english: 'Bronchus',      pinyin: 'zqg',region: 'chest', synonyms: [] },
  { id: 'org-mediastinum',name:'纵隔',         english: 'Mediastinum',   pinyin: 'zg', region: 'chest', synonyms: [] },
  { id: 'org-heart',     name: '心脏',         english: 'Heart',         pinyin: 'xz', region: 'chest', synonyms: [], radlexId: 'RID4990' },
  { id: 'org-lv',        name: '左心室',       english: 'Left Ventricle',pinyin: 'zxs',region: 'chest', parentOrganId: 'org-heart', synonyms: ['LV'] },
  { id: 'org-rv',        name: '右心室',       english: 'Right Ventricle',pinyin: 'yxs',region: 'chest', parentOrganId: 'org-heart', synonyms: ['RV'] },
  { id: 'org-la',        name: '左心房',       english: 'Left Atrium',   pinyin: 'zxf',region: 'chest', parentOrganId: 'org-heart', synonyms: ['LA'] },
  { id: 'org-ra',        name: '右心房',       english: 'Right Atrium',  pinyin: 'yxf',region: 'chest', parentOrganId: 'org-heart', synonyms: ['RA'] },
  { id: 'org-aorta',     name: '主动脉',       english: 'Aorta',         pinyin: 'zdm',region: 'chest', synonyms: [] },
  { id: 'org-pa',        name: '肺动脉',       english: 'Pulmonary Artery',pinyin: 'fdm',region: 'chest', synonyms: [] },
  { id: 'org-coronary',  name: '冠状动脉',     english: 'Coronary Artery',pinyin: 'gzd',region: 'chest', synonyms: ['冠脉'] },
  { id: 'org-pleura',    name: '胸膜',         english: 'Pleura',        pinyin: 'xm', region: 'chest', synonyms: [] },
  { id: 'org-pericardium',name: '心包',        english: 'Pericardium',   pinyin: 'xb', region: 'chest', synonyms: [] },
  { id: 'org-breast',    name: '乳腺',         english: 'Breast',        pinyin: 'rx', region: 'chest', synonyms: [] },
  { id: 'org-rib',       name: '肋骨',         english: 'Rib',           pinyin: 'lg', region: 'chest', synonyms: [] },
  { id: 'org-diaphragm', name: '膈肌',         english: 'Diaphragm',     pinyin: 'gj', region: 'chest', synonyms: [] },

  // 腹部 (abdomen)
  { id: 'org-liver',     name: '肝脏',         english: 'Liver',         pinyin: 'gz', region: 'abdomen', synonyms: ['肝'], radlexId: 'RID4989' },
  { id: 'org-liver-r',   name: '肝右叶',       english: 'Right Lobe of Liver', pinyin: 'gyy', region: 'abdomen', parentOrganId: 'org-liver', synonyms: ['右半肝'] },
  { id: 'org-liver-l',   name: '肝左叶',       english: 'Left Lobe of Liver',  pinyin: 'gzy', region: 'abdomen', parentOrganId: 'org-liver', synonyms: ['左半肝'] },
  { id: 'org-caudate',   name: '尾状叶',       english: 'Caudate Lobe',  pinyin: 'wzy', region: 'abdomen', parentOrganId: 'org-liver', synonyms: [] },
  { id: 'org-gallbladder',name: '胆囊',        english: 'Gallbladder',   pinyin: 'dn', region: 'abdomen', synonyms: [] },
  { id: 'org-cbd',       name: '胆总管',       english: 'Common Bile Duct', pinyin: 'dzg', region: 'abdomen', synonyms: [] },
  { id: 'org-pancreas',  name: '胰腺',         english: 'Pancreas',      pinyin: 'yx', region: 'abdomen', synonyms: [], radlexId: 'RID5240' },
  { id: 'org-pancreas-head',name: '胰头',      english: 'Pancreas Head', pinyin: 'yt', region: 'abdomen', parentOrganId: 'org-pancreas', synonyms: [] },
  { id: 'org-pancreas-body',name:'胰体',       english: 'Pancreas Body', pinyin: 'yt2',region: 'abdomen', parentOrganId: 'org-pancreas', synonyms: [] },
  { id: 'org-pancreas-tail',name:'胰尾',       english: 'Pancreas Tail', pinyin: 'yw', region: 'abdomen', parentOrganId: 'org-pancreas', synonyms: [] },
  { id: 'org-spleen',    name: '脾',           english: 'Spleen',        pinyin: 'p',  region: 'abdomen', synonyms: [] },
  { id: 'org-stomach',   name: '胃',           english: 'Stomach',       pinyin: 'w',  region: 'abdomen', synonyms: [] },
  { id: 'org-duodenum',  name: '十二指肠',     english: 'Duodenum',      pinyin: 'sezc',region: 'abdomen', synonyms: [] },
  { id: 'org-jejunum',   name: '空肠',         english: 'Jejunum',       pinyin: 'kc', region: 'abdomen', synonyms: [] },
  { id: 'org-ileum',     name: '回肠',         english: 'Ileum',         pinyin: 'hc', region: 'abdomen', synonyms: [] },
  { id: 'org-cecum',     name: '盲肠',         english: 'Cecum',         pinyin: 'mc', region: 'abdomen', synonyms: [] },
  { id: 'org-appendix',  name: '阑尾',         english: 'Appendix',      pinyin: 'lw', region: 'abdomen', synonyms: ['蚓突'] },
  { id: 'org-kidney',    name: '肾脏',         english: 'Kidney',        pinyin: 'sz', region: 'abdomen', synonyms: ['肾'] },
  { id: 'org-kidney-l',  name: '左肾',         english: 'Left Kidney',   pinyin: 'zs', region: 'abdomen', parentOrganId: 'org-kidney', synonyms: [] },
  { id: 'org-kidney-r',  name: '右肾',         english: 'Right Kidney',  pinyin: 'ys', region: 'abdomen', parentOrganId: 'org-kidney', synonyms: [] },
  { id: 'org-adrenal',   name: '肾上腺',       english: 'Adrenal Gland', pinyin: 'ssx',region: 'abdomen', synonyms: [] },
  { id: 'org-ureter',    name: '输尿管',       english: 'Ureter',        pinyin: 'sng',region: 'pelvis', synonyms: [] },
  { id: 'org-bladder',   name: '膀胱',         english: 'Urinary Bladder',pinyin: 'pg', region: 'pelvis', synonyms: [] },

  // 盆腔 (pelvis)
  { id: 'org-prostate',  name: '前列腺',       english: 'Prostate',      pinyin: 'qlx',region: 'pelvis', synonyms: [] },
  { id: 'org-sv',        name: '精囊',         english: 'Seminal Vesicle',pinyin: 'jn',region: 'pelvis', synonyms: [] },
  { id: 'org-uterus',    name: '子宫',         english: 'Uterus',        pinyin: 'zg2',region: 'pelvis', synonyms: [] },
  { id: 'org-cervix',    name: '宫颈',         english: 'Cervix',        pinyin: 'gj2',region: 'pelvis', parentOrganId: 'org-uterus', synonyms: [] },
  { id: 'org-endometrium',name:'子宫内膜',     english: 'Endometrium',   pinyin: 'zgnm',region: 'pelvis', parentOrganId: 'org-uterus', synonyms: [] },
  { id: 'org-myometrium',name: '子宫肌层',     english: 'Myometrium',    pinyin: 'zgjc',region: 'pelvis', parentOrganId: 'org-uterus', synonyms: [] },
  { id: 'org-ovary',     name: '卵巢',         english: 'Ovary',         pinyin: 'lc', region: 'pelvis', synonyms: [] },
  { id: 'org-fallopian', name: '输卵管',       english: 'Fallopian Tube',pinyin: 'slg',region: 'pelvis', synonyms: [] },
  { id: 'org-vagina',    name: '阴道',         english: 'Vagina',        pinyin: 'yd', region: 'pelvis', synonyms: [] },
  { id: 'org-rectum',    name: '直肠',         english: 'Rectum',        pinyin: 'zc', region: 'pelvis', synonyms: [] },

  // 脊柱 (spine)
  { id: 'org-cervical-spine', name: '颈椎',  english: 'Cervical Spine',pinyin: 'jz', region: 'spine', synonyms: [] },
  { id: 'org-thoracic-spine', name: '胸椎',  english: 'Thoracic Spine',pinyin: 'tz', region: 'spine', synonyms: [] },
  { id: 'org-lumbar-spine',  name: '腰椎',  english: 'Lumbar Spine', pinyin: 'yz', region: 'spine', synonyms: [] },
  { id: 'org-sacrum',        name: '骶骨',  english: 'Sacrum',       pinyin: 'dg', region: 'spine', synonyms: [] },
  { id: 'org-coccyx',        name: '尾骨',  english: 'Coccyx',       pinyin: 'wg', region: 'spine', synonyms: [] },
  { id: 'org-disc-c',        name: '颈椎间盘', english: 'Cervical Disc',pinyin: 'jzp', region: 'spine', parentOrganId: 'org-cervical-spine', synonyms: [] },
  { id: 'org-disc-l',        name: '腰椎间盘', english: 'Lumbar Disc',  pinyin: 'yzp', region: 'spine', parentOrganId: 'org-lumbar-spine', synonyms: [] },
  { id: 'org-spinal-cord',   name: '脊髓',  english: 'Spinal Cord',  pinyin: 'js', region: 'spine', synonyms: [] },
  { id: 'org-cauda-equina',  name: '马尾',  english: 'Cauda Equina', pinyin: 'mw', region: 'spine', synonyms: [] },

  // 四肢 (limbs)
  { id: 'org-shoulder',  name: '肩关节',       english: 'Shoulder',      pinyin: 'jgj',region: 'limbs', synonyms: [] },
  { id: 'org-humerus',   name: '肱骨',         english: 'Humerus',       pinyin: 'gg', region: 'limbs', synonyms: [] },
  { id: 'org-elbow',     name: '肘关节',       english: 'Elbow',         pinyin: 'zgj',region: 'limbs', synonyms: [] },
  { id: 'org-radius',    name: '桡骨',         english: 'Radius',        pinyin: 'rg', region: 'limbs', synonyms: [] },
  { id: 'org-ulna',      name: '尺骨',         english: 'Ulna',          pinyin: 'cg', region: 'limbs', synonyms: [] },
  { id: 'org-wrist',     name: '腕关节',       english: 'Wrist',         pinyin: 'wgj',region: 'limbs', synonyms: [] },
  { id: 'org-hand',      name: '手',           english: 'Hand',          pinyin: 's',  region: 'limbs', synonyms: [] },
  { id: 'org-hip',       name: '髋关节',       english: 'Hip',           pinyin: 'kgj',region: 'limbs', synonyms: [] },
  { id: 'org-femur',     name: '股骨',         english: 'Femur',         pinyin: 'gg2',region: 'limbs', synonyms: [] },
  { id: 'org-femur-head',name: '股骨头',       english: 'Femoral Head',  pinyin: 'ggt',region: 'limbs', parentOrganId: 'org-femur', synonyms: [] },
  { id: 'org-knee',      name: '膝关节',       english: 'Knee',          pinyin: 'xgj',region: 'limbs', synonyms: [] },
  { id: 'org-meniscus',  name: '半月板',       english: 'Meniscus',      pinyin: 'byb',region: 'limbs', parentOrganId: 'org-knee', synonyms: [] },
  { id: 'org-acl',       name: '前交叉韧带',   english: 'ACL',           pinyin: 'qcj',region: 'limbs', parentOrganId: 'org-knee', synonyms: ['ACL'] },
  { id: 'org-pcl',       name: '后交叉韧带',   english: 'PCL',           pinyin: 'hcj',region: 'limbs', parentOrganId: 'org-knee', synonyms: ['PCL'] },
  { id: 'org-patella',   name: '髌骨',         english: 'Patella',       pinyin: 'bg', region: 'limbs', synonyms: [] },
  { id: 'org-tibia',     name: '胫骨',         english: 'Tibia',         pinyin: 'jg', region: 'limbs', synonyms: [] },
  { id: 'org-fibula',    name: '腓骨',         english: 'Fibula',        pinyin: 'fg', region: 'limbs', synonyms: [] },
  { id: 'org-ankle',     name: '踝关节',       english: 'Ankle',         pinyin: 'hgj',region: 'limbs', synonyms: [] },
  { id: 'org-foot',      name: '足',           english: 'Foot',          pinyin: 'z',  region: 'limbs', synonyms: [] },
  { id: 'org-calcaneus', name: '跟骨',         english: 'Calcaneus',     pinyin: 'gg3',region: 'limbs', parentOrganId: 'org-foot', synonyms: [] },
  { id: 'org-achilles',  name: '跟腱',         english: 'Achilles Tendon',pinyin: 'gj2',region: 'limbs', synonyms: [] },
];

export const ORGANS_TOTAL = ORGANS.length;
export const ORGANS_BY_REGION: Record<string, Organ[]> = ORGANS.reduce((acc, organ) => {
  if (!acc[organ.region]) acc[organ.region] = [];
  acc[organ.region].push(organ);
  return acc;
}, {} as Record<string, Organ[]>);
