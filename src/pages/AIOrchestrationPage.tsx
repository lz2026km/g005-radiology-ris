/**
 * G005 放射RIS系统 v3.0.6.5 - AI 编排页面
 * A5-AI-ORCH / 30 点
 */

import React from 'react';
import { Tabs } from 'antd';
import { OrchestrationCenter } from '../components/ai/OrchestrationCenter';
import { FederatedLearningPanel } from '../components/ai/FederatedLearningPanel';
import { ModelGovernance } from '../components/ai/ModelGovernance';
import { Cpu, Lock, Settings } from 'lucide-react';

export default function AIOrchestrationPage() {
  return (
    <div data-testid="ai-orchestration-page" style={{ background: '#0f172a', minHeight: '100vh' }}>
      <Tabs
        defaultActiveKey="orchestration"
        size="large"
        items={[
          {
            key: 'orchestration',
            label: <span><Cpu size={14} /> 算法编排</span>,
            children: <OrchestrationCenter />,
          },
          {
            key: 'federated',
            label: <span><Lock size={14} /> 联邦学习</span>,
            children: <FederatedLearningPanel />,
          },
          {
            key: 'governance',
            label: <span><Settings size={14} /> 模型治理</span>,
            children: <ModelGovernance />,
          },
        ]}
      />
    </div>
  );
}
