export type WidgetSize = 'sm' | 'md' | 'lg'

export interface DashboardWidget {
  id: string
  title: string
  type: string
  size: WidgetSize
  position: number
  visible: boolean
  settings: Record<string, unknown>
}

export interface DashboardConfig {
  userId: string
  layout: 'grid' | 'freeform'
  widgets: DashboardWidget[]
  theme: 'dark' | 'light'
  autoRefreshInterval: number
}

export interface WidgetDefinition {
  type: string
  title: string
  description: string
  defaultSize: WidgetSize
  icon: string
}

export interface IDashboardConfigService {
  getConfig(userId: string): Promise<DashboardConfig>
  saveConfig(userId: string, config: DashboardConfig): Promise<boolean>
  getAvailableWidgets(): Promise<WidgetDefinition[]>
  resetToDefaults(userId: string): Promise<DashboardConfig>
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w1', title: '今日概览', type: 'kpi-summary', size: 'lg', position: 0, visible: true, settings: {} },
  { id: 'w2', title: '检查趋势', type: 'workload-trend', size: 'lg', position: 1, visible: true, settings: { days: 14 } },
  { id: 'w3', title: '设备利用率', type: 'modality-utilization', size: 'md', position: 2, visible: true, settings: {} },
  { id: 'w4', title: '高峰时段分析', type: 'peak-hours', size: 'md', position: 3, visible: true, settings: {} },
  { id: 'w5', title: '技师生产力', type: 'operator-productivity', size: 'sm', position: 4, visible: true, settings: {} },
  { id: 'w6', title: '平均周转时间', type: 'turnaround-time', size: 'sm', position: 5, visible: true, settings: {} },
]

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  { type: 'kpi-summary', title: '今日概览', description: '显示关键运营KPI指标', defaultSize: 'lg', icon: 'BarChart3' },
  { type: 'workload-trend', title: '检查趋势', description: '检查量随时间变化趋势', defaultSize: 'lg', icon: 'TrendingUp' },
  { type: 'modality-utilization', title: '设备利用率', description: '各设备类型使用率', defaultSize: 'md', icon: 'Monitor' },
  { type: 'peak-hours', title: '高峰时段分析', description: '每小时检查量分布', defaultSize: 'md', icon: 'Clock' },
  { type: 'operator-productivity', title: '技师生产力', description: '技师工作量排名', defaultSize: 'sm', icon: 'Users' },
  { type: 'turnaround-time', title: '平均周转时间', description: '报告完成时间分布', defaultSize: 'sm', icon: 'Timer' },
  { type: 'device-status', title: '设备状态', description: '设备运行健康状态', defaultSize: 'sm', icon: 'Wrench' },
  { type: 'queue-depth', title: '排队深度', description: '各检查室排队人数', defaultSize: 'sm', icon: 'List' },
  { type: 'quality-metrics', title: '质量指标', description: '报告质量评分', defaultSize: 'md', icon: 'CheckCircle' },
]

const store = new Map<string, DashboardConfig>()

class MockDashboardConfigService implements IDashboardConfigService {
  async getConfig(userId: string): Promise<DashboardConfig> {
    if (store.has(userId)) return store.get(userId)!
    const config: DashboardConfig = {
      userId,
      layout: 'grid',
      widgets: DEFAULT_WIDGETS.map(w => ({ ...w, id: `${w.id}-${userId}` })),
      theme: 'dark',
      autoRefreshInterval: 60,
    }
    store.set(userId, config)
    return config
  }

  async saveConfig(userId: string, config: DashboardConfig): Promise<boolean> {
    store.set(userId, config)
    return true
  }

  async getAvailableWidgets(): Promise<WidgetDefinition[]> {
    return AVAILABLE_WIDGETS
  }

  async resetToDefaults(userId: string): Promise<DashboardConfig> {
    const config: DashboardConfig = {
      userId,
      layout: 'grid',
      widgets: DEFAULT_WIDGETS.map(w => ({ ...w, id: `${w.id}-${userId}` })),
      theme: 'dark',
      autoRefreshInterval: 60,
    }
    store.set(userId, config)
    return config
  }
}

let _instance: IDashboardConfigService | null = null

export function getDashboardConfigService(): IDashboardConfigService {
  if (!_instance) _instance = new MockDashboardConfigService()
  return _instance
}
