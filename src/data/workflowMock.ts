/**
 * G005 RIS v3.0.6.6 - 工作流模板 Mock 数据 (20+ 模板)
 */

import type { WorkflowGraph } from '../types/workflow';

function buildBaseWorkflow(name: string, description: string): WorkflowGraph {
  const now = new Date().toISOString();
  return {
    id: `wf_${name}`,
    name,
    version: '1.0.0',
    description,
    nodes: [],
    edges: [],
    variables: {},
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

const NODES = {
  start: (id: string, x = 60, y = 200) => ({ id, name: '开始', kind: 'start' as const, position: { x, y } }),
  end: (id: string, x = 760, y = 200) => ({ id, name: '结束', kind: 'end' as const, position: { x, y } }),
  task: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'task' as const, position: { x, y } }),
  gateway: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'gateway' as const, position: { x, y } }),
  timer: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'timer' as const, position: { x, y } }),
  notify: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'notify' as const, position: { x, y } }),
  assign: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'assign' as const, position: { x, y } }),
  service: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'service' as const, position: { x, y } }),
  subprocess: (id: string, name: string, x: number, y: number) => ({ id, name, kind: 'subprocess' as const, position: { x, y } }),
};

function edge(id: string, source: string, target: string, kind: 'sequence' | 'conditional' | 'default' = 'sequence', label?: string) {
  return { id, source, target, kind, label };
}

export const WORKFLOW_TEMPLATES: WorkflowGraph[] = [
  (() => {
    const w = buildBaseWorkflow('CT检查标准流', 'CT 检查从登记到出报告的标准工作流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.assign('a1', '分配技师', 180, 200),
      NODES.task('t1', '扫描采集', 320, 200),
      NODES.gateway('g1', '图像质量?', 460, 200),
      NODES.task('t2', '重新扫描', 600, 100),
      NODES.notify('n1', '通知临床', 600, 300),
      NODES.task('t3', 'AI预读', 760, 200),
      NODES.end('e', 920, 200),
    ];
    w.edges = [
      edge('e1', 's', 'a1'),
      edge('e2', 'a1', 't1'),
      edge('e3', 't1', 'g1'),
      edge('e4', 'g1', 't2', 'conditional', '不通过'),
      edge('e5', 'g1', 't3', 'default', '通过'),
      edge('e6', 't2', 't1', 'sequence'),
      edge('e7', 't3', 'n1'),
      edge('e8', 'n1', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('MR增强检查流', 'MR 增强扫描工作流,含禁忌症校验');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '过敏史筛查', 180, 200),
      NODES.gateway('g1', '可否增强?', 320, 200),
      NODES.task('t2', '平扫', 460, 100),
      NODES.task('t3', '增强扫描', 460, 300),
      NODES.task('t4', '后处理', 620, 300),
      NODES.end('e', 800, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 'g1'),
      edge('e3', 'g1', 't2', 'conditional', '不可增强'),
      edge('e4', 'g1', 't3', 'default', '可增强'),
      edge('e5', 't2', 'e', 'sequence'),
      edge('e6', 't3', 't4'),
      edge('e7', 't4', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('急诊绿色通道', '急诊检查 30 分钟报告流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.notify('n1', '通知值班医生', 180, 200),
      NODES.task('t1', '优先检查', 320, 200),
      NODES.task('t2', '即时出报告', 460, 200),
      NODES.gateway('g1', '危急值?', 600, 200),
      NODES.notify('n2', '危急值通知', 740, 100),
      NODES.end('e', 880, 300),
    ];
    w.edges = [
      edge('e1', 's', 'n1'),
      edge('e2', 'n1', 't1'),
      edge('e3', 't1', 't2'),
      edge('e4', 't2', 'g1'),
      edge('e5', 'g1', 'n2', 'conditional', '是'),
      edge('e6', 'g1', 'e', 'default', '否'),
      edge('e7', 'n2', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('DR普放流', 'DR 普通放射检查标准流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.assign('a1', '分配设备', 180, 200),
      NODES.task('t1', '摆位拍摄', 320, 200),
      NODES.task('t2', '图像后处理', 460, 200),
      NODES.task('t3', '出报告', 600, 200),
      NODES.end('e', 760, 200),
    ];
    w.edges = [
      edge('e1', 's', 'a1'),
      edge('e2', 'a1', 't1'),
      edge('e3', 't1', 't2'),
      edge('e4', 't2', 't3'),
      edge('e5', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('DSA介入流', 'DSA 介入手术完整流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '术前评估', 180, 200),
      NODES.task('t2', '知情同意', 320, 200),
      NODES.task('t3', '麻醉', 460, 200),
      NODES.task('t4', '介入手术', 600, 200),
      NODES.task('t5', '术后监护', 740, 200),
      NODES.task('t6', '出院评估', 880, 200),
      NODES.end('e', 1020, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 't4'),
      edge('e5', 't4', 't5'),
      edge('e6', 't5', 't6'),
      edge('e7', 't6', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('报告双签流', '高风险报告 CoSign 双签工作流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '主治书写', 180, 200),
      NODES.task('t2', '初审', 320, 200),
      NODES.task('t3', '终审', 460, 200),
      NODES.gateway('g1', '需双签?', 600, 200),
      NODES.task('t4', '主任签发', 740, 100),
      NODES.task('t5', '常规签发', 740, 300),
      NODES.end('e', 920, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 'g1'),
      edge('e5', 'g1', 't4', 'conditional', '是'),
      edge('e6', 'g1', 't5', 'default', '否'),
      edge('e7', 't4', 'e'),
      edge('e8', 't5', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('危急值响应流', '危急值发现 → 通知 → 处置 → 闭环');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '识别危急值', 180, 200),
      NODES.notify('n1', '电话通知', 320, 200),
      NODES.timer('tm1', '等待确认 5min', 460, 200),
      NODES.gateway('g1', '已确认?', 600, 200),
      NODES.task('t2', '升级主任', 740, 100),
      NODES.task('t3', '记录处置', 740, 300),
      NODES.end('e', 920, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 'n1'),
      edge('e3', 'n1', 'tm1'),
      edge('e4', 'tm1', 'g1'),
      edge('e5', 'g1', 't2', 'conditional', '否'),
      edge('e6', 'g1', 't3', 'default', '是'),
      edge('e7', 't2', 't3'),
      edge('e8', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('体检批量报告流', '体检中心批量报告生成流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '批量导入', 180, 200),
      NODES.service('sv1', 'AI 批量预读', 320, 200),
      NODES.task('t2', '集中审核', 460, 200),
      NODES.task('t3', '统一发布', 600, 200),
      NODES.end('e', 760, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 'sv1'),
      edge('e3', 'sv1', 't2'),
      edge('e4', 't2', 't3'),
      edge('e5', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('远程会诊流', '远程会诊全流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '申请会诊', 180, 200),
      NODES.notify('n1', '通知专家', 320, 200),
      NODES.task('t2', '远程阅片', 460, 200),
      NODES.task('t3', '出具意见', 600, 200),
      NODES.task('t4', '反馈申请方', 740, 200),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 'n1'),
      edge('e3', 'n1', 't2'),
      edge('e4', 't2', 't3'),
      edge('e5', 't3', 't4'),
      edge('e6', 't4', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('PET-CT检查流', 'PET-CT 全身检查流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '血糖检测', 180, 200),
      NODES.task('t2', '注射示踪剂', 320, 200),
      NODES.timer('tm1', '静息 60min', 460, 200),
      NODES.task('t3', '全身扫描', 600, 200),
      NODES.task('t4', '图像融合', 740, 200),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'tm1'),
      edge('e4', 'tm1', 't3'),
      edge('e5', 't3', 't4'),
      edge('e6', 't4', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('超声检查流', '超声检查标准流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '登记候诊', 180, 200),
      NODES.task('t2', '体位准备', 320, 200),
      NODES.task('t3', '超声扫查', 460, 200),
      NODES.task('t4', '即时报告', 600, 200),
      NODES.end('e', 760, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 't4'),
      edge('e5', 't4', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('乳腺钼靶筛查流', '乳腺钼靶筛查流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '预约确认', 180, 200),
      NODES.task('t2', '体位摆放', 320, 200),
      NODES.task('t3', '多角度曝光', 460, 200),
      NODES.task('t4', 'AI 辅助阅片', 600, 200),
      NODES.task('t5', '专科审核', 740, 200),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 't4'),
      edge('e5', 't4', 't5'),
      edge('e6', 't5', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('造影检查流', '消化道造影检查流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '空腹确认', 180, 200),
      NODES.task('t2', '口服造影剂', 320, 200),
      NODES.task('t3', '动态透视', 460, 200),
      NODES.task('t4', '关键帧采集', 600, 200),
      NODES.task('t5', '出具报告', 740, 200),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 't4'),
      edge('e5', 't4', 't5'),
      edge('e6', 't5', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('AI预读流', 'AI 智能预读工作流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.service('sv1', 'AI 引擎', 180, 200),
      NODES.gateway('g1', 'AI 高置信?', 320, 200),
      NODES.task('t1', 'AI 自动出报告', 460, 100),
      NODES.task('t2', '人工复核', 460, 300),
      NODES.task('t3', '终审', 620, 300),
      NODES.end('e', 800, 200),
    ];
    w.edges = [
      edge('e1', 's', 'sv1'),
      edge('e2', 'sv1', 'g1'),
      edge('e3', 'g1', 't1', 'conditional', '是'),
      edge('e4', 'g1', 't2', 'default', '否'),
      edge('e5', 't1', 't3', 'sequence'),
      edge('e6', 't2', 't3'),
      edge('e7', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('科研随访流', '科研项目随访检查流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '受试者筛选', 180, 200),
      NODES.task('t2', '知情同意', 320, 200),
      NODES.subprocess('sp1', '基线检查', 460, 200),
      NODES.timer('tm1', '3个月间隔', 600, 200),
      NODES.subprocess('sp2', '随访检查', 740, 200),
      NODES.task('t3', '数据采集', 880, 200),
      NODES.end('e', 1020, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'sp1'),
      edge('e4', 'sp1', 'tm1'),
      edge('e5', 'tm1', 'sp2'),
      edge('e6', 'sp2', 't3'),
      edge('e7', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('儿童检查流', '儿童镇静检查工作流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '家长陪同', 180, 200),
      NODES.task('t2', '镇静评估', 320, 200),
      NODES.gateway('g1', '需要镇静?', 460, 200),
      NODES.task('t3', '镇静给药', 600, 100),
      NODES.task('t4', '直接检查', 600, 300),
      NODES.task('t5', '检查', 740, 200),
      NODES.task('t6', '苏醒观察', 880, 200),
      NODES.end('e', 1020, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'g1'),
      edge('e4', 'g1', 't3', 'conditional', '是'),
      edge('e5', 'g1', 't4', 'default', '否'),
      edge('e6', 't3', 't5'),
      edge('e7', 't4', 't5'),
      edge('e8', 't5', 't6'),
      edge('e9', 't6', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('术中影像流', '术中影像导航流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '术前定位', 180, 200),
      NODES.task('t2', '术中扫描', 320, 200),
      NODES.gateway('g1', '需要补充?', 460, 200),
      NODES.task('t3', '继续扫描', 600, 100),
      NODES.task('t4', '即时诊断', 600, 300),
      NODES.task('t5', '手术决策', 740, 300),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'g1'),
      edge('e4', 'g1', 't3', 'conditional', '是'),
      edge('e5', 'g1', 't4', 'default', '否'),
      edge('e6', 't3', 't2'),
      edge('e7', 't4', 't5'),
      edge('e8', 't5', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('影像复核流', '历史影像复核对比');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.service('sv1', '历史检索', 180, 200),
      NODES.task('t1', '影像配准', 320, 200),
      NODES.task('t2', '差异标注', 460, 200),
      NODES.task('t3', '对比报告', 600, 200),
      NODES.end('e', 760, 200),
    ];
    w.edges = [
      edge('e1', 's', 'sv1'),
      edge('e2', 'sv1', 't1'),
      edge('e3', 't1', 't2'),
      edge('e4', 't2', 't3'),
      edge('e5', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('设备维护流', '设备定期维护工作流');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '维护计划', 180, 200),
      NODES.task('t2', '停机通知', 320, 200),
      NODES.subprocess('sp1', '日常保养', 460, 200),
      NODES.subprocess('sp2', '性能校准', 600, 200),
      NODES.task('t3', '验收测试', 740, 200),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'sp1'),
      edge('e4', 'sp1', 'sp2'),
      edge('e5', 'sp2', 't3'),
      edge('e6', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('质控抽查流', '报告质控抽查流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '随机抽样', 180, 200),
      NODES.task('t2', '专家评审', 320, 200),
      NODES.task('t3', '评分', 460, 200),
      NODES.gateway('g1', '合格?', 600, 200),
      NODES.task('t4', '反馈整改', 740, 100),
      NODES.task('t5', '归档', 740, 300),
      NODES.end('e', 900, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 't3'),
      edge('e4', 't3', 'g1'),
      edge('e5', 'g1', 't4', 'conditional', '否'),
      edge('e6', 'g1', 't5', 'default', '是'),
      edge('e7', 't4', 't5'),
      edge('e8', 't5', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('值班交接流', '24小时值班交接流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '班次清点', 180, 200),
      NODES.task('t2', '未完成任务', 320, 200),
      NODES.notify('n1', '交接通知', 460, 200),
      NODES.task('t3', '电子签名确认', 600, 200),
      NODES.end('e', 760, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'n1'),
      edge('e4', 'n1', 't3'),
      edge('e5', 't3', 'e'),
    ];
    return w;
  })(),
  (() => {
    const w = buildBaseWorkflow('报告修订流', '已发布报告修订流程');
    w.nodes = [
      NODES.start('s', 40, 200),
      NODES.task('t1', '修订申请', 180, 200),
      NODES.task('t2', '修订理由审核', 320, 200),
      NODES.gateway('g1', '通过?', 460, 200),
      NODES.task('t3', '内容修订', 600, 100),
      NODES.notify('n1', '驳回通知', 600, 300),
      NODES.task('t4', '重新发布', 740, 100),
      NODES.task('t5', '通知临床', 880, 100),
      NODES.end('e', 1060, 200),
    ];
    w.edges = [
      edge('e1', 's', 't1'),
      edge('e2', 't1', 't2'),
      edge('e3', 't2', 'g1'),
      edge('e4', 'g1', 't3', 'conditional', '通过'),
      edge('e5', 'g1', 'n1', 'default', '驳回'),
      edge('e6', 't3', 't4'),
      edge('e7', 't4', 't5'),
      edge('e8', 't5', 'e'),
      edge('e9', 'n1', 'e'),
    ];
    return w;
  })(),
];

export const WORKFLOW_TEMPLATE_COUNT = WORKFLOW_TEMPLATES.length;