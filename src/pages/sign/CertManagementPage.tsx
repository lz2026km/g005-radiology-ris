import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { Key, Clock, Ban, Shield } from 'lucide-react';
import CertManager from '../../components/sign/CertManager';
import TimeStampDisplay from '../../components/sign/TimeStampDisplay';
import RevocationList from '../../components/sign/RevocationList';

const { Title } = Typography;

const CertManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('certs');

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Key size={22} /> 证书管理 (CA / TSA / CRL)
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'certs',
            label: <span><Key size={14} /> 证书列表</span>,
            children: <CertManager showActions />,
          },
          {
            key: 'timestamps',
            label: <span><Clock size={14} /> 时间戳</span>,
            children: <TimeStampDisplay autoLoad />,
          },
          {
            key: 'revocation',
            label: <span><Ban size={14} /> CRL / OCSP</span>,
            children: <RevocationList autoLoad />,
          },
        ]}
      />
    </div>
  );
};

export default CertManagementPage;
