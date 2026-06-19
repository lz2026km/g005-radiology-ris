/**
 * G005 RIS v3.0.6.6 - 工作流设计器页面
 * 40 点升级
 */
import { useState } from 'react';
import { Layers } from 'lucide-react';
import WorkflowDesigner from '../components/workflow/WorkflowDesigner';
import { WORKFLOW_TEMPLATES } from '../data/workflowMock';
import type { WorkflowGraph } from '../types/workflow';

export default function WorkflowDesignerPage() {
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = (graph: WorkflowGraph) => {
    setSaved(`已保存 ${graph.name} (节点 ${graph.nodes.length}, 连线 ${graph.edges.length})`);
    setTimeout(() => setSaved(null), 3000);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <header style={{ background: 'linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)', color: '#fff', padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>工作流设计器</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>BPMN 风格可视化编排 · 内置 {WORKFLOW_TEMPLATES.length}+ 模板</div>
          </div>
          {saved && <span style={{ marginLeft: 'auto', background: '#10b981', padding: '4px 12px', borderRadius: 12, fontSize: 12 }}>{saved}</span>}
        </div>
      </header>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <WorkflowDesigner onSave={handleSave} />
      </div>
    </div>
  );
}