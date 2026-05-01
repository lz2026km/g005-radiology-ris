// @ts-nocheck
// ============================================================
// G005 放射科RIS - 排队叫号系统 v0.3.0
// 放射科CT/MR/DR/DSA/乳腺检查排队叫号
// ============================================================
import { useState, useEffect, useRef } from 'react'
import {
  Monitor, Clock, CheckCircle, User, Volume2, VolumeX,
  RefreshCw, SkipForward, AlertCircle, Radio, ChevronRight,
  Phone, Users, Timer, Volume1, X
} from 'lucide-react'
import { initialRadiologyExams } from '../data/initialData'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 },
  callDisplay: {
    background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
    borderRadius: 16, padding: '32px 40px', marginBottom: 24,
    color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden'
  },
  callNumber: { fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 8 },
  callName: { fontSize: 28, fontWeight: 600, marginBottom: 4 },
  callType: { fontSize: 16, opacity: 0.8 },
  callRoom: { position: 'absolute', top: 20, right: 24, fontSize: 14, opacity: 0.7 },
  callTime: { position: 'absolute', bottom: 16, right: 24, fontSize: 12, opacity: 0.6 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  queueTable: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#64748b', borderBottom: '2px solid #f1f5f9', fontWeight: 600 },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9', color: '#475569' },
  btnPrimary: { background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  actionRow: { display: 'flex', gap: 12, marginBottom: 20 },
  roomBar: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
  roomCard: { background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 },
  roomName: { fontSize: 14, fontWeight: 700, color: '#1e3a5f' },
  roomDoctor: { fontSize: 12, color: '#64748b' },
  roomStatus: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
}

const modalityColors: Record<string, string> = {
  CT: '#3b82f6', MR: '#8b5cf6', DR: '#22c55e', DSA: '#f59e0b', '乳腺钼靶': '#ec4899'
}

const statusColors: Record<string, { bg: string; color: string }> = {
  等待中: { bg: '#fef3c7', color: '#d97706' },
  已呼叫: { bg: '#dbeafe', color: '#1d4ed8' },
  检查中: { bg: '#dcfce7', color: '#16a34a' },
  已完成: { bg: '#f1f5f9', color: '#64748b' },
  跳过: { bg: '#fee2e2', color: '#dc2626' }
}

// 生成模拟排队数据
function generateQueue() {
  const exams = initialRadiologyExams.slice(0, 8).map((e, i) => ({
    ...e,
    queueNum: `${e.modality?.slice(0, 2) || 'CT'}${(100 + i).toString().padStart(3, '0')}`,
    status: i === 0 ? '检查中' : i === 1 ? '已呼叫' : '等待中',
    waitMin: Math.floor(Math.random() * 30) + 5,
    examRoom: `放射科${['1', '2', '3'][i % 3]}室`
  }))
  return exams
}

export default function QueueCallPage() {
  const [queue, setQueue] = useState(() => generateQueue())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [calledPatient, setCalledPatient] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const waiting = queue.filter(q => q.status === '等待中')
  const called = queue.find(q => q.status === '已呼叫')
  const completed = queue.filter(q => q.status === '已完成')

  const callNext = () => {
    const next = waiting[0]
    if (!next) return
    setQueue(prev => prev.map(q =>
      q.id === next.id ? { ...q, status: '已呼叫' } :
      q.status === '已呼叫' ? { ...q, status: '等待中' } : q
    ))
    setCalledPatient(next)
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }

  const recall = () => {
    if (!called) return
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }

  const skip = () => {
    if (!called) return
    setQueue(prev => prev.map(q =>
      q.status === '已呼叫' ? { ...q, status: '等待中' } :
      q.id === waiting[0]?.id ? { ...q, status: '已呼叫' } : q
    ))
  }

  const finishExam = () => {
    if (!called) return
    setQueue(prev => prev.map(q =>
      q.status === '已呼叫' ? { ...q, status: '已完成' } : q
    ))
    setCalledPatient(null)
  }

  return (
    <div style={s.root}>
      {/* 顶部操作栏 */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📢 排队叫号系统</h2>
          <div style={{ fontSize: 12, color: '#64748b' }}>上海市第一人民医院 · 放射科 · {currentTime.toLocaleString('zh-CN')}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={s.btnSecondary} onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume1 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? '声音开' : '声音关'}
          </button>
          <button style={s.btnSecondary} onClick={() => setQueue(generateQueue())}>
            <RefreshCw size={16} /> 重置队列
          </button>
        </div>
      </div>

      {/* 音频提示 */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleV4aBjOW2teleV4aBjOW2teleV4aBjOW2teleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15dZ2eleV4aBjOW2telZ15d" />

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#1d4ed8" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{waiting.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>待检查人数</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 40, height: 40, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>{completed.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>今日已完成</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Timer size={20} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>
              {waiting.length > 0 ? `${Math.floor(Math.random() * 20 + 10)}` : '0'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>预计等候(分钟)</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 40, height: 40, background: '#f3e8ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={20} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', lineHeight: 1 }}>3</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>检查室在线</div>
          </div>
        </div>
      </div>

      {/* 叫号大屏 */}
      <div style={s.callDisplay}>
        {called ? (
          <>
            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>正在呼叫</div>
            <div style={s.callNumber}>{called.queueNum}</div>
            <div style={s.callName}>{called.patientName}</div>
            <div style={s.callType}>{called.modality} · {called.examType} · {called.examRoom}</div>
            <div style={s.callRoom}>
              <Monitor size={14} style={{ marginRight: 4 }} />检查室
            </div>
            <div style={s.callTime}>
              <Clock size={12} style={{ marginRight: 4 }} />呼叫时间 {new Date().toLocaleTimeString('zh-CN')}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 28, opacity: 0.5, marginBottom: 8 }}>暂无候诊患者</div>
            <div style={{ fontSize: 48, fontWeight: 800, opacity: 0.3 }}>--:--</div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={s.actionRow}>
        <button style={s.btnPrimary} onClick={callNext} disabled={waiting.length === 0}>
          <Phone size={18} /> 呼叫下一位
        </button>
        <button style={s.btnSecondary} onClick={recall} disabled={!called}>
          <Volume2 size={16} /> 重呼
        </button>
        <button style={s.btnSecondary} onClick={skip} disabled={!called || waiting.length === 0}>
          <SkipForward size={16} /> 跳过
        </button>
        <button style={{ ...s.btnSecondary, background: '#dcfce7', color: '#16a34a' }} onClick={finishExam} disabled={!called}>
          <CheckCircle size={16} /> 完成检查
        </button>
      </div>

      {/* 诊室状态 */}
      <div style={s.roomBar}>
        {['放射科1室(CT)', '放射科2室(MR)', '放射科3室(DR)'].map((room, i) => {
          const status = i === 0 ? '检查中' : i === 1 ? '空闲' : '准备中'
          const colors = { '检查中': { bg: '#dcfce7', color: '#16a34a' }, '空闲': { bg: '#dbeafe', color: '#1d4ed8' }, '准备中': { bg: '#fef3c7', color: '#d97706' } }[status]
          return (
            <div key={room} style={s.roomCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={s.roomName}>{room}</div>
                <div style={{ ...s.roomStatus, background: colors.bg, color: colors.color }}>{status}</div>
              </div>
              <div style={s.roomDoctor}>
                {i === 0 ? '张伟 主任医师' : i === 1 ? '李明 副主任医师' : '王芳 主治医师'}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {i === 0 ? '当前: 王建国 CT平扫' : i === 1 ? '空闲中' : '准备: 赵红 DR胸部'}
              </div>
            </div>
          )
        })}
      </div>

      {/* 候诊列表 */}
      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Users size={16} color="#1d4ed8" />
            候诊队列（{waiting.length}人）
          </div>
          <table style={s.queueTable}>
            <thead>
              <tr>
                <th style={s.th}>排队号</th>
                <th style={s.th}>姓名</th>
                <th style={s.th}>检查类型</th>
                <th style={s.th}>检查室</th>
                <th style={s.th}>预计等候</th>
                <th style={s.th}>状态</th>
              </tr>
            </thead>
            <tbody>
              {queue.filter(q => q.status !== '已完成').map(q => (
                <tr key={q.id}>
                  <td style={{ ...s.td, fontWeight: 700, color: '#1e3a5f' }}>{q.queueNum}</td>
                  <td style={s.td}>{q.patientName}</td>
                  <td style={s.td}>
                    <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: (modalityColors[q.modality as keyof typeof modalityColors] || '#64748b') + '20', color: modalityColors[q.modality as keyof typeof modalityColors] || '#64748b' }}>
                      {q.modality}
                    </span>
                  </td>
                  <td style={s.td}>{q.examRoom}</td>
                  <td style={s.td}>{q.waitMin}分钟</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusColors[q.status] }}>{q.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>
            <CheckCircle size={16} color="#16a34a" />
            今日已完成（{completed.length}人）
          </div>
          <table style={s.queueTable}>
            <thead>
              <tr>
                <th style={s.th}>排队号</th>
                <th style={s.th}>姓名</th>
                <th style={s.th}>检查类型</th>
                <th style={s.th}>完成时间</th>
              </tr>
            </thead>
            <tbody>
              {completed.length === 0 && (
                <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: 24 }}>暂无已完成记录</td></tr>
              )}
              {completed.map(q => (
                <tr key={q.id}>
                  <td style={{ ...s.td, fontWeight: 700, color: '#1e3a5f' }}>{q.queueNum}</td>
                  <td style={s.td}>{q.patientName}</td>
                  <td style={s.td}>
                    <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: (modalityColors[q.modality as keyof typeof modalityColors] || '#64748b') + '20', color: modalityColors[q.modality as keyof typeof modalityColors] || '#64748b' }}>
                      {q.modality}
                    </span>
                  </td>
                  <td style={s.td}>{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
