export type CqiStatus = 'planning' | 'active' | 'sustaining' | 'closed'

export interface CqiIndicator {
  name: string
  currentValue: number
  baselineValue: number
  targetValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

export interface PdsaCycle {
  cycle: number
  plan: string
  do_: string
  study: string
  act: string
  startDate: string
  endDate: string
  outcome: string
  success: boolean
}

export interface CqiProject {
  id: string
  title: string
  description: string
  aim: string
  indicators: CqiIndicator[]
  pdsaCycles: PdsaCycle[]
  status: CqiStatus
  sponsor: string
  teamMembers: string[]
  startDate: string
  targetEndDate: string
  closedAt?: string
  lessonsLearned?: string
  sustainabilityPlan?: string
}

const MOCK_CQI_PROJECTS: CqiProject[] = [
  {
    id: 'CQI-001',
    title: '降低CT增强检查对比剂外渗率',
    description: '通过流程优化和人员培训，将对比剂外渗率降低50%',
    aim: '在6个月内将对比剂外渗率从3.2%降至1.6%以下',
    indicators: [
      { name: '对比剂外渗率', currentValue: 1.8, baselineValue: 3.2, targetValue: 1.6, unit: '%', trend: 'down', lastUpdated: '2025-06-01' },
      { name: '高压注射器正确使用率', currentValue: 95, baselineValue: 82, targetValue: 98, unit: '%', trend: 'up', lastUpdated: '2025-06-01' },
      { name: '对比剂外渗处理规范执行率', currentValue: 100, baselineValue: 75, targetValue: 100, unit: '%', trend: 'up', lastUpdated: '2025-06-01' },
    ],
    pdsaCycles: [
      {
        cycle: 1,
        plan: '分析外渗原因，制定标准化操作流程',
        do_: '收集3个月外渗数据，开展根因分析，制定SOP草案',
        study: '外渗主要原因为穿刺技术不当和注射流速设置过高',
        act: '修订SOP，增加穿刺后回血确认步骤，降低初始流速',
        startDate: '2025-01-10',
        endDate: '2025-02-28',
        outcome: '外渗率降至2.5%',
        success: true,
      },
      {
        cycle: 2,
        plan: '开展全员培训和模拟演练',
        do_: '组织4次专题培训，包含理论考核和实操演练',
        study: '培训后考核通过率98%，但部分高年资护士存在惯性操作',
        act: '建立月度技能复训机制，将SOP执行纳入绩效考核',
        startDate: '2025-03-01',
        endDate: '2025-04-15',
        outcome: '外渗率降至2.1%',
        success: true,
      },
      {
        cycle: 3,
        plan: '引入智能外渗监测系统',
        do_: '与设备科协调，在3台CT高压注射器上加装外渗监测装置',
        study: '监测系统对外渗预警灵敏度达95%，显著减少了严重外渗',
        act: '推广至全部CT设备，建立外渗事件24小时上报制度',
        startDate: '2025-04-20',
        endDate: '2025-06-01',
        outcome: '外渗率降至1.8%，达到阶段性目标',
        success: true,
      },
    ],
    status: 'active',
    sponsor: '李主任',
    teamMembers: ['张护士长', '王医师', '赵质控员', '刘设备工程师'],
    startDate: '2025-01-10',
    targetEndDate: '2025-07-10',
    sustainabilityPlan: '每月监测外渗率，季度回顾SOP执行情况，半年更新一次培训材料',
  },
  {
    id: 'CQI-002',
    title: '缩短门诊CT检查报告出具时间',
    description: '优化报告流程，将门诊CT报告出具时间从平均4小时缩短至2小时内',
    aim: '在3个月内将门诊CT平扫报告出具时间缩短50%',
    indicators: [
      { name: '平均报告出具时间', currentValue: 2.5, baselineValue: 4.0, targetValue: 2.0, unit: '小时', trend: 'down', lastUpdated: '2025-06-01' },
      { name: '2小时内完成率', currentValue: 68, baselineValue: 42, targetValue: 85, unit: '%', trend: 'up', lastUpdated: '2025-06-01' },
      { name: '报告质量评分', currentValue: 92, baselineValue: 88, targetValue: 95, unit: '分', trend: 'up', lastUpdated: '2025-06-01' },
    ],
    pdsaCycles: [
      {
        cycle: 1,
        plan: '优化报告优先级分配',
        do_: '实施门诊CT报告优先级标签，分配专职医生优先处理',
        study: '平均时间从4小时降至3.2小时，但下午时段仍有积压',
        act: '增加下午班次报告医生人力，设置弹性排班',
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        outcome: '平均时间降至3.0小时',
        success: true,
      },
      {
        cycle: 2,
        plan: '引入AI辅助报告系统',
        do_: '部署CT平扫AI辅助排阴功能，正常报告自动生成模板',
        study: 'AI辅助使正常报告时间缩短60%，异常病例仍需人工',
        act: '优化AI与人工的接口流程，建立AI报告复核机制',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        outcome: '平均时间降至2.5小时',
        success: true,
      },
    ],
    status: 'active',
    sponsor: '王主任',
    teamMembers: ['陈医生', '刘医生', '赵技师', '信息科李工'],
    startDate: '2025-04-01',
    targetEndDate: '2025-07-01',
  },
  {
    id: 'CQI-003',
    title: '提高危急值报告及时率',
    description: '通过流程再造实现危急值15分钟内闭环管理',
    aim: '将危急值报告及时率从78%提升至95%以上',
    indicators: [
      { name: '危急值报告及时率', currentValue: 92, baselineValue: 78, targetValue: 95, unit: '%', trend: 'up', lastUpdated: '2025-06-01' },
      { name: '平均报告响应时间', currentValue: 12, baselineValue: 22, targetValue: 10, unit: '分钟', trend: 'down', lastUpdated: '2025-06-01' },
      { name: '临床接收确认率', currentValue: 95, baselineValue: 82, targetValue: 98, unit: '%', trend: 'up', lastUpdated: '2025-06-01' },
    ],
    pdsaCycles: [
      {
        cycle: 1,
        plan: '建立危急值电子推送系统',
        do_: '与HIS对接实现危急值自动弹窗提醒临床医生',
        study: '推送后响应时间缩短，但部分医生未及时查看',
        act: '增加短信和电话二次提醒机制',
        startDate: '2025-02-01',
        endDate: '2025-03-15',
        outcome: '及时率提升至85%',
        success: true,
      },
      {
        cycle: 2,
        plan: '建立危急值闭环管理流程',
        do_: '实施"报告-推送-确认-处理-反馈"五步闭环',
        study: '闭环流程执行后，确认率大幅提升',
        act: '将危急值管理纳入科室月度质控会议议题',
        startDate: '2025-03-16',
        endDate: '2025-05-01',
        outcome: '及时率提升至92%',
        success: true,
      },
    ],
    status: 'sustaining',
    sponsor: '赵主任',
    teamMembers: ['钱医生', '孙护士', '李质控员'],
    startDate: '2025-02-01',
    targetEndDate: '2025-06-30',
    sustainabilityPlan: '月度监测危急值指标，季度开展流程审计',
    closedAt: undefined,
    lessonsLearned: undefined,
  },
]

export function createCqiProject(project: Omit<CqiProject, 'id' | 'status'>): CqiProject {
  const newProject: CqiProject = {
    ...project,
    id: `CQI-${String(MOCK_CQI_PROJECTS.length + 1).padStart(3, '0')}`,
    status: 'planning',
  }
  MOCK_CQI_PROJECTS.unshift(newProject)
  return newProject
}

export function executePdsaCycle(projectId: string, cycle: Omit<PdsaCycle, 'cycle' | 'outcome' | 'success'>): CqiProject | undefined {
  const project = MOCK_CQI_PROJECTS.find(p => p.id === projectId)
  if (!project) return undefined
  const newCycleNumber = project.pdsaCycles.length + 1
  const newCycle: PdsaCycle = {
    ...cycle,
    cycle: newCycleNumber,
    outcome: '',
    success: false,
  }
  project.pdsaCycles.push(newCycle)
  if (project.status === 'planning') project.status = 'active'
  return project
}

export function getCqiDashboard(): CqiProject[] {
  return [...MOCK_CQI_PROJECTS]
}

export function closeCqiProject(projectId: string, lessonsLearned: string, sustainabilityPlan: string): CqiProject | undefined {
  const project = MOCK_CQI_PROJECTS.find(p => p.id === projectId)
  if (!project) return undefined
  project.status = 'closed'
  project.closedAt = new Date().toISOString().slice(0, 10)
  project.lessonsLearned = lessonsLearned
  project.sustainabilityPlan = sustainabilityPlan
  return project
}
