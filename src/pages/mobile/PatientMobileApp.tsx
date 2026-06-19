import React, { useState, useEffect } from 'react'
import { ChevronRight, Bell, BellOff } from 'lucide-react'
import { pushService } from '../../services/mobile/push/PushService'

// ===== Types =====
export interface MobileUser {
  id: string
  name: string
  avatar: string
  verified: boolean
  phone: string
}

export interface MobileReport {
  id: string
  examType: string
  examDate: string
  status: 'ready' | 'pending'
  doctorName?: string
  hospitalName?: string
  hasImages: boolean
  pdfUrl?: string
}

export interface MobileNotification {
  id: string
  title: string
  body: string
  type: 'report' | 'appointment' | 'system' | 'promotion'
  read: boolean
  time: string
}

// ===== Mock Data =====
const MOCK_USER: MobileUser = { id: 'P001', name: '张三', avatar: '👤', verified: true, phone: '138****5678' }

const MOCK_REPORTS: MobileReport[] = [
  { id: 'R1', examType: '胸部CT平扫', examDate: '2025-05-01', status: 'ready', doctorName: '李明', hospitalName: '市人民医院', hasImages: true },
  { id: 'R2', examType: '颅脑MRI平扫', examDate: '2025-04-15', status: 'ready', doctorName: '王芳', hospitalName: '市人民医院', hasImages: true },
  { id: 'R3', examType: '腹部彩超', examDate: '2025-04-20', status: 'pending', hasImages: false },
]

const MOCK_NOTIFICATIONS: MobileNotification[] = [
  { id: 'N1', title: '报告已出具', body: '您的胸部CT平扫报告已出具，点击查看', type: 'report', read: false, time: '2025-05-01 14:30' },
  { id: 'N2', title: '预约提醒', body: '您有新的影像检查预约', type: 'appointment', read: false, time: '2025-04-28 09:00' },
  { id: 'N3', title: '系统维护通知', body: '系统将于凌晨2:00-4:00进行维护', type: 'system', read: true, time: '2025-04-25 10:00' },
]

// ===== Styles =====
const s = {
  wrapper: { maxWidth: 380, margin: '0 auto', background: '#f8fafc', minHeight: 700, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', fontFamily: '-apple-system, sans-serif' },
  header: { background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', padding: '20px 16px 16px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userRow: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  userName: { fontSize: 16, fontWeight: 700 },
  verifiedBadge: { fontSize: 10, background: '#059669', padding: '2px 6px', borderRadius: 8, color: '#fff' },
  content: { padding: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  badge: (status: string) => ({
    padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
    background: status === 'ready' ? '#dcfce7' : '#fef9c3',
    color: status === 'ready' ? '#166534' : '#854d0e',
  }),
  tab: (active: boolean) => ({
    flex: 1, padding: '8px 0', textAlign: 'center' as const, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    color: active ? '#1e40af' : '#94a3b8', borderBottom: active ? '2px solid #1e40af' : '2px solid transparent',
  }),
  nav: { display: 'flex', background: '#fff', borderTop: '1px solid #e2e8f0', padding: '6px 0' },
  navItem: (active: boolean) => ({
    flex: 1, textAlign: 'center' as const, padding: '4px 0', fontSize: 10, color: active ? '#1e40af' : '#94a3b8', cursor: 'pointer' as const, fontWeight: active ? 700 : 400,
  }),
}

// ===== Component =====
export default function PatientMobileApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'reports' | 'notifications' | 'profile'>('home')
  const [selectedReport, setSelectedReport] = useState<MobileReport | null>(null)
  const [pushEnabled, setPushEnabled] = useState(pushService.permission === 'granted')

  useEffect(() => {
    if (pushService.permission === 'default') {
      pushService.requestPermission().then(p => setPushEnabled(p === 'granted'))
    }
  }, [])

  const togglePush = async () => {
    if (pushEnabled) {
      await pushService.unsubscribe()
      setPushEnabled(false)
    } else {
      const perm = await pushService.requestPermission()
      if (perm === 'granted') {
        pushService.sendLocalNotification({ title: 'G005 RIS', body: '通知已开启' })
        setPushEnabled(true)
      }
    }
  }

  const renderHome = () => (
    <>
      {/* Banner */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: 'none' }}>
        <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>欢迎回来</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: '4px 0' }}>{MOCK_USER.name}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>您有 {MOCK_REPORTS.filter(r => r.status === 'ready').length} 份新报告可查看</div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { icon: '📋', label: '我的报告', tab: 'reports' as const },
          { icon: '🖼️', label: '影像查看', tab: 'reports' as const },
          { icon: '🔔', label: '消息中心', tab: 'notifications' as const },
        ].map(action => (
          <div key={action.label} style={{ background: '#fff', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => setActiveTab(action.tab)}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{action.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={s.cardTitle}>最近报告</div>
          <span style={{ fontSize: 11, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>查看全部 →</span>
        </div>
        {MOCK_REPORTS.slice(0, 2).map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
            onClick={() => setSelectedReport(r)}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.examType}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.examDate}</div>
            </div>
            <span style={s.badge(r.status)}>{r.status === 'ready' ? '已出报告' : '待出具'}</span>
          </div>
        ))}
      </div>

      {/* Notifications Preview */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={s.cardTitle}>消息</div>
          <span style={{ fontSize: 11, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setActiveTab('notifications')}>查看全部 →</span>
        </div>
        {MOCK_NOTIFICATIONS.filter(n => !n.read).slice(0, 2).map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 4, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{n.title}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  const renderReports = () => (
    <div style={s.card}>
      {selectedReport ? (
        <div>
          <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#3b82f6', marginBottom: 12, padding: 0 }} onClick={() => setSelectedReport(null)}>
            ← 返回列表
          </button>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{selectedReport.examType}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{selectedReport.examDate} · {selectedReport.doctorName}</div>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
            检查描述：双肺野清晰，肺纹理走行自然。\n诊断意见：未见明显异常。
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📥 下载PDF</button>
            <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🖼️ 查看影像</button>
          </div>
        </div>
      ) : (
        <>
          <div style={s.cardTitle}>检查报告</div>
          {MOCK_REPORTS.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => setSelectedReport(r)}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{r.examType}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.examDate}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={s.badge(r.status)}>{r.status === 'ready' ? '已出报告' : '待出具'}</span>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )

  const renderNotifications = () => (
    <div style={s.card}>
      <div style={s.cardTitle}>消息中心</div>
      {MOCK_NOTIFICATIONS.map(n => (
        <div key={n.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? '#e2e8f0' : '#3b82f6', marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{n.title}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{n.body}</div>
            <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderProfile = () => (
    <div>
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ ...s.avatar, width: 56, height: 56, fontSize: 24, background: '#dbeafe' }}>{MOCK_USER.avatar}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{MOCK_USER.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{MOCK_USER.phone}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={s.verifiedBadge}>已实名认证 ✓</span>
        </div>
      </div>
      <div style={s.card}>
        {[
          { icon: '🔒', label: '账户安全' },
          { icon: '📱', label: '设备管理' },
          { icon: '⚙️', label: '设置' },
          { icon: 'ℹ️', label: '关于' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}>
            <span style={{ marginRight: 10, fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: '#334155', flex: 1 }}>{item.label}</span>
            <ChevronRight size={14} color="#94a3b8" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={s.wrapper}>
      {/* Status Bar */}
      <div style={{ background: '#1e40af', color: '#fff', padding: '6px 16px', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
        <span>9:41</span>
        <span>📶 🔋 100%</span>
      </div>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.userRow}>
            <div style={s.avatar}>👤</div>
            <div>
              <div style={s.userName}>{MOCK_USER.name}</div>
              <span style={s.verifiedBadge}>✓ 已认证</span>
            </div>
          </div>
          <span style={{ fontSize: 20, cursor: 'pointer' }} onClick={togglePush} title={pushEnabled ? '关闭推送通知' : '开启推送通知'}>
            {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </span>
        </div>
        {/* Tab Bar */}
        <div style={{ display: 'flex', marginTop: 8 }}>
          {(['home', 'reports', 'notifications', 'profile'] as const).map(t => (
            <div key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t === 'home' ? '首页' : t === 'reports' ? '报告' : t === 'notifications' ? '消息' : '我的'}
            </div>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={s.content}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'profile' && renderProfile()}
      </div>
      {/* Bottom Nav */}
      <div style={s.nav}>
        {[
          { key: 'home' as const, icon: '🏠', label: '首页' },
          { key: 'reports' as const, icon: '📋', label: '报告' },
          { key: 'notifications' as const, icon: '🔔', label: '消息' },
          { key: 'profile' as const, icon: '👤', label: '我的' },
        ].map(n => (
          <div key={n.key} style={s.navItem(activeTab === n.key)} onClick={() => setActiveTab(n.key)}>
            <div style={{ fontSize: 18 }}>{n.icon}</div>
            <div>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
