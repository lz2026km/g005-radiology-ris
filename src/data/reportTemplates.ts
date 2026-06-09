/**
 * G005 放射RIS系统 v3.0.2 - 报告模板数据(30+ 模板)
 * 对标:东软 / 创业 / 岱嘉
 * 分类:CT(8) / MR(6) / DR(4) / US(3) / MG(2) / DSA(2) / 危急值(5)
 */
export type TemplateCategory = 'CT' | 'MR' | 'DR' | 'US' | 'MG' | 'DSA' | 'CRITICAL' | 'CUSTOM'

export interface ReportTemplate {
  id: string
  name: string
  category: TemplateCategory
  bodyPart: string
  description: string
  /** 模板主体(支持宏 {{var}}) */
  body: string
  /** 父模板 id(用于继承) */
  parentId?: string
  /** 版本号 */
  version: number
  /** 创建人 */
  createdBy: string
  createdAt: string
  /** 标签 */
  tags: string[]
  /** RADS 类别(可选) */
  radsCategory?: string
}

const CT_HEAD = '双肺纹理清晰,未见明显异常密度影。气管支气管通畅。'
const CT_HEAD_LUNG = '左肺上叶前段见磨玻璃密度影,边界欠清,直径约 12mm,周围伴少许实变。'
const CT_HEAD_LIVER = '肝脏形态、大小正常,平扫及增强各期未见异常密度灶。胆囊大小正常,壁不厚。'
const CT_HEAD_CHEST_PLEURAL = '右侧胸腔见弧形液性密度影,上缘低于肺门水平,提示中等量胸腔积液。'
const CT_HEAD_CORONARY = '冠状动脉左前降支中段见非钙化斑块,管腔狭窄约 50%。'
const CT_HEAD_BRAIN = '双侧大脑半球对称,灰白质对比正常。脑室、脑池、脑沟未见扩大、变窄。中线结构居中。'
const CT_HEAD_STROKE = '右侧大脑中动脉供血区见片状低密度影,边界欠清,符合超急性期脑梗死改变。'
const CT_HEAD_PNEUMOTHORAX = '右侧胸腔见无肺纹理透亮区,肺组织压缩约 30%,提示少量气胸。'
const MR_HEAD_BRAIN = '双侧大脑半球对称,脑实质未见异常信号,DWI 未见扩散受限高信号。'
const MR_HEAD_SPINE = '腰椎序列整齐,L4/5 椎间盘向后突出约 4mm,硬膜囊受压。'
const MR_HEAD_KNEE = '右膝关节内侧半月板后角见线状高信号达关节面,符合 3 度损伤。'
const MR_HEAD_BREAST = '双侧乳腺腺体呈混合型,右乳外上象限见结节状强化灶,大小约 1.2×1.0cm,边缘毛刺。'
const MR_HEAD_CARDIAC = '左心室壁厚度正常,室壁运动协调,射血分数约 58%。'
const MR_HEAD_LIVER = '肝右叶见类圆形长 T1 长 T2 信号灶,直径约 1.8cm,增强动脉期明显强化,门脉期廓清。'
const DR_HEAD_CHEST = '双肺纹理清晰,肺门影不大。心影大小、形态正常。纵隔居中,气管居中。'
const DR_HEAD_FRACTURE = '右桡骨远端见横行骨折线,断端轻度移位,周围软组织稍肿胀。'
const DR_HEAD_PNEUMONIA = '右下肺见片状渗出影,边界欠清,提示炎症。'
const DR_HEAD_PNEUMOTHORAX_XR = '右侧胸腔见无肺纹理透亮区,提示气胸(胸部 X 线)。'
const US_HEAD_ABDOMEN = '肝脏大小形态正常,包膜光整,实质回声均匀,未见占位。'
const US_HEAD_THYROID = '甲状腺右叶下极见低回声结节,大小约 0.8×0.6cm,边界欠清,内见点状强回声。'
const US_HEAD_OBSTETRIC = '宫内见单胎,胎心搏动规律,头臀长符合孕周。'
const MG_HEAD_CAL = '左乳外上象限见簇状细小多形性钙化灶,范围约 1.5cm,BI-RADS 4B。'
const MG_HEAD_NORM = '双侧乳腺未见明确肿块及恶性钙化。'
const DSA_HEAD_CEREBRAL = '右侧颈内动脉 C5 段见 90% 狭窄,远端血流通过 Willis 环代偿。'
const DSA_HEAD_CORONARY = '右冠状动脉中段 99% 狭窄,远端 TIMI 血流 3 级。'
const CV_CRITICAL_PTX = '双侧张力性气胸,肺组织压缩 > 50%,需立即胸腔穿刺引流。'
const CV_CRITICAL_DISSECTION = '升主动脉见内膜片,真腔与假腔并存,Stanford A 型,建议立即外科会诊。'
const CV_CRITICAL_STROKE = '大面积脑梗死,范围超一个脑叶,需立即神经内科溶栓会诊。'
const CV_CRITICAL_MI = '冠脉 CTA 示 LAD 闭塞,考虑急性 ST 段抬高型心肌梗死,需立即心内科 PCI。'
const CV_CRITICAL_OBSTRUCTION = '肠系膜上动脉主干闭塞,肠壁增厚伴强化减低,提示肠系膜栓塞,需立即外科手术探查。'

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // CT 8
  { id: 't-ct-chest', name: '胸部 CT 平扫(常规)', category: 'CT', bodyPart: 'CHEST', description: '胸部 CT 平扫常规所见与结论', body: `检查所见:${CT_HEAD}\n\n检查结论:胸部 CT 平扫未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['常规', '胸部'] },
  { id: 't-ct-chest-lung', name: '肺结节 CT 报告', category: 'CT', bodyPart: 'CHEST', description: '肺结节发现与随访建议模板', body: `检查所见:${CT_HEAD_LUNG}\n\n检查结论:左肺上叶前段磨玻璃结节,建议 3 个月后低剂量 CT 复查。\n\nRADS 分级:可疑恶性,建议多学科会诊(MDT)。`, radsCategory: 'LUNG-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['肺结节', '随访'] },
  { id: 't-ct-abdomen', name: '腹部 CT 平扫', category: 'CT', bodyPart: 'ABDOMEN', description: '肝胆胰脾肾 CT 平扫', body: `检查所见:${CT_HEAD_LIVER}\n\n检查结论:腹部 CT 平扫未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['腹部', '常规'] },
  { id: 't-ct-chest-pleural', name: '胸腔积液 CT 评估', category: 'CT', bodyPart: 'CHEST', description: '胸腔积液定量与定位', body: `检查所见:${CT_HEAD_CHEST_PLEURAL}\n\n检查结论:右侧中等量胸腔积液,建议超声定位后胸腔穿刺引流。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['胸腔积液'] },
  { id: 't-ct-coronary', name: '冠脉 CTA', category: 'CT', bodyPart: 'CHEST', description: '冠状动脉 CTA 评估与狭窄分级', body: `检查所见:${CT_HEAD_CORONARY}\n\n检查结论:LAD 中段轻度狭窄(< 50%),建议控制危险因素并定期复查。\n\nCAD-RADS 分级:2 级(轻度狭窄 25-49%)。`, radsCategory: 'CAD-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['冠脉', 'CTA'] },
  { id: 't-ct-brain', name: '头颅 CT 平扫(常规)', category: 'CT', bodyPart: 'BRAIN', description: '常规头颅 CT', body: `检查所见:${CT_HEAD_BRAIN}\n\n检查结论:头颅 CT 平扫未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['头颅', '常规'] },
  { id: 't-ct-stroke', name: '急性脑梗死 CT 评估', category: 'CT', bodyPart: 'BRAIN', description: '超急性期脑梗死 CT 征象', body: `检查所见:${CT_HEAD_STROKE}\n\n检查结论:右侧大脑中动脉供血区脑梗死(超急性期),建议立即神经内科会诊,评估静脉溶栓或动脉取栓。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['脑梗死', '危急'] },
  { id: 't-ct-pneumothorax', name: '气胸 CT 评估', category: 'CT', bodyPart: 'CHEST', description: '气胸定量与处理建议', body: `检查所见:${CT_HEAD_PNEUMOTHORAX}\n\n检查结论:右侧少量气胸(肺压缩约 30%),建议卧床休息、吸氧,1 周后复查 CT。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['气胸'] },

  // MR 6
  { id: 't-mr-brain', name: '头颅 MR 平扫(常规)', category: 'MR', bodyPart: 'BRAIN', description: '常规头颅 MR', body: `检查所见:${MR_HEAD_BRAIN}\n\n检查结论:头颅 MR 平扫未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['头颅', '常规'] },
  { id: 't-mr-spine', name: '腰椎 MR 平扫', category: 'MR', bodyPart: 'SPINE', description: '腰椎间盘评估', body: `检查所见:${MR_HEAD_SPINE}\n\n检查结论:L4/5 椎间盘膨出伴突出,建议避免久坐、加强腰背肌锻炼,必要时骨科会诊。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['腰椎', '椎间盘'] },
  { id: 't-mr-knee', name: '膝关节 MR 平扫', category: 'MR', bodyPart: 'KNEE', description: '半月板与韧带评估', body: `检查所见:${MR_HEAD_KNEE}\n\n检查结论:右膝内侧半月板 3 度损伤,建议关节镜手术治疗。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['膝关节', '半月板'] },
  { id: 't-mr-breast', name: '乳腺 MR 增强', category: 'MR', bodyPart: 'BREAST', description: '乳腺病灶 MR 增强评估', body: `检查所见:${MR_HEAD_BREAST}\n\nBI-RADS 分级:4C — 高度可疑恶性,建议穿刺活检。`, radsCategory: 'BI-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['乳腺', '增强'] },
  { id: 't-mr-cardiac', name: '心脏 MR 评估', category: 'MR', bodyPart: 'HEART', description: '心功能与心肌评估', body: `检查所见:${MR_HEAD_CARDIAC}\n\n检查结论:左心功能正常范围,射血分数约 58%。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['心脏', '心功能'] },
  { id: 't-mr-liver', name: '肝胆 MR 增强', category: 'MR', bodyPart: 'ABDOMEN', description: '肝脏占位 MR 评估', body: `检查所见:${MR_HEAD_LIVER}\n\nLI-RADS 分级:LR-4 — 高度可疑 HCC,建议多学科会诊。`, radsCategory: 'LI-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['肝脏', '增强'] },

  // DR 4
  { id: 't-dr-chest', name: '胸部 DR 正侧位', category: 'DR', bodyPart: 'CHEST', description: '常规胸部 X 线', body: `检查所见:${DR_HEAD_CHEST}\n\n检查结论:胸部 DR 正侧位未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['胸部', '常规'] },
  { id: 't-dr-fracture', name: '骨折 DR 评估', category: 'DR', bodyPart: 'EXTREMITY', description: '四肢骨折 X 线', body: `检查所见:${DR_HEAD_FRACTURE}\n\n检查结论:右桡骨远端骨折(Colles 骨折),建议骨科就诊,手法复位石膏固定。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['骨折'] },
  { id: 't-dr-pneumonia', name: '肺炎 DR 评估', category: 'DR', bodyPart: 'CHEST', description: '社区获得性肺炎 X 线', body: `检查所见:${DR_HEAD_PNEUMONIA}\n\n检查结论:右下肺炎,建议抗感染治疗 1-2 周后复查。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['肺炎', '感染'] },
  { id: 't-dr-pneumothorax', name: '气胸 DR 评估', category: 'DR', bodyPart: 'CHEST', description: '胸部 X 线气胸', body: `检查所见:${DR_HEAD_PNEUMOTHORAX_XR}\n\n检查结论:右侧气胸(肺压缩约 30%),建议胸外科会诊。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['气胸'] },

  // US 3
  { id: 't-us-abdomen', name: '腹部 US 常规', category: 'US', bodyPart: 'ABDOMEN', description: '肝胆胰脾肾超声', body: `检查所见:${US_HEAD_ABDOMEN}\n\n检查结论:腹部 US 常规未见明显异常。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['腹部', '常规'] },
  { id: 't-us-thyroid', name: '甲状腺 US + TI-RADS', category: 'US', bodyPart: 'THYROID', description: '甲状腺结节 TI-RADS 评估', body: `检查所见:${US_HEAD_THYROID}\n\nTI-RADS 分级:4 — 中度可疑,建议细针穿刺活检(FNA)。`, radsCategory: 'TI-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['甲状腺'] },
  { id: 't-us-obstetric', name: '产科 US 常规', category: 'US', bodyPart: 'PELVIS', description: '孕中期产科超声', body: `检查所见:${US_HEAD_OBSTETRIC}\n\n检查结论:宫内单活胎,超声孕周与停经孕周相符,建议定期产检。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['产科', '孕检'] },

  // MG 2
  { id: 't-mg-cal', name: '乳腺钼靶 + BI-RADS', category: 'MG', bodyPart: 'BREAST', description: '乳腺钙化 BI-RADS 评估', body: `检查所见:${MG_HEAD_CAL}\n\nBI-RADS 分级:4B — 中度可疑恶性,建议立体定位穿刺活检。`, radsCategory: 'BI-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['乳腺', '钙化'] },
  { id: 't-mg-norm', name: '乳腺钼靶(常规筛查)', category: 'MG', bodyPart: 'BREAST', description: '乳腺常规筛查', body: `检查所见:${MG_HEAD_NORM}\n\nBI-RADS 分级:1 — 阴性,建议 1 年后常规筛查。`, radsCategory: 'BI-RADS', version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['乳腺', '筛查'] },

  // DSA 2
  { id: 't-dsa-cerebral', name: '脑血管造影(DSA)', category: 'DSA', bodyPart: 'BRAIN', description: '脑血管造影评估', body: `检查所见:${DSA_HEAD_CEREBRAL}\n\n检查结论:右侧颈内动脉 C5 段重度狭窄,符合血管内介入治疗指征。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['脑血管', 'DSA'] },
  { id: 't-dsa-coronary', name: '冠脉造影', category: 'DSA', bodyPart: 'CHEST', description: '冠脉造影评估', body: `检查所见:${DSA_HEAD_CORONARY}\n\n检查结论:RCA 中段次全闭塞,建议 PCI 介入治疗。`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['冠脉', 'DSA'] },

  // 危急值 5
  { id: 't-cv-ptx', name: '危急值:张力性气胸', category: 'CRITICAL', bodyPart: 'CHEST', description: '张力性气胸危急值', body: `⚠️ 危急值 ⚠️\n\n${CV_CRITICAL_PTX}\n\n请立即电话通知临床科室:${'{{report.notifyTo}}'}`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['危急值', '气胸'] },
  { id: 't-cv-dissection', name: '危急值:主动脉夹层', category: 'CRITICAL', bodyPart: 'CHEST', description: 'Stanford A 型主动脉夹层', body: `⚠️ 危急值 ⚠️\n\n${CV_CRITICAL_DISSECTION}\n\n请立即电话通知心外科:${'{{report.notifyTo}}'}`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['危急值', '主动脉夹层'] },
  { id: 't-cv-stroke', name: '危急值:大面积脑梗死', category: 'CRITICAL', bodyPart: 'BRAIN', description: '大面积脑梗死', body: `⚠️ 危急值 ⚠️\n\n${CV_CRITICAL_STROKE}\n\n请立即电话通知神经内科:${'{{report.notifyTo}}'}`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['危急值', '脑梗死'] },
  { id: 't-cv-mi', name: '危急值:急性心肌梗死', category: 'CRITICAL', bodyPart: 'CHEST', description: 'STEMI 危急值', body: `⚠️ 危急值 ⚠️\n\n${CV_CRITICAL_MI}\n\n请立即电话通知心内科:${'{{report.notifyTo}}'}`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['危急值', '心梗'] },
  { id: 't-cv-obstruction', name: '危急值:肠系膜栓塞', category: 'CRITICAL', bodyPart: 'ABDOMEN', description: '急性肠系膜上动脉栓塞', body: `⚠️ 危急值 ⚠️\n\n${CV_CRITICAL_OBSTRUCTION}\n\n请立即电话通知普外科:${'{{report.notifyTo}}'}`, version: 1, createdBy: '系统', createdAt: '2026-01-01', tags: ['危急值', '肠系膜'] },
]

/** 模板继承示例:CT 胸部常规 + 增强(从 t-ct-chest 继承) */
export const TEMPLATE_INHERITANCE_EXAMPLE: ReportTemplate = {
  id: 't-ct-chest-enhanced',
  name: '胸部 CT 增强(继承常规)',
  category: 'CT',
  bodyPart: 'CHEST',
  description: '在常规 CT 胸部模板基础上增加增强扫描所见与结论',
  body: `{{extends: t-ct-chest}}\n\n增强所见:纵隔内未见肿大淋巴结。心脏大血管增强均匀。胸膜未见增厚及结节。\n\n增强结论:胸部增强 CT 未见明显异常。`,
  parentId: 't-ct-chest',
  version: 1,
  createdBy: '系统',
  createdAt: '2026-01-15',
  tags: ['胸部', '增强', '继承'],
}

REPORT_TEMPLATES.push(TEMPLATE_INHERITANCE_EXAMPLE)

export const listTemplates = (filter?: { category?: TemplateCategory; bodyPart?: string; keyword?: string }) => {
  let r = REPORT_TEMPLATES
  if (filter?.category) r = r.filter((t) => t.category === filter.category)
  if (filter?.bodyPart) r = r.filter((t) => t.bodyPart === filter.bodyPart)
  if (filter?.keyword) {
    const q = filter.keyword.toLowerCase()
    r = r.filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)))
  }
  return r
}

export const findTemplate = (id: string): ReportTemplate | undefined => REPORT_TEMPLATES.find((t) => t.id === id)

/** 获取模板继承链(从子到根) */
export const getInheritanceChain = (id: string): ReportTemplate[] => {
  const chain: ReportTemplate[] = []
  let t = findTemplate(id)
  while (t) {
    chain.push(t)
    t = t.parentId ? findTemplate(t.parentId) : undefined
  }
  return chain
}
