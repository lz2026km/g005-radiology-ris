import { useEffect, useState } from 'react';
import { getStorageMetrics } from '../services/storage';

export default function CloudStorageDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => { setMetrics(getStorageMetrics()); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Cloud Storage & Archiving</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
        <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          <div>Total Objects</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics?.totalObjects || 0}</div>
        </div>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div>Total Size</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics ? `${(metrics.totalSizeBytes / 1e9).toFixed(1)} GB` : '0 GB'}</div>
        </div>
        <div style={{ padding: 16, background: '#fefce8', borderRadius: 8 }}>
          <div>Writes (24h)</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics?.bytesWritten24h ? `${(metrics.bytesWritten24h / 1e6).toFixed(1)} MB` : '0 MB'}</div>
        </div>
        <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8 }}>
          <div>Reads (24h)</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metrics?.bytesRead24h ? `${(metrics.bytesRead24h / 1e6).toFixed(1)} MB` : '0 MB'}</div>
        </div>
      </div>
    </div>
  );
}
