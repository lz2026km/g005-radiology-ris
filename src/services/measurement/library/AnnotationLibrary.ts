// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 标注库服务
// Phase R11 W4: 模板搜索 / 收藏 / 使用统计 / 共享范围管理
// 30 升级点:CRUD / search / toggleFavorite / recordUsage / 共享范围
// ============================================================

import type { AnnotationTemplate } from '../../../types/measurement';
import { ANNOTATION_LIBRARY_MOCK } from '../../../data/measurement/annotationLibraryMock';

const SIM_LATENCY_MS = 60;

let library: AnnotationTemplate[] = ANNOTATION_LIBRARY_MOCK.map((t) => ({ ...t, keywords: [...t.keywords] }));
let favorites: Set<string> = new Set();

async function delay(ms = SIM_LATENCY_MS): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * 列出所有模板(可按类别 / 共享范围过滤)
 */
export async function list(filter?: {
  category?: AnnotationTemplate['category'];
  sharedScope?: AnnotationTemplate['sharedScope'];
  onlyFavorites?: boolean;
  search?: string;
  anatomy?: string;
}): Promise<AnnotationTemplate[]> {
  await delay(40);
  let result = [...library];
  if (filter?.category) result = result.filter((t) => t.category === filter.category);
  if (filter?.sharedScope) result = result.filter((t) => t.sharedScope === filter.sharedScope);
  if (filter?.onlyFavorites) result = result.filter((t) => favorites.has(t.id));
  if (filter?.anatomy) {
    const q = filter.anatomy.toLowerCase();
    result = result.filter(
      (t) => t.anatomy?.toLowerCase().includes(q) || t.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }
  return result.map((t) => ({ ...t, keywords: [...t.keywords] }));
}

/**
 * 读取模板详情
 */
export async function getById(id: string): Promise<AnnotationTemplate | null> {
  await delay(30);
  const found = library.find((t) => t.id === id);
  return found ? { ...found, keywords: [...found.keywords] } : null;
}

/**
 * 创建模板
 */
export async function create(template: Omit<AnnotationTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<AnnotationTemplate> {
  await delay();
  const now = new Date().toISOString();
  const id = `tpl-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  const next: AnnotationTemplate = {
    ...template,
    id,
    createdAt: now,
    usageCount: 0,
    keywords: [...template.keywords],
  };
  library.push(next);
  return { ...next, keywords: [...next.keywords] };
}

/**
 * 更新模板(共享范围 / 默认文字 / 颜色等)
 */
export async function update(id: string, patch: Partial<Omit<AnnotationTemplate, 'id' | 'createdAt'>>): Promise<AnnotationTemplate | null> {
  await delay();
  const idx = library.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const cur = library[idx];
  if (!cur) return null;
  const updated: AnnotationTemplate = { ...cur, ...patch, keywords: patch.keywords ? [...patch.keywords] : [...cur.keywords] };
  library[idx] = updated;
  return { ...updated, keywords: [...updated.keywords] };
}

/**
 * 记录模板被使用一次(用于排序与统计)
 */
export async function recordUsage(id: string): Promise<AnnotationTemplate | null> {
  await delay(10);
  const t = library.find((x) => x.id === id);
  if (!t) return null;
  t.usageCount += 1;
  return { ...t, keywords: [...t.keywords] };
}

/** 切换收藏 */
export async function toggleFavorite(id: string): Promise<boolean> {
  await delay(10);
  if (favorites.has(id)) {
    favorites.delete(id);
    return false;
  }
  favorites.add(id);
  return true;
}

/** 读取当前收藏集合 */
export async function listFavorites(): Promise<string[]> {
  await delay(10);
  return Array.from(favorites);
}

/** 共享范围升级(私有 -> 科室 -> 全院 -> 公开) */
export async function upgradeScope(
  id: string,
  target: AnnotationTemplate['sharedScope'],
): Promise<AnnotationTemplate | null> {
  await delay(20);
  const t = library.find((x) => x.id === id);
  if (!t) return null;
  t.sharedScope = target;
  return { ...t, keywords: [...t.keywords] };
}

/** 删除模板 */
export async function remove(id: string): Promise<boolean> {
  await delay(20);
  const idx = library.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  library.splice(idx, 1);
  favorites.delete(id);
  return true;
}

/** 按使用频次返回 Top N */
export async function topUsed(limit = 10): Promise<AnnotationTemplate[]> {
  await delay(20);
  return [...library]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
    .map((t) => ({ ...t, keywords: [...t.keywords] }));
}

/** 按类别分组统计 */
export async function categoryStats(): Promise<Record<AnnotationTemplate['category'], number>> {
  await delay(15);
  const stats: Record<AnnotationTemplate['category'], number> = {
    finding: 0,
    measurement: 0,
    roi: 0,
    label: 0,
    arrow: 0,
  };
  for (const t of library) {
    stats[t.category] += 1;
  }
  return stats;
}

export const AnnotationLibrary = {
  list,
  getById,
  create,
  update,
  remove,
  recordUsage,
  toggleFavorite,
  listFavorites,
  upgradeScope,
  topUsed,
  categoryStats,
};

export default AnnotationLibrary;
