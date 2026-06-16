import { useState, useEffect } from 'react';
import { vnaHealthCheck, getVnaMetrics } from '../services/vna';

export default function VNADashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    vnaHealthCheck().then(setHealth);
    setMetrics(getVnaMetrics());
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>VNA Core Engine Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
        <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          <div>Status</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{health?.status || 'N/A'}</div>
        </div>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div>Studies</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{health?.studiesCount || 0}</div>
        </div>
        <div style={{ padding: 16, background: '#fefce8', borderRadius: 8 }}>
          <div>Instances</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics?.instancesStored || 0}</div>
        </div>
        <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8 }}>
          <div>Active Connections</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{health?.activeAssociations || 0}</div>
        </div>
      </div>
      <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
        <h2>Version: {health?.version || 'v3.0.3.30'}</h2>
        <p>Uptime: {health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : 'N/A'}</p>
      </div>
    </div>
  );
}
