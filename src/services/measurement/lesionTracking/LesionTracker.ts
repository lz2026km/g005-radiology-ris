// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 病灶追踪服务
// Phase R11 W1: 同一病灶跨 study 同 ID 跟踪,计算 RECIST 趋势
// 80 升级点:register / findByLocation / getTrend / compareStudies / 内部管理
// ============================================================

import type {
  TrackedLesion,
  LesionSnapshot,
  LesionTrend,
  LesionComparison,
  LesionLocation,
  LesionTrackingId,
} from '../../../types/measurement';
import { LESION_MOCK } from '../../../data/measurement/lesionMock';

const SIM_LATENCY_MS = 80;

/** 内存中可写存储(mock 启动时载入) */
let lesionStore: TrackedLesion[] = LESION_MOCK.map((l) => ({
  ...l,
  snapshots: [...l.snapshots],
}));

let registerCounter = lesionStore.length;

/** 简单字符串归一化(用于模糊匹配 location) */
function normalizeLocation(loc: LesionLocation): string {
  return [loc.region, loc.organ, loc.subStructure ?? ''].join('|').toLowerCase().replace(/\s+/g, '');
}

/** 距离评分(0-1, 越大越相似) */
function locationScore(a: LesionLocation, b: LesionLocation): number {
  let score = 0;
  if (a.region && a.region === b.region) score += 0.3;
  if (a.organ && a.organ === b.organ) score += 0.4;
  if (a.subStructure && a.subStructure === b.subStructure) score += 0.3;
  if (a.snomedCode && a.snomedCode === b.snomedCode) score += 0.2;
  return Math.min(score, 1);
}

/** 计算 RECIST 1.1 反应类别(基于长径变化) */
function classifyResponse(baselineLong: number, currentLong: number): 'CR' | 'PR' | 'SD' | 'PD' | 'NE' {
  if (baselineLong <= 0 || !Number.isFinite(baselineLong) || !Number.isFinite(currentLong)) return 'NE';
  if (currentLong === 0) return 'CR';
  const changePercent = ((currentLong - baselineLong) / baselineLong) * 100;
  if (changePercent <= -100) return 'CR';
  if (changePercent <= -30) return 'PR';
  if (changePercent >= 20) return 'PD';
  return 'SD';
}

async function delay(ms = SIM_LATENCY_MS): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/** 生成稳定的病灶 ID */
function generateLesionId(): string {
  registerCounter += 1;
  return `lesion-${Date.now().toString(36)}-${registerCounter}`;
}

/**
 * 注册新病灶或追加快照到已有病灶
 *
 * - 若同一患者 + 高度相似位置 + 同类别 -> 自动追加快照到已有病灶
 * - 否则创建新病灶
 *
 * @param lesion 待注册的病灶(可含 snapshots 或单个)
 * @returns 注册后的病灶(含 ID)
 */
export async function register(lesion: Omit<TrackedLesion, 'id' | 'createdAt'> & { id?: string }): Promise<TrackedLesion> {
  await delay();
  const now = new Date().toISOString();

  const category = lesion.category ?? 'target';

  // 尝试匹配已有病灶
  const existing = lesionStore.find(
    (l) => l.patientId === lesion.patientId && l.category === category && locationScore(l.location, lesion.location) >= 0.7,
  );

  if (existing) {
    existing.snapshots = [...existing.snapshots, ...lesion.snapshots].sort(
      (a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate),
    );
    const baseline = existing.snapshots[0];
    const latest = existing.snapshots[existing.snapshots.length - 1];
    if (baseline && latest) {
      latest.response = classifyResponse(baseline.longDiameter, latest.longDiameter);
      existing.overallResponse = latest.response;
    }
    existing.label = lesion.label ?? existing.label;
    return { ...existing, snapshots: [...existing.snapshots] };
  }

  const id = lesion.id ?? generateLesionId();
  const baseline = lesion.snapshots[0];
  const created: TrackedLesion = {
    ...lesion,
    category,
    id,
    createdAt: now,
    snapshots: [...lesion.snapshots].sort((a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate)),
  };
  if (baseline && created.snapshots.length > 0) {
    const latest = created.snapshots[created.snapshots.length - 1];
    if (latest) {
      latest.response = classifyResponse(baseline.longDiameter, latest.longDiameter);
      created.overallResponse = latest.response;
    }
  }
  lesionStore.push(created);
  return { ...created, snapshots: [...created.snapshots] };
}

/**
 * 在指定 study 内按位置查找候选病灶
 *
 * @param studyInstanceUID 研究 UID
 * @param location 解剖位置
 * @returns 候选病灶列表(按相似度倒序)
 */
export async function findByLocation(studyInstanceUID: string, location: LesionLocation): Promise<TrackedLesion[]> {
  await delay();
  const candidates: Array<{ lesion: TrackedLesion; score: number }> = [];
  for (const lesion of lesionStore) {
    const hasInStudy = lesion.snapshots.some((s) => s.studyInstanceUID === studyInstanceUID);
    if (!hasInStudy) continue;
    const score = locationScore(lesion.location, location);
    if (score >= 0.4) candidates.push({ lesion, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.map((c) => ({ ...c.lesion, snapshots: [...c.lesion.snapshots] }));
}

/**
 * 获取病灶的时序趋势(基线 -> 最新)
 *
 * @param lesionId 病灶追踪 ID
 * @returns 趋势结果(含变化百分比 + 时间序列)
 */
export async function getTrend(lesionId: LesionTrackingId): Promise<LesionTrend | null> {
  await delay(60);
  const lesion = lesionStore.find((l) => l.id === lesionId);
  if (!lesion) return null;

  const baseline = lesion.snapshots[0];
  if (!baseline) return null;
  const latest = lesion.snapshots[lesion.snapshots.length - 1] ?? baseline;

  const longChange = ((latest.longDiameter - baseline.longDiameter) / Math.max(baseline.longDiameter, 1)) * 100;
  const shortChange =
    baseline.shortDiameter && latest.shortDiameter
      ? ((latest.shortDiameter - baseline.shortDiameter) / Math.max(baseline.shortDiameter, 1)) * 100
      : undefined;
  const volumeChange =
    baseline.volume && latest.volume
      ? ((latest.volume - baseline.volume) / Math.max(baseline.volume, 1)) * 100
      : undefined;

  const overallResponse = latest.response ?? classifyResponse(baseline.longDiameter, latest.longDiameter);

  return {
    lesionId: lesion.id,
    longDiameterChangePercent: Math.round(longChange * 100) / 100,
    shortDiameterChangePercent: shortChange !== undefined ? Math.round(shortChange * 100) / 100 : undefined,
    volumeChangePercent: volumeChange !== undefined ? Math.round(volumeChange * 100) / 100 : undefined,
    overallResponse,
    timeline: lesion.snapshots.map((s) => ({
      date: s.acquisitionDate,
      longDiameter: s.longDiameter,
      shortDiameter: s.shortDiameter,
      volume: s.volume,
      response: s.response,
    })),
  };
}

/**
 * 对比同一病灶在两次研究中的变化
 *
 * @param lesionId 病灶追踪 ID
 * @param studyA 研究 A UID(基线)
 * @param studyB 研究 B UID(随访)
 * @returns 双研究对比结果(含 RECIST 反应)
 */
export async function compareStudies(
  lesionId: LesionTrackingId,
  studyA: string,
  studyB: string,
): Promise<LesionComparison | null> {
  await delay(100);
  const lesion = lesionStore.find((l) => l.id === lesionId);
  if (!lesion) return null;
  const snapA = lesion.snapshots.find((s) => s.studyInstanceUID === studyA);
  const snapB = lesion.snapshots.find((s) => s.studyInstanceUID === studyB);
  if (!snapA || !snapB) return null;
  const changeMm = snapB.longDiameter - snapA.longDiameter;
  const changePercent = (changeMm / Math.max(snapA.longDiameter, 1)) * 100;
  return {
    lesionId: lesion.id,
    studyA,
    studyB,
    longDiameterA: snapA.longDiameter,
    longDiameterB: snapB.longDiameter,
    changeMm: Math.round(changeMm * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    response: classifyResponse(snapA.longDiameter, snapB.longDiameter),
  };
}

/** 列出患者的所有病灶 */
export async function listByPatient(patientId: string): Promise<TrackedLesion[]> {
  await delay(50);
  return lesionStore
    .filter((l) => l.patientId === patientId)
    .map((l) => ({ ...l, snapshots: [...l.snapshots] }));
}

/** 通过 ID 读取病灶 */
export async function getById(lesionId: LesionTrackingId): Promise<TrackedLesion | null> {
  await delay(40);
  const found = lesionStore.find((l) => l.id === lesionId);
  return found ? { ...found, snapshots: [...found.snapshots] } : null;
}

/** 列出所有病灶 */
export async function listAll(): Promise<TrackedLesion[]> {
  await delay();
  return lesionStore.map((l) => ({ ...l, snapshots: [...l.snapshots] }));
}

/** 向现有病灶追加一次随访快照(快捷方法) */
export async function appendSnapshot(
  lesionId: LesionTrackingId,
  snapshot: LesionSnapshot,
): Promise<TrackedLesion | null> {
  await delay();
  const lesion = lesionStore.find((l) => l.id === lesionId);
  if (!lesion) return null;
  lesion.snapshots.push(snapshot);
  lesion.snapshots.sort((a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate));
  const baseline = lesion.snapshots[0];
  const latest = lesion.snapshots[lesion.snapshots.length - 1];
  if (baseline && latest) {
    latest.response = classifyResponse(baseline.longDiameter, latest.longDiameter);
    lesion.overallResponse = latest.response;
  }
  return { ...lesion, snapshots: [...lesion.snapshots] };
}

/** 标记病灶为已消退(同时清零最新长径) */
export async function markResolved(lesionId: LesionTrackingId): Promise<TrackedLesion | null> {
  await delay(50);
  const lesion = lesionStore.find((l) => l.id === lesionId);
  if (!lesion) return null;
  lesion.category = 'resolved';
  lesion.overallResponse = 'CR';
  const latest = lesion.snapshots[lesion.snapshots.length - 1];
  if (latest) {
    latest.longDiameter = 0;
    latest.shortDiameter = 0;
    latest.volume = 0;
    latest.response = 'CR';
    latest.notes = '病灶消退';
  }
  return { ...lesion, snapshots: [...lesion.snapshots] };
}

/** 删除病灶(测试用) */
export async function remove(lesionId: LesionTrackingId): Promise<boolean> {
  await delay(30);
  const idx = lesionStore.findIndex((l) => l.id === lesionId);
  if (idx < 0) return false;
  lesionStore.splice(idx, 1);
  return true;
}

/** 工具函数:归一化 location 字符串 */
export function locationKey(location: LesionLocation): string {
  return normalizeLocation(location);
}

/** 工具函数:位置模糊匹配 */
export function locationsMatch(a: LesionLocation, b: LesionLocation, threshold = 0.7): boolean {
  return locationScore(a, b) >= threshold;
}

export const LesionTracker = {
  register,
  findByLocation,
  getTrend,
  compareStudies,
  listByPatient,
  getById,
  listAll,
  appendSnapshot,
  markResolved,
  remove,
  locationKey,
  locationsMatch,
};

export default LesionTracker;
