// ============================================================
// G005 放射RIS系统 v3.0.6.5 - AI 检测框转测量桥接服务
// Phase R11 W6: 把 AI bbox 转换为可写入报告的测量项
// 20 升级点:bbox -> length/diameter/area / 可关联 TrackedLesion
// ============================================================

import type { AiBoundingBox, AiConvertedMeasurement } from '../../../types/measurement';
import { TrackedLesion } from '../../../types/measurement';

async function delay(ms = 20): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

let bridgeCounter = 0;

/**
 * 将单个 AI 检测框转换为直径测量(取 bbox 较长边作为直径)
 *
 * @param bbox AI 检测框
 * @param lesion 可选关联病灶(用于生成 Lesion ID)
 */
export async function bboxToDiameter(bbox: AiBoundingBox, lesion?: TrackedLesion): Promise<AiConvertedMeasurement> {
  await delay();
  bridgeCounter += 1;
  const longSidePx = Math.max(bbox.bbox.width, bbox.bbox.height);
  const longSideMm = longSidePx * bbox.pixelSpacing[0];
  return {
    id: `ai-conv-${Date.now().toString(36)}-${bridgeCounter}`,
    bboxId: bbox.id,
    measurementType: 'diameter',
    value: Math.round(longSideMm * 10) / 10,
    unit: 'mm',
    label: bbox.categoryZh || bbox.category,
    lesionId: lesion?.id,
    confidence: bbox.confidence,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 将单个 AI 检测框转换为面积(矩形近似)
 */
export async function bboxToArea(bbox: AiBoundingBox, lesion?: TrackedLesion): Promise<AiConvertedMeasurement> {
  await delay();
  bridgeCounter += 1;
  const wMm = bbox.bbox.width * bbox.pixelSpacing[0];
  const hMm = bbox.bbox.height * bbox.pixelSpacing[1];
  return {
    id: `ai-conv-${Date.now().toString(36)}-${bridgeCounter}`,
    bboxId: bbox.id,
    measurementType: 'area',
    value: Math.round(wMm * hMm * 100) / 100,
    unit: 'mm²',
    label: bbox.categoryZh || bbox.category,
    lesionId: lesion?.id,
    confidence: bbox.confidence,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 批量转换:逐个 bbox -> measurement
 */
export async function batchConvert(
  bboxes: AiBoundingBox[],
  lesionByCategory?: Record<string, TrackedLesion>,
): Promise<AiConvertedMeasurement[]> {
  await delay(40);
  const out: AiConvertedMeasurement[] = [];
  for (const bbox of bboxes) {
    const lesion = lesionByCategory?.[bbox.category];
    const m = await bboxToDiameter(bbox, lesion);
    out.push(m);
  }
  return out;
}

/**
 * 桥接器对象
 */
export const AutoAnnotationBridge = {
  bboxToDiameter,
  bboxToArea,
  batchConvert,
};

export default AutoAnnotationBridge;
