// ============================================================
// G005 放射RIS系统 v2.1.0 - 报告批量种子生成器
// Phase R12 W10: 500 真实放射报告（演示数据）
// ============================================================

export interface SeedReport {
  id: string;
  patientId: string;
  patientName: string;
  modality: 'CT' | 'MR' | 'DR' | 'CR' | 'US' | 'MG' | 'PT' | 'XA' | 'NM';
  bodyPart: string;
  status: 'draft' | 'pending' | 'preliminary' | 'final' | 'amended' | 'cancelled';
  doctorId: string;
  doctorName: string;
  priority: 'routine' | 'urgent' | 'stat' | 'critical';
  clinicalHistory: string;
  findings: string;
  impression: string;
  recommendation: string;
  technique: string;
  isCritical: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  reviewedBy?: string;
  qualityScore: number;
  measurements: Array<{ name: string; value: string; unit: string }>;
}

// 真实姓名池（中文常见姓氏 + 名字）
const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '萧', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈', '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金', '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟', '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯', '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵', '万', '钱', '严', '覃', '武', '戴', '莫', '孔', '向', '汤'];
const GIVEN_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英', '文', '华', '建国', '红', '辉', '亮', '颖', '浩然', '梓涵', '欣怡', '宇轩', '紫萱', '俊豪', '思远', '婉儿', '梓琪', '雨欣', '晨曦', '嘉怡', '可馨', '雅婷', '俊熙'];

// 真实临床场景模板
const BODY_PARTS: Record<string, { parts: string[]; symptoms: string[]; findings: string[]; impressions: string[] }> = {
  chest: {
    parts: ['胸部', '肺', '纵隔', '胸膜', '心脏'],
    symptoms: ['咳嗽 2 周', '胸痛 3 天', '气短 1 月', '痰中带血', '体检发现结节', '发热伴胸痛', '随访肺结节'],
    findings: [
      '双肺纹理清晰，未见明显实质性病变',
      '右肺下叶见一类圆形结节影，大小约 12mm×10mm，边缘可见毛刺征',
      '左肺上叶尖后段见斑片状高密度影，边界欠清',
      '纵隔内见多发肿大淋巴结，最大者短径约 14mm',
      '双侧胸腔未见明显积液征象',
      '心脏大小形态正常，心包未见积液',
      '右肺中叶见磨玻璃密度结节，约 8mm×7mm',
      '双肺散在多发微小结节，直径 3-5mm',
    ],
    impressions: [
      '右肺下叶占位性病变，考虑周围型肺癌可能，建议穿刺活检',
      '左肺上叶炎症，建议抗炎后复查',
      '双肺多发结节，考虑转移瘤可能',
      '纵隔淋巴结肿大，性质待定',
      '未见明显异常',
      '右肺磨玻璃结节（Lung-RADS 3 类），建议 6 个月随访',
    ],
  },
  abdomen: {
    parts: ['肝脏', '胆囊', '胰腺', '脾脏', '肾脏', '肾上腺', '胃', '肠道'],
    symptoms: ['上腹痛 1 周', '黄疸 3 天', '体检发现肝占位', '食欲不振 1 月', '便血', '腹胀', 'B 超发现肾囊肿'],
    findings: [
      '肝脏大小形态正常，实质内见一类圆形低密度灶，直径约 25mm，增强扫描动脉期明显强化',
      '胆囊大小正常，壁不厚，腔内未见结石影',
      '胰腺形态正常，胰管未见扩张',
      '双肾形态对称，右肾见一囊性低密度灶，约 18mm×16mm',
      '脾脏不大，实质密度均匀',
      '胃壁未见明显增厚',
      '肝脏内见多发低密度灶，最大者位于右叶，约 35mm×30mm',
      '胆总管轻度扩张，内径约 9mm',
    ],
    impressions: [
      '肝右叶占位性病变，考虑肝细胞癌可能（LI-RADS 5 类）',
      '肝囊肿',
      '胆总管扩张，建议 MRCP 进一步检查',
      '右肾囊肿（简单型，Bosniak 1 类）',
      '未见明显异常',
      '肝脏多发占位，考虑转移瘤',
    ],
  },
  head: {
    parts: ['头颅', '脑实质', '颅骨', '鼻窦', '眼眶', '颞骨'],
    symptoms: ['头痛 1 周', '头晕伴呕吐', '外伤后复查', '脑梗后随访', '癫痫发作', '视力下降'],
    findings: [
      '脑实质未见明显异常密度灶',
      '右侧基底节区见片状低密度影，边界欠清',
      '颅骨骨质连续，未见骨折线',
      '鼻窦黏膜增厚，以上颌窦为著',
      '脑室系统未见扩张',
      '中线结构居中',
      '左侧颞叶见一类圆形稍高密度影，周围伴水肿带',
      '脑沟脑池未见明显增宽',
    ],
    impressions: [
      '右侧基底节区脑梗死（亚急性期可能）',
      '左侧颞叶占位性病变，周围水肿明显，建议增强扫描',
      '鼻窦炎',
      '未见明显急性异常',
      '脑萎缩',
    ],
  },
  msk: {
    parts: ['膝关节', '髋关节', '肩关节', '腰椎', '颈椎', '腕关节'],
    symptoms: ['膝关节疼痛 2 月', '外伤后疼痛', '腰椎间盘突出', '关节活动受限', '晨僵', '复查骨折'],
    findings: [
      '关节面光滑，关节间隙未见明显变窄',
      '半月板形态、信号未见明显异常',
      '前后交叉韧带走行连续，信号未见明显异常',
      'L4/5 椎间盘向后突出约 4mm，硬膜囊受压',
      '椎体边缘见骨质增生',
      '骨折线清晰可见，对位对线尚可',
      '关节腔内见少量积液信号',
    ],
    impressions: [
      'L4/5 椎间盘突出',
      '膝关节退行性变',
      '骨折愈合中',
      '未见明显异常',
    ],
  },
};

const DOCTORS = [
  { id: 'd001', name: '王明华' },
  { id: 'd002', name: '李建国' },
  { id: 'd003', name: '张丽娟' },
  { id: 'd004', name: '陈志强' },
  { id: 'd005', name: '刘晓燕' },
  { id: 'd006', name: '杨文博' },
  { id: 'd007', name: '黄海涛' },
  { id: 'd008', name: '赵雪梅' },
  { id: 'd009', name: '吴俊杰' },
  { id: 'd010', name: '周婷婷' },
  { id: 'd011', name: '徐振华' },
  { id: 'd012', name: '孙佳琪' },
];

// 种子化随机（保证可重现）
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(n: number, w: number): string {
  return String(n).padStart(w, '0');
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function genName(rng: () => number): string {
  return pick(SURNAMES, rng) + pick(GIVEN_NAMES, rng);
}

function genDate(rng: () => number, daysBack = 365): string {
  const now = Date.now();
  const offset = Math.floor(rng() * daysBack * 24 * 3600 * 1000);
  return new Date(now - offset).toISOString();
}

function genMRN(idx: number): string {
  return `MRN${pad(20240000 + idx, 8)}`;
}

export function generateReports(count = 500, seed = 42): SeedReport[] {
  const rng = mulberry32(seed);
  const regionKeys = Object.keys(BODY_PARTS);
  const reports: SeedReport[] = [];
  for (let i = 0; i < count; i++) {
    const region = pick(regionKeys, rng);
    const data = BODY_PARTS[region]!;
    const part = pick(data.parts, rng);
    const symptom = pick(data.symptoms, rng);
    const finding = pick(data.findings, rng);
    const impression = pick(data.impressions, rng);
    const doctor = pick(DOCTORS, rng);
    const modality = pick(['CT', 'MR', 'DR', 'US'] as const, rng);
    const priority = rng() < 0.05 ? 'critical' : rng() < 0.2 ? 'stat' : rng() < 0.4 ? 'urgent' : 'routine';
    const isCritical = priority === 'critical';
    const statusRoll = rng();
    let status: SeedReport['status'];
    if (statusRoll < 0.05) status = 'draft';
    else if (statusRoll < 0.15) status = 'pending';
    else if (statusRoll < 0.25) status = 'preliminary';
    else if (statusRoll < 0.92) status = 'final';
    else if (statusRoll < 0.97) status = 'amended';
    else status = 'cancelled';
    const isDraft = status === 'draft' || status === 'pending';
    const created = genDate(rng, 180);
    const updated = new Date(new Date(created).getTime() + Math.floor(rng() * 7 * 24 * 3600 * 1000)).toISOString();
    const qScore = Math.floor(60 + rng() * 40);
    const measurements: SeedReport['measurements'] = [];
    if (rng() < 0.4) {
      const dim = Math.floor(5 + rng() * 40);
      measurements.push({ name: '长径', value: dim.toFixed(1), unit: 'mm' });
      if (rng() < 0.5) {
        measurements.push({ name: '短径', value: (dim * (0.5 + rng() * 0.4)).toFixed(1), unit: 'mm' });
      }
    }
    if (rng() < 0.15) {
      measurements.push({ name: 'CT值', value: (20 + Math.floor(rng() * 60)).toString(), unit: 'HU' });
    }
    const rec = impression.includes('建议') ? '' : '建议临床随访，必要时进一步检查。';
    reports.push({
      id: `R${pad(20240000 + i, 8)}`,
      patientId: `P${pad(10000 + i, 6)}`,
      patientName: genName(rng),
      modality,
      bodyPart: part,
      status,
      doctorId: doctor.id,
      doctorName: doctor.name,
      priority: priority as SeedReport['priority'],
      clinicalHistory: symptom,
      findings: finding,
      impression: impression,
      recommendation: rec,
      technique: modality === 'CT' ? '平扫 + 增强' : modality === 'MR' ? 'T1WI + T2WI + DWI' : '常规',
      isCritical,
      isDraft,
      createdAt: created,
      updatedAt: updated,
      signedAt: !isDraft ? updated : undefined,
      reviewedBy: !isDraft && rng() < 0.6 ? pick(DOCTORS, rng).name : undefined,
      qualityScore: qScore,
      measurements,
    });
    void genMRN;
  }
  return reports;
}

// 统计助手
export function summarizeReports(reports: SeedReport[]) {
  const byStatus: Record<string, number> = {};
  const byModality: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byDoctor: Record<string, number> = {};
  let criticalCount = 0;
  for (const r of reports) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byModality[r.modality] = (byModality[r.modality] ?? 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;
    byDoctor[r.doctorName] = (byDoctor[r.doctorName] ?? 0) + 1;
    if (r.isCritical) criticalCount++;
  }
  return {
    total: reports.length,
    criticalCount,
    byStatus,
    byModality,
    byPriority,
    byDoctor,
    avgQuality: Math.round(reports.reduce((s, r) => s + r.qualityScore, 0) / reports.length),
  };
}
