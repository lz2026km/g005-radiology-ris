// [v3.0.6.8-97] Phase 5: AI 增强 (气道分析+骨龄+阻生齿风险)
// 对标: Planmeca AI + Dolphin 3D Airway

export const MOCK_AIRWAY_ANALYSIS = {
  studyId: 'CBCT-001',
  airwayVolume: 18500,               // mm³
  minCrossSectionalArea: 52.3,       // mm²
  minCSALocation: { x: 85, y: 120, z: 40 },
  avgCrossSectionalArea: 128.5,
  totalLength: 68.2,                  // mm
  retroglossalSpace: 8.5,
  retropalatalSpace: 6.2,
  tonsillarHypertrophy: false,
  apneicHypopneaIndex: 5.2,
  apneicRisk: 'moderate',             // 'low' | 'moderate' | 'high'
  osaSeverity: 'mild',                // 'normal' | 'mild' | 'moderate' | 'severe'
  recommendation: '建议睡眠呼吸监测，考虑口呼吸矫治',
  createdAt: new Date().toISOString(),
};

export const MOCK_BONE_AGE = {
  patientId: 'P100004',
  patientName: '赵雪',
  age: 9,
  gender: 'F',
  cvmStage: 'CS2',                    // Cervical Vertebral Maturation CS1-CS6
  cvmDescription: '加速生长期 - 最佳矫治时机',
  boneAgeYears: 9.5,
  boneAgeStatus: 'normal',             // 'advanced' | 'delayed' | 'normal'
  growthRemaining: 35,                 // %
  peakGrowthVelocity: '约 1.5 年内',
  recommendedWindow: '2-3 years',
  skeletalMaturity: 'pre-peak',
  handWristBoneAge: 9.2,
  createdAt: new Date().toISOString(),
};

export const MOCK_IMPACTED_RISK = {
  toothNo: 38,
  classification: 'mesioangular',     // 'mesioangular' | 'horizontal' | 'vertical' | 'distoangular' | 'transverse'
  impactionDepth: 'moderate',          // 'mild' | 'moderate' | 'deep'
  nerveRelation: 'superior',           // 'superior' | 'inferior' | 'buccal' | 'lingual' | 'contact'
  nerveDistance: 1.2,                  // mm
  nerveAtRisk: true,
  rootCurvature: 'normal',             // 'normal' | 'dilacerated' | 'curved'
  pericoronalRadiolucency: false,
  riskScore: 7,                        // 0-10
  riskLevel: 'high',                   // 'low' | 'moderate' | 'high'
  difficulty: 'moderate',              // 'easy' | 'moderate' | 'difficult'
  recommendations: [
    '术前 CBCT 三维评估',
    '建议转口腔颌面外科',
    '术后预防性抗生素',
  ],
  createdAt: new Date().toISOString(),
};

// AI 龋齿像素分割 (segmentation mask as polygon coordinates)
export const MOCK_SEGMENTATION_RESULT = {
  studyId: 'CBCT-001',
  detections: [
    { toothNo: 26, type: 'caries', surface: 'occlusal', confidence: 0.92, polygon: [[120,80],[130,75],[145,78],[150,90],[140,100],[125,95]], area: 45.2, severity: 'moderate' },
    { toothNo: 36, type: 'caries', surface: 'mesial', confidence: 0.85, polygon: [[280,140],[290,135],[305,138],[310,148],[300,155],[285,150]], area: 28.5, severity: 'incipient' },
    { toothNo: 16, type: 'caries', surface: 'distal', confidence: 0.78, polygon: [[180,200],[188,195],[200,198],[205,208],[195,212],[185,208]], area: 18.2, severity: 'incipient' },
  ],
  model: 'dental-unet-multiclass-v2.1',
};

// AI 颌骨囊性病变
export const MOCK_CYST_DETECTION = {
  studyId: 'CBCT-001',
  findings: [
    { region: '下颌骨体右侧', type: 'radiolucent', diagnosis: '含牙囊肿', probability: 0.88, size: { width: 15.2, height: 12.5, depth: 18.0 }, margin: 'sclerotic', unilocular: true, toothInvolved: 48, recommendation: '建议手术摘除' },
  ],
  model: 'cyst-detector-v1.2',
};

// AI 报告生成
export const MOCK_AI_REPORT_TEMPLATES = [
  { id: 'ai-tpl-1', name: 'CBCT 结构化报告 (种植)', sections: ['general','implantSite','nerveAnalysis','boneDensity','recommendation'] },
  { id: 'ai-tpl-2', name: '全景片报告 (正畸)', sections: ['general','cephalometric','archAnalysis','tmj','impaction'] },
  { id: 'ai-tpl-3', name: '根尖片报告 (牙体牙髓)', sections: ['general','caries','periapical','canal','restoration'] },
];
