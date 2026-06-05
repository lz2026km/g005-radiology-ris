// ============================================================
// G005 放射RIS系统 v2.1.0 - 术语服务
// Phase R12 W11: 查询 + 补全 + 统计
// ============================================================

import { getAllTerms, searchTerms, suggestAutocomplete, getTermsByCategory, getTermById, type Term, type TermCategory, type TermResult } from '../data/termSeed';

export interface TermStats {
  total: number;
  byCategory: Record<string, number>;
  withSnomed: number;
  withRadlex: number;
  withIcd10: number;
  withSynonyms: number;
}

export function getTermStats(): TermStats {
  const all = getAllTerms();
  const byCategory: Record<string, number> = {};
  let withSnomed = 0, withRadlex = 0, withIcd10 = 0, withSynonyms = 0;
  for (const t of all) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
    if (t.snomed) withSnomed++;
    if (t.radlex) withRadlex++;
    if (t.icd10) withIcd10++;
    if (t.synonyms && t.synonyms.length > 0) withSynonyms++;
  }
  return { total: all.length, byCategory, withSnomed, withRadlex, withIcd10, withSynonyms };
}

export function lookup(text: string, opts?: { category?: TermCategory | TermCategory[]; limit?: number }): TermResult[] {
  return searchTerms({ text, category: opts?.category, limit: opts?.limit ?? 20 });
}

export function autocomplete(prefix: string, limit = 10): Term[] {
  return suggestAutocomplete(prefix, limit);
}

export function byCategory(cat: TermCategory): Term[] {
  return getTermsByCategory(cat);
}

export function byId(id: string): Term | undefined {
  return getTermById(id);
}

// 智能推荐：根据当前报告上下文
export interface ReportContext {
  modality?: string;
  bodyPart?: string;
  clinicalHistory?: string;
}

export function recommendTerms(ctx: ReportContext, limit = 20): TermResult[] {
  const all = getAllTerms();
  const out: TermResult[] = [];
  const keywords = (ctx.clinicalHistory ?? '').toLowerCase().split(/[\s,，。、]+/).filter(Boolean);
  for (const t of all) {
    let score = 0;
    // 部位相关
    if (ctx.bodyPart) {
      const bp = ctx.bodyPart.toLowerCase();
      if (t.cn.includes(ctx.bodyPart) || t.term.toLowerCase().includes(bp)) score += 30;
    }
    // 关键词命中
    for (const k of keywords) {
      if (k.length < 2) continue;
      if (t.cn.toLowerCase().includes(k)) score += 10;
      if (t.term.toLowerCase().includes(k)) score += 8;
    }
    if (score > 0) {
      out.push({ ...t, matchedCn: t.cn, matchedTerm: t.term, score });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

// 按模态推荐
const MODALITY_TERM_MAP: Record<string, TermCategory[]> = {
  CT: ['finding-lung', 'finding-liver', 'anatomy-organ', 'technique'],
  MR: ['finding-brain', 'finding-kidney', 'finding-cardiac'],
  DR: ['finding-bone', 'fracture', 'anatomy-organ'],
  US: ['finding-thyroid', 'finding-kidney', 'finding-liver', 'finding-breast'],
  MG: ['finding-breast'],
  PT: ['finding-lung', 'finding-general'],
  XA: ['finding-cardiac', 'finding-general'],
};

export function getCategoriesForModality(modality: string): TermCategory[] {
  return MODALITY_TERM_MAP[modality] ?? ['finding-general', 'anatomy-organ'];
}
