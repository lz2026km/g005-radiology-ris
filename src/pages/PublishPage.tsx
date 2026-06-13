/**
 * G005 RIS - 报告发布页面 v3.0.2.8
 * 已签发 → 已发布
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReportStore } from '../store'
import { reportApi } from '../services/api'
import type { ReportDto } from '../services/api'

export default function PublishPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<ReportDto[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const res = await reportApi.list({ status: '已签发' })
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data as ReportDto[])
      }
      setLoading(false)
    })()
  }, [])

  const handlePublish = async (id: string) => {
    setPublishing(id)
    await useReportStore.getState().publish(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
    setPublishing(null)
  }

  const handlePublishAll = async () => {
    for (const r of reports) {
      setPublishing(r.id)
      await useReportStore.getState().publish(r.id)
    }
    setPublishing(null)
    setReports([])
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
          报告发布管理
        </h1>
        {reports.length > 0 && (
          <button
            onClick={handlePublishAll}
            style={{
              padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            一键发布全部 ({reports.length})
          </button>
        )}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>加载中...</div>}

      {!loading && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 14 }}>
          暂无待发布的已签发报告
        </div>
      )}

      {reports.map((r) => (
        <div key={r.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', marginBottom: 12, background: '#fff', borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.patientName}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {r.modality} · {r.bodyPart} · {r.reportId}
            </div>
          </div>
          <button
            onClick={() => handlePublish(r.id)}
            disabled={publishing === r.id}
            style={{
              padding: '6px 16px', background: publishing === r.id ? '#94a3b8' : '#059669',
              color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600,
              cursor: publishing === r.id ? 'not-allowed' : 'pointer',
            }}
          >
            {publishing === r.id ? '发布中...' : '发布'}
          </button>
        </div>
      ))}
    </div>
  )
}
