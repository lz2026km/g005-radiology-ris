/**
 * G005 RIS v3.0.7 - 活动流 UI (Activity Feed)
 *
 *  - 时间倒序展示
 *  - 类型图标 + 颜色
 *  - 类型/报告/用户过滤
 *  - 通过 ActivityFeed 服务订阅
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Tooltip, Select, Input } from 'antd';
import {
  Activity,
  UserCheck,
  UserX,
  Edit3,
  MessageSquare,
  AtSign,
  MousePointer,
  Save,
  Camera,
  Pin,
  GitMerge,
  CheckCircle2,
} from 'lucide-react';
import { activityFeed } from '../../services/collab/ActivityFeed';
import type { CollabActivity, CollabActivityType } from '../../types/collab';

export interface ActivityFeedProps {
  reportId?: string;
  /** 默认最大条目 */
  limit?: number;
  /** 是否显示过滤控件 */
  showFilters?: boolean;
  testIdPrefix?: string;
}

const TYPE_META: Record<CollabActivityType, { label: string; color: string; Icon: React.ElementType }> = {
  join: { label: '加入', color: '#10b981', Icon: UserCheck },
  leave: { label: '离开', color: '#dc2626', Icon: UserX },
  edit: { label: '编辑', color: '#3b82f6', Icon: Edit3 },
  comment: { label: '评论', color: '#7c3aed', Icon: MessageSquare },
  'comment-resolve': { label: '解决', color: '#059669', Icon: CheckCircle2 },
  mention: { label: '提及', color: '#f59e0b', Icon: AtSign },
  select: { label: '选中', color: '#0891b2', Icon: MousePointer },
  save: { label: '保存', color: '#10b981', Icon: Save },
  snapshot: { label: '快照', color: '#6366f1', Icon: Pin },
  share: { label: '共享', color: '#ec4899', Icon: Camera },
  'mention-handled': { label: '处理', color: '#0ea5e9', Icon: CheckCircle2 },
  'note-add': { label: '便签', color: '#facc15', Icon: Pin },
  merge: { label: '合并', color: '#a855f7', Icon: GitMerge },
  sign: { label: '签发', color: '#0f766e', Icon: CheckCircle2 },
};

const timeAgo = (iso: string): string => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
};

export const ActivityFeedView: React.FC<ActivityFeedProps> = ({
  reportId,
  limit = 30,
  showFilters = true,
  testIdPrefix = 'activity-feed',
}) => {
  const [items, setItems] = useState<CollabActivity[]>([]);
  const [typeFilter, setTypeFilter] = useState<CollabActivityType | 'all'>('all');
  const [keyword, setKeyword] = useState('');

  const reload = () => {
    const list = activityFeed.query({
      reportId,
      type: typeFilter === 'all' ? undefined : typeFilter,
      limit: 200,
    });
    setItems(list);
  };

  useEffect(() => {
    reload();
    const unsub = activityFeed.subscribe(() => reload());
    const timer = window.setInterval(reload, 10_000);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, typeFilter]);

  const filtered = useMemo(() => {
    let list = items;
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      list = list.filter((a) =>
        a.detail.toLowerCase().includes(k) ||
        a.userName.toLowerCase().includes(k) ||
        a.type.toLowerCase().includes(k),
      );
    }
    return list.slice(0, limit);
  }, [items, keyword, limit]);

  return (
    <div
      data-testid={testIdPrefix}
      role="region"
      aria-label="活动流"
      style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="#3b82f6" />
          <strong style={{ fontSize: 13 }}>活动流</strong>
          <Tag color="blue">{items.length}</Tag>
        </div>
        {showFilters && (
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Select
              size="small"
              style={{ minWidth: 100 }}
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as CollabActivityType | 'all')}
              data-testid={`${testIdPrefix}-type-filter`}
              options={[
                { label: '全部类型', value: 'all' },
                ...Object.entries(TYPE_META).map(([k, v]) => ({ label: v.label, value: k })),
              ]}
            />
            <Input
              size="small"
              placeholder="搜索活动..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, minWidth: 120 }}
              data-testid={`${testIdPrefix}-search`}
            />
          </div>
        )}
      </div>
      <div
        data-testid={`${testIdPrefix}-list`}
        style={{ maxHeight: 380, overflowY: 'auto' }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
            <Tooltip title="暂无活动">
              <Activity size={20} style={{ opacity: 0.4 }} />
            </Tooltip>
            <div style={{ marginTop: 6 }}>暂无活动记录</div>
          </div>
        ) : (
          filtered.map((a) => {
            const meta = TYPE_META[a.type];
            const Icon = meta.Icon;
            return (
              <div
                key={a.id}
                data-testid={`${testIdPrefix}-item-${a.id}`}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: meta.color,
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#0f172a' }}>
                    <span style={{ fontWeight: 600 }}>{a.userName}</span>
                    <Tag color="default" style={{ marginInline: 4, fontSize: 10 }}>
                      {meta.label}
                    </Tag>
                    <span style={{ color: '#475569' }}>{a.detail}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {new Date(a.timestamp).toLocaleString('zh-CN')} · {timeAgo(a.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeedView;
