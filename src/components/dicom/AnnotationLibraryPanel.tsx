// ============================================================
// G005 放射RIS系统 v3.0.6.5 - 标注库面板组件
// Phase R11 W4: 列表 / 搜索 / 收藏 / 使用统计 / 插入到当前标注
// 20 升级点:列表 / 搜索 / 收藏 / 共享范围 / 插入
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Library, Star, Search, Plus, Filter } from 'lucide-react';
import type { AnnotationTemplate } from '../../types/measurement';
import AnnotationLibrary from '../../services/measurement/library/AnnotationLibrary';

interface Props {
  onApplyTemplate?: (template: AnnotationTemplate) => void;
  /** 受控的查询词 */
  initialSearch?: string;
}

const CATEGORY_LABEL: Record<AnnotationTemplate['category'], string> = {
  finding: '影像所见',
  measurement: '测量',
  roi: 'ROI',
  label: '标签',
  arrow: '箭头',
};

const SCOPE_COLOR: Record<AnnotationTemplate['sharedScope'], string> = {
  private: '#6b7280',
  department: '#0ea5e9',
  institution: '#7c3aed',
  public: '#10b981',
};

const SCOPE_LABEL: Record<AnnotationTemplate['sharedScope'], string> = {
  private: '个人',
  department: '科室',
  institution: '全院',
  public: '公开',
};

export default function AnnotationLibraryPanel({ onApplyTemplate, initialSearch }: Props) {
  const [items, setItems] = useState<AnnotationTemplate[]>([]);
  const [search, setSearch] = useState(initialSearch ?? '');
  const [category, setCategory] = useState<AnnotationTemplate['category'] | 'all'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setBusy(true);
    try {
      const list = await AnnotationLibrary.list({
        search: search || undefined,
        category: category === 'all' ? undefined : category,
        onlyFavorites: false,
      });
      setItems(list);
      const favs = await AnnotationLibrary.listFavorites();
      setFavorites(new Set(favs));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const grouped = useMemo(() => {
    const map: Record<string, AnnotationTemplate[]> = {};
    for (const item of items) {
      const k = item.category;
      (map[k] ??= []).push(item);
    }
    return map;
  }, [items]);

  const toggleFav = async (id: string) => {
    const isFav = await AnnotationLibrary.toggleFavorite(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 280,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Library size={15} color="#7c3aed" />
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>标注库</h4>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280' }}>
          {items.length} 个模板
        </span>
      </header>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: 8, color: '#9ca3af' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板 / 关键词"
            style={{
              fontSize: 12,
              padding: '4px 8px 4px 24px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: '#fff',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
        <Filter size={13} color="#6b7280" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as AnnotationTemplate['category'] | 'all')}
          style={{ fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 }}
        >
          <option value="all">全部分类</option>
          {(Object.keys(CATEGORY_LABEL) as Array<AnnotationTemplate['category']>).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {busy && <div style={{ fontSize: 11, color: '#6b7280' }}>加载中...</div>}
        {!busy && items.length === 0 && (
          <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 16 }}>未找到匹配模板</div>
        )}
        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat}>
            <h5 style={{ margin: '4px 0', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
              {CATEGORY_LABEL[cat as AnnotationTemplate['category']] ?? cat} · {list.length}
            </h5>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {list.map((t) => {
                const isFav = favorites.has(t.id);
                return (
                  <li
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      background: '#f9fafb',
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: t.defaultColor, border: '1px solid rgba(0,0,0,0.06)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>
                        {CATEGORY_LABEL[t.category]} · 使用 {t.usageCount} 次 ·{' '}
                        <span style={{ color: SCOPE_COLOR[t.sharedScope] }}>{SCOPE_LABEL[t.sharedScope]}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => void toggleFav(t.id)}
                      title="收藏"
                      aria-label="收藏"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <Star size={13} color={isFav ? '#f59e0b' : '#d1d5db'} fill={isFav ? '#f59e0b' : 'transparent'} />
                    </button>
                    <button
                      onClick={() => {
                        void AnnotationLibrary.recordUsage(t.id);
                        onApplyTemplate?.(t);
                      }}
                      title="插入到当前标注"
                      aria-label="插入"
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Plus size={11} /> 插入
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
