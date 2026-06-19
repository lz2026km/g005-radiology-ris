import { useState, useEffect, useCallback, useMemo } from 'react'
import { Activity, BarChart3, AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { getCdsEngine } from '../../services/cds/hooks/CdsEngine'
import DoseCheckModal from '../../components/cds/DoseCheckModal'
import type { CdsDoseRecord, DoseCheckResult, DoseThreshold } from '../../types/cds'

export default function DoseMonitoringPage() {
  const engine = getCdsEngine()
  const [records, setRecords] = useState<CdsDoseRecord[]>([])
  const [thresholds, setThresholds] = useState<DoseThreshold[]>([])
  const [selectedResult, setSelectedResult] = useState<DoseCheckResult | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    const doseRules = engine.getDoseCheckRules()
    setRecords(doseRules.getRecords())
    setThresholds(doseRules.getThresholds())
    setLoading(false)
  }, [engine])

  useEffect(() => { refresh() }, [refresh])

  const stats = useMemo(() => {
    const total = records.length
    const exceeded = records.filter((r) => {
      const t = thresholds.find((th) => th.bodyPart === '胸部' && th.ageGroup === r.ageGroup)
      return t?.ctdiVolLimit && r.ctdiVol ? r.ctdiVol > t.ctdiVolLimit : false
    }).length
    const avgCtdi = total > 0 ? records.reduce((s, r) => s + (r.ctdiVol ?? 0), 0) / total : 0
    const avgDlp = total > 0 ? records.reduce((s, r) => s + (r.dlp ?? 0), 0) / total : 0
    return { total, exceeded, avgCtdi: Math.round(avgCtdi * 10) / 10, avgDlp: Math.round(avgDlp * 10) / 10 }
  }, [records, thresholds])

  const handleCheck = (record: CdsDoseRecord) => {
    const result = engine.getDoseCheckRules().checkDose(record)
    setSelectedResult(result)
  }

  const handleConfirm = () => {
    if (selectedResult) {
      engine.getDoseCheckRules().addRecord({
        studyId: selectedResult.studyId,
        modality: selectedResult.modality,
        ctdiVol: selectedResult.ctdiVol,
        dlp: selectedResult.dlp,
        ssde: selectedResult.ssde,
        effectiveDose: selectedResult.effectiveDose,
        ageGroup: selectedResult.ageGroup,
        recordedAt: new Date().toISOString(),
      })
      refresh()
      setSelectedResult(null)
    }
  }

  const handleExportCSV = () => {
    const header = '检查ID,设备类型,CTDIvol(mGy),DLP(mGy·cm),SSDE(mGy),有效剂量(mSv),年龄组,记录时间\n'
    const rows = records.map((r) =>
      [r.studyId, r.modality, r.ctdiVol ?? '', r.dlp ?? '', r.ssde ?? '', r.effectiveDose ?? '', r.ageGroup, r.recordedAt].join(','),
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'dose-records.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0d1117', color: '#8b949e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
      加载剂量监测...
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f0f6fc', fontSize: 14, fontFamily: '"Segoe UI",sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#1e3a8a)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Activity size={24} /><span style={{ fontSize: 20, fontWeight: 600 }}>剂量监测</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportCSV}
            style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} />导出 CSV
          </button>
          <button onClick={refresh}
            style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} />刷新
          </button>
        </div>
      </div>
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard icon={<Activity size={18} />} label="总记录" value={String(stats.total)} color="#58a6ff" />
          <StatCard icon={<BarChart3 size={18} />} label="平均CTDIvol" value={stats.avgCtdi + ' mGy'} color="#22c55e" />
          <StatCard icon={<BarChart3 size={18} />} label="平均 DLP" value={stats.avgDlp + ' mGy·cm'} color="#22c55e" />
          <StatCard icon={<AlertTriangle size={18} />} label="超限记录" value={String(stats.exceeded)} color={stats.exceeded > 0 ? '#f85149' : '#6e7681'} />
        </div>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 100px 100px 100px 100px 80px 100px 80px', gap: 8, padding: '12px 16px', borderBottom: '1px solid #21262d', background: '#0d1117', color: '#8b949e', fontSize: 12, fontWeight: 600, alignItems: 'center' }}>
            <span>检查ID</span><span>设备</span><span>CTDIvol</span><span>DLP</span><span>SSDE</span><span>有效剂量</span><span>年龄组</span><span>记录时间</span><span>操作</span>
          </div>
          {records.map((r, idx) => (
            <div key={r.studyId + idx} style={{ display: 'grid', gridTemplateColumns: '120px 80px 100px 100px 100px 100px 80px 100px 80px', gap: 8, padding: '10px 16px', borderBottom: '1px solid #21262d', alignItems: 'center', background: idx % 2 === 0 ? '#0d1117' : '#161b22', fontSize: 12 }}>
              <span style={{ color: '#8b949e', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.studyId.slice(0, 8)}</span>
              <span>{r.modality}</span>
              <span style={{ color: r.ctdiVol && thresholds.some((t) => t.ctdiVolLimit && r.ctdiVol! > t.ctdiVolLimit!) ? '#f85149' : '#f0f6fc' }}>{r.ctdiVol ?? '-'}</span>
              <span style={{ color: r.dlp && thresholds.some((t) => t.dlpLimit && r.dlp! > t.dlpLimit!) ? '#f85149' : '#f0f6fc' }}>{r.dlp ?? '-'}</span>
              <span>{r.ssde ?? '-'}</span>
              <span>{r.effectiveDose ?? '-'}</span>
              <span>{r.ageGroup}</span>
              <span style={{ color: '#6e7681' }}>{new Date(r.recordedAt).toLocaleDateString('zh-CN')}</span>
              <button onClick={() => handleCheck(r)}
                style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', cursor: 'pointer', fontSize: 11 }}>
                检查
              </button>
            </div>
          ))}
          {records.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#6e7681' }}>
              <Activity size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div>暂无剂量记录</div>
            </div>
          )}
        </div>
      </div>
      {selectedResult && (
        <DoseCheckModal
          result={selectedResult}
          thresholds={thresholds.filter((t) => t.modality === selectedResult.modality && t.ageGroup === selectedResult.ageGroup)}
          onClose={() => setSelectedResult(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#6e7681', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>{value}</div>
      </div>
    </div>
  )
}
