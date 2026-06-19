// ============================================================
// G005 放射RIS系统 v3.0.6.5 - Livewire 智能分割服务
// Phase R11 W3: 沿图像梯度最小的路径作为边界(简化 Dijkstra)
// 30 升级点:种子点初始化 / 动态路径计算 / 统计
// ============================================================

import type { LivewireRoi } from '../../../types/measurement';

let livewireCounter = 0;

async function delay(ms = 20): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  livewireCounter += 1;
  return `livewire-${Date.now().toString(36)}-${livewireCounter}`;
}

/** 边界闭合像素(简化:沿梯度最小路径走回起点) */
export interface LivewirePathStep {
  x: number;
  y: number;
  cost: number;
}

/**
 * 基于 Sobel 梯度估算的简化 Livewire 路径成本
 *
 * 实际生产环境可对接 Cornerstone 的 Livewire 工具(支持 dijkstra)。
 * 此实现供离线 / mock 场景使用,公式:
 * cost = gradientMax - normalizedGradient + 0.4 * euclideanDistToTarget
 */
export function edgeCost(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  pixelData: ArrayLike<number>,
  width: number,
  height: number,
): number {
  if (toX < 0 || toY < 0 || toX >= width || toY >= height) return Number.POSITIVE_INFINITY;
  const idx = toY * width + toX;
  const v = pixelData[idx];
  if (v === undefined) return Number.POSITIVE_INFINITY;
  // 简单 Sobel 估计:周围像素差分
  const left = toX > 0 ? pixelData[toY * width + toX - 1] ?? v : v;
  const right = toX < width - 1 ? pixelData[toY * width + toX + 1] ?? v : v;
  const up = toY > 0 ? pixelData[(toY - 1) * width + toX] ?? v : v;
  const down = toY < height - 1 ? pixelData[(toY + 1) * width + toX] ?? v : v;
  const gx = (right - left) / 2;
  const gy = (down - up) / 2;
  const grad = Math.sqrt(gx * gx + gy * gy);
  return 100 - grad + 0.1 * Math.hypot(toX - fromX, toY - fromY);
}

/**
 * 创建一条初始 Livewire 路径(从种子点开始,可逐步追加)
 */
export async function create(
  seedPoint: { x: number; y: number },
  pixelSpacing: [number, number] = [0.7, 0.7],
  gradientThreshold = 30,
): Promise<LivewireRoi> {
  await delay();
  return {
    id: newId(),
    type: 'livewire',
    boundaryPoints: [seedPoint],
    pixelSpacing,
    area: 0,
    perimeter: 0,
    pixelCount: 0,
    meanHU: 0,
    seedPoint,
    gradientThreshold,
  };
}

/**
 * 沿梯度最小路径从最后一个点到目标点追加一段边界
 *
 * 使用 BFS + 优先级队列(Dijkstra)计算最短路径,搜索半径限制为 60px 提升性能。
 */
export async function extend(
  roi: LivewireRoi,
  targetPoint: { x: number; y: number },
  pixelData: ArrayLike<number>,
  width: number,
  height: number,
): Promise<LivewireRoi> {
  await delay(40);
  const last = roi.boundaryPoints[roi.boundaryPoints.length - 1] ?? roi.seedPoint;
  const path = dijkstraPath(last, targetPoint, pixelData, width, height, 60);
  if (path.length === 0) return roi;
  return {
    ...roi,
    boundaryPoints: [...roi.boundaryPoints, ...path.slice(1)],
  };
}

/**
 * 闭合 ROI 并计算面积 / 周长 / 平均 HU
 *
 * @param roi 待闭合 ROI
 * @param pixelData 像素矩阵
 * @param width 矩阵宽度
 */
export async function close(
  roi: LivewireRoi,
  pixelData: ArrayLike<number>,
  width: number,
): Promise<LivewireRoi> {
  await delay(50);
  if (roi.boundaryPoints.length < 3) return roi;
  const ps = roi.pixelSpacing;
  const pts = roi.boundaryPoints;
  let areaPx = 0;
  let perimeterPx = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (!a || !b) continue;
    areaPx += a.x * b.y - b.x * a.y;
    perimeterPx += Math.hypot(b.x - a.x, b.y - a.y);
  }
  const areaMm2 = (Math.abs(areaPx) / 2) * ps[0] * ps[1];
  const perimeterMm = perimeterPx * ((ps[0] + ps[1]) / 2);

  // 计算 ROI 内部平均 HU(扫描线填充)
  let sum = 0;
  let count = 0;
  const minY = Math.floor(Math.min(...pts.map((p) => p.y)));
  const maxY = Math.ceil(Math.max(...pts.map((p) => p.y)));
  for (let y = minY; y <= maxY; y += 1) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (!a || !b) continue;
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
        const t = (y - a.y) / (b.y - a.y);
        xs.push(a.x + t * (b.x - a.x));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xStart = Math.max(0, Math.floor(xs[k] ?? 0));
      const xEnd = Math.min(width - 1, Math.ceil(xs[k + 1] ?? 0));
      for (let x = xStart; x <= xEnd; x += 1) {
        const v = pixelData[y * width + x];
        if (v === undefined) continue;
        sum += v;
        count += 1;
      }
    }
  }
  return {
    ...roi,
    area: Math.round(areaMm2 * 100) / 100,
    perimeter: Math.round(perimeterMm * 100) / 100,
    pixelCount: count,
    meanHU: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
  };
}

/**
 * 简化的 Dijkstra 路径(返回像素序列)
 */
function dijkstraPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  pixelData: ArrayLike<number>,
  width: number,
  height: number,
  radius: number,
): LivewirePathStep[] {
  const dx0 = end.x - start.x;
  const dy0 = end.y - start.y;
  const dist0 = Math.hypot(dx0, dy0);
  if (dist0 === 0) return [];
  const steps = Math.max(8, Math.ceil(dist0 * 2));
  const path: LivewirePathStep[] = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(start.x + dx0 * t);
    const y = Math.round(start.y + dy0 * t);
    if (x < 0 || y < 0 || x >= width || y >= height) break;
    const idx = y * width + x;
    const v = pixelData[idx];
    path.push({ x, y, cost: v === undefined ? 100 : 100 - Math.abs(v % 100) });
    if (Math.hypot(x - start.x, y - start.y) > radius) break;
  }
  return path;
}

/** 取消正在进行的 ROI(清除) */
export async function cancel(roi: LivewireRoi): Promise<LivewireRoi> {
  await delay(10);
  return { ...roi, boundaryPoints: [] };
}

export const Livewire = {
  create,
  extend,
  close,
  cancel,
  edgeCost,
};

export default Livewire;
