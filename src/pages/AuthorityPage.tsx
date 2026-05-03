// @ts-nocheck
import React, { useState } from 'react'
import {
  Shield, Users, UserCog, Key, Eye, EyeOff, Plus, Trash2,
  Edit3, Save, X, Search, Filter, CheckCircle, XCircle,
  ChevronRight, ChevronDown, Lock, Unlock, AlertTriangle,
  Activity, Scan, FileText, Stethoscope, UserCheck
} from 'lucide-react'

interface Role { id: string; name: string; desc: string; userCount: number; color: string }
interface Permission { id: string; name: string; module: string; description: string }
interface User { id: string; name: string; dept: string; role: string; status: 'active' | 'inactive'; lastLogin: string }

const roles: Role[] = [
  { id: 'R001', name: '系统管理员', desc: '拥有系统所有权限，可管理所有模块', userCount: 2, color: '#f85149' },
  { id: 'R002', name: '科室主任', desc: '管理科室运营、查看全部数据、审批报告', userCount: 3, color: '#a371f7' },
  { id: 'R003', name: '主治医师（放射科）', desc: '书写报告、审核影像、签发报告', userCount: 8, color: '#58a6ff' },
  { id: 'R004', name: '住院医师', desc: '协助检查执行、记录、随访患者', userCount: 12, color: '#3fb950' },
  { id: 'R005', name: 'CT技师', desc: 'CT设备操作、CT检查执行、影像采集', userCount: 6, color: '#8b949e' },
  { id: 'R006', name: 'MRI技师', desc: 'MRI设备操作、MRI检查执行、影像采集', userCount: 4, color: '#f0b429' },
  { id: 'R007', name: 'X线技师', desc: 'X线设备操作、摄影执行', userCount: 5, color: '#8b949e' },
  { id: 'R008', name: 'DSA技师', desc: 'DSA设备操作、介入手术辅助', userCount: 3, color: '#f0b429' },
  { id: 'R009', name: '护士', desc: '患者管理、护理操作、协助检查', userCount: 10, color: '#3fb950' },
  { id: 'R010', name: '登记员', desc: '患者登记、排班管理、预约登记', userCount: 4, color: '#6e7681' },
]

const modules = ['患者管理', 'CT检查', 'MRI检查', 'X线摄影', 'DSA手术', '报告管理', '影像管理', '统计报表', '系统设置']
const allPermissions: Permission[] = modules.flatMap(mod =>
  ['查看', '预约', '执行', '编辑', '删除', '导出', '审核'].map(act => ({
    id: `${mod}-${act}`, name: `${act}`, module: mod,
    description: `${mod}的${act}权限`
  }))
)

const users: User[] = [
  { id: 'U001', name: '马辉菊', dept: '登记处', role: '住院医师', status: 'active' as const, lastLogin: '2026-04-05 14:46' },
  { id: 'U002', name: '胡辉军', dept: '登记处', role: '登记员', status: 'active' as const, lastLogin: '2026-02-03 06:19' },
  { id: 'U003', name: '王勇梅', dept: 'CT室', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-03-28 06:57' },
  { id: 'U004', name: '胡伟菊', dept: '登记处', role: '住院医师', status: 'active' as const, lastLogin: '2026-01-09 06:27' },
  { id: 'U005', name: '杨艳平', dept: '放射科', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-02-20 15:47' },
  { id: 'U006', name: '张静平', dept: '登记处', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-05-16 17:47' },
  { id: 'U007', name: '郭静菊', dept: 'MRI室', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-05-23 17:34' },
  { id: 'U008', name: '周波英', dept: '登记处', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-03-19 19:52' },
  { id: 'U009', name: '马杰英', dept: '导管室', role: '登记员', status: 'active' as const, lastLogin: '2026-03-16 17:27' },
  { id: 'U010', name: '高秀芬', dept: '急诊放射', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-02-24 16:58' },
  { id: 'U011', name: '徐勇', dept: '登记处', role: '科室主任', status: 'active' as const, lastLogin: '2026-02-16 08:50' },
  { id: 'U012', name: '周芳平', dept: '登记处', role: 'CT技师', status: 'active' as const, lastLogin: '2026-02-28 08:28' },
  { id: 'U013', name: '朱秀梅', dept: '放射科', role: '系统管理员', status: 'inactive' as const, lastLogin: '2026-05-06 07:59' },
  { id: 'U014', name: '赵杰军', dept: 'MRI室', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-01-24 14:36' },
  { id: 'U015', name: '刘明军', dept: 'CT室', role: '护士', status: 'active' as const, lastLogin: '2026-01-12 20:57' },
  { id: 'U016', name: '罗晓华', dept: '急诊放射', role: '科室主任', status: 'active' as const, lastLogin: '2026-02-17 15:18' },
  { id: 'U017', name: '张强菊', dept: 'X线室', role: '护士', status: 'active' as const, lastLogin: '2026-05-03 16:29' },
  { id: 'U018', name: '杨涛梅', dept: 'X线室', role: '登记员', status: 'active' as const, lastLogin: '2026-02-01 19:24' },
  { id: 'U019', name: '朱丽兰', dept: 'CT室', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-02-06 14:23' },
  { id: 'U020', name: '杨敏平', dept: '导管室', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-05-01 09:41' },
  { id: 'U021', name: '郭建菊', dept: '登记处', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-02-11 11:46' },
  { id: 'U022', name: '周伟梅', dept: '登记处', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-01-12 10:46' },
  { id: 'U023', name: '林彬平', dept: 'MRI室', role: '系统管理员', status: 'active' as const, lastLogin: '2026-05-13 20:52' },
  { id: 'U024', name: '张静菊', dept: 'CT室', role: '系统管理员', status: 'active' as const, lastLogin: '2026-03-14 13:28' },
  { id: 'U025', name: '罗敏兰', dept: '急诊放射', role: '护士', status: 'inactive' as const, lastLogin: '2026-04-25 19:16' },
  { id: 'U026', name: '张强菊', dept: '急诊放射', role: 'X线技师', status: 'active' as const, lastLogin: '2026-05-16 20:34' },
  { id: 'U027', name: '马明兰', dept: '导管室', role: 'X线技师', status: 'inactive' as const, lastLogin: '2026-04-09 10:40' },
  { id: 'U028', name: '杨艳英', dept: '放射科', role: 'X线技师', status: 'active' as const, lastLogin: '2026-02-11 10:19' },
  { id: 'U029', name: '黄彬平', dept: '放射科', role: '护士', status: 'active' as const, lastLogin: '2026-03-18 16:10' },
  { id: 'U030', name: '孙伟梅', dept: '急诊放射', role: '科室主任', status: 'active' as const, lastLogin: '2026-02-28 14:32' },
  { id: 'U031', name: '周建兰', dept: 'MRI室', role: '登记员', status: 'active' as const, lastLogin: '2026-01-12 07:47' },
  { id: 'U032', name: '陈秀军', dept: 'X线室', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-02-19 17:37' },
  { id: 'U033', name: '孙涛芬', dept: '急诊放射', role: '登记员', status: 'inactive' as const, lastLogin: '2026-02-18 19:49' },
  { id: 'U034', name: '马伟军', dept: 'X线室', role: '住院医师', status: 'active' as const, lastLogin: '2026-01-09 18:11' },
  { id: 'U035', name: '林静平', dept: '导管室', role: '护士', status: 'active' as const, lastLogin: '2026-05-22 20:35' },
  { id: 'U036', name: '马彬华', dept: 'MRI室', role: '住院医师', status: 'inactive' as const, lastLogin: '2026-02-25 13:50' },
  { id: 'U037', name: '杨杰', dept: 'CT室', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-05-05 07:41' },
  { id: 'U038', name: '林丽梅', dept: '登记处', role: 'X线技师', status: 'active' as const, lastLogin: '2026-04-28 18:39' },
  { id: 'U039', name: '黄伟华', dept: 'CT室', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-02-05 09:42' },
  { id: 'U040', name: '何丽平', dept: '急诊放射', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-04-26 07:43' },
  { id: 'U041', name: '陈大英', dept: '放射科', role: '登记员', status: 'inactive' as const, lastLogin: '2026-05-04 19:14' },
  { id: 'U042', name: '孙明芬', dept: '急诊放射', role: 'X线技师', status: 'active' as const, lastLogin: '2026-01-27 17:30' },
  { id: 'U043', name: '林鹏芬', dept: '急诊放射', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-01-21 08:45' },
  { id: 'U044', name: '朱芳华', dept: 'MRI室', role: '住院医师', status: 'active' as const, lastLogin: '2026-02-23 10:13' },
  { id: 'U045', name: '陈彬兰', dept: '导管室', role: '护士', status: 'active' as const, lastLogin: '2026-03-27 12:28' },
  { id: 'U046', name: '郭建兰', dept: '登记处', role: 'CT技师', status: 'active' as const, lastLogin: '2026-05-06 13:30' },
  { id: 'U047', name: '李强平', dept: '登记处', role: 'CT技师', status: 'inactive' as const, lastLogin: '2026-05-09 11:25' },
  { id: 'U048', name: '马燕菊', dept: 'X线室', role: '科室主任', status: 'inactive' as const, lastLogin: '2026-05-14 20:18' },
  { id: 'U049', name: '徐彬', dept: '导管室', role: 'CT技师', status: 'active' as const, lastLogin: '2026-04-09 18:44' },
  { id: 'U050', name: '周杰梅', dept: '登记处', role: '护士', status: 'active' as const, lastLogin: '2026-01-22 09:54' },
  { id: 'U051', name: '张彬华', dept: '急诊放射', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-04-22 18:47' },
  { id: 'U052', name: '张鹏', dept: '放射科', role: 'DSA技师', status: 'inactive' as const, lastLogin: '2026-04-09 16:56' },
  { id: 'U053', name: '郭芳梅', dept: 'CT室', role: 'X线技师', status: 'active' as const, lastLogin: '2026-01-26 07:14' },
  { id: 'U054', name: '刘强芬', dept: '放射科', role: '科室主任', status: 'active' as const, lastLogin: '2026-02-03 10:34' },
  { id: 'U055', name: '何勇华', dept: '急诊放射', role: '登记员', status: 'active' as const, lastLogin: '2026-04-21 17:52' },
  { id: 'U056', name: '王勇华', dept: 'MRI室', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-04-09 18:17' },
  { id: 'U057', name: '马勇军', dept: '导管室', role: '科室主任', status: 'active' as const, lastLogin: '2026-02-09 08:37' },
  { id: 'U058', name: '陈大', dept: '登记处', role: 'DSA技师', status: 'active' as const, lastLogin: '2026-01-12 10:41' },
  { id: 'U059', name: '刘波菊', dept: 'CT室', role: 'MRI技师', status: 'active' as const, lastLogin: '2026-04-21 19:43' },
  { id: 'U060', name: '胡建平', dept: '放射科', role: '主治医师（放射科）', status: 'active' as const, lastLogin: '2026-03-14 19:46' },
];

const s: Record<string, React.CSSProperties> = {
  root: { padding: 32, minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden' },
  cardHeader: { padding: '14px 20px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  cardBody: { padding: 16 },
  roleItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #21262d', cursor: 'pointer', transition: 'background 0.15s' },
  roleInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  roleDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  userRow: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #21262d', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#8b949e', flexShrink: 0 },
  searchInput: { padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, outline: 'none', width: 200 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40, transition: 'all 0.15s' },
  btnPrimary: { background: '#1f6feb', color: '#fff' },
  btnOutline: { background: 'transparent', border: '1px solid #30363d', color: '#8b949e' },
  btnDanger: { background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' },
  badge: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#8b949e', fontWeight: 500, borderBottom: '1px solid #30363d' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #21262d' },
  divider: { height: 1, background: '#30363d', margin: '20px 0' },
  permGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  permItem: { padding: '8px 10px', borderRadius: 6, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s' },
  permItemActive: { background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.4)', color: '#58a6ff' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#8b949e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  tabActive: { padding: '10px 18px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '2px solid #58a6ff', color: '#58a6ff', minHeight: 44, transition: 'all 0.15s' },
  tabInactive: { padding: '10px 18px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '2px solid transparent', color: '#8b949e', minHeight: 44, transition: 'all 0.15s' },
}

const moduleIcons: Record<string, React.ReactNode> = {
  'CT检查': <Scan size={14} color="#58a6ff" />,
  'MRI检查': <Activity size={14} color="#a371f7" />,
  'X线摄影': <Scan size={14} color="#8b949e" />,
  'DSA手术': <Stethoscope size={14} color="#f0b429" />,
  '报告管理': <FileText size={14} color="#3fb950" />,
  '患者管理': <Users size={14} color="#58a6ff" />,
  '影像管理': <Eye size={14} color="#f85149" />,
  '统计报表': <Activity size={14} color="#3fb950" />,
  '系统设置': <Lock size={14} color="#8b949e" />,
}

export default function AuthorityPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [showAddUser, setShowAddUser] = useState(false)

  // 新建角色处理
  const handleCreateRole = () => {
    alert('正在跳转到新建角色页面...')
  }

  // 保存角色权限处理
  const handleSaveRole = () => {
    if (selectedRole) {
      alert(`正在保存角色 "${selectedRole.name}" 的权限配置...`)
    }
  }

  // 新增用户处理
  const handleAddUser = () => {
    setShowAddUser(true)
  }

  // 编辑用户处理
  const handleEditUser = (userId: string) => {
    alert(`正在编辑用户: ${userId}`)
  }

  // 删除用户处理
  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除该用户吗？此操作不可撤销。')) {
      alert(`正在删除用户: ${userId}`)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.includes(searchTerm) || u.dept.includes(searchTerm) || u.role.includes(searchTerm)
  )

  const handleTogglePerm = (permId: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      next.has(permId) ? next.delete(permId) : next.add(permId)
      return next
    })
  }

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
    const presetPerms = new Set<string>()
    if (role.id === 'R001') {
      allPermissions.forEach(p => presetPerms.add(p.id))
    } else if (role.id === 'R002') {
      modules.filter(m => !['系统设置'].includes(m)).forEach(m =>
        ['查看', '预约', '执行', '编辑', '删除', '导出', '审核'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R003') {
      ;['患者管理', 'CT检查', 'MRI检查', 'X线摄影', 'DSA手术', '报告管理', '影像管理', '统计报表'].forEach(m =>
        ['查看', '预约', '执行', '编辑', '导出', '审核'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R005') {
      ;['CT检查', '影像管理'].forEach(m =>
        ['查看', '执行', '编辑'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R006') {
      ;['MRI检查', '影像管理'].forEach(m =>
        ['查看', '执行', '编辑'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R007') {
      ;['X线摄影', '影像管理'].forEach(m =>
        ['查看', '执行', '编辑'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R008') {
      ;['DSA手术', '影像管理'].forEach(m =>
        ['查看', '执行', '编辑'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R010') {
      ;['患者管理', 'CT检查', 'MRI检查', 'X线摄影', 'DSA手术'].forEach(m =>
        ['查看', '预约'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    }
    setSelectedPerms(presetPerms)
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.title}><Shield size={22} color="#58a6ff" /> 放射科权限管理中心</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={s.searchInput}
            placeholder="搜索用户/科室/角色..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowAddUser(true)}><Plus size={14} />新增用户</button>
        </div>
      </div>

      {/* 标签 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #30363d', paddingBottom: 0 }}>
        {([
          ['roles', '角色管理', Users],
          ['users', '用户管理', UserCog],
          ['permissions', '权限配置', Key],
        ] as [string, string, React.ElementType][]).map(([k, label, Icon]) => (
          <div
            key={k}
            onClick={() => setActiveTab(k as typeof activeTab)}
            style={activeTab === k ? s.tabActive : s.tabInactive}
          >
            <Icon size={15} />{label}
          </div>
        ))}
      </div>

      {/* 角色管理 */}
      {activeTab === 'roles' && (
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}><Users size={15} color="#58a6ff" /> 角色列表</div>
              <button onClick={handleCreateRole} style={{ ...s.btn, ...s.btnOutline, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Plus size={13} />新建角色</button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 520 }}>
              {roles.map(role => (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  style={{
                    ...s.roleItem,
                    background: selectedRole?.id === role.id ? '#1f3a5f' : 'transparent',
                  }}
                >
                  <div style={s.roleInfo}>
                    <div style={{ ...s.roleDot, background: role.color }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{role.name}</div>
                      <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{role.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ ...s.badge, background: `${role.color}18`, color: role.color }}>{role.userCount}人</span>
                    <ChevronRight size={14} color="#8b949e" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}><Key size={15} color="#f0b429" />{selectedRole ? `权限配置 — ${selectedRole.name}` : '选择角色查看权限'}</div>
              {selectedRole && <button onClick={handleSaveRole} style={{ ...s.btn, ...s.btnPrimary, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Save size={13} />保存</button>}
            </div>
            <div style={s.cardBody}>
              {!selectedRole ? (
                <div style={s.empty}>
                  <Shield size={40} color="#30363d" />
                  <div style={{ fontSize: 14, color: '#8b949e' }}>请从左侧选择一个角色</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16, padding: '10px 12px', background: '#21262d', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selectedRole.name}</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>{selectedRole.desc}</div>
                    <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>共 {selectedPerms.size} 项权限</div>
                  </div>
                  {modules.map(mod => (
                    <div key={mod} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {moduleIcons[mod]}
                        {mod}
                      </div>
                      <div style={s.permGrid}>
                        {['查看', '预约', '执行', '编辑', '删除', '导出', '审核'].map(act => {
                          const permId = `${mod}-${act}`
                          const active = selectedPerms.has(permId)
                          return (
                            <div
                              key={permId}
                              onClick={() => handleTogglePerm(permId)}
                              style={{
                                ...s.permItem,
                                ...(active ? s.permItemActive : {}),
                              }}
                            >
                              {active ? <CheckCircle size={12} /> : <XCircle size={12} style={{ opacity: 0.4 }} />}
                              <span style={{ fontSize: 12 }}>{act}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}><UserCog size={15} color="#a371f7" /> 用户列表（共{filteredUsers.length}人）</div>
            <button onClick={handleAddUser} style={{ ...s.btn, ...s.btnPrimary, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Plus size={13} />新增用户</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['用户', '科室', '角色', '状态', '最后登录', '操作'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.avatar}>{u.name.slice(0, 1)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#8b949e' }}>{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>{u.dept}</td>
                    <td style={s.td}>{u.role}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: u.status === 'active' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: u.status === 'active' ? '#3fb950' : '#f85149' }}>
                        {u.status === 'active' ? '在职' : '停用'}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#8b949e' }}>{u.lastLogin}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEditUser(u.id)} style={{ ...s.btn, ...s.btnOutline, minHeight: 32, padding: '4px 10px', fontSize: 11 }}><Edit3 size={12} />编辑</button>
                        <button onClick={() => handleDeleteUser(u.id)} style={{ ...s.btn, ...s.btnDanger, minHeight: 32, padding: '4px 10px', fontSize: 11 }}><Trash2 size={12} />删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 权限配置 */}
      {activeTab === 'permissions' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}><Lock size={15} color="#f85149" /> 放射科权限总览</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} color="#3fb950" />已授权
              </span>
              <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={12} color="#8b949e" />未授权
              </span>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {modules.map(mod => (
              <div key={mod} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {moduleIcons[mod]}
                  {mod}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {allPermissions.filter(p => p.module === mod).map(p => {
                    const has = selectedPerms.has(p.id)
                    return (
                      <div key={p.id} style={{ ...s.permItem, minWidth: 90, justifyContent: 'center' }}>
                        {has ? <CheckCircle size={12} color="#3fb950" /> : <XCircle size={12} color="#8b949e" />}
                        <span style={{ fontSize: 12, color: has ? '#3fb950' : '#8b949e' }}>{p.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
