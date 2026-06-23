import { useMemo } from 'react'
import {
  ArrowLeft, Edit2, Calendar, CreditCard, Phone, MapPin, Contact, User, Shield, Stethoscope,
  Activity, AlertTriangle, CheckCircle, Clock, AlertCircle, Image, Layers
} from 'lucide-react'
import type { Patient } from '../../types'
import type { RadiologyExam } from '../../types'
import type { TimelineEvent } from './types'
import { getBirthDateFromIdCard, getPatientExams, getPatientStats } from './utils'

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  exam: <Image size={14} />,
  report: <FileText size={14} />,
  appointment: <Calendar size={14} />,
  diagnosis: <Stethoscope size={14} />,
}

const TIMELINE_COLORS: Record<string, string> = {
  exam: '#3b82f6',
  report: '#059669',
  appointment: '#d97706',
  diagnosis: '#7c3aed',
}

function FileText({ size }: { size?: number }) {
  return <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}

interface PatientTimelineProps {
  events: TimelineEvent[]
}

function PatientTimeline({ events }: PatientTimelineProps) {
  const sorted = useMemo(() => [...events].sort((a, b) => b.date.localeCompare(a.date)), [events])

  return (
    <div style={{ position: 'relative', paddingLeft: 32 }}>
      <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }} />
      {sorted.map((evt, idx) => {
        const color = TIMELINE_COLORS[evt.type] || '#64748b'
        return (
          <div key={idx} style={{ position: 'relative', paddingBottom: 24, display: 'flex', gap: 16 }}>
            <div style={{ position: 'absolute', left: -24, width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 1, fontSize: 12 }}>
              {evt.icon || TIMELINE_ICONS[evt.type] || <Clock size={14} />}
            </div>
            <div style={{ flex: 1, marginLeft: 8 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', border: '1px solid #e2e8f0', borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: 13 }}>{evt.title}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{evt.date}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{evt.description}</div>
                {evt.status && (
                  <span style={{ marginTop: 6, display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#2563eb' }}>
                    {evt.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {sorted.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>暂无时间线事件</div>
      )}
    </div>
  )
}

export interface PatientDetailPanelProps {
  selectedPatient: Patient | null
  onBack: () => void
  onEdit: (patient: Patient) => void
  exams: RadiologyExam[]
}

export function PatientDetailPanel({ selectedPatient, onBack, onEdit, exams }: PatientDetailPanelProps) {
  if (!selectedPatient) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 60, textAlign: 'center' }}>
        <User size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 14, color: '#64748b' }}>请从患者列表选择一个患者查看详情</div>
        <button onClick={onBack} style={{ marginTop: 16, padding: '8px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          返回患者列表
        </button>
      </div>
    )
  }

  const patientExams = getPatientExams(selectedPatient.id, exams)
  const stats = getPatientStats(selectedPatient.id, exams)

  return (
    <>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', marginBottom: 16 }}>
        <ArrowLeft size={14} />返回列表
      </button>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{selectedPatient.name.slice(0, 1)}</span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>{selectedPatient.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{selectedPatient.gender} · {selectedPatient.age}岁 · {selectedPatient.patientType}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>ID: {selectedPatient.id}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(selectedPatient)}
              style={{ padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit2 size={14} />编辑
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: '出生日期', value: getBirthDateFromIdCard(selectedPatient.idCard), icon: <Calendar size={14} /> },
            { label: '身份证号', value: selectedPatient.idCard, icon: <CreditCard size={14} /> },
            { label: '联系电话', value: selectedPatient.phone, icon: <Phone size={14} /> },
            { label: '家庭住址', value: selectedPatient.address, icon: <MapPin size={14} /> },
            { label: '联系人', value: selectedPatient.emergencyContact, icon: <Contact size={14} /> },
            { label: '联系人电话', value: selectedPatient.emergencyPhone, icon: <Phone size={14} /> },
            { label: '就诊卡号', value: selectedPatient.id, icon: <CreditCard size={14} /> },
            { label: '患者类型', value: selectedPatient.patientType, icon: <User size={14} /> },
            { label: '医保类型', value: selectedPatient.insuranceType || '-', icon: <Shield size={14} /> },
            { label: '床位号', value: selectedPatient.bedNumber || '-', icon: <User size={14} /> },
            { label: '主治医师', value: selectedPatient.attendingDoctor || '-', icon: <Stethoscope size={14} /> },
            { label: '建档日期', value: selectedPatient.registrationDate, icon: <Calendar size={14} /> },
          ].map(item => (
            <div key={item.label} style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#94a3b8' }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 16, background: selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#fef2f2' : '#f8fafc', border: `1px solid ${selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#fecaca' : '#e2e8f0'}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <AlertTriangle size={14} color={selectedPatient.allergyHistory && selectedPatient.allergyHistory !== '无' ? '#dc2626' : '#94a3b8'} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>过敏史</span>
            </div>
            <div style={{ fontSize: 13, color: '#334155' }}>{selectedPatient.allergyHistory || '无'}</div>
          </div>
          <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Clock size={14} color="#94a3b8" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>既往史</span>
            </div>
            <div style={{ fontSize: 13, color: '#334155' }}>{selectedPatient.medicalHistory || '无'}</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>检查统计</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: '#eff6ff', borderRadius: 8 }}>
            <Activity size={24} color="#3b82f6" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>{stats.totalExams}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>总检查次数</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: '#fef2f2', borderRadius: 8 }}>
            <AlertTriangle size={24} color="#dc2626" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{stats.positiveCount}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>阳性/危急</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
            <CheckCircle size={24} color="#16a34a" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{stats.negativeCount}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>阴性/正常</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <Clock size={24} color="#64748b" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{stats.firstExamDate}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>首次检查日期</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>检查历史</div>
          <span style={{ fontSize: 12, color: '#64748b' }}>共 {patientExams.length} 条记录</span>
        </div>
        {patientExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>暂无检查记录</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['检查日期', '检查项目', '设备', '检查类型', '优先级', '状态', '报告结果', '报告医生'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientExams.map((ex, idx) => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>{ex.examDate}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{ex.examItemName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{ex.modality} · {ex.bodyPart}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>{ex.deviceName}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{ex.patientType}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, background: ex.priority === '危重' || ex.priority === '紧急' ? '#fef2f2' : '#f0fdf4', color: ex.priority === '危重' || ex.priority === '紧急' ? '#dc2626' : '#16a34a' }}>
                        {ex.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: ex.status === '已完成' ? '#dbeafe' : '#fef3c7', color: ex.status === '已完成' ? '#1e40af' : '#d97706' }}>
                        {ex.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {ex.criticalFinding ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600 }}>
                          <AlertCircle size={12} />阳性
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a' }}>正常</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{ex.technologistName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="#1e3a5f" />
          患者360°时间线
        </div>
        <PatientTimeline events={[
          ...patientExams.map(ex => ({
            date: ex.examDate,
            type: 'exam' as const,
            title: ex.examItemName,
            description: `${ex.modality} · ${ex.bodyPart} · ${ex.deviceName || ''}`,
            status: ex.status,
          })),
          ...patientExams.filter(ex => ex.criticalFinding).map(ex => ({
            date: ex.examDate,
            type: 'diagnosis' as const,
            title: '阳性发现',
            description: `检查 ${ex.examItemName} 有阳性/危急发现`,
            status: '需关注',
          })),
        ]} />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Image size={16} color="#1e3a5f" />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>影像历史</div>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>共 {patientExams.length} 组影像</span>
        </div>
        {patientExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>暂无影像记录</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {patientExams.map(ex => (
              <div key={ex.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#1e3a5f'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}>
                <div style={{ width: '100%', height: 80, background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Image size={24} color="rgba(255,255,255,0.6)" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f', marginBottom: 2 }}>{ex.examItemName}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{ex.examDate}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{ex.imagesAcquired > 0 ? `${ex.imagesAcquired} 帧` : '待采集'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
