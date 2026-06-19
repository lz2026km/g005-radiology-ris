/**
 * G005 放射RIS系统 v3.0.6.5 - Prompt 模板库 (全 mock)
 * A5-AI-ORCH / 50 点
 *
 * 50+ 模板的版本化库，支持变量填充、版本回溯。
 */

import type { AIPromptTemplate } from '../../../types/ai/orchestrator';
import { AI_PROMPT_TEMPLATES, AI_PROMPT_CATEGORIES } from '../../../data/aiPromptTemplates';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

export interface PromptRenderResult {
  systemPrompt: string;
  userPrompt: string;
  missingVariables: string[];
}

export class PromptLibrary {
  private templates: AIPromptTemplate[] = [...AI_PROMPT_TEMPLATES];

  async list(category?: string, search?: string): Promise<AIPromptTemplate[]> {
    await delay(60);
    let arr = [...this.templates];
    if (category) arr = arr.filter((t) => t.category === category);
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter((t) => t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s) || t.tags.some((x) => x.toLowerCase().includes(s)));
    }
    return arr.sort((a, b) => b.usageCount - a.usageCount);
  }

  async get(id: string): Promise<AIPromptTemplate | null> {
    await delay(40);
    return this.templates.find((t) => t.id === id) ?? null;
  }

  async getVersions(id: string): Promise<AIPromptTemplate[]> {
    await delay(40);
    return this.templates.filter((t) => t.id === id);
  }

  async render(id: string, vars: Record<string, string>): Promise<PromptRenderResult> {
    const tpl = await this.get(id);
    if (!tpl) throw new Error('模板不存在');
    const missing = tpl.variables.filter((v) => v.required && !(v.name in vars)).map((v) => v.name);
    return {
      systemPrompt: fillTemplate(tpl.systemPrompt, vars),
      userPrompt: fillTemplate(tpl.userPrompt, vars),
      missingVariables: missing,
    };
  }

  async save(template: Omit<AIPromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'avgRating'>): Promise<AIPromptTemplate> {
    await delay(80);
    const now = new Date().toISOString();
    const tpl: AIPromptTemplate = {
      ...template,
      id: `pt-${String(this.templates.length + 100).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      avgRating: 0,
    };
    this.templates.push(tpl);
    return tpl;
  }

  async update(id: string, patch: Partial<AIPromptTemplate>): Promise<AIPromptTemplate> {
    await delay(80);
    const tpl = this.templates.find((t) => t.id === id);
    if (!tpl) throw new Error('模板不存在');
    Object.assign(tpl, patch, { updatedAt: new Date().toISOString() });
    return tpl;
  }

  async deprecate(id: string): Promise<AIPromptTemplate> {
    return this.update(id, { deprecated: true });
  }

  async clone(id: string, newName: string): Promise<AIPromptTemplate> {
    const tpl = await this.get(id);
    if (!tpl) throw new Error('模板不存在');
    return this.save({ ...tpl, name: newName, version: '1.0.0' });
  }

  async recordUsage(id: string): Promise<void> {
    const tpl = this.templates.find((t) => t.id === id);
    if (tpl) tpl.usageCount += 1;
  }

  async listCategories(): Promise<{ id: string; label: string; count: number }[]> {
    await delay(20);
    return AI_PROMPT_CATEGORIES;
  }
}

export const promptLibrary = new PromptLibrary();
