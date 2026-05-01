// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - 操作痕迹日志页面 v1.0.0
// 记录所有用户操作行为，支持筛选、统计、时间线视图
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, X, Calendar, Clock, User, Monitor,
  FileText, Edit3, CheckCircle, LogIn, LogOut, Download,
  Settings, ChevronDown, ChevronUp, Eye, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Activity,
  ArrowUpDown, Check, AlertCircle, History, List,
  GitCompare, MonitorSmartphone, Globe, Server
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'
import { initialUsers } from '../data/initialData'

// ============================================================
// 常量定义
// ============================================================
const PRIMARY = '#1e3a5f'
const PRIMARY_LIGHT = '#2c5282'
const ACCENT = '#3182ce'
const SUCCESS = '#059669'
const WARNING = '#d97706'
const DANGER = '#dc2626'
const PURPLE = '#7c3aed'
const GRAY = '#64748b'
const BG = '#f8fafc'
const WHITE = '#ffffff'

const ACTION_TYPES = ['全部', '修改报告', '审核通过', '审核驳回', '登录', '登出', '导出数据', '修改设置']
const MODULES = ['全部', '报告管理', '检查管理', '患者管理', '设备管理', '系统设置', '统计报表', '预约管理']
const PAGE_SIZES = [10, 20, 50, 100]

const ACTION_COLORS: Record<string, string> = {
  '修改报告': '#3b82f6',
  '审核通过': '#059669',
  '审核驳回': '#dc2626',
  '登录': '#8b5cf6',
  '登出': '#6b7280',
  '导出数据': '#f59e0b',
  '修改设置': '#14b8a6',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  '修改报告': <Edit3 size={14} />,
  '审核通过': <CheckCircle size={14} />,
  '审核驳回': <AlertCircle size={14} />,
  '登录': <LogIn size={14} />,
  '登出': <LogOut size={14} />,
  '导出数据': <Download size={14} />,
  '修改设置': <Settings size={14} />,
}

// ============================================================
// 类型定义
// ============================================================
interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  targetId: string
  targetDesc: string
  beforeData?: string
  afterData?: string
  timestamp: string
  ipAddress: string
  device: string
}

interface LogDetailModalProps {
  log: OperationLog | null
  onClose: () => void
}

// ============================================================
// 辅助函数
// ============================================================
function formatDateTime(dt: string): string {
  if (!dt) return '-'
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function formatDate(dt: string): string {
  if (!dt) return '-'
  return dt.slice(0, 10)
}

function formatTime(dt: string): string {
  if (!dt) return '-'
  const d = new Date(dt)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function getRelativeTime(dt: string): string {
  const now = new Date('2026-05-01T18:00:00')
  const d = new Date(dt)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// ============================================================
// 生成模拟操作日志数据（300条）
// ============================================================
function generateMockOperationLogs(): OperationLog[] {
  const users = initialUsers.filter(u => u.role === 'radiologist' || u.role === 'technologist' || u.role === 'admin')
  const actions = ['修改报告', '审核通过', '审核驳回', '登录', '登出', '导出数据', '修改设置']
  const modules = ['报告管理', '检查管理', '患者管理', '设备管理', '系统设置', '统计报表', '预约管理']
  const devices = ['Chrome/120.0', 'Firefox/119.0', 'Edge/120.0', 'Safari/17.0', 'Chrome Mobile/120.0']
  const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.50', '172.16.0.25', '127.0.0.1']
  
  const reportIds = Array.from({ length: 50 }, (_, i) => `RAD-RPT${String(i + 1).padStart(3, '0')}`)
  const patientNames = ['张志刚', '李秀英', '王建国', '赵晓敏', '周玉芬', '孙伟', '吴婷', '郑丽', '钱伟明', '陈丽华']
  const examItems = ['头颅CT平扫', '胸部CT平扫', '腹部CT平扫+增强', '头颅MR平扫', '腰椎MR平扫', '胸部DR正侧位', '冠脉CTA', '乳腺钼靶']

  const logs: OperationLog[] = []
  const baseTime = new Date('2026-05-01T08:00:00')

  for (let i = 0; i < 300; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const module = action === '登录' || action === '登出' ? '系统设置' : modules[Math.floor(Math.random() * modules.length)]
    const hoursOffset = Math.floor(i / 3) + Math.random() * 0.5
    const timestamp = new Date(baseTime.getTime() + hoursOffset * 3600000).toISOString()
    
    let targetDesc = ''
    let targetId = ''
    let beforeData = ''
    let afterData = ''

    if (action === '修改报告') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
      beforeData = `印象：左肺下叶见约1.2cm结节影，边缘毛糙。建议定期随访。\n诊断意见：左肺下叶结节，LU-RADS 3类。`
      afterData = `印象：左肺下叶见约1.3cm结节影，边缘毛糙伴少许索条影。较前片略增大。\n诊断意见：左肺下叶结节，LU-RADS 4A类，建议进一步检查。`
    } else if (action === '审核通过') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
    } else if (action === '审核驳回') {
      targetId = reportIds[Math.floor(Math.random() * reportIds.length)]
      const patientName = patientNames[Math.floor(Math.random() * patientNames.length)]
      const examItem = examItems[Math.floor(Math.random() * examItems.length)]
      targetDesc = `${patientName}的${examItem}报告`
      beforeData = `报告描述不完整，请补充诊断依据。`
    } else if (action === '登录') {
      targetDesc = `${user.name}登录系统`
      targetId = user.id
    } else if (action === '登出') {
      targetDesc = `${user.name}退出系统`
      targetId = user.id
    } else if (action === '导出数据') {
      targetId = `EXPORT-${String(i).padStart(5, '0')}`
      targetDesc = `导出报告统计数据（2026年4月）`
      beforeData = `导出范围：2026-04-01 至 2026-04-30\n导出内容：CT/MR/DR全部报告`
      afterData = `导出文件：report_stats_2026_04.xlsx\n导出记录数：2456条`
    } else if (action === '修改设置') {
      targetId = `SETTINGS-${String(i % 5 + 1).padStart(2, '0')}`
      const settingNames = ['危急值通知规则', '报告审核流程', '预约超时设置', '系统参数配置', '用户权限设置']
      targetDesc = settingNames[i % 5]
      beforeData = `危急值提醒时间间隔：5分钟\n短信通知：开启\n邮件通知：开启`
      afterData = `危急值提醒时间间隔：3分钟\n短信通知：开启\n邮件通知：关闭`
    }

    logs.push({
      id: `LOG${String(i + 1).padStart(6, '0')}`,
      userId: user.id,
      userName: user.name,
      action,
      module,
      targetId,
      targetDesc,
      beforeData,
      afterData,
      timestamp,
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// ============================================================
// 日志详情弹窗组件
// ============================================================
function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  if (!log) return null

  const renderDiff = () => {
    if (!log.beforeData && !log.afterData) {
      return <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>无数据对比</div>
    }

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 8, fontSize: 13 }}>数据对比：</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#fef2f2', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: DANGER, borderBottom: '1px solid #fecaca' }}>
              修改前
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fef2f2', color: '#991b1b', lineHeight: 1.6 }}>
              {log.beforeData || '(空)'}
            </pre>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#ecfdf5', padding: '8px 12px', fontWeight: 600, fontSize: 12, color: SUCCESS, borderBottom: '1px solid #a7f3d0' }}>
              修改后
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#ecfdf5', color: '#065f46', lineHeight: 1.6 }}>
              {log.afterData || '(空)'}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: WHITE, borderRadius: 12, width: '90%', maxWidth: 800,
        maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{
          background: PRIMARY, padding: '16px 20px', borderRadius: '12px 12px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={20} color={WHITE} />
            <span style={{ color: WHITE, fontSize: 16, fontWeight: 600 }}>操作日志详情</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
            padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <X size={18} color={WHITE} />
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: 20 }}>
          {/* 操作基本信息 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>日志ID</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.id}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作时间</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{formatDateTime(log.timestamp)}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作类型</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                  color: ACTION_COLORS[log.action] || ACCENT,
                  padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                }}>
                  {log.action}
                </span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作用户</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.userName}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>用户ID</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.userId}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ color: GRAY, fontSize: 11, marginBottom: 4 }}>操作模块</div>
              <div style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>{log.module}</div>
            </div>
          </div>

          {/* 目标信息 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 10, fontSize: 13 }}>操作目标</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <div style={{ color: GRAY, fontSize: 11, marginBottom: 2 }}>目标ID</div>
                <div style={{ color: PRIMARY, fontSize: 13 }}>{log.targetId}</div>
              </div>
              <div>
                <div style={{ color: GRAY, fontSize: 11, marginBottom: 2 }}>目标描述</div>
                <div style={{ color: PRIMARY, fontSize: 13 }}>{log.targetDesc}</div>
              </div>
            </div>
          </div>

          {/* 环境信息 */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 10, fontSize: 13 }}>环境信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={14} color={GRAY} />
                <div>
                  <div style={{ color: GRAY, fontSize: 11 }}>IP地址</div>
                  <div style={{ color: PRIMARY, fontSize: 13 }}>{log.ipAddress}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MonitorSmartphone size={14} color={GRAY} />
                <div>
                  <div style={{ color: GRAY, fontSize: 11 }}>设备</div>
                  <div style={{ color: PRIMARY, fontSize: 13 }}>{log.device}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 数据对比 */}
          {renderDiff()}
        </div>

        {/* 底部 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: WHITE, color: GRAY, fontSize: 13, cursor: 'pointer',
          }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 统计图表组件
// ============================================================
function StatisticsCharts({ logs }: { logs: OperationLog[] }) {
  // 操作类型分布
  const actionStats = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: ACTION_COLORS[name] || ACCENT,
    }))
  }, [logs])

  // 用户操作量统计
  const userStats = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach(log => {
      counts[log.userName] = (counts[log.userName] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [logs])

  // 操作时段分布（小时）
  const hourStats = useMemo(() => {
    const counts: number[] = new Array(24).fill(0)
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours()
      counts[hour]++
    })
    return counts.map((value, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      value,
    }))
  }, [logs])

  // 操作高峰时段热力图数据
  const heatmapData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const data: { day: string; hour: number; value: number }[] = []
    days.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        // 模拟工作日高峰
        let value = Math.floor(Math.random() * 20)
        if (hour >= 8 && hour <= 17 && dayIndex < 5) {
          value = Math.floor(Math.random() * 40) + 20
        } else if (hour >= 9 && hour <= 11 && dayIndex < 5) {
          value = Math.floor(Math.random() * 50) + 40
        }
        data.push({ day, hour, value })
      }
    })
    return data
  }, [])

  const getHeatColor = (value: number) => {
    if (value < 10) return '#f0f9ff'
    if (value < 20) return '#bae6fd'
    if (value < 30) return '#38bdf8'
    if (value < 40) return '#0ea5e9'
    if (value < 50) return '#0284c7'
    return '#0369a1'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* 操作类型饼图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <PieChartIcon size={16} />
          操作类型分布
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={actionStats}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            >
              {actionStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 用户操作量柱状图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={16} />
          用户操作量 TOP10
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={userStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 操作时段柱状图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={16} />
          24小时操作趋势
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={hourStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value}次`, '操作次数']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="value" fill={PRIMARY_LIGHT} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 操作高峰时段热力图 */}
      <div style={{ background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, color: PRIMARY, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} />
          操作高峰时段热力图
        </div>
        <div style={{ overflow: 'auto' }}>
          <div style={{ display: 'flex', marginLeft: 50, marginBottom: 4 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ width: 20, fontSize: 9, color: GRAY, textAlign: 'center' }}>
                {i % 4 === 0 ? `${i}` : ''}
              </div>
            ))}
          </div>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, dayIndex) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ width: 45, fontSize: 10, color: GRAY }}>{day}</div>
              <div style={{ display: 'flex', gap: 1 }}>
                {heatmapData.filter(d => d.day === day).map((item) => (
                  <div
                    key={item.hour}
                    style={{
                      width: 18,
                      height: 14,
                      background: getHeatColor(item.value),
                      borderRadius: 2,
                    }}
                    title={`${day} ${item.hour}:00 - ${item.value}次操作`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: GRAY }}>低</span>
          {[5, 15, 25, 35, 45, 55].map((val) => (
            <div key={val} style={{ width: 14, height: 14, background: getHeatColor(val), borderRadius: 2 }} />
          ))}
          <span style={{ fontSize: 10, color: GRAY }}>高</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 时间线视图组件
// ============================================================
function TimelineView({ logs, onViewDetail }: { logs: OperationLog[], onViewDetail: (log: OperationLog) => void }) {
  // 按日期分组
  const groupedLogs = useMemo(() => {
    const groups: Record<string, OperationLog[]> = {}
    logs.forEach(log => {
      const date = formatDate(log.timestamp)
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    })
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  }, [logs])

  return (
    <div style={{ position: 'relative' }}>
      {/* 时间线 */}
      {groupedLogs.map(([date, dayLogs], groupIndex) => (
        <div key={date} style={{ marginBottom: 24 }}>
          {/* 日期标签 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginLeft: 40 }}>
            <div style={{
              background: PRIMARY, color: WHITE, padding: '4px 12px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, boxShadow: '0 2px 6px rgba(30,58,95,0.3)',
            }}>
              {date}
            </div>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0', marginLeft: 12 }} />
          </div>

          {/* 日期内的日志 */}
          <div style={{ marginLeft: 40 }}>
            {dayLogs.map((log, index) => {
              const isLast = index === dayLogs.length - 1
              return (
                <div key={log.id} style={{ display: 'flex', position: 'relative', paddingBottom: isLast ? 0 : 16 }}>
                  {/* 时间线竖线 */}
                  <div style={{
                    position: 'absolute', left: -32, top: 8,
                    width: 12, height: 12, borderRadius: '50%',
                    background: ACTION_COLORS[log.action] || ACCENT,
                    border: '2px solid #e2e8f0', boxShadow: '0 0 0 3px #e2e8f0',
                    zIndex: 1,
                  }} />
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: -27, top: 20,
                      width: 2, height: 'calc(100% - 12px)',
                      background: '#e2e8f0',
                    }} />
                  )}

                  {/* 日志卡片 */}
                  <div style={{
                    flex: 1, background: WHITE, border: '1px solid #e2e8f0',
                    borderRadius: 10, padding: 14, marginLeft: 16,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = ACCENT
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                    onClick={() => onViewDetail(log)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                          color: ACTION_COLORS[log.action] || ACCENT,
                          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {ACTION_ICONS[log.action]}
                          {log.action}
                        </span>
                        <span style={{ fontSize: 12, color: GRAY }}>{log.module}</span>
                      </div>
                      <span style={{ fontSize: 11, color: GRAY }}>{formatTime(log.timestamp)}</span>
                    </div>

                    <div style={{ fontSize: 13, color: PRIMARY, marginBottom: 6 }}>
                      {log.targetDesc}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, color: GRAY, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} />
                          {log.userName}
                        </span>
                        <span style={{ fontSize: 11, color: GRAY, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Monitor size={11} />
                          {log.ipAddress}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: ACCENT, display: 'flex', alignItems: 'center', gap: 2 }}>
                        查看详情 <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// 主页面组件
// ============================================================
export default function OperationLogPage() {
  const allLogs = useMemo(() => generateMockOperationLogs(), [])

  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table')
  const [searchText, setSearchText] = useState('')
  const [actionFilter, setActionFilter] = useState('全部')
  const [moduleFilter, setModuleFilter] = useState('全部')
  const [userFilter, setUserFilter] = useState('全部')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null)
  const [showStats, setShowStats] = useState(true)

  // 筛选后的日志
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (searchText) {
        const search = searchText.toLowerCase()
        if (
          !log.userName.toLowerCase().includes(search) &&
          !log.targetDesc.toLowerCase().includes(search) &&
          !log.targetId.toLowerCase().includes(search) &&
          !log.id.toLowerCase().includes(search)
        ) {
          return false
        }
      }
      if (actionFilter !== '全部' && log.action !== actionFilter) return false
      if (moduleFilter !== '全部' && log.module !== moduleFilter) return false
      if (userFilter !== '全部' && log.userName !== userFilter) return false
      if (dateFrom && log.timestamp < dateFrom) return false
      if (dateTo && log.timestamp > dateTo + 'T23:59:59') return false
      return true
    })
  }, [allLogs, searchText, actionFilter, moduleFilter, userFilter, dateFrom, dateTo])

  // 分页
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const totalPages = Math.ceil(filteredLogs.length / pageSize)

  // 重置页码
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  // 获取所有用户名
  const allUserNames = useMemo(() => {
    const names = new Set(allLogs.map(l => l.userName))
    return ['全部', ...Array.from(names)]
  }, [allLogs])

  // 筛选器样式
  const filterBtnStyle = (active: boolean) => ({
    padding: '5px 12px', borderRadius: 6, border: `1px solid ${active ? ACCENT : '#e2e8f0'}`,
    background: active ? `${ACCENT}15` : WHITE, color: active ? ACCENT : GRAY,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  })

  const inputStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, outline: 'none', width: '100%',
  }

  const selectStyle = {
    padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: WHITE, color: PRIMARY, fontSize: 12, cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* 顶部导航 */}
      <div style={{
        background: WHITE, borderBottom: '1px solid #e2e8f0', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <History size={24} color={PRIMARY} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: PRIMARY }}>操作痕迹日志</div>
            <div style={{ fontSize: 11, color: GRAY }}>Operation Logs - 共 {filteredLogs.length} 条记录</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              ...filterBtnStyle(showStats),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <BarChart3 size={14} />
            {showStats ? '隐藏' : '显示'}统计
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              ...filterBtnStyle(viewMode === 'table'),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <List size={14} />
            列表视图
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            style={{
              ...filterBtnStyle(viewMode === 'timeline'),
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Clock size={14} />
            时间线视图
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* 筛选栏 */}
        <div style={{
          background: WHITE, borderRadius: 10, padding: 16, border: '1px solid #e2e8f0',
          marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {/* 搜索框 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{
              flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', background: '#fafbfc',
            }}>
              <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input
                value={searchText}
                onChange={e => { setSearchText(e.target.value); handleFilterChange() }}
                placeholder="搜索用户 / 目标 / 日志ID..."
                style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%', background: 'transparent' }}
              />
              {searchText && (
                <button onClick={() => setSearchText('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} color={GRAY} />
                </button>
              )}
            </div>
          </div>

          {/* 筛选器 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 操作类型 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>操作类型:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {ACTION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setActionFilter(type); handleFilterChange() }}
                    style={filterBtnStyle(actionFilter === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 模块 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>模块:</span>
              <select
                value={moduleFilter}
                onChange={e => { setModuleFilter(e.target.value); handleFilterChange() }}
                style={selectStyle}
              >
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* 用户 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>用户:</span>
              <select
                value={userFilter}
                onChange={e => { setUserFilter(e.target.value); handleFilterChange() }}
                style={selectStyle}
              >
                {allUserNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            {/* 日期范围 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>日期:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); handleFilterChange() }}
                style={inputStyle}
              />
              <span style={{ color: GRAY }}>-</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); handleFilterChange() }}
                style={inputStyle}
              />
            </div>

            {/* 重置 */}
            <button
              onClick={() => {
                setSearchText('')
                setActionFilter('全部')
                setModuleFilter('全部')
                setUserFilter('全部')
                setDateFrom('')
                setDateTo('')
                setCurrentPage(1)
              }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                background: WHITE, color: GRAY, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <RefreshCw size={12} />
              重置筛选
            </button>
          </div>
        </div>

        {/* 统计图表 */}
        {showStats && (
          <div style={{ marginBottom: 16 }}>
            <StatisticsCharts logs={filteredLogs} />
          </div>
        )}

        {/* 日志列表/时间线 */}
        <div style={{
          background: WHITE, borderRadius: 10, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {viewMode === 'table' ? (
            <>
              {/* 表格头部 */}
              <div style={{
                display: 'grid', gridTemplateColumns: '160px 100px 90px 100px 1fr 120px 100px',
                padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                fontSize: 12, fontWeight: 600, color: GRAY,
              }}>
                <div>时间</div>
                <div>用户</div>
                <div>操作类型</div>
                <div>模块</div>
                <div>操作详情</div>
                <div>IP地址</div>
                <div style={{ textAlign: 'center' }}>操作</div>
              </div>

              {/* 表格内容 */}
              {paginatedLogs.map(log => (
                <div
                  key={log.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '160px 100px 90px 100px 1fr 120px 100px',
                    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                    fontSize: 12, alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: PRIMARY, fontWeight: 500 }}>
                    <div>{formatDate(log.timestamp)}</div>
                    <div style={{ color: GRAY, fontSize: 11 }}>{formatTime(log.timestamp)}</div>
                  </div>
                  <div style={{ color: PRIMARY }}>{log.userName}</div>
                  <div>
                    <span style={{
                      background: `${ACTION_COLORS[log.action] || ACCENT}20`,
                      color: ACTION_COLORS[log.action] || ACCENT,
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    }}>
                      {log.action}
                    </span>
                  </div>
                  <div style={{ color: GRAY }}>{log.module}</div>
                  <div style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.targetDesc}>
                    {log.targetDesc}
                  </div>
                  <div style={{ color: GRAY }}>{log.ipAddress}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      style={{
                        padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0',
                        background: WHITE, color: ACCENT, fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <Eye size={12} />
                      详情
                    </button>
                  </div>
                </div>
              ))}

              {/* 分页 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderTop: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 12, color: GRAY }}>
                  显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} 条，共 {filteredLogs.length} 条
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: GRAY }}>每页</span>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }}
                    >
                      {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={{ fontSize: 12, color: GRAY }}>条</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                        background: WHITE, color: currentPage === 1 ? '#cbd5e1' : PRIMARY,
                        fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                        background: WHITE, color: currentPage === totalPages ? '#cbd5e1' : PRIMARY,
                        fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      下一页
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: GRAY }}>
                    第 {currentPage} / {totalPages} 页
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* 时间线视图 */
            <div style={{ padding: 20 }}>
              <TimelineView logs={paginatedLogs} onViewDetail={setSelectedLog} />
              
              {/* 分页 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderTop: '1px solid #e2e8f0', marginTop: 16,
              }}>
                <div style={{ fontSize: 12, color: GRAY }}>
                  显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} 条，共 {filteredLogs.length} 条
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                      background: WHITE, color: currentPage === 1 ? '#cbd5e1' : PRIMARY,
                      fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0',
                      background: WHITE, color: currentPage === totalPages ? '#cbd5e1' : PRIMARY,
                      fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 日志详情弹窗 */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
