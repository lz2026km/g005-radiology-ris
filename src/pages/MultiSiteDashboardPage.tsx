import { useState } from 'react';
import { getAllSites } from '../services/site';

export default function MultiSiteDashboardPage() {
  const [sites] = useState(() => getAllSites());

  return (
    <div style={{ padding: 24 }}>
      <h1>Multi-Site / Multi-Campus Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          <div>Total Sites</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{sites.length}</div>
        </div>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div>Active Sites</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{sites.filter(s => s.status === 'active').length}</div>
        </div>
        <div style={{ padding: 16, background: '#fefce8', borderRadius: 8 }}>
          <div>Offline Sites</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{sites.filter(s => s.status === 'offline').length}</div>
        </div>
      </div>
      <div style={{ marginTop: 24, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
        <p>Site management, cross-site routing, and synchronization tools are available here.</p>
      </div>
    </div>
  );
}
