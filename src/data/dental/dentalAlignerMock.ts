// [v3.0.6.8-92] Phase 2: 隐形矫治模拟 mock 数据
// 对标: Planmeca Align + 3Shape Trios Ortho + Invisalign

export const MOCK_ALIGNER_PLANS = [
  {
    id: 'ALIGN-001', patientId: 'P100004', patientName: '赵雪', age: 28, gender: 'F',
    diagnosis: '安氏 II 类 1 分类, 前牙深覆盖 6mm, 下前牙轻度拥挤',
    totalStages: 24, currentStage: 8, wearDaysPerStage: 7,
    startedAt: '2026-04-15', estimatedEnd: '2026-12-15',
    attachments: [
      { toothNo: 13, type: 'horizontal' as const, position: 'buccal' },
      { toothNo: 23, type: 'horizontal' as const, position: 'buccal' },
      { toothNo: 33, type: 'vertical' as const, position: 'buccal' },
      { toothNo: 43, type: 'vertical' as const, position: 'buccal' },
      { toothNo: 16, type: 'beveled' as const, position: 'occlusal' },
      { toothNo: 26, type: 'beveled' as const, position: 'occlusal' },
    ],
    ipr: [{ toothNo: 33, amount: 0.3 }, { toothNo: 43, amount: 0.3 }, { toothNo: 32, amount: 0.2 }],
    status: 'in-progress' as const, doctor: '李正畸', lab: 'AlignTech',
    createdBy: 'Dr. Li', createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'ALIGN-002', patientId: 'P100005', patientName: '刘阳', age: 32, gender: 'M',
    diagnosis: '安氏 III 类, 反合, 上前牙舌倾',
    totalStages: 30, currentStage: 0,
    wearDaysPerStage: 7,
    startedAt: null, estimatedEnd: null,
    attachments: [
      { toothNo: 14, type: 'horizontal' as const, position: 'buccal' },
      { toothNo: 24, type: 'horizontal' as const, position: 'buccal' },
      { toothNo: 34, type: 'horizontal' as const, position: 'buccal' },
      { toothNo: 44, type: 'horizontal' as const, position: 'buccal' },
    ],
    ipr: [{ toothNo: 34, amount: 0.3 }, { toothNo: 44, amount: 0.3 }],
    status: 'pending' as const, doctor: '李正畸', lab: 'AlignTech',
    createdBy: 'Dr. Li', createdAt: '2026-06-20T14:30:00Z',
  },
];

// 各阶段牙移动数据 (模拟: toothNo -> dx, dy, dz, rotation)
export function generateMockStages(totalStages: number) {
  const stageToothMovements: Record<number, Array<{ toothNo: number; dx: number; dy: number; dz: number; rotation: number }>> = {};
  const teeth = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45];
  for (let s = 0; s < totalStages; s++) {
    const progress = s / totalStages; // 0..1
    stageToothMovements[s] = teeth.map((tno, ti) => {
      const targetDx = ti < 10 ? -2.5 : 1.5; // 上前牙后移, 下前牙前移
      const targetDy = [11,12,21,22,31,32,41,42].includes(tno) ? -3 : -1; // 切牙压低
      return {
        toothNo: tno,
        dx: targetDx * progress,
        dy: targetDy * progress * (s / totalStages),
        dz: [14,15,24,25].includes(tno) ? progress * 1.5 : 0, // 后牙伸长
        rotation: [13,23,33,43].includes(tno) ? progress * 8 : 0, // 尖牙扭转
      };
    });
  }
  return stageToothMovements;
}

export const MOCK_ALIGNER_PROGRESS = {
  totalStages: 24, currentStage: 8, completedStages: 8,
  patientCompliance: 0.92, // 92% 依从性
  trackingQuality: 'good', // 'good' | 'fair' | 'poor'
  lastStageWornDays: 8,    // 当前阶段佩戴天数
  nextStageDate: '2026-06-30',
  refinementSuggested: false,
  refinementCount: 0,
};

// 3D 牙弓参数 (用于 Three.js 可视化)
export const MOCK_ARCH_3D = {
  upperArch: Array.from({ length: 14 }, (_, i) => ({
    toothNo: [11,12,13,14,15,16,17,21,22,23,24,25,26,27][i],
    position: { x: -20 + i * 4.5, y: 5 + Math.sin(i * 0.5) * 3, z: 0 },
    rotation: { x: 0, y: Math.sin(i * 0.3) * 0.2, z: 0 },
    color: '#e8e0d4',
  })),
  lowerArch: Array.from({ length: 14 }, (_, i) => ({
    toothNo: [31,32,33,34,35,36,37,41,42,43,44,45,46,47][i],
    position: { x: -20 + i * 4.5, y: -5 + Math.sin(i * 0.5) * 2.5, z: 0 },
    rotation: { x: 0, y: Math.sin(i * 0.3) * 0.2, z: 0 },
    color: '#e8e0d4',
  })),
};
