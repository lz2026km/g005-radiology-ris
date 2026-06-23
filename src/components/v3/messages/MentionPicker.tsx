/**
 * G005 放射RIS系统 v3.0.1 - @ 提及选择器
 * 对标飞利浦 / 联影 / 钉钉风格
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Modal, Input, List, Avatar, Tag, Space, Empty, Button } from 'antd'
import { AtSign, Search, User } from 'lucide-react'

export interface MentionUser {
  id: string
  name: string
  role: string
  department?: string
  online?: boolean
  avatarColor?: string
}

export const SAMPLE_USERS: MentionUser[] = [
  { id: 'u1', name: '李明辉', role: '主任医师', department: '放射科', online: true, avatarColor: '#1e3a5f' },
  { id: 'u2', name: '王芳', role: '副主任医师', department: '放射科', online: true, avatarColor: '#059669' },
  { id: 'u3', name: '张伟', role: '主治医师', department: '放射科', online: false, avatarColor: '#dc2626' },
  { id: 'u4', name: '刘洋', role: '技师', department: 'CT 室', online: true, avatarColor: '#7c3aed' },
  { id: 'u5', name: '陈静', role: '护士', department: '登记处', online: false, avatarColor: '#0891b2' },
  { id: 'u6', name: '周强', role: '主任', department: '影像中心', online: true, avatarColor: '#be185d' },
]

export interface MentionPickerProps {
  open: boolean
  onClose: () => void
  onSelect?: (users: MentionUser[]) => void
  multiple?: boolean
  users?: MentionUser[]
  trigger?: 'modal' | 'inline'
}

export const MentionPicker: React.FC<MentionPickerProps> = ({
  open,
  onClose,
  onSelect,
  multiple = true,
  users = SAMPLE_USERS,
  trigger = 'modal',
}) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<MentionUser[]>([])

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.department ?? '').toLowerCase().includes(q)
    )
  }, [users, search])

  const toggle = useCallback(
    (u: MentionUser) => {
      setSelected((prev) => {
        const exists = prev.find((p) => p.id === u.id)
        if (exists) return prev.filter((p) => p.id !== u.id)
        if (!multiple) return [u]
        return [...prev, u]
      })
    },
    [multiple]
  )

  const handleOk = useCallback(() => {
    onSelect?.(selected)
    setSelected([])
    setSearch('')
    onClose()
  }, [selected, onSelect, onClose])

  const body = (
    <div data-testid="mention-picker">
      <Input
        data-testid="mention-search"
        prefix={<Search size={14} />}
        placeholder="搜索用户 / 角色 / 科室"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        autoFocus
        style={{ marginBottom: 12 }}
      />
      {selected.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Space wrap>
            {selected.map((u) => (
              <Tag
                key={u.id}
                color="blue"
                closable
                onClose={() => toggle(u)}
                data-testid={`mention-selected-${u.id}`}
              >
                @{u.name}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty description="未找到用户" />
      ) : (
        <List
          dataSource={filtered}
          renderItem={(u) => {
            const isSelected = selected.some((s) => s.id === u.id)
            return (
              <List.Item
                key={u.id}
                onClick={() => toggle(u)}
                data-testid={`mention-user-${u.id}`}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : 'transparent',
                  padding: '8px 12px',
                  borderRadius: 6,
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ background: u.avatarColor }}>
                      {u.name.slice(0, 1)}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span>{u.name}</span>
                      <Tag color="default">{u.role}</Tag>
                      {u.online ? (
                        <Tag color="green" style={{ fontSize: 12 }}>在线</Tag>
                      ) : (
                        <Tag style={{ fontSize: 12 }}>离线</Tag>
                      )}
                    </Space>
                  }
                  description={u.department}
                />
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )

  if (trigger === 'inline') return body

  return (
    <Modal
      title={
        <Space>
          <AtSign size={16} />
          <span>选择提及人员</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={`确认 (${selected.length})`}
      cancelText="取消"
      width={520}
    >
      {body}
    </Modal>
  )
}

export default MentionPicker
