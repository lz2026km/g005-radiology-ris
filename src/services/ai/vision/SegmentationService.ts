/**
 * G005 放射RIS系统 v3.0.6.5 - 分割服务 (全 mock)
 * A5-AI-ORCH / 80 点
 *
 * 文本/框提示的医学图像分割，输出 mask + 多类标签。
 */

import type {
  AISegmentationMask,
  AISegmentationClass,
  AIAlgorithm,
} from '../../../types/ai/orchestrator';
import { AI_MARKETPLACE_ALGORITHMS } from '../../../data/aiMarketplace';

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const PROMPT_TO_CLASSES: Record<string, { label: string }[]> = {
  liver: [{ label: '肝脏' }, { label: '病灶' }],
  肝: [{ label: '肝脏' }, { label: '病灶' }],
  肺: [{ label: '左肺' }, { label: '右肺' }, { label: '结节' }],
  lung: [{ label: '左肺' }, { label: '右肺' }, { label: '结节' }],
  脑: [{ label: '脑实质' }, { label: '病灶' }, { label: '水肿' }],
  brain: [{ label: '脑实质' }, { label: '肿瘤核心' }, { label: '水肿' }],
  心脏: [{ label: '左心室' }, { label: '右心室' }, { label: '心肌' }],
  heart: [{ label: '左心室' }, { label: '右心室' }, { label: '心肌' }],
  骨: [{ label: '骨皮质' }, { label: '骨松质' }],
  bone: [{ label: '骨皮质' }, { label: '骨松质' }],
  乳腺: [{ label: '腺体' }, { label: '脂肪' }, { label: '病灶' }],
  breast: [{ label: '腺体' }, { label: '脂肪' }, { label: '病灶' }],
};

export interface SegmentParams {
  studyId: string;
  sopInstanceUid: string;
  prompt: string;
  algorithmId?: string;
  dimensions?: { width: number; height: number; depth?: number };
}

export class SegmentationService {
  private algorithms: AIAlgorithm[];

  constructor(algorithms: AIAlgorithm[] = AI_MARKETPLACE_ALGORITHMS) {
    this.algorithms = algorithms;
  }

  getSegmentationAlgorithms(): AIAlgorithm[] {
    return this.algorithms.filter((a) => a.type === 'segmentation');
  }

  async segment(params: SegmentParams): Promise<AISegmentationMask> {
    const start = Date.now();
    await delay(600 + Math.random() * 800);

    const algo = this.resolveAlgorithm(params.algorithmId);
    const classes = this.resolveClasses(params.prompt);
    const dims = params.dimensions ?? { width: 512, height: 512, depth: 100 };

    const segClasses: AISegmentationClass[] = classes.map((c, i) => ({
      id: i + 1,
      label: c.label,
      color: COLORS[i % COLORS.length]!,
      voxelCount: 5000 + Math.floor(Math.random() * 50000),
      volumeMl: 5 + Math.random() * 100,
      boundingBox: {
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 200,
        width: 100 + Math.random() * 200,
        height: 100 + Math.random() * 200,
      },
    }));

    return {
      id: uuid('seg'),
      studyId: params.studyId,
      sopInstanceUid: params.sopInstanceUid,
      algorithmId: algo?.id ?? 'algo-liver-lesion',
      algorithmName: algo?.name ?? 'Generic Segmenter',
      prompt: params.prompt,
      classes: segClasses,
      dimensions: dims,
      maskFormat: 'rle',
      diceScore: 0.82 + Math.random() * 0.1,
      createdAt: new Date().toISOString(),
    };
  }

  async segmentByBox(studyId: string, sopInstanceUid: string, box: { x: number; y: number; width: number; height: number }): Promise<AISegmentationMask> {
    return this.segment({ studyId, sopInstanceUid, prompt: `box:${box.x},${box.y},${box.width},${box.height}` });
  }

  async listMasks(studyId: string): Promise<AISegmentationMask[]> {
    await delay(80);
    return [];
  }

  async exportMask(maskId: string, format: 'rle' | 'png' | 'nifti' | 'dicom-seg'): Promise<{ url: string; bytes: number; format: string }> {
    await delay(400);
    return { url: `mock://masks/${maskId}.${format}`, bytes: 1024 * (50 + Math.floor(Math.random() * 200)), format };
  }

  async refine(maskId: string, corrections: { classId: number; add: { x: number; y: number }[]; remove: { x: number; y: number }[] }): Promise<AISegmentationMask> {
    await delay(300);
    return {
      id: maskId,
      studyId: 'refined',
      sopInstanceUid: 'sop-refined',
      algorithmId: 'algo-liver-lesion',
      algorithmName: 'Refined',
      prompt: 'manual',
      classes: [],
      dimensions: { width: 512, height: 512 },
      maskFormat: 'rle',
      diceScore: 0.88,
      createdAt: new Date().toISOString(),
    };
  }

  private resolveAlgorithm(id?: string): AIAlgorithm | null {
    if (!id) return this.getSegmentationAlgorithms()[0] ?? null;
    return this.algorithms.find((a) => a.id === id) ?? null;
  }

  private resolveClasses(prompt: string): { label: string }[] {
    const lower = prompt.toLowerCase();
    for (const key of Object.keys(PROMPT_TO_CLASSES)) {
      if (lower.includes(key)) return PROMPT_TO_CLASSES[key]!;
    }
    return [{ label: '目标' }];
  }
}

export const segmentationService = new SegmentationService();
