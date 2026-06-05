// ============================================================
// G005 放射RIS系统 v2.1.0 - ImageAnchorChip 组件
// Phase R10 W3: 报告中内嵌的影像锚定标记
// ============================================================

import React from 'react';
import type { ImageAnchor } from '../../types/imageAnchor';

export interface ImageAnchorChipProps {
  anchor: ImageAnchor;
  onClick?: (anchor: ImageAnchor) => void;
  onRemove?: (anchor: ImageAnchor) => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const CATEGORY_COLORS: Record<ImageAnchor['category'], { bg: string; border: string; text: string; icon: string }> = {
  finding:    { bg: '#fef3c7', border: '#fbbf24', text: '#78350f', icon: '◉' },
  lesion:     { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d', icon: '●' },
  organ:      { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', icon: '◇' },
  measurement:{ bg: '#d1fae5', border: '#10b981', text: '#064e3b', icon: '⊢' },
  critical:   { bg: '#fecaca', border: '#dc2626', text: '#7f1d1d', icon: '!' },
  reference:  { bg: '#e0e7ff', border: '#6366f1', text: '#312e81', icon: 'ⓘ' },
  comparison: { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', icon: '⇄' },
};

export default function ImageAnchorChip({ anchor, onClick, onRemove, size = 'sm', showLabel = true }: ImageAnchorChipProps) {
  const c = CATEGORY_COLORS[anchor.category];
  const fontSize = size === 'sm' ? 10 : 12;
  const padding = size === 'sm' ? '1px 5px' : '2px 8px';
  const isCritical = anchor.isCritical;
  const isAI = anchor.isAIDetected;
  const measurement = anchor.measurement;

  const tooltip = [
    anchor.label ?? `${anchor.category}`,
    anchor.frame.sopInstanceUID ? `SOP: ${anchor.frame.sopInstanceUID.slice(-8)}` : `Series: ${anchor.frame.seriesInstanceUID.slice(-8)}`,
    measurement ? `测量: ${measurement.value}${measurement.unit}` : '',
    isAI ? 'AI 检测' : '',
    isCritical ? '危急' : '',
  ].filter(Boolean).join('\n');

  return (
    <span
      data-testid={`anchor-chip-${anchor.id}`}
      title={tooltip}
      onClick={e => { e.stopPropagation(); onClick?.(anchor); }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        background: c.bg,
        border: `1px solid ${isCritical ? '#dc2626' : c.border}`,
        borderRadius: 10,
        padding,
        fontSize,
        color: c.text,
        cursor: onClick ? 'pointer' : 'default',
        marginLeft: 2,
        marginRight: 2,
        fontWeight: 500,
        userSelect: 'none',
        verticalAlign: 'middle',
        position: 'relative',
        animation: isCritical ? 'pulse 1.5s infinite' : undefined,
      }}
    >
      <span style={{ fontSize: fontSize + 1, lineHeight: 1 }}>{c.icon}</span>
      {showLabel && (
        <span>
          {anchor.label ?? anchor.category}
          {measurement && <span style={{ opacity: 0.75, marginLeft: 3 }}>{measurement.value}{measurement.unit}</span>}
        </span>
      )}
      {isAI && (
        <span style={{ background: '#8b5cf6', color: 'white', borderRadius: 6, padding: '0 3px', fontSize: 8, marginLeft: 2 }}>AI</span>
      )}
      {isCritical && (
        <span style={{ background: '#dc2626', color: 'white', borderRadius: 6, padding: '0 3px', fontSize: 8, marginLeft: 2 }}>⚠</span>
      )}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(anchor); }}
          style={{
            background: 'transparent', border: 'none', color: c.text, marginLeft: 2,
            cursor: 'pointer', fontSize: fontSize, lineHeight: 1, padding: 0,
          }}
          aria-label="移除锚定"
        >×</button>
      )}
    </span>
  );
}

// 内联渲染助手：把文本中的 {charOffset: anchorId} 占位符替换为 chip
export function renderTextWithAnchors(opts: {
  text: string;
  anchors: ImageAnchor[];
  onAnchorClick?: (a: ImageAnchor) => void;
  onAnchorRemove?: (a: ImageAnchor) => void;
}): React.ReactNode {
  const { text, anchors, onAnchorClick, onAnchorRemove } = opts;
  // 按 textRange.start 排序
  const sorted = [...anchors].filter(a => a.textRange).sort((a, b) => (a.textRange!.start - b.textRange!.start));
  if (sorted.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((a, i) => {
    const r = a.textRange!;
    if (r.start > cursor) parts.push(text.slice(cursor, r.start));
    parts.push(
      <ImageAnchorChip
        key={a.id}
        anchor={a}
        onClick={onAnchorClick}
        onRemove={onAnchorRemove}
      />,
    );
    cursor = Math.max(r.end, cursor);
    if (i === sorted.length - 1 && cursor < text.length) parts.push(text.slice(cursor));
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
