import React from 'react';
import IolCalculator from '@/components/eye/IolCalculator';

const IolCalculatorPage: React.FC = () => {
  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: 'calc(100vh - 56px)' }}>
      <IolCalculator />
    </div>
  );
};

export default IolCalculatorPage;
