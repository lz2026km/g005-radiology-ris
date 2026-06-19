/**
 * G005 放射RIS系统 v3.0.6.5 - 说话人档案 mock
 * 10 升级点:模拟医生声纹档案 / MFCC 特征
 */

import type { SpeakerProfile } from '../../types/voice';

function generateMfcc(seed: number, dimension = 13): { mean: number[]; std: number[] } {
  const mean: number[] = [];
  const std: number[] = [];
  for (let i = 0; i < dimension; i++) {
    const base = Math.sin(seed * 0.7 + i) * 0.5;
    mean.push(Number((base + Math.cos(seed + i * 0.3) * 0.3).toFixed(4)));
    std.push(Number((0.1 + Math.abs(Math.sin(seed + i)) * 0.2).toFixed(4)));
  }
  return { mean, std };
}

function makeSamples(seed: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const { mean } = generateMfcc(seed + i);
    return {
      id: `emb-${seed}-${i}`,
      speakerId: `spk-${seed}`,
      mfcc: mean,
      pitch: 100 + Math.sin(seed + i) * 20,
      energy: 0.5 + Math.abs(Math.cos(seed + i)) * 0.3,
      durationMs: 3000 + i * 200,
      capturedAt: new Date(2025, 0, 1 + i).toISOString(),
      quality: 0.85 + Math.abs(Math.sin(seed + i * 0.7)) * 0.14,
    };
  });
}

export const MOCK_SPEAKER_PROFILES: SpeakerProfile[] = [
  {
    id: 'spk-001',
    userId: 'u-zhang-001',
    userName: '张文华',
    role: 'attending',
    title: '主任医师',
    enrollmentSamples: makeSamples(1, 5),
    embeddingDimension: 13,
    enrolledAt: '2025-01-15T08:00:00.000Z',
    lastVerifiedAt: '2025-12-10T14:23:00.000Z',
    totalVerifications: 256,
    successRate: 0.972,
    ...generateMfcc(1),
    pitchMean: 135.2,
    pitchStd: 12.4,
    speechRate: 245,
    active: true,
    notes: '胸组主诊,声音偏低沉',
  },
  {
    id: 'spk-002',
    userId: 'u-li-002',
    userName: '李明月',
    role: 'attending',
    title: '副主任医师',
    enrollmentSamples: makeSamples(2, 5),
    embeddingDimension: 13,
    enrolledAt: '2025-01-20T08:00:00.000Z',
    lastVerifiedAt: '2025-12-09T16:45:00.000Z',
    totalVerifications: 198,
    successRate: 0.958,
    ...generateMfcc(2),
    pitchMean: 218.6,
    pitchStd: 18.7,
    speechRate: 280,
    active: true,
    notes: '腹组主诊,语速较快',
  },
  {
    id: 'spk-003',
    userId: 'u-wang-003',
    userName: '王建国',
    role: 'resident',
    title: '住院医师',
    enrollmentSamples: makeSamples(3, 4),
    embeddingDimension: 13,
    enrolledAt: '2025-02-05T08:00:00.000Z',
    lastVerifiedAt: '2025-12-10T10:12:00.000Z',
    totalVerifications: 89,
    successRate: 0.943,
    ...generateMfcc(3),
    pitchMean: 152.3,
    pitchStd: 15.2,
    speechRate: 215,
    active: true,
  },
  {
    id: 'spk-004',
    userId: 'u-chen-004',
    userName: '陈思雨',
    role: 'resident',
    title: '住院医师',
    enrollmentSamples: makeSamples(4, 4),
    embeddingDimension: 13,
    enrolledAt: '2025-02-10T08:00:00.000Z',
    lastVerifiedAt: '2025-12-08T11:30:00.000Z',
    totalVerifications: 67,
    successRate: 0.926,
    ...generateMfcc(4),
    pitchMean: 225.8,
    pitchStd: 20.1,
    speechRate: 265,
    active: true,
  },
  {
    id: 'spk-005',
    userId: 'u-zhao-005',
    userName: '赵志强',
    role: 'attending',
    title: '主任医师',
    enrollmentSamples: makeSamples(5, 6),
    embeddingDimension: 13,
    enrolledAt: '2025-01-08T08:00:00.000Z',
    lastVerifiedAt: '2025-12-10T15:50:00.000Z',
    totalVerifications: 412,
    successRate: 0.984,
    ...generateMfcc(5),
    pitchMean: 128.7,
    pitchStd: 10.8,
    speechRate: 235,
    active: true,
    notes: '神经组主诊,声音稳定',
  },
  {
    id: 'spk-006',
    userId: 'u-sun-006',
    userName: '孙婉清',
    role: 'attending',
    title: '副主任医师',
    enrollmentSamples: makeSamples(6, 4),
    embeddingDimension: 13,
    enrolledAt: '2025-03-01T08:00:00.000Z',
    lastVerifiedAt: '2025-12-07T09:20:00.000Z',
    totalVerifications: 145,
    successRate: 0.962,
    ...generateMfcc(6),
    pitchMean: 210.4,
    pitchStd: 16.5,
    speechRate: 260,
    active: true,
  },
  {
    id: 'spk-007',
    userId: 'u-zhou-007',
    userName: '周国良',
    role: 'attending',
    title: '主治医师',
    enrollmentSamples: makeSamples(7, 4),
    embeddingDimension: 13,
    enrolledAt: '2025-02-25T08:00:00.000Z',
    lastVerifiedAt: '2025-12-10T13:15:00.000Z',
    totalVerifications: 178,
    successRate: 0.951,
    ...generateMfcc(7),
    pitchMean: 142.9,
    pitchStd: 14.3,
    speechRate: 250,
    active: true,
  },
  {
    id: 'spk-008',
    userId: 'u-wu-008',
    userName: '吴秀英',
    role: 'transcriber',
    title: '报告录入员',
    enrollmentSamples: makeSamples(8, 4),
    embeddingDimension: 13,
    enrolledAt: '2025-03-15T08:00:00.000Z',
    lastVerifiedAt: '2025-12-10T16:30:00.000Z',
    totalVerifications: 234,
    successRate: 0.978,
    ...generateMfcc(8),
    pitchMean: 198.6,
    pitchStd: 13.8,
    speechRate: 295,
    active: true,
  },
];
