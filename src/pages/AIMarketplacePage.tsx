/**
 * G005 放射RIS系统 v3.0.6.5 - AI 市场页面
 * A5-AI-ORCH / 30 点
 */

import React, { useState } from 'react';
import { Tabs, Badge } from 'antd';
import { Marketplace } from '../components/ai/Marketplace';
import { PromptLibraryView } from '../components/ai/PromptLibrary';
import { LesionOverlay } from '../components/ai/LesionOverlay';
import { SegmentationEditor } from '../components/ai/SegmentationEditor';
import { ResponseAssessmentChart } from '../components/ai/ResponseAssessmentChart';
import { Zap, BookOpen, Crosshair, Scissors, Activity } from 'lucide-react';

export default function AIMarketplacePage() {
  const [activeTab, setActiveTab] = useState('marketplace');

  return (
    <div data-testid="ai-marketplace-page" style={{ background: '#0f172a', minHeight: '100vh' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabBarExtraContent={
          <Badge
            count={5}
            title="AI 工具集 5 项"
            style={{ backgroundColor: '#7c3aed' }}
          />
        }
        items={[
          {
            key: 'marketplace',
            label: <span><Zap size={14} /> 算法市场</span>,
            children: <Marketplace />,
          },
          {
            key: 'prompts',
            label: <span><BookOpen size={14} /> Prompt 库</span>,
            children: <PromptLibraryView />,
          },
          {
            key: 'lesion',
            label: <span><Crosshair size={14} /> 病灶定位</span>,
            children: (
              <div style={{ padding: 16 }}>
                <LesionOverlay studyId="S-DEMO-001" modality="CT" bodyPart="胸部" />
              </div>
            ),
          },
          {
            key: 'segmentation',
            label: <span><Scissors size={14} /> 分割</span>,
            children: <SegmentationEditor studyId="S-DEMO-001" sopInstanceUid="sop-demo-1" />,
          },
          {
            key: 'recist',
            label: <span><Activity size={14} /> RECIST</span>,
            children: <ResponseAssessmentChart patientId="P001" />,
          },
        ]}
      />
    </div>
  );
}
