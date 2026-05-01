// @ts-nocheck
// G005 放射科RIS系统 - 剂量追踪 v0.1.0
import { useState } from 'react'
import { Activity, AlertTriangle, TrendingUp, Monitor, Download, Search, Filter, ShieldAlert, Info } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// 模拟剂量数据
const doseHistoryData = [
  { date: '04-25', CT: 1250, MR: 0, DR: 180, DSA: 420, MG: 8 },
  { date: '04-26', CT: 1180, MR: 0, DR: 195, DSA: 380, MG: 6 },
  { date: '04-27', CT: 1320, MR: 0, DR: 210, DSA: 450, MG: 10 },
  { date: '04-28', CT: 1190, MR: 0, DR: 175, DSA: 0, MG: 4 },
  { date: '04-29', CT: 980, MR: 0, DR: 120, DSA: 400, MG: 8 },
  { date: '04-30', CT: 1100, MR: 0, DR: 160, DSA: 390, MG: 12 },
  { date: '05-01', CT: 850, MR: 0, DR: 95, DSA: 200, MG: 4 },
]

const deviceDoseData = [
  { device: 'CT-1', todayDLP: 850, todayCTDI: 22.5, alertCount: 2, status: 'normal' },
  { device: 'CT-2', todayDLP: 620, todayCTDI: 18.2, alertCount: 0, status: 'normal' },
  { device: 'DR-1', todayDLP: 95, todayCTDI: 0.8, alertCount: 0, status: 'normal' },
  { device: 'DR-2', todayDLP: 78, todayCTDI: 0.6, alertCount: 0, status: 'normal' },
  { device: 'DSA-1', todayDLP: 4200, todayCTDI: 35.8, alertCount: 3, status: 'warning' },
  { device: 'MG-1', todayDLP: 8, todayCTDI: 0.4, alertCount: 0, status: 'normal' },
]

const patientDoseRecords = [
  { id: 'DDR001', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, modality: 'CT', examItem: '冠脉CTA', examDate: '2026-05-01', doseType: 'DLP', doseValue: 856, doseUnit: 'mGy·cm', alertLevel: 'warning', threshold: 800 },
  { id: 'DDR002', patientId: 'RAD-P004', patientName: '赵晓敏', gender: '女', age: 45, modality: 'CT', examItem: '头颅CT平扫', examDate: '2026-05-01', doseType: 'DLP', doseValue: 680, doseUnit: 'mGy·cm', alertLevel: 'normal', threshold: 800 },
  { id: 'DDR003', patientId: 'RAD-P005', patientName: '周玉芬', gender: '女', age: 52, modality: 'CT', examItem: '腹部CT增强', examDate: '2026-05-01', doseType: 'DLP', doseValue: 1250, doseUnit: 'mGy·cm', alertLevel: 'critical', threshold: 1000 },
  { id: 'DDR004', patientId: 'RAD-P001', patientName: '张志刚', gender: '男', age: 62, modality: 'DSA', examItem: '冠脉造影', examDate: '2026-04-28', doseType: 'DAP', doseValue: 3850, doseUnit: 'mGy·m²', alertLevel: 'critical', threshold: 3000 },
  { id: 'DDR005', patientId: 'RAD-P007', patientName: '吴婷', gender: '女', age: 42, modality: '乳腺钼靶', examItem: '乳腺钼靶', examDate: '2026-05-01', doseType: 'AGD', doseValue: 4.2, doseUnit: 'mGy', alertLevel: 'normal', threshold: 6 },
  { id: 'DDR006', patientId: 'RAD-P003', patientName: '王建国', gender: '男', age: 58, modality: 'DR', examItem: '胸部DR正侧位', examDate: '2026-05-01', doseType: 'DAP', doseValue: 0.15, doseUnit: 'mGy·m²', alertLevel: 'normal', threshold: 1 },
]

const doseAlerts = [
  { id: 'ALERT001', patientName: '周玉芬', modality: 'CT', examItem: '腹部CT增强', doseValue: 1250, threshold: 1000, alertLevel: 'critical', device: 'CT-2', time: '2026-05-01 14:30', status: 'pending' },
  { id: 'ALERT002', patientName: '张志刚', modality: 'DSA', examItem: '冠脉造影', doseValue: 3850, threshold: 3000, alertLevel: 'critical', device: 'DSA-1', time: '2026-04-28 11:20', status: 'acknowledged' },
  { id: 'ALERT003', patientName: '张志刚', modality: 'CT', examItem: '冠脉CTA', doseValue: 856, threshold: 800, alertLevel: 'warning', device: 'CT-1', time: '2026-05-01 09:45', status: 'pending' },
]

const cumulativeStats = {
  totalPatientsToday: 247,
  highDosePatients: 8,
  totalDLPToday: 2865,
  doseAlertsToday: 5,
  averageDLP: { CT: 720, DR: 0.12, DSA: 2800, MG: 3.8 },
}

export default function DoseTrackPage() {
  const [view, setView] = useState<'overview' | 'patient' | 'device' | 'alert'>('overview')
  const [modalityFilter, setModalityFilter] = useState<string>('全部')
  const [alertFilter, setAlertFilter] = useState<string>('全部')
  const [searchText, setSearchText] = useState('')

  const modalities = ['全部', 'CT', 'MR', 'DR', 'DSA', '乳腺钼靶', '胃肠造影']

  const getAlertBadge = (level: string) => {
    if (level === 'critical') return { bg: '#fef2f2', color: '#dc2626', label: '危' }
    if (level === 'warning') return { bg: '#fffbeb', color: '#d97706', label: '警' }
    return { bg: '#f0fdf4', color: '#16a34a', label: '正' }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>剂量追踪</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>患者辐射剂量监测 · 设备剂量统计 · 超剂量预警</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '6px 14px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> 导出报表
          </button>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '今日检查人数', value: cumulativeStats.totalPatientsToday, icon: <Activity size={16} />, color: '#3b82f6', bg: '#eff6ff', change: '+5.2%' },
          { label: '高剂量患者', value: cumulativeStats.highDosePatients, icon: <AlertTriangle size={16} />, color: '#dc2626', bg: '#fef2f2', change: '+2人' },
          { label: '今日总DLP', value: `${cumulativeStats.totalDLPToday}`, unit: 'mGy·cm', icon: <TrendingUp size={16} />, color: '#8b5cf6', bg: '#f5f3ff', change: '-3.1%' },
          { label: '剂量超标预警', value: cumulativeStats.doseAlertsToday, icon: <ShieldAlert size={16} />, color: '#d97706', bg: '#fffbeb', change: '+1起' },
          { label: '监控设备数', value: deviceDoseData.length, icon: <Monitor size={16} />, color: '#059669', bg: '#ecfdf5', change: '0' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f', lineHeight: 1.2, marginTop: 4 }}>
                {item.value}<span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{item.unit || ''}</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{item.change}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 视图切换 + 筛选器 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          {(['overview', 'patient', 'device', 'alert'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: view === v ? '#fff' : 'transparent', color: view === v ? '#1e3a5f' : '#64748b',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              {v === 'overview' ? '总览' : v === 'patient' ? '患者剂量' : v === 'device' ? '设备剂量' : '剂量预警'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="搜索患者/检查..." value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ padding: '6px 10px 6px 30px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, width: 180, outline: 'none' }} />
          </div>
          {view !== 'alert' && (
            <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#334155', outline: 'none' }}>
              {modalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {view === 'alert' && (
            <select value={alertFilter} onChange={e => setAlertFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#334155', outline: 'none' }}>
              <option value="全部">全部状态</option>
              <option value="pending">待处理</option>
              <option value="acknowledged">已确认</option>
            </select>
          )}
        </div>
      </div>

      {/* 总览视图 */}
      {view === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* 剂量趋势图 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>各类设备剂量趋势（本周DLP合计）</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={doseHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}`} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v} mGy·cm`, 'DLP']} />
                <Legend iconSize={10} />
                <Bar dataKey="CT" fill="#3b82f6" name="CT" radius={[4, 4, 0, 0]} />
                <Bar dataKey="DR" fill="#22c55e" name="DR" radius={[4, 4, 0, 0]} />
                <Bar dataKey="DSA" fill="#f59e0b" name="DSA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 设备状态列表 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>设备今日剂量状态</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deviceDoseData.map(d => {
                const badge = d.status === 'warning' ? { bg: '#fffbeb', color: '#d97706' } : { bg: '#f0fdf4', color: '#16a34a' }
                return (
                  <div key={d.device} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Monitor size={14} color="#64748b" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{d.device}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>DLP: {d.todayDLP} mGy·cm</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {d.alertCount > 0 && (
                        <span style={{ padding: '2px 6px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                          {d.alertCount}起
                        </span>
                      )}
                      <span style={{ padding: '2px 8px', background: badge.bg, color: badge.color, borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                        {d.status === 'warning' ? '预警' : '正常'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 患者剂量视图 */}
      {view === 'patient' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>患者剂量记录</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
              <Info size={12} />
              <span>显示近30天内接受辐射检查的患者剂量记录</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['患者姓名', '性别', '年龄', '设备类型', '检查项目', '检查日期', '剂量类型', '剂量值', '阈值', '预警级别', '操作'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientDoseRecords.map((r, i) => {
                  const badge = getAlertBadge(r.alertLevel)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{r.patientName}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.gender}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.age}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>
                        <span style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.modality}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155' }}>{r.examItem}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{r.examDate}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>{r.doseType}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: r.alertLevel === 'critical' ? '#dc2626' : r.alertLevel === 'warning' ? '#d97706' : '#1e3a5f' }}>
                        {r.doseValue} <span style={{ fontSize: 10, fontWeight: 400 }}>{r.doseUnit}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{r.threshold} {r.doseUnit}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', background: badge.bg, color: badge.color, borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                          {badge.label}级
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>详情</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 设备剂量视图 */}
      {view === 'device' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {deviceDoseData.map(d => (
            <div key={d.device} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Monitor size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{d.device}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>今日运行</div>
                  </div>
                </div>
                {d.alertCount > 0 && (
                  <span style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', borderRadius: 6, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={12} /> {d.alertCount}起预警
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>今日DLP</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{d.todayDLP}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>mGy·cm</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>CTDIvol</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{d.todayCTDI}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>mGy</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>历史趋势</button>
                <button style={{ flex: 1, padding: '8px', background: '#f8fafc', color: '#334155', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>质控报告</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 剂量预警视图 */}
      {view === 'alert' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#dc2626" />
              待处理预警 <span style={{ padding: '2px 8px', background: '#fef2f2', color: '#dc2626', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>2</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {doseAlerts.filter(a => a.status === 'pending').map(alert => {
                const badge = alert.alertLevel === 'critical' ? { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' } : { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
                return (
                  <div key={alert.id} style={{ padding: 14, border: `1px solid ${badge.border}`, borderRadius: 10, background: badge.bg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f' }}>{alert.patientName}</span>
                        <span style={{ padding: '2px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{alert.modality}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{alert.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{alert.examItem} · 设备：{alert.device}</div>
                    <div style={{ fontSize: 12, color: badge.color, fontWeight: 600 }}>
                      实测剂量：{alert.doseValue} mGy·cm（阈值：{alert.threshold}）
                      <span style={{ marginLeft: 8 }}>超出 {Math.round((alert.doseValue / alert.threshold - 1) * 100)}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button style={{ flex: 1, padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>确认处理</button>
                      <button style={{ flex: 1, padding: '6px 12px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>查看详情</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="#16a34a" />
              已处理记录
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {doseAlerts.filter(a => a.status === 'acknowledged').map(alert => (
                <div key={alert.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{alert.patientName}</span>
                      <span style={{ padding: '2px 6px', background: '#f0fdf4', color: '#16a34a', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>已确认</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{alert.examItem} · {alert.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>
                    <div>超出 {Math.round((alert.doseValue / alert.threshold - 1) * 100)}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{alert.doseValue}/{alert.threshold}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Info size={14} style={{ color: '#64748b', marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#334155' }}>剂量参考：</strong>CT头颅平扫 DLP参考值约700-800 mGy·cm；胸部CT平扫约400-600 mGy·cm；冠脉CTA约800-1200 mGy·cm；DSA冠脉造影约2000-4000 mGy·m²；乳腺钼靶约3-6 mGy。
          根据《医疗照射放射防护标准》要求，对超出指导水平的检查应进行患者剂量优化分析。
        </div>
      </div>
    </div>
  )
}
