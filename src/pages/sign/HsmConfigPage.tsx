import React from 'react';
import { Typography } from 'antd';
import { Shield } from 'lucide-react';
import HsmConfigPanel from '../../components/sign/HsmConfig';

const { Title } = Typography;

const HsmConfigPage: React.FC = () => {
  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Shield size={22} /> HSM 配置 (PKCS#11)
      </Title>
      <HsmConfigPanel />
    </div>
  );
};

export default HsmConfigPage;
