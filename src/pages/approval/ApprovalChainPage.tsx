import React, { useState } from 'react';
import { Tabs, Typography, Badge } from 'antd';
import { GitBranch, ClipboardList, AlertTriangle } from 'lucide-react';
import ApprovalChainBuilder from '../../components/approval/ApprovalChainBuilder';
import MultiLevelApprovalView from '../../components/approval/MultiLevelApprovalView';
import EmergencyOverrideDialog from '../../components/approval/EmergencyOverrideDialog';

const { Title } = Typography;

const ApprovalChainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chains');

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ClipboardList size={22} /> 审批与合规
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <Badge
            count={3}
            title="审批模块 3 项"
            style={{ backgroundColor: '#1677ff' }}
          />
        }
        items={[
          {
            key: 'chains',
            label: <span><GitBranch size={14} /> 审批链</span>,
            children: <ApprovalChainBuilder />,
          },
          {
            key: 'approvals',
            label: <span><ClipboardList size={14} /> 多级审批</span>,
            children: <MultiLevelApprovalView />,
          },
          {
            key: 'emergency',
            label: <span><AlertTriangle size={14} /> 紧急越权</span>,
            children: <EmergencyOverrideDialog userId="current-user" userName="当前用户" />,
          },
        ]}
      />
    </div>
  );
};

export default ApprovalChainPage;
