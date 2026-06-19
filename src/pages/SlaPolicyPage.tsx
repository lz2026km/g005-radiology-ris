/**
 * G005 RIS v3.0.6.6 - SLA 策略页面
 * 20 点升级
 */
import { useState } from 'react';
import { Clock } from 'lucide-react';
import SlaMatrixEditor from '../components/workflow/SlaMatrixEditor';
import type { SLAPolicyConfig } from '../types/workflow';

const SEED: SLAPolicyConfig[] = [
  { modality: 'CT', priority: 'critical', minutesToReport: 30, minutesToReview: 15, minutesToPublish: 60, escalationMinutes: 45 },
  { modality: 'CT', priority: 'urgent', minutesToReport: 90, minutesToReview: 60, minutesToPublish: 180, escalationMinutes: 120 },
  { modality: 'CT', priority: 'normal', minutesToReport: 240, minutesToReview: 240, minutesToPublish: 480, escalationMinutes: 360 },
  { modality: 'MR', priority: 'critical', minutesToReport: 45, minutesToReview: 30, minutesToPublish: 90, escalationMinutes: 60 },
  { modality: 'MR', priority: 'urgent', minutesToReport: 180, minutesToReview: 120, minutesToPublish: 360, escalationMinutes: 240 },
  { modality: 'MR', priority: 'normal', minutesToReport: 480, minutesToReview: 360, minutesToPublish: 720, escalationMinutes: 600 },
  { modality: 'DR', priority: 'critical', minutesToReport: 15, minutesToReview: 10, minutesToPublish: 30, escalationMinutes: 20 },
  { modality: 'DR', priority: 'urgent', minutesToReport: 60, minutesToReview: 30, minutesToPublish: 120, escalationMinutes: 90 },
  { modality: 'DR', priority: 'normal', minutesToReport: 120, minutesToReview: 120, minutesToPublish: 240, escalationMinutes: 180 },
];

export default function SlaPolicyPage() {
  const [policies, setPolicies] = useState<SLAPolicyConfig[]>(SEED);

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ background: 'linear-gradient(135deg,#dc2626 0%,#f59e0b 100%)', color: '#fff', padding: '14px 24px', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>SLA 策略配置</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>设备类型 × 优先级 × 时效阈值矩阵</div>
          </div>
        </div>
      </header>
      <SlaMatrixEditor policies={policies} onChange={setPolicies} />
    </div>
  );
}