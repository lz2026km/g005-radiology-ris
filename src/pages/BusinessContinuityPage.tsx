import { useState, useEffect } from 'react';
import { syncEngine } from '../services/offline';
import { getDbHealth } from '../../server/db/failover';

export default function BusinessContinuityPage() {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);

  useEffect(() => {
    syncEngine.getSyncStatus().then(setSyncStatus);
    setDbHealth(getDbHealth());
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Business Continuity</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          <div>Sync Queue</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{syncStatus?.total || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Pending: {syncStatus ? syncStatus.total - syncStatus.completed - syncStatus.failed : 0}</div>
        </div>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div>DB Primary</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{dbHealth?.primary || 'N/A'}</div>
        </div>
        <div style={{ padding: 16, background: '#fefce8', borderRadius: 8 }}>
          <div>Replicas</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{dbHealth?.healthyReplicas || 0}/{dbHealth?.replicaCount || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Lag: {dbHealth?.replicationLagMs || 0}ms</div>
        </div>
      </div>
      <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
        <p>Offline queue, sync engine, conflict resolution, and database failover management.</p>
      </div>
    </div>
  );
}
