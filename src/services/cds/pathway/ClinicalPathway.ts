import type {
  CdsAlert,
  CdsPathwayContext,
  ClinicalPathwayDef,
  ClinicalPathwayStep,
  PathwayInstance,
  PathwayInstanceStep,
  PathwayStepStatus,
} from '../../../types/cds';

const MOCK_PATHWAYS: ClinicalPathwayDef[] = [
  {
    id: 'cpw-001', code: 'LUNG-NODULE', name: '肺结节评估路径', nameEn: 'Lung Nodule Assessment',
    condition: '肺结节', icdCode: 'R91.1', description: '偶然发现肺结节的标准评估和随访路径', modality: 'CT', bodyPart: '胸部',
    steps: [
      { id: 'cpw-s-001', order: 1, type: 'exam', name: '胸部CT平扫', description: '初次发现肺结节', modality: 'CT', bodyPart: '胸部', defaultTimingDays: 0, isOptional: false, isMilestone: true },
      { id: 'cpw-s-002', order: 2, type: 'exam', name: '低剂量CT随访', description: '根据结节大小定期随访', modality: 'CT', bodyPart: '胸部', defaultTimingDays: 180, isOptional: false, isMilestone: false, dependsOnStepIds: ['cpw-s-001'] },
      { id: 'cpw-s-003', order: 3, type: 'decision', name: '多学科会诊', description: '复杂结节MDT评估', defaultTimingDays: 30, isOptional: true, isMilestone: true, dependsOnStepIds: ['cpw-s-002'], responsibleRole: 'radiologist' },
      { id: 'cpw-s-004', order: 4, type: 'procedure', name: 'CT引导下穿刺活检', description: '高度可疑结节', modality: 'CT', bodyPart: '胸部', defaultTimingDays: 14, isOptional: true, isMilestone: false, dependsOnStepIds: ['cpw-s-003'] },
    ],
    estimatedDurationDays: 365, isActive: true, version: '1.0', evidenceLevel: 'A', organization: 'Fleischner Society',
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', usageCount: 47, completionRate: 0.78,
  },
  {
    id: 'cpw-002', code: 'STROKE', name: '缺血性脑卒中路径', nameEn: 'Acute Ischemic Stroke',
    condition: '急性缺血性脑卒中', icdCode: 'I63.9', description: '急性缺血性脑卒中影像评估与治疗路径', modality: 'CT', bodyPart: '头颅',
    steps: [
      { id: 'cpw-s-005', order: 1, type: 'exam', name: '头颅CT平扫', description: '排除出血', modality: 'CT', bodyPart: '头颅', defaultTimingDays: 0, isOptional: false, isMilestone: true },
      { id: 'cpw-s-006', order: 2, type: 'exam', name: 'CTA+CTP', description: '血管评估与灌注', modality: 'CT', bodyPart: '头颅', defaultTimingDays: 0, isOptional: false, isMilestone: true, dependsOnStepIds: ['cpw-s-005'] },
      { id: 'cpw-s-007', order: 3, type: 'procedure', name: '机械取栓', description: '大血管闭塞', defaultTimingDays: 0, isOptional: true, isMilestone: true, dependsOnStepIds: ['cpw-s-006'], responsibleRole: 'interventional_radiologist' },
    ],
    estimatedDurationDays: 30, isActive: true, version: '1.0', evidenceLevel: 'A', organization: 'AHA/ASA',
    createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z', usageCount: 32, completionRate: 0.82,
  },
  {
    id: 'cpw-003', code: 'BREAST-SCREEN', name: '乳腺癌筛查路径', nameEn: 'Breast Cancer Screening',
    condition: '乳腺癌筛查', icdCode: 'Z12.3', description: '乳腺癌筛查标准路径', modality: 'MG', bodyPart: '胸部',
    steps: [
      { id: 'cpw-s-008', order: 1, type: 'exam', name: '乳腺X线摄影', description: '常规筛查', modality: 'MG', bodyPart: '胸部', defaultTimingDays: 0, isOptional: false, isMilestone: true },
      { id: 'cpw-s-009', order: 2, type: 'exam', name: '乳腺超声', description: '补充评估', modality: 'US', bodyPart: '胸部', defaultTimingDays: 14, isOptional: true, isMilestone: false, dependsOnStepIds: ['cpw-s-008'] },
      { id: 'cpw-s-010', order: 3, type: 'procedure', name: '穿刺活检', description: 'BI-RADS 4+', defaultTimingDays: 14, isOptional: true, isMilestone: true, dependsOnStepIds: ['cpw-s-009'], responsibleRole: 'radiologist' },
    ],
    estimatedDurationDays: 180, isActive: true, version: '1.0', evidenceLevel: 'A', organization: 'NCCN',
    createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-05-20T00:00:00Z', usageCount: 28, completionRate: 0.91,
  },
  {
    id: 'cpw-004', code: 'CONTRAST-AKI', name: '造影剂肾病预防路径', nameEn: 'CIN Prevention',
    condition: '肾功能不全', description: 'eGFR下降患者碘对比剂使用安全路径', modality: 'CT',
    steps: [
      { id: 'cpw-s-011', order: 1, type: 'exam', name: '肾功能评估', description: '检查前eGFR检测', defaultTimingDays: 0, isOptional: false, isMilestone: true },
      { id: 'cpw-s-012', order: 2, type: 'medication', name: '水化治疗', description: '检查前后充分水化', defaultTimingDays: 0, isOptional: false, isMilestone: false, dependsOnStepIds: ['cpw-s-011'] },
      { id: 'cpw-s-013', order: 3, type: 'exam', name: '增强CT检查', description: '使用等渗造影剂', modality: 'CT', defaultTimingDays: 0, isOptional: false, isMilestone: true, dependsOnStepIds: ['cpw-s-012'] },
      { id: 'cpw-s-014', order: 4, type: 'lab', name: '复查肾功能', description: '48-72h复查肌酐', defaultTimingDays: 3, isOptional: false, isMilestone: true, dependsOnStepIds: ['cpw-s-013'] },
    ],
    estimatedDurationDays: 7, isActive: true, version: '1.0', evidenceLevel: 'A', organization: 'KDIGO',
    createdAt: '2025-04-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', usageCount: 156, completionRate: 0.88,
  },
];

export class ClinicalPathway {
  private pathways: ClinicalPathwayDef[] = MOCK_PATHWAYS;
  private instances: Map<string, PathwayInstance> = new Map();

  getPathways(): ClinicalPathwayDef[] {
    return this.pathways;
  }

  getPathway(id: string): ClinicalPathwayDef | null {
    return this.pathways.find((p) => p.id === id) ?? null;
  }

  search(query: string): ClinicalPathwayDef[] {
    const q = query.toLowerCase();
    return this.pathways.filter(
      (p) => p.name.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q) || (p.icdCode ?? '').toLowerCase().includes(q),
    );
  }

  getByModality(modality: string): ClinicalPathwayDef[] {
    return this.pathways.filter((p) => p.modality === modality);
  }

  getByCondition(icdCode: string): ClinicalPathwayDef[] {
    return this.pathways.filter((p) => p.icdCode === icdCode);
  }

  createInstance(pathwayId: string, patientId: string, patientName: string, activatedBy: string): PathwayInstance | null {
    const def = this.getPathway(pathwayId);
    if (!def) return null;
    const instance: PathwayInstance = {
      id: 'inst-' + Date.now().toString(36),
      pathwayId: def.id,
      pathwayName: def.name,
      patientId,
      patientName,
      activatedAt: new Date().toISOString(),
      activatedBy,
      currentStepIndex: 0,
      steps: def.steps.map((s) => ({
        stepId: s.id,
        status: 'pending' as PathwayStepStatus,
        plannedDate: s.defaultTimingDays > 0 ? new Date(Date.now() + s.defaultTimingDays * 86400000).toISOString() : undefined,
      })),
      status: 'active',
      progress: 0,
    };
    this.instances.set(instance.id, instance);
    return instance;
  }

  getInstances(patientId?: string): PathwayInstance[] {
    const list = Array.from(this.instances.values());
    return patientId ? list.filter((i) => i.patientId === patientId) : list;
  }

  getInstance(id: string): PathwayInstance | null {
    return this.instances.get(id) ?? null;
  }

  advanceStep(instanceId: string, stepId: string, status: PathwayInstanceStep['status'], by?: string): PathwayInstance | null {
    const inst = this.instances.get(instanceId);
    if (!inst) return null;
    const step = inst.steps.find((s) => s.stepId === stepId);
    if (!step) return null;
    step.status = status;
    if (status === 'in_progress') step.startedAt = new Date().toISOString();
    if (status === 'completed') {
      step.completedAt = new Date().toISOString();
      step.performedBy = by;
      inst.currentStepIndex = Math.min(inst.currentStepIndex + 1, inst.steps.length - 1);
    }
    inst.progress = Math.round((inst.steps.filter((s) => s.status === 'completed').length / inst.steps.length) * 100);
    if (inst.steps.every((s) => s.status === 'completed')) {
      inst.status = 'completed';
      inst.completedAt = new Date().toISOString();
      inst.progress = 100;
    }
    return inst;
  }

  discontinue(instanceId: string, reason: string): PathwayInstance | null {
    const inst = this.instances.get(instanceId);
    if (!inst) return null;
    inst.status = 'discontinued';
    inst.discontinueReason = reason;
    inst.discontinuedAt = new Date().toISOString();
    return inst;
  }

  checkDeviation(context: CdsPathwayContext): CdsAlert[] {
    const out: CdsAlert[] = [];
    const inst = this.instances.get(context.instanceId);
    if (!inst) return out;
    const def = this.getPathway(inst.pathwayId);
    if (!def) return out;
    const currentStep = def.steps[context.currentStepIndex];
    if (currentStep && currentStep.defaultTimingDays > 0) {
      const instStep = inst.steps.find((s) => s.stepId === currentStep.id);
      if (instStep && instStep.completedAt) {
        const elapsed = (Date.now() - new Date(instStep.completedAt).getTime()) / 86400000;
        if (elapsed > currentStep.defaultTimingDays * 1.5) {
          out.push({
            id: 'alert-' + Date.now().toString(36) + '-dev-' + currentStep.id,
            ruleId: 'deviation-timing',
            ruleName: '路径时序偏差',
            category: 'pathway_deviation',
            severity: 'warning',
            status: 'active',
            title: '路径步骤超期: ' + currentStep.name,
            message: currentStep.name + ' 已超期 ' + Math.round(elapsed - currentStep.defaultTimingDays) + ' 天',
            patientId: inst.patientId,
            patientName: inst.patientName,
            triggeredAt: new Date().toISOString(),
            blocking: false,
            source: 'pathway',
            recommendations: ['检查步骤完成情况', '更新路径计划'],
            metadata: { pathwayId: def.id, stepId: currentStep.id, elapsedDays: Math.round(elapsed) },
          });
        }
      }
    }
    return out;
  }

  getPathwayCount(): number {
    return this.pathways.length;
  }

  getInstanceCount(): number {
    return this.instances.size;
  }
}

let _instance: ClinicalPathway | null = null;
export function getClinicalPathway(): ClinicalPathway {
  if (!_instance) _instance = new ClinicalPathway();
  return _instance;
}
