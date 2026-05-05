// G005 放射科RIS系统 - PET图像质量评价 v1.0.0
import { useState } from 'react'
import { Image, Star, AlertTriangle, CheckCircle, Search, BarChart3, Clock, Camera, X, Check, Eye, Gauge, Download, RefreshCw } from 'lucide-react'

const PRIMARY = '#1e40af'
const SUCCESS = '#059669'
const WARNING = '#d97706'
const DANGER = '#dc2626'
const GRAY = '#64748b'
const LIGHT_BG = '#f8fafc'
const BORDER = '#e2e8f0'
const WHITE = '#ffffff'

const GRADE_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  A: { bg: '#d1fae5', color: '#059669', label: 'A 级（优质）' },
  B: { bg: '#dbeafe', color: '#1e40af', label: 'B 级（良好）' },
  C: { bg: '#fef3c7', color: '#d97706', label: 'C 级（合格）' },
  D: { bg: '#fee2e2', color: '#dc2626', label: 'D 级（不合格）' },
}

const ARTIFACT_TYPES = ['无伪影', '运动伪影', '金属伪影', '射线伪影', '呼吸伪影', '设备伪影']

// 12条模拟数据
const PET_QC_DATA = [
  { id: 'PET-2026-001', patientName: '王建国', age: 62, gender: '男', studyDate: '2026-05-03', device: 'PET-CT 1（GE）', suvMax: 8.5, suvPeak: 6.2, lesionSize: 22.5, artifact: '无伪影', grade: 'A', note: '图像质量优良，SUV摄取清晰' },
  { id: 'PET-2026-002', patientName: '李秀英', age: 58, gender: '女', studyDate: '2026-05-03', device: 'PET-CT 2（西门子）', suvMax: 5.2, suvPeak: 4.1, lesionSize: 15.8, artifact: '轻微运动伪影', grade: 'B', note: '右肺上叶结节，代谢略增高' },
  { id: 'PET-2026-003', patientName: '赵志明', age: 71, gender: '男', studyDate: '2026-05-02', device: 'PET-CT 1（GE）', suvMax: 12.3, suvPeak: 9.8, lesionSize: 35.2, artifact: '无伪影', grade: 'A', note: '肝右叶巨块型占位，代谢显著增高' },
  { id: 'PET-2026-004', patientName: '周玉芬', age: 55, gender: '女', studyDate: '2026-05-02', device: 'PET-CT 3（飞利浦）', suvMax: 3.8, suvPeak: 2.9, lesionSize: 8.2, artifact: '呼吸伪影', grade: 'C', note: '图像噪声偏高，建议复查' },
  { id: 'PET-2026-005', patientName: '吴婷', age: 48, gender: '女', studyDate: '2026-05-01', device: 'PET-CT 2（西门子）', suvMax: 6.7, suvPeak: 5.4, lesionSize: 18.6, artifact: '无伪影', grade: 'B', note: '纵隔淋巴结，代谢轻度增高' },
  { id: 'PET-2026-006', patientName: '郑伟', age: 65, gender: '男', studyDate: '2026-05-01', device: 'PET-CT 1（GE）', suvMax: 9.1, suvPeak: 7.3, lesionSize: 28.4, artifact: '金属伪影', grade: 'C', note: '胸腰椎内固定术后，局部伪影' },
  { id: 'PET-2026-007', patientName: '孙磊', age: 73, gender: '男', studyDate: '2026-04-30', device: 'PET-CT 3（飞利浦）', suvMax: 4.2, suvPeak: 3.5, lesionSize: 12.1, artifact: '轻微运动伪影', grade: 'B', note: '骨盆溶骨性改变，代谢轻度增高' },
  { id: 'PET-2026-008', patientName: '刘芳', age: 52, gender: '女', studyDate: '2026-04-30', device: 'PET-CT 2（西门子）', suvMax: 7.8, suvPeak: 6.1, lesionSize: 19.3, artifact: '无伪影', grade: 'A', note: '左侧乳腺癌术后，腋窝淋巴结阴性' },
  { id: 'PET-2026-009', patientName: '陈军', age: 68, gender: '男', studyDate: '2026-04-29', device: 'PET-CT 1（GE）', suvMax: 2.1, suvPeak: 1.8, lesionSize: 5.6, artifact: '射线伪影', grade: 'D', note: '图像质量差，噪声严重超标' },
  { id: 'PET-2026-010', patientName: '杨丽', age: 60, gender: '女', studyDate: '2026-04-29', device: 'PET-CT 3（飞利浦）', suvMax: 10.5, suvPeak: 8.2, lesionSize: 32.8, artifact: '无伪影', grade: 'A', note: '胰腺癌伴肝转移' },
  { id: 'PET-2026-011', patientName: '周涛', age: 45, gender: '男', studyDate: '2026-04-28', device: 'PET-CT 2（西门子）', suvMax: 5.5, suvPeak: 4.3, lesionSize: 14.2, artifact: '设备伪影', grade: 'C', note: '探测器灵敏度下降，需维护' },
  { id: 'PET-2026-012', patientName: '张华', age: 57, gender: '男', studyDate: '2026-04-28', device: 'PET-CT 1（GE）', suvMax: 8.9, suvPeak: 7.0, lesionSize: 25.6, artifact: '无伪影', grade: 'A', note: '直肠癌术后，无复发征象' },
]

export default function PETQCPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState('全部')
  const [filterArtifact, setFilterArtifact] = useState('全部')
  const [selectedItem, setSelectedItem] = useState<typeof PET_QC_DATA[0] | null>(null)

  const stats = {
    total: PET_QC_DATA.length,
    gradeA: PET_QC_DATA.filter(d => d.grade === 'A').length,
    gradeB: PET_QC_DATA.filter(d => d.grade === 'B').length,
    gradeC: PET_QC_DATA.filter(d => d.grade === 'C').length,
    gradeD: PET_QC_DATA.filter(d => d.grade === 'D').length,
    avgSuv: (PET_QC_DATA.reduce((sum, d) => sum + d.suvMax, 0) / PET_QC_DATA.length).toFixed(1),
    hasArtifact: PET_QC_DATA.filter(d => d.artifact !== '无伪影').length,
  }

  const filteredData = PET_QC_DATA.filter(item => {
    const matchSearch = item.patientName.includes(searchTerm) || item.id.includes(searchTerm)
    const matchGrade = filterGrade === '全部' || item.grade === filterGrade
    const matchArtifact = filterArtifact === '全部' || item.artifact === filterArtifact
    return matchSearch && matchGrade && matchArtifact
  })

  return (
    <div style={{ minHeight: '100vh', background: LIGHT_BG, padding: '24px' }}>
      {/* 标题栏 */}
      <div style={{ background: WHITE, borderRadius: 12, padding: '20px 24px', marginBottom: 20, borderLeft: `4px solid ${PRIMARY}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: '0 0 4px' }}>📷 PET图像质量评价</h1>
            <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>SUV最大值 · 伪影评估 · 质量分级</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}><Download size={15} /> 导出报告</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: WHITE, color: PRIMARY, border: `1px solid ${PRIMARY}`, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}><RefreshCw size={15} /> 刷新</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ background: WHITE, borderRadius: 12, padding: 16, borderTop: `3px solid ${SUCCESS}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#d1fae5', padding: 10, borderRadius: 8 }}><CheckCircle size={20} color={SUCCESS} /></div>
            <div><p style={{ fontSize: 12, color: GRAY, margin: 0 }}>优质率 (A级)</p><p style={{ fontSize: 24, fontWeight: 700, color: SUCCESS, margin: 0 }}>{((stats.gradeA / stats.total) * 100).toFixed(0)}%</p></div>
          </div>
        </div>
        <div style={{ background: WHITE, borderRadius: 12, padding: 16, borderTop: `3px solid ${PRIMARY}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#dbeafe', padding: 10, borderRadius: 8 }}><Gauge size={20} color={PRIMARY} /></div>
            <div><p style={{ fontSize: 12, color: GRAY, margin: 0 }}>平均SUV最大值</p><p style={{ fontSize: 24, fontWeight: 700, color: PRIMARY, margin: 0 }}>{stats.avgSuv}</p></div>
          </div>
        </div>
        <div style={{ background: WHITE, borderRadius: 12, padding: 16, borderTop: `3px solid ${WARNING}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fef3c7', padding: 10, borderRadius: 8 }}><AlertTriangle size={20} color={WARNING} /></div>
            <div><p style={{ fontSize: 12, color: GRAY, margin: 0 }}>存在伪影</p><p style={{ fontSize: 24, fontWeight: 700, color: WARNING, margin: 0 }}>{stats.hasArtifact}</p></div>
          </div>
        </div>
        <div style={{ background: WHITE, borderRadius: 12, padding: 16, borderTop: `3px solid ${DANGER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fee2e2', padding: 10, borderRadius: 8 }}><Star size={20} color={DANGER} /></div>
            <div><p style={{ fontSize: 12, color: GRAY, margin: 0 }}>不合格 (D级)</p><p style={{ fontSize: 24, fontWeight: 700, color: DANGER, margin: 0 }}>{stats.gradeD}</p></div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{ background: WHITE, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: GRAY }} />
            <input type="text" placeholder="搜索患者姓名 / 检查ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 36px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="全部">全部等级</option>
            {['A', 'B', 'C', 'D'].map(g => <option key={g} value={g}>{g}级</option>)}
          </select>
          <select value={filterArtifact} onChange={e => setFilterArtifact(e.target.value)} style={{ padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="全部">全部伪影</option>
            {ARTIFACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* 数据表格 */}
      <div style={{ background: WHITE, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['检查ID', '患者', '检查日期', '设备', 'SUV最大', 'SUV峰值', '病灶大小', '伪影', '等级', '操作'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: GRAY }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? WHITE : '#fafafa' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: PRIMARY, fontWeight: 500 }}>{item.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{item.patientName}<br /><span style={{ fontSize: 11, color: GRAY }}>{item.age}岁/{item.gender}</span></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: GRAY }}>{item.studyDate}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{item.device}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: item.suvMax > 10 ? DANGER : item.suvMax > 6 ? WARNING : SUCCESS }}>{item.suvMax}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{item.suvPeak}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{item.lesionSize} mm</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>
                  {item.artifact === '无伪影' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: SUCCESS }}><CheckCircle size={14} /> 无伪影</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: WARNING }}><AlertTriangle size={14} /> {item.artifact}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: GRADE_CONFIG[item.grade].bg, color: GRADE_CONFIG[item.grade].color }}>{item.grade}级</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => setSelectedItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PRIMARY, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Eye size={14} /> 详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: 24, width: 500, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: PRIMARY, margin: 0 }}>PET图像质量详情</h2>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>检查ID</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{selectedItem.id}</p></div>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>患者姓名</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{selectedItem.patientName}</p></div>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>SUV最大值</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{selectedItem.suvMax}</p></div>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>SUV峰值</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{selectedItem.suvPeak}</p></div>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>病灶大小</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{selectedItem.lesionSize} mm</p></div>
              <div><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>伪影评估</p><p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: selectedItem.artifact === '无伪影' ? SUCCESS : WARNING }}>{selectedItem.artifact}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>质量等级</p><span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: GRADE_CONFIG[selectedItem.grade].bg, color: GRADE_CONFIG[selectedItem.grade].color }}>{GRADE_CONFIG[selectedItem.grade].label}</span></div>
              <div style={{ gridColumn: '1 / -1' }}><p style={{ fontSize: 12, color: GRAY, margin: '0 0 4px' }}>备注</p><p style={{ fontSize: 14, margin: 0 }}>{selectedItem.note}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
