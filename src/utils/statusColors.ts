/**
 * Status Colors System
 * U4: 所有页面引用同一套状态徽章颜色
 * 
 * Usage:
 *   import { STATUS_COLORS, STATUS_LABELS, getStatusColor } from '../utils/statusColors'
 *   
 *   // 直接获取颜色
 *   const color = STATUS_COLORS['已完成']
 *   
 *   // 获取带背景色的样式对象
 *   const style = getStatusStyle('进行中')
 */

export const STATUS_COLORS: Record<string, string> = {
  // 通用状态
  '已完成': '#22c55e',
  '进行中': '#3b82f6',
  '待处理': '#f59e0b',
  '已取消': '#6b7280',
  '已废弃': '#6b7280',
  
  // 设备状态
  '使用中': '#22c55e',
  '空闲': '#3b82f6',
  '维护中': '#f59e0b',
  '维修中': '#ef4444',
  '已报废': '#6b7280',
  '故障': '#ef4444',
  '停用': '#6b7280',
  
  // 报告状态
  '已书写': '#3b82f6',
  '已审核': '#22c55e',
  '已提交': '#3b82f6',
  '已打印': '#60a5fa',
  '急诊': '#ef4444',
  '优先': '#f59e0b',
  
  // 患者状态
  '候诊': '#f59e0b',
  '检查中': '#3b82f6',
  '已完成': '#22c55e',
  '离院': '#6b7280',
  
  // 质控状态
  '合格': '#22c55e',
  '不合格': '#ef4444',
  '待复核': '#f59e0b',
  
  // 预约状态
  '已预约': '#3b82f6',
  '已到诊': '#22c55e',
  '迟到': '#f59e0b',
  '爽约': '#ef4444',
  '取消预约': '#6b7280',
}

// 状态类型分组
export const STATUS_GROUPS = {
  DEVICE: ['使用中', '空闲', '维护中', '维修中', '故障', '停用', '已报废'],
  REPORT: ['已书写', '已审核', '已提交', '已打印', '急诊', '优先'],
  PATIENT: ['候诊', '检查中', '已完成', '离院'],
  APPOINTMENT: ['已预约', '已到诊', '迟到', '爽约', '取消预约'],
  QC: ['合格', '不合格', '待复核'],
  COMMON: ['已完成', '进行中', '待处理', '已取消'],
}

// 通用状态标签
export const STATUS_LABELS: Record<string, string> = {
  '已完成': '已完成',
  '进行中': '进行中',
  '待处理': '待处理',
  '已取消': '已取消',
  '使用中': '使用中',
  '空闲': '空闲',
  '维护中': '维护中',
  '维修中': '维修中',
  '已报废': '已报废',
  '已书写': '已书写',
  '已审核': '已审核',
  '已提交': '已提交',
  '已打印': '已打印',
  '急诊': '急诊',
  '候诊': '候诊',
  '检查中': '检查中',
  '离院': '离院',
}

/**
 * 获取状态对应的颜色
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || '#6b7280'
}

/**
 * 获取状态的背景色（用于徽章）
 */
export function getStatusBgColor(status: string): string {
  const color = getStatusColor(status)
  return `${color}18` // 10% opacity
}

/**
 * 获取状态的完整徽章样式对象
 */
export function getStatusStyle(status: string): { 
  color: string
  backgroundColor: string
  borderColor: string
} {
  const color = getStatusColor(status)
  return {
    color,
    backgroundColor: `${color}18`,
    borderColor: `${color}40`,
  }
}

/**
 * 判断状态是否为"积极"状态
 */
export function isPositiveStatus(status: string): boolean {
  return ['已完成', '已审核', '已到诊', '使用中', '空闲', '合格'].includes(status)
}

/**
 * 判断状态是否为"警告"状态
 */
export function isWarningStatus(status: string): boolean {
  return ['待处理', '维护中', '待复核', '优先', '迟到', '候诊'].includes(status)
}

/**
 * 判断状态是否为"危险"状态
 */
export function isDangerStatus(status: string): boolean {
  return ['维修中', '故障', '急诊', '不合格', '爽约'].includes(status)
}
