/**
 * G005 放射RIS系统 v3.0.5.1 - 审批链管理 Service (mock)
 * 25 pts
 *
 * 管理审批链模板: 创建/查询/更新/删除
 */

import type {
  ApprovalChainTemplate,
  ApprovalLevel,
} from '../../types/sign';
import { APPROVAL_CHAIN_TEMPLATES } from '../../data/signMock';

const MIN_DELAY_MS = 150;
const MAX_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class ApprovalChainService {
  private templates: ApprovalChainTemplate[] = [...APPROVAL_CHAIN_TEMPLATES.map((t) => ({ ...t, levels: [...t.levels] }))];

  async list(): Promise<ApprovalChainTemplate[]> {
    await randomDelay();
    return this.templates.map((t) => ({ ...t, levels: [...t.levels] }));
  }

  async getById(id: string): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const found = this.templates.find((t) => t.id === id);
    return found ? { ...found, levels: [...found.levels] } : null;
  }

  async create(template: Omit<ApprovalChainTemplate, 'id' | 'createdAt'>): Promise<ApprovalChainTemplate> {
    await randomDelay();
    const created: ApprovalChainTemplate = {
      ...template,
      id: uuid('tmpl'),
      createdAt: nowIso(),
      levels: template.levels.map((l, i) => ({ ...l, levelId: l.levelId ?? `lv-${uuid('lvl').slice(0, 12)}`, order: l.order ?? i + 1 })),
    };
    this.templates.push(created);
    return { ...created, levels: [...created.levels] };
  }

  async update(id: string, updates: Partial<Omit<ApprovalChainTemplate, 'id' | 'createdAt'>>): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const idx = this.templates.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    this.templates[idx] = { ...this.templates[idx]!, ...updates, levels: updates.levels ?? this.templates[idx]!.levels };
    return { ...this.templates[idx]!, levels: [...this.templates[idx]!.levels] };
  }

  async delete(id: string): Promise<boolean> {
    await randomDelay();
    const idx = this.templates.findIndex((t) => t.id === id);
    if (idx < 0) return false;
    this.templates.splice(idx, 1);
    return true;
  }

  async setDefault(id: string): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    this.templates.forEach((t) => { t.isDefault = t.id === id; });
    const found = this.templates.find((t) => t.id === id);
    return found ? { ...found, levels: [...found.levels] } : null;
  }

  async getDefault(): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const found = this.templates.find((t) => t.isDefault);
    return found ? { ...found, levels: [...found.levels] } : null;
  }

  async getByAppliesTo(appliesTo: ApprovalChainTemplate['appliesTo']): Promise<ApprovalChainTemplate[]> {
    await randomDelay();
    return this.templates.filter((t) => t.appliesTo === appliesTo).map((t) => ({ ...t, levels: [...t.levels] }));
  }

  async addLevel(templateId: string, level: ApprovalLevel): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const idx = this.templates.findIndex((t) => t.id === templateId);
    if (idx < 0) return null;
    this.templates[idx]!.levels.push({ ...level, levelId: level.levelId ?? `lv-${uuid('lvl').slice(0, 12)}` });
    return { ...this.templates[idx]!, levels: [...this.templates[idx]!.levels] };
  }

  async removeLevel(templateId: string, levelId: string): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const idx = this.templates.findIndex((t) => t.id === templateId);
    if (idx < 0) return null;
    this.templates[idx]!.levels = this.templates[idx]!.levels.filter((l) => l.levelId !== levelId);
    return { ...this.templates[idx]!, levels: [...this.templates[idx]!.levels] };
  }

  async reorderLevels(templateId: string, levelIds: string[]): Promise<ApprovalChainTemplate | null> {
    await randomDelay();
    const idx = this.templates.findIndex((t) => t.id === templateId);
    if (idx < 0) return null;
    const levelMap = new Map(this.templates[idx]!.levels.map((l) => [l.levelId, l]));
    const reordered: ApprovalLevel[] = [];
    for (const levelId of levelIds) {
      const level = levelMap.get(levelId);
      if (level) reordered.push({ ...level, order: reordered.length + 1 });
    }
    this.templates[idx]!.levels = reordered;
    return { ...this.templates[idx]!, levels: [...this.templates[idx]!.levels] };
  }
}

export const approvalChainService = new ApprovalChainService();
