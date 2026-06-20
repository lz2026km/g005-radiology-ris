import type {
  V4Report,
  V4PriorReport,
  V4SimilarCase,
  V4Collaborator,
  V4Draft,
} from "../types";

export const MOCK_REPORT: V4Report = {
  id: "rpt-038",
  patientId: "p-038",
  patientName: "张三",
  modality: "CT",
  bodyPart: "胸部",
  status: "draft",
  content: {
    findings:
      "双肺纹理清晰，肺野透光度正常。右肺上叶可见一大小约 15×12mm 的磨玻璃结节，边界尚清，无分叶及毛刺征。纵隔未见肿大淋巴结。心脏大小形态正常。胸膜无增厚，胸腔无积液。",
    impression: "右肺上叶磨玻璃结节，建议随访复查。",
    recommendation: "建议 3-6 个月后复查胸部 CT，观察结节变化。",
    images: [
      {
        id: "img-1",
        thumbnailUrl: "",
        description: "右肺上叶磨玻璃结节（轴位）",
        starred: true,
      },
      {
        id: "img-2",
        thumbnailUrl: "",
        description: "右肺上叶磨玻璃结节（冠状位）",
        starred: true,
      },
      { id: "img-3", thumbnailUrl: "", description: "纵隔窗", starred: false },
    ],
    wordCount: 128,
    charCount: 342,
    paragraphCount: 3,
  },
  structured: {
    templateId: "recist",
    fields: {
      lesionSite: { value: "右肺上叶" },
      lesionType: { value: "磨玻璃结节" },
      longDiameter: { value: 15, unit: "mm" },
      shortDiameter: { value: 12, unit: "mm" },
      margin: { value: "边界尚清" },
      spiculation: { value: "无" },
      pleuralIndentation: { value: "无" },
    },
    score: 85,
    checklist: [
      { id: "c1", label: "患者姓名与检查号匹配", passed: true },
      { id: "c2", label: "检查部位与申请单一致", passed: true },
      { id: "c3", label: "影像所见覆盖全部检查部位", passed: true },
      { id: "c4", label: "诊断意见与影像所见逻辑一致", passed: true },
      { id: "c5", label: "危急值已标注并通知临床", passed: true },
      { id: "c6", label: "术语符合 ICD 编码规范", passed: true },
      { id: "c7", label: "测量数据与图像一致", passed: true },
    ],
  },
  templateId: "Lung-RADS",
  version: 3,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 60000,
};

export const MOCK_PRIOR_REPORTS: V4PriorReport[] = [
  {
    id: "prior-1",
    reportId: "rpt-031",
    studyDate: "2024-06-15",
    findings: "双肺纹理清晰，未见明确结节及肿块。",
    impression: "胸部 CT 未见明显异常。",
    comparisonDelta: { summary: "新出现磨玻璃结节，需密切关注" },
  },
  {
    id: "prior-2",
    reportId: "rpt-025",
    studyDate: "2024-03-10",
    findings: "双肺纹理清晰，肺野透光度正常。",
    impression: "大致正常胸部 CT。",
  },
];

export const MOCK_SIMILAR_CASES: V4SimilarCase[] = [
  {
    id: "sim-1",
    reportId: "rpt-042",
    impression: "右肺上叶磨玻璃结节，大小 12×10mm，建议随访。",
    similarityScore: 0.92,
  },
  {
    id: "sim-2",
    reportId: "rpt-056",
    impression: "左肺下叶磨玻璃结节，边界清晰，无分叶毛刺。",
    similarityScore: 0.78,
  },
  {
    id: "sim-3",
    reportId: "rpt-071",
    impression: "右肺中叶磨玻璃密度影，建议增强扫描。",
    similarityScore: 0.65,
  },
];

export const MOCK_COLLABORATORS: V4Collaborator[] = [
  {
    name: "陈医师",
    role: "报告医师",
    status: "online",
    lastActive: "当前编辑",
  },
  {
    name: "王医师",
    role: "审核医师",
    status: "online",
    lastActive: "10 分钟前",
  },
  {
    name: "李主任",
    role: "终审医师",
    status: "offline",
    lastActive: "2 小时前",
  },
];

export const MOCK_DRAFTS: V4Draft[] = [
  {
    id: "draft-3",
    content: MOCK_REPORT.content,
    structured: MOCK_REPORT.structured,
    timestamp: Date.now() - 60000,
    versionLabel: "v3",
    autoSaved: true,
  },
  {
    id: "draft-2",
    content: { ...MOCK_REPORT.content, wordCount: 98 },
    structured: MOCK_REPORT.structured,
    timestamp: Date.now() - 1800000,
    versionLabel: "v2",
    autoSaved: true,
  },
  {
    id: "draft-1",
    content: {
      ...MOCK_REPORT.content,
      wordCount: 65,
      findings: "双肺纹理清晰。",
    },
    structured: { ...MOCK_REPORT.structured, score: 60 },
    timestamp: Date.now() - 3600000,
    versionLabel: "v1",
    autoSaved: false,
  },
];

export const SNIPPETS_DATA: Record<string, string[]> = {
  findings: [
    "双肺纹理清晰，肺野透光度正常。",
    "双肺未见明确实变、结节及肿块。",
    "气管及主支气管通畅，管壁未见增厚。",
    "纵隔未见肿大淋巴结。",
    "心脏大小形态正常。",
    "胸膜无增厚，胸腔无积液。",
    "右肺上叶可见一大小约 {{size}} 的 {{type}}，边界{{margin}}。",
    "左肺下叶可见片状高密度影，考虑炎症可能。",
    "双肺门结构清晰，无增大。",
  ],
  impression: [
    "胸部 CT 未见明显异常。",
    "右肺上叶磨玻璃结节，建议随访复查。",
    "左肺下叶炎症，建议抗炎治疗后复查。",
    "双肺多发小结节，建议定期随访。",
    "纵隔淋巴结增大，建议增强扫描进一步明确。",
    "考虑早期肺癌可能，建议穿刺活检。",
    "COPD 合并肺气肿表现。",
  ],
  recommendation: [
    "建议 3-6 个月后复查胸部 CT。",
    "建议增强 CT 扫描进一步评估。",
    "建议 PET-CT 检查。",
    "建议穿刺活检明确病理。",
    "建议抗炎治疗 2 周后复查。",
    "建议临床随访，如症状加重及时就诊。",
    "建议呼吸内科会诊。",
  ],
};
