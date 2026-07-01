/**
 * G005 RIS v3.0.7 - 便签 (Sticky Note)
 *
 *  - 在 viewer 上叠加
 *  - 拖拽 (Pointer Events) + 缩放
 *  - 颜色 / 固定
 *  - 通过 StickyNoteService 持久化
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popconfirm } from 'antd';
import { Pin, Trash2, Edit3, Maximize2, GripVertical } from 'lucide-react';
import { stickyNoteService } from '../../services/collab/StickyNoteService';
import type { CollabStickyNote, CollabNoteColor } from '../../types/collab';

const COLOR_BG: Record<CollabNoteColor, { bg: string; border: string; accent: string }> = {
  yellow: { bg: '#fef3c7', border: '#fbbf24', accent: '#92400e' },
  pink: { bg: '#fce7f3', border: '#ec4899', accent: '#9d174d' },
  green: { bg: '#dcfce7', border: '#22c55e', accent: '#166534' },
  blue: { bg: '#dbeafe', border: '#3b82f6', accent: '#1e3a8a' },
  purple: { bg: '#f3e8ff', border: '#a855f7', accent: '#581c87' },
  orange: { bg: '#ffedd5', border: '#f97316', accent: '#7c2d12' },
};

export interface StickyNoteProps {
  note: CollabStickyNote;
  /** 容器边界 (px, viewport 坐标) */
  containerRef: React.RefObject<HTMLElement | null>;
  /** 是否可编辑 */
  canEdit?: boolean;
  /** 当前用户 (用于删除权限) */
  currentUserId: string;
  /** 选中回调 */
  onSelect?: (note: CollabStickyNote) => void;
  /** 测试 ID 前缀 */
  testIdPrefix?: string;
}

type DragState =
  | { mode: 'idle' }
  | { mode: 'move'; startX: number; startY: number; originX: number; originY: number }
  | { mode: 'resize'; startX: number; startY: number; originW: number; originH: number };

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  containerRef,
  canEdit = true,
  currentUserId,
  onSelect,
  testIdPrefix = 'sticky',
}) => {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title ?? '');
  const [draftContent, setDraftContent] = useState(note.content);
  const [position, setPosition] = useState(note.position);
  const [size, setSize] = useState({ width: note.width, height: note.height });
  const dragState = useRef<DragState>({ mode: 'idle' });

  useEffect(() => {
    setPosition(note.position);
    setSize({ width: note.width, height: note.height });
    setDraftTitle(note.title ?? '');
    setDraftContent(note.content);
  }, [note.id, note.position.x, note.position.y, note.width, note.height, note.title, note.content]);

  const palette = COLOR_BG[note.color];

  const onPointerDownMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canEdit) return;
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        mode: 'move',
        startX: e.clientX,
        startY: e.clientY,
        originX: position.x,
        originY: position.y,
      };
    },
    [canEdit, position.x, position.y],
  );

  const onPointerDownResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canEdit) return;
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        mode: 'resize',
        startX: e.clientX,
        startY: e.clientY,
        originW: size.width,
        originH: size.height,
      };
    },
    [canEdit, size.width, size.height],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (state.mode === 'idle') return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (state.mode === 'move') {
        const newX = Math.max(0, Math.min(rect.width - 40, state.originX + dx));
        const newY = Math.max(0, Math.min(rect.height - 40, state.originY + dy));
        setPosition({ x: newX, y: newY });
      } else if (state.mode === 'resize') {
        const newW = Math.max(120, Math.min(rect.width - position.x, state.originW + dx));
        const newH = Math.max(60, Math.min(rect.height - position.y, state.originH + dy));
        setSize({ width: newW, height: newH });
      }
    },
    [containerRef, position.x, position.y],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (state.mode === 'idle') return;
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* swallow */ }
      dragState.current = { mode: 'idle' };
      if (state.mode === 'move') {
        stickyNoteService.move(note.id, position);
      } else if (state.mode === 'resize') {
        stickyNoteService.resize(note.id, size);
      }
    },
    [note.id, position, size],
  );

  const saveEdit = () => {
    stickyNoteService.update(note.id, { title: draftTitle, content: draftContent });
    setEditing(false);
  };

  const togglePin = () => {
    stickyNoteService.togglePin(note.id);
  };

  const remove = () => {
    // 删除逻辑移到 Popconfirm 的 onConfirm 中
  };

  return (
    <div
      role="note"
      aria-label={note.title ?? '便签'}
      data-testid={`${testIdPrefix}-${note.id}`}
      onClick={() => onSelect?.(note)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: note.zIndex,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 8,
        boxShadow: note.pinned
          ? '0 6px 18px rgba(15,23,42,0.18)'
          : '0 2px 6px rgba(15,23,42,0.10)',
        padding: 8,
        color: palette.accent,
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        cursor: canEdit ? 'grab' : 'default',
        userSelect: editing ? 'text' : 'none',
      }}
    >
      <div
        onPointerDown={onPointerDownMove}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          color: palette.accent,
          marginBottom: 4,
          cursor: canEdit ? 'grab' : 'default',
        }}
      >
        <GripVertical size={11} />
        {editing ? (
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="标题"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: palette.accent,
              fontSize: 12,
              fontWeight: 700,
            }}
            data-testid={`${testIdPrefix}-title-${note.id}`}
          />
        ) : (
          <span style={{ flex: 1 }}>{note.title || '便签'}</span>
        )}
        {canEdit && (
          <span style={{ display: 'inline-flex', gap: 2 }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePin(); }}
              aria-label="固定"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.accent, padding: 0 }}
            >
              <Pin size={11} fill={note.pinned ? palette.accent : 'transparent'} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}
              aria-label="编辑"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.accent, padding: 0 }}
            >
              <Edit3 size={11} />
            </button>
            <Popconfirm
              title={`删除便签 "${note.title ?? note.content.slice(0, 20)}…"?`}
              okText="确定"
              cancelText="取消"
              onConfirm={(e) => { e?.stopPropagation?.(); stickyNoteService.remove(note.id, currentUserId); }}
              onCancel={(e) => { e?.stopPropagation?.(); }}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                aria-label="删除"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.accent, padding: 0 }}
              >
                <Trash2 size={11} />
              </button>
            </Popconfirm>
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {editing ? (
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: palette.accent,
              fontSize: 12,
              resize: 'none',
              fontFamily: 'inherit',
            }}
            data-testid={`${testIdPrefix}-content-${note.id}`}
          />
        ) : (
          <span>{note.content}</span>
        )}
      </div>
      {editing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <button
            type="button"
            onClick={saveEdit}
            style={{ background: palette.border, color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDraftTitle(note.title ?? '');
              setDraftContent(note.content);
            }}
            style={{ background: 'transparent', color: palette.accent, border: `1px solid ${palette.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}
          >
            取消
          </button>
        </div>
      )}
      <div
        style={{ position: 'absolute', right: 2, bottom: 2, color: palette.accent, opacity: 0.55, cursor: canEdit ? 'nwse-resize' : 'default' }}
        onPointerDown={onPointerDownResize}
        data-testid={`${testIdPrefix}-resize-${note.id}`}
      >
        <Maximize2 size={10} />
      </div>
      <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>
        {note.authorName} · {new Date(note.updatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StickyNote;
