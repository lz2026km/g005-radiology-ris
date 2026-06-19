/**
 * G005 放射RIS系统 v3.0.6.5 - RECIST 1.1 肿瘤治疗反应跟踪 (全 mock)
 * A5-AI-ORCH / 100 点
 *
 * 跟踪靶病灶：基线 → 多次随访 → 反应分类 (CR/PR/SD/PD)
 */

import type {
  AIRecistLesion,
  AIRecistMeasurement,
  AIRecistComparison,
} from '../../../types/ai/orchestrator';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const _lesions = new Map<string, AIRecistLesion>();

function seedLesion(patientId: string, lesionId: string, name: string, location: string, baselineDate: string, baselineDiameter: number): AIRecistLesion {
  const fups: AIRecistMeasurement[] = [];
  const baseTime = new Date(baselineDate).getTime();
  const sizes = [baselineDiameter];
  for (let i = 1; i <= 4; i++) {
    const change = (Math.random() - 0.45) * 0.3;
    sizes.push(Math.max(2, sizes[i - 1]! * (1 + change)));
  }
  let currentSum = 0;
  for (let i = 0; i < sizes.length; i++) {
    const sum = sizes.slice(0, i + 1).reduce((s, v) => s + v, 0);
    const percentFromBaseline = ((sizes[i]! - baselineDiameter) / baselineDiameter) * 100;
    fups.push({
      studyId: `${patientId}-study-${i}`,
      date: new Date(baseTime + i * 60 * 24 * 3600 * 1000).toISOString(),
      diameterMm: Math.round(sizes[i]! * 10) / 10,
      sum: Math.round(sum * 10) / 10,
      percentChangeFromBaseline: Math.round(percentFromBaseline * 10) / 10,
      percentChangeFromNadir: 0,
      reviewerId: 'D001',
      reviewerName: '张明远',
      confirmed: true,
    });
    currentSum = sum;
  }
  const nadirDiameter = Math.min(...sizes);
  fups.forEach((m, i) => {
    m.percentChangeFromNadir = Math.round(((sizes[i]! - nadirDiameter) / nadirDiameter) * 1000) / 10;
  });
  const currentDiameter = sizes[sizes.length - 1]!;
  const percentChange = ((currentDiameter - baselineDiameter) / baselineDiameter) * 100;
  let response: AIRecistLesion['responseCategory'] = 'SD';
  if (currentDiameter === 0) response = 'CR';
  else if (percentChange <= -30) response = 'PR';
  else if (percentChange >= 20) response = 'PD';
  const lesion: AIRecistLesion = {
    id: uuid('les'),
    patientId,
    lesionId,
    name,
    type: 'target',
    location,
    baseline: { studyId: `${patientId}-study-0`, date: baselineDate, diameterMm: baselineDiameter, sum: baselineDiameter },
    followUps: fups,
    currentDiameter: Math.round(currentDiameter * 10) / 10,
    currentSum: Math.round(currentSum * 10) / 10,
    percentChange: Math.round(percentChange * 10) / 10,
    responseCategory: response,
    nadirDiameter: Math.round(nadirDiameter * 10) / 10,
  };
  _lesions.set(lesionId, lesion);
  return lesion;
}

const _seeded = [
  seedLesion('P001', 'L001', '靶病灶1', '右肺上叶', '2026-01-15T00:00:00Z', 28.5),
  seedLesion('P001', 'L002', '靶病灶2', '右肺下叶', '2026-01-15T00:00:00Z', 18.2),
  seedLesion('P001', 'L003', '靶病灶3', '肝S6段', '2026-01-15T00:00:00Z', 22.4),
  seedLesion('P002', 'L004', '靶病灶1', '左肺门', '2026-02-20T00:00:00Z', 35.6),
  seedLesion('P002', 'L005', '靶病灶2', '纵隔淋巴结', '2026-02-20T00:00:00Z', 15.8),
];

export interface TrackLesionParams {
  lesionId: string;
  patientId: string;
  studyId: string;
  diameterMm: number;
  reviewerId: string;
  reviewerName: string;
  date?: string;
  confirmed?: boolean;
}

export class ResponseTracker {
  async trackLesion(params: TrackLesionParams): Promise<AIRecistLesion> {
    await delay(200);
    let lesion = _lesions.get(params.lesionId);
    if (!lesion) {
      lesion = {
        id: uuid('les'),
        patientId: params.patientId,
        lesionId: params.lesionId,
        name: `病灶 ${params.lesionId}`,
        type: 'target',
        location: '未指定',
        baseline: { studyId: params.studyId, date: params.date ?? new Date().toISOString(), diameterMm: params.diameterMm, sum: params.diameterMm },
        followUps: [],
        currentDiameter: params.diameterMm,
        currentSum: params.diameterMm,
        percentChange: 0,
        responseCategory: 'NE',
        nadirDiameter: params.diameterMm,
      };
      _lesions.set(params.lesionId, lesion);
    }

    const measurement: AIRecistMeasurement = {
      studyId: params.studyId,
      date: params.date ?? new Date().toISOString(),
      diameterMm: params.diameterMm,
      sum: 0,
      percentChangeFromBaseline: 0,
      percentChangeFromNadir: 0,
      reviewerId: params.reviewerId,
      reviewerName: params.reviewerName,
      confirmed: params.confirmed ?? true,
    };

    lesion.followUps.push(measurement);
    lesion.currentDiameter = params.diameterMm;
    lesion.currentSum = lesion.followUps.reduce((s, m) => s + m.diameterMm, 0);
    lesion.nadirDiameter = Math.min(...lesion.followUps.map((m) => m.diameterMm));
    lesion.followUps.forEach((m) => {
      m.sum = lesion!.followUps.filter((x) => new Date(x.date) <= new Date(m.date)).reduce((s, x) => s + x.diameterMm, 0);
      m.percentChangeFromBaseline = Math.round(((m.diameterMm - lesion!.baseline.diameterMm) / lesion!.baseline.diameterMm) * 1000) / 10;
      m.percentChangeFromNadir = Math.round(((m.diameterMm - lesion!.nadirDiameter) / lesion!.nadirDiameter) * 1000) / 10;
    });
    lesion.percentChange = Math.round(((lesion.currentDiameter - lesion.baseline.diameterMm) / lesion.baseline.diameterMm) * 1000) / 10;
    lesion.responseCategory = this.classifyResponse(lesion);
    return lesion;
  }

  async getTrend(lesionId: string): Promise<AIRecistLesion | null> {
    await delay(60);
    return _lesions.get(lesionId) ?? null;
  }

  async listLesions(patientId?: string): Promise<AIRecistLesion[]> {
    await delay(80);
    const arr = Array.from(_lesions.values());
    return patientId ? arr.filter((l) => l.patientId === patientId) : arr;
  }

  async compareStudies(studyAId: string, studyBId: string): Promise<AIRecistComparison> {
    await delay(150);
    const lesions = Array.from(_lesions.values());
    let newLesions = 0;
    let disappeared = 0;
    let progressed = 0;
    let responded = 0;
    let stable = 0;
    let sumA = 0;
    let sumB = 0;
    for (const l of lesions) {
      const a = l.followUps.find((m) => m.studyId === studyAId);
      const b = l.followUps.find((m) => m.studyId === studyBId);
      if (!a && b) newLesions += 1;
      if (a && !b) disappeared += 1;
      if (a && b) {
        sumA += a.diameterMm;
        sumB += b.diameterMm;
        const change = ((b.diameterMm - a.diameterMm) / a.diameterMm) * 100;
        if (change <= -30) responded += 1;
        else if (change >= 20) progressed += 1;
        else stable += 1;
      }
    }
    const sumChange = sumB - sumA;
    const sumChangePercent = sumA > 0 ? (sumChange / sumA) * 100 : 0;
    let overall: AIRecistComparison['overallResponse'] = 'SD';
    if (newLesions > 0) overall = 'PD';
    else if (sumChangePercent <= -30 && disappeared > 0) overall = 'CR';
    else if (sumChangePercent <= -30) overall = 'PR';
    else if (sumChangePercent >= 20) overall = 'PD';
    return {
      studyAId,
      studyBId,
      newLesions,
      disappearedLesions: disappeared,
      progressed,
      responded,
      stable,
      overallResponse: overall,
      sumChange: Math.round(sumChange * 10) / 10,
      sumChangePercent: Math.round(sumChangePercent * 10) / 10,
      comparedAt: new Date().toISOString(),
    };
  }

  async getPatientSummary(patientId: string): Promise<{ patientId: string; totalLesions: number; targetSum: number; percentChange: number; response: string; lesionSummaries: AIRecistLesion[] }> {
    await delay(80);
    const arr = await this.listLesions(patientId);
    const targetSum = arr.reduce((s, l) => s + l.currentDiameter, 0);
    const baselineSum = arr.reduce((s, l) => s + l.baseline.diameterMm, 0);
    const percentChange = baselineSum > 0 ? ((targetSum - baselineSum) / baselineSum) * 100 : 0;
    let response = 'SD';
    if (arr.every((l) => l.currentDiameter === 0)) response = 'CR';
    else if (percentChange <= -30) response = 'PR';
    else if (percentChange >= 20) response = 'PD';
    return {
      patientId,
      totalLesions: arr.length,
      targetSum: Math.round(targetSum * 10) / 10,
      percentChange: Math.round(percentChange * 10) / 10,
      response,
      lesionSummaries: arr,
    };
  }

  private classifyResponse(lesion: AIRecistLesion): AIRecistLesion['responseCategory'] {
    if (lesion.currentDiameter === 0) return 'CR';
    if (lesion.percentChange <= -30) return 'PR';
    if (lesion.percentChange >= 20) return 'PD';
    if (lesion.followUps.length === 1) return 'NE';
    return 'SD';
  }
}

export const responseTracker = new ResponseTracker();
