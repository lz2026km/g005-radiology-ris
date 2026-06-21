// ============================================================
// G005 放射科RIS系统 v1.0.4 - 报告缺陷分类字典
// Phase R4：缺陷分类管理 + 解决方案 + 统计
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  AlertOctagon, AlertCircle, Plus, Edit2, Trash2,
  Search, FileText, Eye, Hash,
  BookOpen, Lightbulb, ListChecks,
  TrendingUp, MessageSquare,
} from 'lucide-react';
import {
  DEFECT_LIBRARY,
  QUALITY_KPI,
  type DefectItem,
  type DefectCategory,
} from '../data/qualityScoreMock';

// ============================================================
// 分类配置
// ============================================================
const CATEGORY_CONFIG: Record<DefectCategory, { label: string; color: string; bg: string; icon: any }> = {
  description:  { label: '描述问题', color: '#3b82f6', bg: '#dbeafe', icon: FileText },
  terminology:  { label: '术语问题', color: '#7c3aed', bg: '#ede9fe', icon: BookOpen },
  format:       { label: '格式问题', color: '#0891b2', bg: '#cffafe', icon: Hash },
  logic:        { label: '逻辑问题', color: '#dc2626', bg: '#fee2e2', icon: AlertOctagon },
  critical:     { label: '危急值',   color: '#7f1d1d', bg: '#fecaca', icon: AlertCircle },
  completeness: { label: '完整性',   color: '#f59e0b', bg: '#fef3c7', icon: ListChecks },
};

const SEVERITY_CONFIG = {
  minor:    { label: '轻微', color: '#3b82f6', bg: '#dbeafe' },
  major:    { label: '重要', color: '#f59e0b', bg: '#fef3c7' },
  critical: { label: '严重', color: '#dc2626', bg: '#fee2e2' },
};

// ============================================================
// 主组件
// ============================================================
export default function ReportDefectLibraryPage() {
  const [defects] = useState<DefectItem[]>(DEFECT_LIBRARY);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [defectList, setDefects] = useState<DefectItem[]>(defects);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedDefect, setSelectedDefect] = useState<DefectItem | null>(defects[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTriggersModal, setShowTriggersModal] = useState(false);

  // 过滤
  const filteredDefects = useMemo(() => {
    return defectList.filter(d => {
      if (filterCategory !== 'all' && d.category !== filterCategory) return false;
      if (filterSeverity !== 'all' && d.severity !== filterSeverity) return false;
      if (search) {
        const t = search.toLowerCase();
        if (!d.name.toLowerCase().includes(t) &&
            !d.code.toLowerCase().includes(t) &&
            !d.description.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [defects, search, filterCategory, filterSeverity]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalCount: number }> = {};
    for (const d of defects) {
      if (!stats[d.category]) stats[d.category] = { count: 0, totalCount: 0 };
      stats[d.category].count += 1;
      stats[d.category].totalCount += d.count;
    }
    return stats;
  }, [defects]);

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      {/* 顶部 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertOctagon size={20} color="#dc2626" /> 报告缺陷分类字典
            <span style={{ fontSize: 10, padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: 3, fontWeight: 700 }}>R4</span>
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            {defects.length} 类缺陷 · 6 大分类 · 累计触发 {QUALITY_KPI.totalEvaluated} 次评分
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '6px 12px', border: 'none', borderRadius: 6,
              background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Plus size={12} /> 新增缺陷
          </button>
        </div>
      </div>

      {/* 分类统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
        {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => {
          const stat = categoryStats[key] || { count: 0, totalCount: 0 };
          const Icon = conf.icon;
          return (
            <div
              key={key}
              onClick={() => setFilterCategory(key === filterCategory ? 'all' : key)}
              style={{
                background: '#fff', padding: 12, borderRadius: 8,
                border: `2px solid ${filterCategory === key ? conf.color : '#e2e8f0'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `${conf.color}15`, color: conf.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>{conf.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: conf.color }}>{stat.count}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>类 / {stat.totalCount} 次触发</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 5 触发排行 */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        borderRadius: 8, padding: 12, marginBottom: 16,
        border: '1px solid #fcd34d',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={13} /> Top 5 最高频缺陷（累计触发）
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {QUALITY_KPI.defectTopList.map((d, i) => {
            const defect = defects.find(x => x.code === d.code);
            return (
              <div key={d.code} style={{
                background: '#fff', borderRadius: 6, padding: 8,
                border: '1px solid #fbbf24',
              }}>
                <div style={{ fontSize: 9, color: '#92400e', fontWeight: 700 }}>第 {i + 1} 名</div>
                <div style={{ fontSize: 11, color: '#1e293b', fontWeight: 600, marginTop: 2 }}>{d.name}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>{d.code}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>{d.count}</div>
                {defect && (
                  <span style={{
                    fontSize: 9, padding: '1px 4px', borderRadius: 2,
                    background: SEVERITY_CONFIG[defect.severity].bg,
                    color: SEVERITY_CONFIG[defect.severity].color,
                    fontWeight: 700, marginTop: 4, display: 'inline-block',
                  }}>{SEVERITY_CONFIG[defect.severity].label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 12 }}>
        {/* 左：缺陷列表 */}
        <div style={{
          background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={11} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索缺陷..."
                  style={{
                    width: '100%', padding: '5px 8px 5px 26px',
                    border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 11, outline: 'none',
                  }}
                />
              </div>
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={selectStyle}>
                <option value="all">全部</option>
                <option value="critical">严重</option>
                <option value="major">重要</option>
                <option value="minor">轻微</option>
              </select>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              <strong style={{ color: '#1e40af' }}>{filteredDefects.length}</strong> / {defects.length} 项
            </div>
          </div>
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            {filteredDefects.map(d => {
              const cConf = CATEGORY_CONFIG[d.category];
              const sConf = SEVERITY_CONFIG[d.severity];
              const isSelected = selectedDefect?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDefect(d)}
                  style={{
                    padding: 10, borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 2,
                      background: cConf.bg, color: cConf.color, fontWeight: 600,
                    }}>{cConf.label}</span>
                    <span style={{
                      fontSize: 9, padding: '1px 4px', borderRadius: 2,
                      background: sConf.bg, color: sConf.color, fontWeight: 700,
                    }}>{sConf.label}</span>
                    <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 'auto', fontWeight: 700 }}>×{d.count}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{d.code}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：详情 */}
        {selectedDefect && (
          <div style={{
            background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: `${CATEGORY_CONFIG[selectedDefect.category].color}15`,
                color: CATEGORY_CONFIG[selectedDefect.category].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(() => {
                  const Icon = CATEGORY_CONFIG[selectedDefect.category].icon;
                  return <Icon size={24} />;
                })()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{selectedDefect.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>编码：{selectedDefect.code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>触发次数</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{selectedDefect.count}</div>
              </div>
            </div>

            {/* 标签行 */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 12,
                background: CATEGORY_CONFIG[selectedDefect.category].bg,
                color: CATEGORY_CONFIG[selectedDefect.category].color, fontWeight: 600,
              }}>
                {CATEGORY_CONFIG[selectedDefect.category].label}
              </span>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 12,
                background: SEVERITY_CONFIG[selectedDefect.severity].bg,
                color: SEVERITY_CONFIG[selectedDefect.severity].color, fontWeight: 600,
              }}>
                严重度：{SEVERITY_CONFIG[selectedDefect.severity].label}
              </span>
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>📋 缺陷描述</div>
              <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6 }}>{selectedDefect.description}</div>
            </div>

            {/* 示例 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MessageSquare size={12} /> 典型示例
              </div>
              {selectedDefect.examples.map((ex, i) => (
                <div key={i} style={{
                  padding: 8, marginBottom: 4,
                  background: '#fef2f2', borderLeft: '3px solid #dc2626',
                  borderRadius: 4, fontSize: 11, color: '#7f1d1d',
                }}>
                  ❌ {ex}
                </div>
              ))}
            </div>

            {/* 解决方案 */}
            <div style={{ padding: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lightbulb size={12} /> 解决方案
              </div>
              <div style={{ fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>{selectedDefect.solution}</div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => { setSelectedDefect(d); setShowEditModal(true) }}
                style={{
                  padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 4,
                  background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Edit2 size={11} /> 编辑
              </button>
              <button
                onClick={() => { setSelectedDefect(d); setShowTriggersModal(true) }}
                style={{
                  padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: 4,
                  background: '#fff', color: '#475569', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Eye size={11} /> 触发记录
              </button>
              <button
                onClick={() => { if (window.confirm(`确定删除缺陷 "${d.name}" 吗?`)) setDefects(prev => prev.filter(x => x.id !== d.id)) }}
                style={{
                  padding: '5px 10px', border: '1px solid #dc2626', borderRadius: 4,
                  background: '#fff', color: '#dc2626', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
                }}
              >
                <Trash2 size={11} /> 删除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 样式
// ============================================================
const selectStyle: React.CSSProperties = {
  padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: 4,
  fontSize: 11, outline: 'none',
};
