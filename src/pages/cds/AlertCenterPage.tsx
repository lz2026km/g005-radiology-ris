import { useState, useEffect, useCallback } from 'react'
import { getCdsEngine } from '../../services/cds/hooks/CdsEngine'
import AlertCenterList from '../../components/cds/AlertCenter'
import AlertDetail from '../../components/cds/AlertDetail'
import type { CdsAlert } from '../../types/cds'

export default function AlertCenterPage() {
  const engine = getCdsEngine()
  const [alerts, setAlerts] = useState<CdsAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<CdsAlert | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    const all = engine.getAlertCenter().getAll()
    setAlerts(all.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()))
    setLoading(false)
  }, [engine])

  useEffect(() => { refresh() }, [refresh])

  const handleDismiss = (id: string) => {
    engine.dismissAlert(id, 'current-user', '用户忽略')
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'dismissed' } : a))
  }

  const handleAcknowledge = (id: string) => {
    engine.acknowledgeAlert(id, 'current-user')
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'acknowledged' } : a))
  }

  const handleDismissAll = () => {
    alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged').forEach((a) => handleDismiss(a.id))
  }

  const handleAcknowledgeAll = () => {
    alerts.filter((a) => a.status === 'active').forEach((a) => handleAcknowledge(a.id))
  }

  const handleOverride = (id: string, reason: string) => {
    engine.overrideAlert(id, 'current-user', reason)
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'overridden' } : a))
    setSelectedAlert(null)
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0d1117', color: '#8b949e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
      加载告警中心...
    </div>
  }

  return (
    <>
      <AlertCenterList
        alerts={alerts}
        onDismiss={handleDismiss}
        onAcknowledge={handleAcknowledge}
        onDismissAll={handleDismissAll}
        onAcknowledgeAll={handleAcknowledgeAll}
      />
      {selectedAlert && (
        <AlertDetail
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledge}
          onDismiss={handleDismiss}
          onOverride={handleOverride}
        />
      )}
    </>
  )
}
