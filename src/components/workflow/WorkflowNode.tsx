/**
 * G005 RIS v3.0.6.6 - WorkflowNode 工作流节点组件
 * 30 点升级 - SVG 节点渲染
 */

import React from 'react';
import type { WorkflowNode as WFNode } from '../../types/workflow';
import { NODE_TEMPLATES } from '../../services/workflow/designer/WorkflowModel';

interface WorkflowNodeProps {
  node: WFNode;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
  readonly?: boolean;
}

const ICON_PATH: Record<string, string> = {
  start: 'M5 4l14 8-14 8V4z',
  end: 'M5 5h14v14H5z',
  task: 'M5 5h14v14H5zM9 9l2 2 4-4',
  gateway: 'M12 3l9 9-9 9-9-9 9-9z',
  subprocess: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  timer: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l4 2',
  notify: 'M6 8a6 6 0 1112 0v5l2 3H4l2-3V8z',
  assign: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  service: 'M6 18a4 4 0 01-4-4 4 4 0 014-4 6 6 0 0111.7-2A5 5 0 0122 12a4 4 0 01-4 4H6z',
};

export const WorkflowNodeView: React.FC<WorkflowNodeProps> = ({
  node,
  selected = false,
  onSelect,
  onMove,
  readonly = false,
}) => {
  const template = NODE_TEMPLATES.find((t) => t.kind === node.kind);
  const color = template?.color ?? '#475569';
  const iconKey = template?.icon ?? 'task';
  const path = ICON_PATH[iconKey] ?? ICON_PATH.task;

  const handleMouseDown = (event: React.MouseEvent<SVGGElement>) => {
    if (readonly) {
      onSelect?.(node.id);
      return;
    }
    onSelect?.(node.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = node.position.x;
    const initialY = node.position.y;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onMove?.(node.id, initialX + dx, initialY + dy);
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const isCircular = node.kind === 'gateway' || node.kind === 'start' || node.kind === 'end';

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      style={{ cursor: readonly ? 'pointer' : 'move' }}
      onMouseDown={handleMouseDown}
      data-testid={`workflow-node-${node.id}`}
    >
      {isCircular ? (
        <circle
          r={32}
          fill={node.kind === 'start' ? '#10b981' : node.kind === 'end' ? '#6b7280' : color}
          stroke={selected ? '#fbbf24' : '#0f172a'}
          strokeWidth={selected ? 3 : 1.5}
        />
      ) : (
        <rect
          x={-72}
          y={-26}
          width={144}
          height={52}
          rx={8}
          fill="#fff"
          stroke={selected ? '#fbbf24' : color}
          strokeWidth={selected ? 3 : 1.5}
        />
      )}
      <g transform="translate(-8, -14)" fill={isCircular ? '#fff' : color}>
        <path d={path} fill={isCircular ? '#fff' : color} />
      </g>
      <text
        x={isCircular ? 0 : 0}
        y={isCircular ? 48 : 36}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="#0f172a"
      >
        {node.name}
      </text>
      {node.slaMinutes !== undefined && !isCircular && (
        <text
          x={0}
          y={18}
          textAnchor="middle"
          fontSize={10}
          fill="#64748b"
        >
          SLA {node.slaMinutes}m
        </text>
      )}
    </g>
  );
};

export default WorkflowNodeView;