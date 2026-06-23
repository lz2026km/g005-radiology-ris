/**
 * G005 RIS v3.0.6.6 - WorkflowDesigner BPMN 编辑器
 * 110 点升级 - 拖拽节点 + 连线 + 验证 + 模板
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  Plus, Save, Trash2, Layers, Download, Upload,
  Play, AlertTriangle, RefreshCcw, Grid3x3,
} from 'lucide-react';
import type { WorkflowGraph, WorkflowNode, WorkflowNodeKind } from '../../types/workflow';
import {
  NODE_TEMPLATES,
  cloneWorkflow,
  createEmptyWorkflow,
  deserializeWorkflow,
  serializeWorkflow,
  validateWorkflow,
} from '../../services/workflow/designer/WorkflowModel';
import { WorkflowExecutor } from '../../services/workflow/designer/WorkflowExecutor';
import { WORKFLOW_TEMPLATES } from '../../data/workflowMock';
import { WorkflowNodeView } from './WorkflowNode';

interface WorkflowDesignerProps {
  initialWorkflow?: WorkflowGraph;
  onSave?: (graph: WorkflowGraph) => void;
  readonly?: boolean;
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  initialWorkflow,
  onSave,
  readonly = false,
}) => {
  const [graph, setGraph] = useState<WorkflowGraph>(initialWorkflow ?? createEmptyWorkflow('新建工作流'));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<string[]>([]);

  const issues = useMemo(() => validateWorkflow(graph), [graph]);
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const handleAddNode = (kind: WorkflowNodeKind) => {
    if (readonly) return;
    const template = NODE_TEMPLATES.find((t) => t.kind === kind);
    if (!template) return;
    const id = `n_${Math.random().toString(36).slice(2, 8)}`;
    const node: WorkflowNode = {
      id,
      name: template.label,
      kind,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
    };
    setGraph((prev) => ({ ...prev, nodes: [...prev.nodes, node], updatedAt: new Date().toISOString() }));
    setSelectedNodeId(id);
  };

  const handleMove = (id: string, x: number, y: number) => {
    if (readonly) return;
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDelete = () => {
    if (readonly || !selectedNodeId) return;
    const id = selectedNodeId;
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(null);
  };

  const handleConnectStart = (event: React.MouseEvent, nodeId: string) => {
    if (readonly) return;
    event.stopPropagation();
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setConnecting({ fromId: nodeId, x: node.position.x, y: node.position.y });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!connecting || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setConnecting({ ...connecting, x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!connecting || !svgRef.current) return;
    const target = event.target as SVGElement;
    const targetId = target.closest('[data-testid^="workflow-node-"]')?.getAttribute('data-testid')?.replace('workflow-node-', '');
    if (targetId && targetId !== connecting.fromId) {
      const newEdge = {
        id: `e_${Math.random().toString(36).slice(2, 8)}`,
        source: connecting.fromId,
        target: targetId,
        kind: 'sequence' as const,
      };
      setGraph((prev) => ({
        ...prev,
        edges: [...prev.edges, newEdge],
        updatedAt: new Date().toISOString(),
      }));
    }
    setConnecting(null);
  };

  const handleSave = () => {
    if (readonly) return;
    onSave?.(graph);
    setValidationMessage('工作流已保存');
    setTimeout(() => setValidationMessage(null), 2500);
  };

  const handleExport = () => {
    const data = serializeWorkflow(graph);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${graph.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readonly) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = deserializeWorkflow(String(reader.result));
        setGraph(next);
      } catch (e) {
        setValidationMessage('导入失败: 文件格式无效');
        setTimeout(() => setValidationMessage(null), 2500);
      }
    };
    reader.readAsText(file);
  };

  const handleSimulate = async () => {
    setSimulation([]);
    const exec = new WorkflowExecutor(graph);
    const ctx = await exec.execute({
      onNodeEnter: (node) => {
        setSimulation((prev) => [...prev, `→ ${node.name} (${node.kind})`]);
      },
    });
    setSimulation((prev) => [...prev, `✓ 实例 ${ctx.instanceId} 状态: ${ctx.status}, ${ctx.history.length} 步`]);
  };

  const applyTemplate = (template: WorkflowGraph) => {
    setGraph(cloneWorkflow(template));
    setSelectedNodeId(null);
    setShowTemplates(false);
  };

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={18} color="#1e40af" />
          <input
            value={graph.name}
            onChange={(e) => setGraph({ ...graph, name: e.target.value })}
            disabled={readonly}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 14,
              fontWeight: 600,
              width: 200,
              color: '#1e3a5f',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {NODE_TEMPLATES.filter((t) => t.kind !== 'start' && t.kind !== 'end').map((t) => (
            <button
              key={t.kind}
              onClick={() => handleAddNode(t.kind)}
              disabled={readonly}
              style={{
                background: '#fff',
                border: `1px solid ${t.color}`,
                color: t.color,
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={12} /> {t.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {(errorCount > 0 || warningCount > 0) && (
            <span
              style={{
                fontSize: 12,
                color: errorCount > 0 ? '#dc2626' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <AlertTriangle size={12} />
              {errorCount} 错误 / {warningCount} 警告
            </span>
          )}
          <button onClick={() => setShowTemplates((s) => !s)} style={toolbarBtnStyle}><Grid3x3 size={12} /> 模板</button>
          <button onClick={handleExport} style={toolbarBtnStyle}><Download size={12} /> 导出</button>
          <label style={{ ...toolbarBtnStyle, cursor: 'pointer' }}>
            <Upload size={12} /> 导入
            <input type="file" accept="application/json" hidden onChange={handleImport} disabled={readonly} />
          </label>
          <button onClick={handleSimulate} style={toolbarBtnStyle}><Play size={12} /> 模拟</button>
          <button onClick={() => setGraph(createEmptyWorkflow(graph.name))} disabled={readonly} style={toolbarBtnStyle}><RefreshCcw size={12} /> 新建</button>
          <button onClick={handleDelete} disabled={readonly || !selectedNodeId} style={{ ...toolbarBtnStyle, color: '#dc2626' }}>
            <Trash2 size={12} /> 删除
          </button>
          <button onClick={handleSave} disabled={readonly} style={{ ...toolbarBtnStyle, background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' }}>
            <Save size={12} /> 保存
          </button>
        </div>
      </div>

      {validationMessage && (
        <div style={{ background: '#dbeafe', color: '#1e3a8a', padding: 8, fontSize: 12 }}>{validationMessage}</div>
      )}

      {showTemplates && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: 12, maxHeight: 200, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f', marginBottom: 8 }}>内置模板 ({WORKFLOW_TEMPLATES.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {WORKFLOW_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: 8,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 12, color: '#1e3a5f' }}>{tpl.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{tpl.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', background: '#f8fafc' }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 1200 700"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{ background: 'repeating-linear-gradient(0deg,#e2e8f0,#e2e8f0 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#e2e8f0,#e2e8f0 1px,transparent 1px,transparent 20px)' }}
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
              </marker>
            </defs>
            {graph.edges.map((edge) => {
              const src = graph.nodes.find((n) => n.id === edge.source);
              const dst = graph.nodes.find((n) => n.id === edge.target);
              if (!src || !dst) return null;
              const sx = src.position.x;
              const sy = src.position.y + (src.kind === 'gateway' || src.kind === 'start' || src.kind === 'end' ? 32 : 26);
              const tx = dst.position.x;
              const ty = dst.position.y - (dst.kind === 'gateway' || dst.kind === 'start' || dst.kind === 'end' ? 32 : 26);
              const midX = (sx + tx) / 2;
              const stroke = edge.kind === 'conditional' ? '#d97706' : edge.kind === 'default' ? '#10b981' : '#475569';
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sx} ${sy} C ${midX} ${sy} ${midX} ${ty} ${tx} ${ty}`}
                    stroke={stroke}
                    strokeWidth={1.5}
                    fill="none"
                    markerEnd="url(#arrow)"
                  />
                  {edge.label && (
                    <text x={midX} y={(sy + ty) / 2 - 6} textAnchor="middle" fontSize={11} fill={stroke}>
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
            {connecting && (
              <line
                x1={graph.nodes.find((n) => n.id === connecting.fromId)?.position.x ?? 0}
                y1={graph.nodes.find((n) => n.id === connecting.fromId)?.position.y ?? 0}
                x2={connecting.x}
                y2={connecting.y}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            {graph.nodes.map((node) => (
              <foreignObject key={node.id} x={0} y={0} width={0} height={0}>
                <div />
              </foreignObject>
            ))}
            {graph.nodes.map((node) => (
              <g key={node.id} onContextMenu={(e) => { e.preventDefault(); handleConnectStart(e, node.id); }}>
                <WorkflowNodeView
                  node={node}
                  selected={selectedNodeId === node.id}
                  onSelect={setSelectedNodeId}
                  onMove={handleMove}
                  readonly={readonly}
                />
              </g>
            ))}
          </svg>
          <div
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 10,
              fontSize: 12,
              color: '#475569',
              maxWidth: 280,
            }}
          >
            <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>操作提示</div>
            <div>• 点击节点: 选择/编辑</div>
            <div>• 拖拽节点: 移动位置</div>
            <div>• 右键拖动: 创建连线</div>
          </div>
        </div>
        <aside style={{ width: 320, background: '#fff', borderLeft: '1px solid #e2e8f0', padding: 12, overflowY: 'auto' }}>
          {selectedNode ? (
            <div>
              <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>节点属性</div>
              <label style={labelStyle}>名称</label>
              <input
                value={selectedNode.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setGraph((prev) => ({
                    ...prev,
                    nodes: prev.nodes.map((n) => (n.id === selectedNode.id ? { ...n, name } : n)),
                    updatedAt: new Date().toISOString(),
                  }));
                }}
                disabled={readonly}
                style={inputStyle}
              />
              <label style={labelStyle}>类型</label>
              <input value={selectedNode.kind} disabled style={inputStyle} />
              <label style={labelStyle}>执行人 ID</label>
              <input
                value={selectedNode.assignee ?? ''}
                onChange={(e) => {
                  const assignee = e.target.value;
                  setGraph((prev) => ({
                    ...prev,
                    nodes: prev.nodes.map((n) => (n.id === selectedNode.id ? { ...n, assignee } : n)),
                    updatedAt: new Date().toISOString(),
                  }));
                }}
                disabled={readonly}
                style={inputStyle}
              />
              <label style={labelStyle}>SLA (分钟)</label>
              <input
                type="number"
                value={selectedNode.slaMinutes ?? ''}
                onChange={(e) => {
                  const sla = e.target.value ? Number(e.target.value) : undefined;
                  setGraph((prev) => ({
                    ...prev,
                    nodes: prev.nodes.map((n) => (n.id === selectedNode.id ? { ...n, slaMinutes: sla } : n)),
                    updatedAt: new Date().toISOString(),
                  }));
                }}
                disabled={readonly}
                style={inputStyle}
              />
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>请选择左侧节点查看属性</div>
          )}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>校验结果</div>
            {issues.length === 0 ? (
              <div style={{ fontSize: 12, color: '#059669' }}>✓ 工作流结构有效</div>
            ) : (
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {issues.map((iss, idx) => (
                  <li key={idx} style={{ fontSize: 12, color: iss.severity === 'error' ? '#dc2626' : '#d97706' }}>
                    {iss.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {simulation.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>模拟执行</div>
              <div style={{ background: '#f1f5f9', borderRadius: 6, padding: 8, fontSize: 12, color: '#1e3a5f' }}>
                {simulation.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const toolbarBtnStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  color: '#1e3a5f',
  padding: '4px 10px',
  fontSize: 12,
  borderRadius: 6,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#475569',
  marginTop: 8,
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 12,
  color: '#1e3a5f',
};

export default WorkflowDesigner;