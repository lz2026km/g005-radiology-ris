export type RcaStatus = 'open' | 'analyzing' | 'capa-planned' | 'implementing' | 'verified' | 'closed'

export interface FishboneCategory {
  category: string
  causes: string[]
  subCauses: { cause: string; details: string[] }[]
}

export interface FiveWhysAnalysis {
  problem: string
  whys: { level: number; question: string; answer: string }[]
  rootCause: string
}

export interface CapaPlan {
  id: string
  correctiveAction: string
  preventiveAction: string
  responsiblePerson: string
  deadline: string
  implementationStatus: 'pending' | 'in-progress' | 'completed'
  verificationMethod: string
  verifiedBy?: string
  verifiedAt?: string
  effectivenessRating?: number
}

export interface RcaInvestigation {
  id: string
  eventId: string
  eventTitle: string
  description: string
  dateOccurred: string
  dateInvestigationStarted: string
  status: RcaStatus
  teamMembers: string[]
  fishboneData: FishboneCategory[]
  fiveWhys: FiveWhysAnalysis[]
  rootCauses: string[]
  capaPlans: CapaPlan[]
  conclusion?: string
  lessonsLearned?: string
  closedAt?: string
  closedBy?: string
}

const MOCK_RCAS: RcaInvestigation[] = [
  {
    id: 'RCA-2025-001',
    eventId: 'AE-2025-001',
    eventTitle: '对比剂过敏反应事件',
    description: '患者CT增强扫描后出现中重度对比剂过敏反应',
    dateOccurred: '2025-06-01',
    dateInvestigationStarted: '2025-06-01',
    status: 'closed',
    teamMembers: ['李主任', '张护士长', '王医师', '赵质控员'],
    fishboneData: [
      { category: '人员', causes: ['过敏史询问不充分', '护士经验不足'], subCauses: [{ cause: '过敏史询问不充分', details: ['未使用标准化问询表', '患者表述不清未追问'] }, { cause: '护士经验不足', details: ['新入职护士', '对比剂过敏识别培训不足'] }] },
      { category: '流程', causes: ['术前评估流程不完善', '过敏史标记不醒目'], subCauses: [{ cause: '术前评估流程不完善', details: ['无强制过敏史确认步骤', '无对比剂过敏风险评估表'] }, { cause: '过敏史标记不醒目', details: ['HIS过敏史标记位置不明显', '系统无弹窗提醒'] }] },
      { category: '设备', causes: ['急救车位置偏远', '无自动对比剂预热装置'], subCauses: [{ cause: '急救车位置偏远', details: ['CT室距急救室50米'] }, { cause: '无自动对比剂预热装置', details: ['手动预热时间不可控'] }] },
      { category: '环境', causes: ['未分区留置观察', '高峰期人员拥挤'], subCauses: [{ cause: '未分区留置观察', details: ['增强扫描后无专用观察区'] }, { cause: '高峰期人员拥挤', details: ['上午9-11时患者集中', '护士人均负责患者过多'] }] },
    ],
    fiveWhys: [
      {
        problem: '患者增强扫描后出现对比剂过敏反应',
        whys: [
          { level: 1, question: '为什么发生过敏反应？', answer: '患者有海鲜过敏史未在扫描前确认' },
          { level: 2, question: '为什么过敏史未确认？', answer: '护士未按规程询问过敏史' },
          { level: 3, question: '为什么护士未按规程询问？', answer: '标准化问询流程未强制执行' },
          { level: 4, question: '为什么流程未强制执行？', answer: 'HIS系统无强制过敏史确认弹窗' },
          { level: 5, question: '为什么系统无强制弹窗？', answer: '过敏史确认未被纳入系统必填字段逻辑' },
        ],
        rootCause: '电子病历系统未将过敏史确认设置为必填校验字段，导致护士可跳过该步骤',
      },
    ],
    rootCauses: ['系统缺陷：HIS系统中过敏史确认非必填字段', '流程缺陷：对比剂使用前无标准风险评估表', '培训不足：新入职护士对比剂过敏识别培训不充分'],
    capaPlans: [
      { id: 'CAPA-001', correctiveAction: '立即修改HIS系统，将过敏史确认设置为必填字段', preventiveAction: '所有对比剂检查前必须完成过敏史电子确认签名', responsiblePerson: '信息科', deadline: '2025-06-15', implementationStatus: 'completed', verificationMethod: '系统上线后抽查100例确认100%完成', verifiedBy: '信息科主任', verifiedAt: '2025-06-14', effectivenessRating: 95 },
      { id: 'CAPA-002', correctiveAction: '制定对比剂使用风险评估表并嵌入工作流', preventiveAction: '每季度更新评估表内容，纳入新发现的风险因素', responsiblePerson: '质控办', deadline: '2025-06-20', implementationStatus: 'completed', verificationMethod: '随机抽查30份评估表填写完整性', verifiedBy: '质控办主任', verifiedAt: '2025-06-19', effectivenessRating: 90 },
      { id: 'CAPA-003', correctiveAction: '组织全体护士进行对比剂过敏识别与处理专题培训', preventiveAction: '新入职护士必须通过对比剂安全考核方可独立上岗', responsiblePerson: '护理部', deadline: '2025-06-25', implementationStatus: 'in-progress', verificationMethod: '培训后考核通过率≥95%', effectivenessRating: undefined },
    ],
    conclusion: '通过系统流程优化和人员培训，可有效降低对比剂过敏反应事件发生率',
    lessonsLearned: '信息系统的强制校验是防止人为疏忽的最后一道防线，应优先系统层面的防错设计',
    closedAt: '2025-06-30',
    closedBy: '李主任',
  },
  {
    id: 'RCA-2025-002',
    eventId: 'AE-2025-002',
    eventTitle: '患者身份识别错误事件',
    description: '两名同名患者检查项目调换',
    dateOccurred: '2025-06-03',
    dateInvestigationStarted: '2025-06-03',
    status: 'capa-planned',
    teamMembers: ['赵主任', '刘技师', '陈护士'],
    fishboneData: [
      { category: '人员', causes: ['技师未核对病历号', '患者应答确认不充分'], subCauses: [{ cause: '技师未核对病历号', details: ['仅核对姓名未核对病历号'] }, { cause: '患者应答确认不充分', details: ['患者未听清呼叫内容即应答'] }] },
      { category: '流程', causes: ['身份识别流程不规范', '同名患者无特殊标识'], subCauses: [{ cause: '身份识别流程不规范', details: ['无双人核对要求', '无身份证件核验步骤'] }, { cause: '同名患者无特殊标识', details: ['系统无同名患者自动提醒功能'] }] },
      { category: '环境', causes: ['候诊区嘈杂', '呼叫系统音量不足'], subCauses: [{ cause: '候诊区嘈杂', details: ['多个检查室同时叫号', '患者家属交谈声大'] }, { cause: '呼叫系统音量不足', details: ['扩音器老化', '候诊区面积大'] }] },
    ],
    fiveWhys: [
      {
        problem: '两名同名患者检查项目被调换',
        whys: [
          { level: 1, question: '为什么检查项目被调换？', answer: '技师叫号时未核对病历号' },
          { level: 2, question: '为什么未核对病历号？', answer: '日常习惯仅核对姓名' },
          { level: 3, question: '为什么养成仅核对姓名的习惯？', answer: '流程文件中未明确要求核对病历号' },
          { level: 4, question: '为什么流程文件未明确？', answer: '身份识别SOP未细致规定核对要素' },
          { level: 5, question: '为什么SOP未细致规定？', answer: 'SOP编写时未参考JCI患者安全目标关于身份识别的双标识要求' },
        ],
        rootCause: '身份识别标准操作流程未按照国际安全标准要求双标识核对',
      },
    ],
    rootCauses: ['流程缺陷：身份识别SOP仅要求核对姓名', '系统缺失：无同名患者自动提醒功能', '培训不足：技师对身份识别风险认识不足'],
    capaPlans: [
      { id: 'CAPA-004', correctiveAction: '修订身份识别SOP，要求核对姓名+病历号双标识', preventiveAction: '将双标识核对纳入科室月度质控检查项目', responsiblePerson: '赵主任', deadline: '2025-06-18', implementationStatus: 'in-progress', verificationMethod: 'SOP修订完成并培训到人', effectivenessRating: undefined },
      { id: 'CAPA-005', correctiveAction: '信息系统增加同名患者自动提醒', preventiveAction: '同名患者在登记时强制提醒技师', responsiblePerson: '信息科', deadline: '2025-07-01', implementationStatus: 'pending', verificationMethod: '系统功能测试通过后上线', effectivenessRating: undefined },
    ],
    conclusion: undefined,
    lessonsLearned: undefined,
  },
]

export function createRcaInvestigation(investigation: Omit<RcaInvestigation, 'id' | 'dateInvestigationStarted' | 'status'>): RcaInvestigation {
  const newRca: RcaInvestigation = {
    ...investigation,
    id: `RCA-${new Date().getFullYear()}-${String(MOCK_RCAS.length + 1).padStart(3, '0')}`,
    dateInvestigationStarted: new Date().toISOString().slice(0, 10),
    status: 'open',
  }
  MOCK_RCAS.unshift(newRca)
  return newRca
}

export function getRcaInvestigations(filters?: { status?: RcaStatus }): RcaInvestigation[] {
  let result = [...MOCK_RCAS]
  if (filters?.status) result = result.filter(r => r.status === filters.status)
  return result
}

export function performFiveWhys(rcaId: string, analysis: FiveWhysAnalysis): RcaInvestigation | undefined {
  const rca = MOCK_RCAS.find(r => r.id === rcaId)
  if (!rca) return undefined
  rca.fiveWhys.push(analysis)
  if (rca.status === 'open') rca.status = 'analyzing'
  return rca
}

export function generateFishboneData(rcaId: string, categories: FishboneCategory[]): RcaInvestigation | undefined {
  const rca = MOCK_RCAS.find(r => r.id === rcaId)
  if (!rca) return undefined
  rca.fishboneData = categories
  return rca
}

export function createCapaPlan(rcaId: string, plan: Omit<CapaPlan, 'id'>): RcaInvestigation | undefined {
  const rca = MOCK_RCAS.find(r => r.id === rcaId)
  if (!rca) return undefined
  const newPlan: CapaPlan = { ...plan, id: `CAPA-${String(rca.capaPlans.length + 1).padStart(3, '0')}` }
  rca.capaPlans.push(newPlan)
  rca.status = 'capa-planned'
  return rca
}

export function closeRca(rcaId: string, closedBy: string, conclusion: string, lessonsLearned: string): RcaInvestigation | undefined {
  const rca = MOCK_RCAS.find(r => r.id === rcaId)
  if (!rca) return undefined
  rca.status = 'closed'
  rca.closedBy = closedBy
  rca.closedAt = new Date().toISOString()
  rca.conclusion = conclusion
  rca.lessonsLearned = lessonsLearned
  return rca
}
