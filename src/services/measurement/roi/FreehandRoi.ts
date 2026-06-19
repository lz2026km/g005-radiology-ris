// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 自由手绘 ROI 服务
// Phase R11 W3: 多边形闭合 ROI 绘制 + 面积/周长/统计
// 50 升级点:create / addPoint / close / stats / shape helpers
// ============================================================

import type { FreehandRoi } from '../../../types/measurement';

let roiCounter = 0;
const DEFAULT_PIXEL_SPACING: [number, number] = [0.7, 0.7];

async function delay(ms = 20): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  roiCounter += 1;
  return `freehand-${Date.now().toString(36)}-${roiCounter}`;
}

/**
 * 创建新的 freehand ROI(初始未闭合)
 *
 * @param pixelSpacing 像素间距(mm),默认 0.7×0.7
 */
export async function create(pixelSpacing: [number, number] = DEFAULT_PIXEL_SPACING): Promise<FreehandRoi> {
  await delay();
  return {
    id: newId(),
    type: 'freehand',
    points: [],
    pixelSpacing,
    area: 0,
    perimeter: 0,
    pixelCount: 0,
    meanHU: 0,
    minHU: 0,
    maxHU: 0,
    stdHU: 0,
    closed: false,
  };
}

/**
 * 向 ROI 添加一个顶点(用户拖动时高频调用)
 */
export async function addPoint(
  roi: FreehandRoi,
  point: { x: number; y: number },
): Promise<FreehandRoi> {
  // 抑制抖动:与上一个点距离 < 2 像素则跳过
  const last = roi.points[roi.points.length - 1];
  if (last) {
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    if (dx * dx + dy * dy < 4) return roi;
  }
  return { ...roi, points: [...roi.points, point] };
}

/**
 * 移除最后一个点(撤销)
 */
export async function undoLast(roi: FreehandRoi): Promise<FreehandRoi> {
  if (roi.points.length === 0) return roi;
  return { ...roi, points: roi.points.slice(0, -1), closed: false };
}

/**
 * 闭合 ROI 并计算面积 / 周长
 *
 * 面积:Shoelace 公式 × 像素间距
 * 周长:累加各边欧氏距离 × 像素间距(对角线按 sqrt(dx²+dy²))
 *
 * @param roi 待闭合 ROI
 */
export async function close(roi: FreehandRoi): Promise<FreehandRoi> {
  await delay(30);
  if (roi.points.length < 3) {
    return { ...roi, closed: false };
  }
  const ps = roi.pixelSpacing;
  const points = roi.points;
  let areaPx = 0;
  let perimeterPx = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    areaPx += a.x * b.y - b.x * a.y;
    perimeterPx += Math.hypot(b.x - a.x, b.y - a.y);
  }
  const areaMm2 = (Math.abs(areaPx) / 2) * ps[0] * ps[1];
  const perimeterMm = perimeterPx * ((ps[0] + ps[1]) / 2);
  const pixelCount = Math.round(Math.abs(areaPx));
  return {
    ...roi,
    closed: true,
    area: Math.round(areaMm2 * 100) / 100,
    perimeter: Math.round(perimeterMm * 100) / 100,
    pixelCount,
  };
}

/**
 * 根据像素矩阵计算 HU 统计
 *
 * @param roi ROI(已闭合)
 * @param pixelData 像素矩阵(行优先,单像素 HU)
 * @param width 矩阵宽度
 */
export async function computeStats(
  roi: FreehandRoi,
  pixelData: ArrayLike<number>,
  width: number,
): Promise<FreehandRoi> {
  await delay(40);
  if (!roi.closed || roi.points.length < 3) return roi;
  const bbox = boundingBox(roi);
  const mask = buildMask(roi);
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let y = bbox.minY; y <= bbox.maxY; y += 1) {
    const rowMask = mask[y];
    if (!rowMask) continue;
    for (let x = bbox.minX; x <= bbox.maxX; x += 1) {
      if (!rowMask[x]) continue;
      const idx = y * width + x;
      const val = pixelData[idx];
      if (val === undefined) continue;
      sum += val;
      sumSq += val * val;
      count += 1;
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }
  if (count === 0) return roi;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));
  return {
    ...roi,
    meanHU: Math.round(mean * 10) / 10,
    minHU: Math.round(min * 10) / 10,
    maxHU: Math.round(max * 10) / 10,
    stdHU: Math.round(std * 10) / 10,
    pixelCount: count,
  };
}

/** 简单包围盒 */
function boundingBox(roi: FreehandRoi): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const p of roi.points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return {
    minX: Math.floor(minX),
    maxX: Math.ceil(maxX),
    minY: Math.floor(minY),
    maxY: Math.ceil(maxY),
  };
}

/**
 * 用扫描线算法填充 ROI 内部掩码
 * 返回按行索引的 Uint8Array 列表
 */
function buildMask(roi: FreehandRoi): Uint8Array[] {
  const bbox = boundingBox(roi);
  const height = bbox.maxY - bbox.minY + 1;
  const width = bbox.maxX - bbox.minX + 1;
  const rows: Uint8Array[] = Array.from({ length: height }, () => new Uint8Array(width));
  if (roi.points.length < 3) return rows;
  for (let y = bbox.minY; y <= bbox.maxY; y += 1) {
    const intersections: number[] = [];
    for (let i = 0; i < roi.points.length; i += 1) {
      const a = roi.points[i];
      const b = roi.points[(i + 1) % roi.points.length];
      if (!a || !b) continue;
      const yi = y + 0.5;
      if ((a.y <= yi && b.y > yi) || (b.y <= yi && a.y > yi)) {
        const t = (yi - a.y) / (b.y - a.y);
        intersections.push(a.x + t * (b.x - a.x));
      }
    }
    intersections.sort((p, q) => p - q);
    for (let k = 0; k + 1 < intersections.length; k += 2) {
      const xStart = Math.max(0, Math.floor((intersections[k] ?? 0) - bbox.minX));
      const xEnd = Math.min(width - 1, Math.ceil((intersections[k + 1] ?? 0) - bbox.minX));
      const row = rows[y - bbox.minY];
      if (!row) continue;
      for (let x = xStart; x <= xEnd; x += 1) row[x] = 1;
    }
  }
  return rows;
}

/**
 * 计算多边形面积(mm²,Shoelace 公式)
 * 同步版,供热点代码使用
 */
export function polygonAreaMm2(points: Array<{ x: number; y: number }>, pixelSpacing: [number, number]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    area += a.x * b.y - b.x * a.y;
  }
  return (Math.abs(area) / 2) * pixelSpacing[0] * pixelSpacing[1];
}

/** 计算多边形周长(mm) */
export function polygonPerimeterMm(
  points: Array<{ x: number; y: number }>,
  pixelSpacing: [number, number],
): number {
  if (points.length < 2) return 0;
  let p = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) continue;
    p += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return p * ((pixelSpacing[0] + pixelSpacing[1]) / 2);
}

/** 简化多边形(Douglas-Peucker,容差按像素) */
export function simplifyPolygon(
  points: Array<{ x: number; y: number }>,
  tolerance = 1.5,
): Array<{ x: number; y: number }> {
  if (points.length < 3) return [...points];
  const sqTol = tolerance * tolerance;
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const range = stack.pop();
    if (!range) break;
    const [first, last] = range;
    let maxDist = 0;
    let index = -1;
    const a = points[first];
    const b = points[last];
    if (!a || !b) continue;
    for (let i = first + 1; i < last; i += 1) {
      const p = points[i];
      if (!p) continue;
      const d = pointToSegmentDistSq(p, a, b);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > sqTol && index > 0) {
      keep[index] = true;
      stack.push([first, index]);
      stack.push([index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function pointToSegmentDistSq(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    const ex = p.x - a.x;
    const ey = p.y - a.y;
    return ex * ex + ey * ey;
  }
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  const px = a.x + t * dx;
  const py = a.y + t * dy;
  const ex = p.x - px;
  const ey = p.y - py;
  return ex * ex + ey * ey;
}

export const FreehandRoiService = {
  create,
  addPoint,
  undoLast,
  close,
  computeStats,
  polygonAreaMm2,
  polygonPerimeterMm,
  simplifyPolygon,
};

export default FreehandRoiService;
