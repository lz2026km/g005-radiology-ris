import { useState } from 'react'
import { UserManagement, type UserAccount } from '../components/v3/admin/UserManagement'
import { generateId } from '../data/simulationStore'
import { PermissionGate } from '../components/common/PermissionGate'

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', username: 'admin', name: '系统管理员', role: 'ADMIN', department: '信息科', email: 'admin@hospital.com', active: true, twoFactor: true, failedLogins: 0, createdAt: '2024-01-01', lastLoginAt: '2026-06-15 08:30' },
  { id: 'u2', username: 'zhang', name: '张主任', role: 'DIRECTOR', department: '放射科', email: 'zhang@hospital.com', active: true, twoFactor: true, failedLogins: 0, createdAt: '2024-01-15', lastLoginAt: '2026-06-15 09:00' },
  { id: 'u3', username: 'li', name: '李医生', role: 'DOCTOR', department: '放射科', active: true, twoFactor: false, failedLogins: 0, createdAt: '2024-02-01', lastLoginAt: '2026-06-14 14:00' },
  { id: 'u4', username: 'wang', name: '王技师', role: 'TECHNICIAN', department: '放射科', active: true, twoFactor: false, failedLogins: 2, createdAt: '2024-02-15' },
  { id: 'u5', username: 'zhao', name: '赵护士', role: 'NURSE', department: '放射科', active: true, twoFactor: false, failedLogins: 0, createdAt: '2024-03-01' },
  { id: 'u6', username: 'sun', name: '孙登记员', role: 'REGISTRAR', department: '放射科', active: true, twoFactor: false, failedLogins: 0, createdAt: '2024-03-15' },
  { id: 'u7', username: 'auditor', name: '审计员', role: 'AUDITOR', department: '质控科', active: true, twoFactor: false, failedLogins: 0, createdAt: '2024-04-01', lastLoginAt: '2026-06-10 10:00' },
  { id: 'u8', username: 'chen', name: '陈医生', role: 'DOCTOR', department: '放射科', active: false, twoFactor: false, failedLogins: 5, createdAt: '2024-04-15', lastLoginAt: '2026-05-01 09:00' },
]

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS)
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) return <div role="status" data-testid="user-loading" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>加载中...</div>;
  if (error) return <div role="alert" data-testid="user-error" style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (users.length === 0) {
    return (
      <div data-testid="user-empty" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>暂无用户</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>请联系系统管理员开通账号</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a3a5c' }}>用户权限管理</h2>
      </div>
      <PermissionGate
        permission="user.manage"
        fallback={
          <div
            data-testid="user-management-denied"
            style={{
              padding: 24,
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#7f1d1d',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            🔒 您当前角色没有用户管理权限 (user.manage),无法新增/编辑/删除用户。请联系系统管理员。
          </div>
        }
      >
        <UserManagement
          users={users}
          onCreate={(u) => {
            const newUser: UserAccount = {
              ...u,
              id: generateId(),
              createdAt: new Date().toISOString().slice(0, 10),
              failedLogins: 0,
            }
            setUsers((prev) => [...prev, newUser])
          }}
          onUpdate={(id, patch) => {
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
          }}
          onDelete={(id) => {
            setUsers((prev) => prev.filter((u) => u.id !== id))
          }}
          onResetPassword={(id) => {
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, failedLogins: 0 } : u)))
          }}
        />
      </PermissionGate>
    </div>
  )
}
