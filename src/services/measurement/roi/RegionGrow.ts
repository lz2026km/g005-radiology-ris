// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 区域生长 ROI 服务
// Phase R11 W3: 基于 HU 阈值的连通区域生长
// 20 升级点:create / grow / close
// ============================================================

import type { RegionGrowRoi } from '../../../types/measurement';

let rgCounter = 0;

async function delay(ms = 20): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  rgCounter += 1;
  return `regiongrow-${Date.now().toString(36)}-${rgCounter}`;
}

/**
 * 创建区域生长 ROI 上下文
 */
export async function create(
  seedPoint: { x: number; y: number },
  huRange: { min: number; max: number },
  pixelSpacing: [number, number] = [0.7, 0.7],
): Promise<RegionGrowRoi> {
  await delay();
  return {
    id: newId(),
    type: 'regionGrow',
    points: [seedPoint],
    pixelSpacing,
    area: 0,
    pixelCount: 0,
    meanHU: 0,
    seedPoint,
    huRange,
  };
}

/**
 * 执行 4 邻域区域生长
 *
 * 队列式 BFS:从种子点出发,加入 HU 在 [min, max] 范围内的相邻像素。
 * 单帧最大像素数限制 200000 防止无限扩张。
 */
export async function grow(
  roi: RegionGrowRoi,
  pixelData: ArrayLike<number>,
  width: number,
  height: number,
): Promise<RegionGrowRoi> {
  await delay(50);
  const { min: huMin, max: huMax } = roi.huRange;
  const seedX = Math.round(roi.seedPoint.x);
  const seedY = Math.round(roi.seedPoint.y);
  if (seedX < 0 || seedY < 0 || seedX >= width || seedY >= height) return roi;
  const seedVal = pixelData[seedY * width + seedX];
  if (seedVal === undefined) return roi;
  if (seedVal < huMin || seedVal > huMax) return roi;

  const maxPixels = 200000;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [seedY * width + seedX];
  visited[seedY * width + seedX] = 1;
  let count = 0;
  let sum = 0;
  while (queue.length > 0 && count < maxPixels) {
    const idx = queue.shift();
    if (idx === undefined) break;
    const v = pixelData[idx];
    if (v === undefined) continue;
    sum += v;
    count += 1;
    const x = idx % width;
    const y = Math.floor(idx / width);
    const neighbors: Array<[number, number]> = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const nv = pixelData[nIdx];
      if (nv === undefined) continue;
      if (nv < huMin || nv > huMax) continue;
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }
  const areaPx = count;
  const areaMm2 = areaPx * roi.pixelSpacing[0] * roi.pixelSpacing[1];
  return {
    ...roi,
    area: Math.round(areaMm2 * 100) / 100,
    pixelCount: count,
    meanHU: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
  };
}

/** 调整 HU 范围并重新生长(避免重建 ROI) */
export async function refineRange(
  roi: RegionGrowRoi,
  newRange: { min: number; max: number },
): Promise<RegionGrowRoi> {
  await delay(10);
  return { ...roi, huRange: newRange };
}

export const RegionGrow = {
  create,
  grow,
  refineRange,
};

export default RegionGrow;
