// @ts-nocheck
// ============================================================
// G005 放射科RIS - 排队叫号系统 v2.0.0
// 放射科CT/MR/DR/DSA/乳腺检查排队叫号 - 蓝网科技风格
// 扩展分诊管理功能：候诊队列管理、分诊规则配置、叫号增强、分诊统计
// ============================================================
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Monitor, Clock, CheckCircle, User, Volume2, VolumeX,
  RefreshCw, SkipForward, AlertCircle, Radio, ChevronRight,
  Phone, Users, Timer, Volume1, X, Plus, Settings,
  List, Activity, Bell, Wifi, WifiOff, Pause, Play,
  ArrowUp, ArrowDown, Trash2, Eye, EyeOff, Mic, MicOff,
  Building2, Stethoscope, Calendar, TrendingUp, Clock3,
  AlertTriangle, ChevronUp, ChevronDown, GripVertical,
  Search, Filter, Download, Printer, MoreHorizontal,
  ChevronLeft, ChevronsRight, Bed,
  FlaskConical, FileText, Zap, Signal, BarChart3,
  GitBranch, Target, Layers, ArrowRightLeft,
  History, Star, FastForward, Volume, VolumeOff,
  BarChart2, PieChart, TrendingDown, Gauge,
  Shield, ShieldAlert, ShieldCheck, Ambulance,
  UserCheck, UserPlus, Clock4, CalendarDays,
  AlertOctagon, SortAsc, FilterIcon,
  PieChartIcon, LineChart, LayoutGrid, Save, RotateCcw
} from 'lucide-react'
import { initialRadiologyExams, initialExamRooms, initialModalityDevices } from '../data/initialData'

// ============================================================
// 类型定义
// ============================================================

// 患者类型枚举
type PatientType = '急诊' | '住院' | '门诊' | '体检'

// 队列候诊等级
type QueueLevel = '一级候诊' | '二级候诊' | '已完成'

interface QueueItem {
  id: string
  queueNum: string
  patientId: string
  patientName: string
  gender: string
  age: number
  modality: string
  examItemName: string
  examRoom: string
  roomId: string
  status: '等待中' | '已呼叫' | '检查中' | '已完成' | '跳过'
  registerTime: string
  waitMinutes: number
  priority: '普通' | '紧急' | '危重'
  examTime: string
  // 扩展字段
  patientType: PatientType  // 患者类型：急诊/住院/门诊/体检
  queueLevel: QueueLevel   // 候诊等级：一级候诊/二级候诊
  appointmentTime?: string // 预约时段
  calledCount: number      // 被叫次数
  lastCalledTime?: string  // 最后呼叫时间
}

interface ExamRoomState {
  id: string
  name: string
  roomNumber: string
  modality: string[]
  deviceName: string
  status: '空闲' | '使用中' | '暂停' | '维护中'
  currentPatient: string | null
  currentQueueNum: string | null
  completedToday: number
  waitCount: number
  doctorName: string
  doctorTitle: string
}

// ============================================================
// 扩展类型定义 - 分诊管理
// ============================================================

// 叫号历史记录
interface CallHistoryItem {
  id: string
  queueNum: string
  patientName: string
  modality: string
  examRoom: string
  callTime: string
  callType: '叫号' | '重呼' | '跳号' | '优先' | '完成'
  operator: string
  waitMinutes: number
}

// 分诊规则配置
interface TriageRule {
  id: string
  name: string
  enabled: boolean
  priority: PatientType[]  // 优先级顺序
  maxWaitMinutes: number   // 最大等待时间(分钟)
  autoPriority: boolean    // 是否自动提升优先级
}

// 预约时段
interface AppointmentSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  booked: number
  modality: string
  enabled: boolean
}

// 排队规则设置
interface QueueRule {
  id: string
  ruleName: string
  ruleType: 'modality' | 'room' | 'priority' | 'time'
  value: string
  weight: number
  enabled: boolean
}

// 分诊统计数据
interface TriageStats {
  avgWaitMinutes: number           // 平均等待时间
  completionRate: number           // 检查完成率
  peakHour: string                // 高峰时段
  totalCompleted: number           // 今日完成总数
  totalCalled: number             // 今日呼叫总数
  avgExamDuration: number         // 平均检查时长
  waitDistribution: {             // 等待时长分布
    range0to15: number
    range15to30: number
    range30to60: number
    range60plus: number
  }
  hourlyStats: {                 // 每小时统计
    hour: string
    completed: number
    called: number
    avgWait: number
  }[]
  modalityStats: {               // 按检查类型统计
    modality: string
    completed: number
    waiting: number
    avgWait: number
  }[]
}

// 检查类型分组
interface ModalityGroup {
  id: string
  name: string
  modality: string
  color: string
  icon: string
  order: number
}

// ============================================================
// 样式字典
// ============================================================
const PRIMARY = '#1e3a5f'
const PRIMARY_LIGHT = '#2d4a6f'
const PRIMARY_DARK = '#152a45'
const ACCENT_BLUE = '#3b82f6'
const ACCENT_GREEN = '#22c55e'
const ACCENT_YELLOW = '#f59e0b'
const ACCENT_RED = '#ef4444'
const ACCENT_PURPLE = '#8b5cf6'
const ACCENT_PINK = '#ec4899'

const s: Record<string, React.CSSProperties> = {
  // 根容器
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
  },

  // 顶部导航
  topNav: {
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(30, 58, 95, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
  },
  navLogoIcon: {
    width: 36,
    height: 36,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1,
  },
  navSubtitle: {
    fontSize: 11,
    opacity: 0.7,
    letterSpacing: 0.5,
  },

  // 标签切换
  tabContainer: {
    display: 'flex',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tab: {
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    background: '#fff',
    color: PRIMARY,
  },
  tabInactive: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.8)',
  },

  // 右侧工具栏
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  timeDisplay: {
    color: '#fff',
    textAlign: 'right' as const,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: '"Roboto Mono", monospace',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 11,
    opacity: 0.7,
  },
  navBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: '8px 14px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },

  // 主内容区
  mainContent: {
    display: 'flex',
    gap: 0,
    minHeight: 'calc(100vh - 64px)',
  },

  // 左侧叫号大屏 (70%)
  callScreen: {
    flex: '0 0 70%',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  // 右侧管理面板 (30%)
  adminPanel: {
    flex: '0 0 30%',
    background: '#fff',
    borderLeft: '1px solid #e2e8f0',
    padding: 20,
    overflowY: 'auto' as const,
    maxHeight: 'calc(100vh - 64px)',
  },

  // ===== 叫号大屏样式 =====
  callMainBanner: {
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 50%, #0f1f35 100%)`,
    borderRadius: 20,
    padding: '40px 48px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(30, 58, 95, 0.4)',
  },
  callBannerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundImage: `radial-gradient(circle at 20% 50%, ${ACCENT_BLUE} 0%, transparent 50%),
                      radial-gradient(circle at 80% 50%, ${ACCENT_PURPLE} 0%, transparent 50%)`,
  },
  callBannerContent: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center' as const,
  },
  callLabel: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  callNumber: {
    fontSize: 160,
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: 16,
    textShadow: '0 4px 30px rgba(0,0,0,0.3)',
    letterSpacing: -4,
    fontFamily: '"Roboto", "Arial Black", sans-serif',
  },
  callPatientName: {
    fontSize: 56,
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: 8,
  },
  callInfo: {
    fontSize: 24,
    opacity: 0.9,
    marginBottom: 8,
  },
  callRoom: {
    fontSize: 20,
    opacity: 0.7,
    marginBottom: 24,
  },
  callWaitHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: '10px 24px',
    fontSize: 16,
    fontWeight: 600,
  },
  callCorner: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  callCornerTopRight: {
    top: 20,
    right: 24,
  },
  callCornerBottomLeft: {
    bottom: 20,
    left: 24,
  },
  callCornerBottomRight: {
    bottom: 20,
    right: 24,
  },
  callEmptyState: {
    textAlign: 'center' as const,
    padding: '80px 40px',
  },
  callEmptyIcon: {
    width: 120,
    height: 120,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  callEmptyText: {
    fontSize: 28,
    opacity: 0.6,
    marginBottom: 8,
  },
  callEmptySubtext: {
    fontSize: 16,
    opacity: 0.4,
  },

  // 次显示区（下一位、再下一位）
  callSecondaryRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  callSecondaryCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  callSecondaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  callSecondaryNum: {
    fontSize: 36,
    fontWeight: 800,
    color: PRIMARY,
    marginBottom: 4,
  },
  callSecondaryName: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
  },
  callSecondaryInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },

  // 候诊队列列表
  queueListPanel: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  queueListHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueListTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: PRIMARY,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  queueListCount: {
    background: PRIMARY,
    color: '#fff',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  queueScroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 0',
    maxHeight: 280,
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    gap: 12,
    borderBottom: '1px solid #f8fafc',
    transition: 'background 0.15s ease',
    cursor: 'pointer',
  },
  queueItemHover: {
    background: '#f8fafc',
  },
  queueNum: {
    fontSize: 14,
    fontWeight: 800,
    color: PRIMARY,
    width: 70,
  },
  queueName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    flex: 1,
  },
  queueModality: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 6,
    fontWeight: 600,
  },
  queueTime: {
    fontSize: 12,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  // 设备状态栏
  deviceStatusBar: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    padding: 20,
  },
  deviceStatusTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  },
  deviceCard: {
    background: '#f8fafc',
    borderRadius: 12,
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deviceCardActive: {
    background: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  deviceCardPaused: {
    background: '#fefce8',
    borderColor: '#fef08a',
  },
  deviceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 13,
    fontWeight: 700,
    color: PRIMARY,
  },
  deviceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 10,
  },
  deviceDoctor: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  devicePatient: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 500,
  },

  // ===== 后台管理面板样式 =====
  adminSection: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  adminSectionHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fafbfc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: PRIMARY,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  adminSectionBody: {
    padding: 18,
  },

  // 叫号控制面板
  callControlPanel: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  controlRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    padding: 18,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    color: '#1e293b',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box' as const,
  },
  btnGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 4,
  },
  btnCall: {
    background: `linear-gradient(135deg, ${ACCENT_GREEN} 0%, #16a34a 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  btnRecall: {
    background: `linear-gradient(135deg, ${ACCENT_BLUE} 0%, #1d4ed8 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  btnFinish: {
    background: `linear-gradient(135deg, ${ACCENT_PURPLE} 0%, #7c3aed 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  btnNext: {
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
  },
  btnSkip: {
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    borderBottom: '2px solid #f1f5f9',
    background: '#fafbfc',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 12px',
    fontSize: 13,
    borderBottom: '1px solid #f8fafc',
    color: '#475569',
    verticalAlign: 'middle' as const,
  },
  trHover: {
    background: '#f8fafc',
    cursor: 'pointer',
  },

  // 状态标签
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
  },

  // 小卡片
  miniStatCard: {
    background: '#f8fafc',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #e2e8f0',
  },
  miniStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: 800,
    color: PRIMARY,
    lineHeight: 1,
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },

  // 统计网格
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },

  // 操作按钮（小）
  actionBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    padding: '5px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  actionBtnCall: {
    color: ACCENT_GREEN,
    background: '#f0fdf4',
  },
  actionBtnSkip: {
    color: ACCENT_YELLOW,
    background: '#fefce8',
  },
  actionBtnRemove: {
    color: ACCENT_RED,
    background: '#fef2f2',
  },
  actionBtnMove: {
    color: ACCENT_BLUE,
    background: '#eff6ff',
  },

  // 拖拽手柄
  dragHandle: {
    color: '#cbd5e1',
    cursor: 'grab',
    padding: '0 4px',
  },

  // 模态框遮罩
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    padding: 32,
    maxWidth: 500,
    width: '90%',
    boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  // ============================================================
  // 分诊管理扩展样式
  // ============================================================

  // 新增Tab样式
  tabContainerNew: {
    display: 'flex',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },

  // 三级Tab样式（管理页内部）
  subTabContainer: {
    display: 'flex',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: 20,
  },
  subTab: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  subTabActive: {
    color: PRIMARY,
    borderBottomColor: PRIMARY,
  },

  // 统计卡片大样式
  statCardLarge: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  statCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: 800,
    color: PRIMARY,
    lineHeight: 1,
    marginBottom: 4,
  },
  statCardSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statCardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    marginTop: 8,
  },
  statCardTrendUp: {
    color: ACCENT_GREEN,
  },
  statCardTrendDown: {
    color: ACCENT_RED,
  },

  // 图表容器
  chartContainer: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  // 历史记录表格
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    gap: 12,
    transition: 'background 0.15s ease',
  },
  historyItemHover: {
    background: '#f8fafc',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyMain: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 2,
  },
  historySub: {
    fontSize: 12,
    color: '#64748b',
  },
  historyTime: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right' as const,
  },

  // 规则配置卡片
  ruleCard: {
    background: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    border: '1px solid #e2e8f0',
    marginBottom: 12,
  },
  ruleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: 700,
    color: PRIMARY,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  ruleDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  rulePriorityList: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  rulePriorityTag: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },

  // 时段配置
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 10,
  },
  slotCard: {
    background: '#f8fafc',
    borderRadius: 10,
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: 700,
    color: PRIMARY,
    marginBottom: 4,
  },
  slotInfo: {
    fontSize: 11,
    color: '#64748b',
  },
  slotEnabled: {
    background: '#dcfce7',
    borderColor: '#bbf7d0',
  },

  // 候诊等级标签
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  levelBadge1: {
    background: '#dbeafe',
    color: '#1d4ed8',
  },
  levelBadge2: {
    background: '#fef3c7',
    color: '#d97706',
  },
  levelBadgeDone: {
    background: '#dcfce7',
    color: '#16a34a',
  },

  // 患者类型标签
  patientTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  patientTypeEmergency: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  patientTypeInpatient: {
    background: '#dbeafe',
    color: '#1d4ed8',
  },
  patientTypeOutpatient: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  patientTypeCheckup: {
    background: '#f3e8ff',
    color: '#7c3aed',
  },

  // 进度条
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: '#e2e8f0',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },

  // 模拟语音提示框
  voiceToast: {
    position: 'fixed',
    bottom: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
    color: '#fff',
    padding: '16px 32px',
    borderRadius: 50,
    fontSize: 18,
    fontWeight: 700,
    boxShadow: '0 10px 40px rgba(30, 58, 95, 0.4)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    animation: 'voiceToastAnim 2s ease-in-out',
  },

  // 优先呼叫模态框
  priorityModalContent: {
    background: '#fff',
    borderRadius: 20,
    padding: 32,
    maxWidth: 450,
    width: '90%',
    boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
  },
  priorityOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  priorityOptionSelected: {
    borderColor: PRIMARY,
    background: '#f0f9ff',
  },
  priorityIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 2,
  },
  priorityDesc: {
    fontSize: 12,
    color: '#64748b',
  },

  // 分布条形图
  barChart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  barChartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  barChartLabel: {
    width: 80,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right' as const,
  },
  barChartBar: {
    flex: 1,
    height: 24,
    background: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  barChartFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.5s ease',
  },
  barChartValue: {
    width: 50,
    fontSize: 12,
    fontWeight: 600,
    color: PRIMARY,
  },

  // 时段热力图
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: 4,
  },
  heatmapCell: {
    aspectRatio: '1',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
  },

  // 配置开关
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    background: '#e2e8f0',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 0.2s ease',
    border: 'none',
    padding: 0,
  },
  toggleEnabled: {
    background: ACCENT_GREEN,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    left: 2,
    transition: 'left 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  toggleKnobEnabled: {
    left: 22,
  },

  // 刷新动画
  refreshSpin: {
    animation: 'spin 1s linear infinite',
  },
}

// ============================================================
// 辅助函数
// ============================================================
const modalityColors: Record<string, string> = {
  CT: '#3b82f6',
  MR: '#8b5cf6',
  DR: '#22c55e',
  DSA: '#f59e0b',
  '乳腺钼靶': '#ec4899',
  '胃肠造影': '#06b6d4',
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  '等待中': { bg: '#fef3c7', color: '#d97706', label: '等待中' },
  '已呼叫': { bg: '#dbeafe', color: '#1d4ed8', label: '已呼叫' },
  '检查中': { bg: '#dcfce7', color: '#16a34a', label: '检查中' },
  '已完成': { bg: '#f1f5f9', color: '#64748b', label: '已完成' },
  '跳过': { bg: '#fee2e2', color: '#dc2626', label: '跳过' },
}

const roomStatusColors: Record<string, { bg: string; color: string }> = {
  '空闲': { bg: '#dcfce7', color: '#16a34a' },
  '使用中': { bg: '#dbeafe', color: '#1d4ed8' },
  '暂停': { bg: '#fef3c7', color: '#d97706' },
  '维护中': { bg: '#fee2e2', color: '#dc2626' },
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}小时${m > 0 ? m + '分钟' : ''}`
}

function generateQueueNum(modality: string, index: number): string {
  const prefix = modality.slice(0, 2)
  return `${prefix}${(1000 + index).toString().slice(1)}`
}

function hidePatientName(name: string): string {
  if (name.length <= 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

// ============================================================
// 扩展辅助函数 - 分诊管理
// ============================================================

// 患者类型颜色映射
const patientTypeColors: Record<PatientType, { bg: string; color: string }> = {
  '急诊': { bg: '#fee2e2', color: '#dc2626' },
  '住院': { bg: '#dbeafe', color: '#1d4ed8' },
  '门诊': { bg: '#dcfce7', color: '#16a34a' },
  '体检': { bg: '#f3e8ff', color: '#7c3aed' },
}

// 候诊等级颜色映射
const queueLevelColors: Record<QueueLevel, { bg: string; color: string }> = {
  '一级候诊': { bg: '#dbeafe', color: '#1d4ed8' },
  '二级候诊': { bg: '#fef3c7', color: '#d97706' },
  '已完成': { bg: '#dcfce7', color: '#16a34a' },
}

// 呼叫类型颜色映射
const callTypeColors: Record<string, { bg: string; color: string }> = {
  '叫号': { bg: '#dbeafe', color: '#1d4ed8' },
  '重呼': { bg: '#fef3c7', color: '#d97706' },
  '跳号': { bg: '#f3e8ff', color: '#7c3aed' },
  '优先': { bg: '#fee2e2', color: '#dc2626' },
  '完成': { bg: '#dcfce7', color: '#16a34a' },
}

// 获取患者类型优先级（数字越小优先级越高）
function getPatientTypePriority(type: PatientType): number {
  const priorityMap: Record<PatientType, number> = {
    '急诊': 1,
    '住院': 2,
    '门诊': 3,
    '体检': 4,
  }
  return priorityMap[type]
}

// 排序候诊队列（按患者类型优先级）
function sortQueueByPriority(queue: QueueItem[]): QueueItem[] {
  return [...queue].sort((a, b) => {
    // 首先按患者类型排序
    const priorityDiff = getPatientTypePriority(a.patientType) - getPatientTypePriority(b.patientType)
    if (priorityDiff !== 0) return priorityDiff
    // 然后按等待时间排序
    return b.waitMinutes - a.waitMinutes
  })
}

// 模拟语音播报
function speakText(text: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }
}

// 生成随机ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// ============================================================
// 数据初始化
// ============================================================

// 患者类型数组
const patientTypes: PatientType[] = ['急诊', '住院', '门诊', '体检']

function initializeQueue(): QueueItem[] {
  const exams = initialRadiologyExams.slice(0, 12)
  return exams.map((e, i) => {
    const registerDate = new Date()
    registerDate.setMinutes(registerDate.getMinutes() - Math.floor(Math.random() * 45 + 5))
    // 随机分配患者类型
    const patientType = patientTypes[Math.floor(Math.random() * patientTypes.length)]
    // 一级候诊：登记后等待；二级候诊：已叫号等待检查
    const queueLevel: QueueLevel = i < 2 ? '二级候诊' : '一级候诊'

    return {
      id: e.id,
      queueNum: generateQueueNum(e.modality, i),
      patientId: e.patientId,
      patientName: e.patientName,
      gender: e.gender,
      age: e.age,
      modality: e.modality,
      examItemName: e.examItemName,
      examRoom: e.roomName,
      roomId: e.roomId,
      status: i === 0 ? '检查中' : i === 1 ? '已呼叫' : '等待中',
      registerTime: registerDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: Math.floor(Math.random() * 30) + 5,
      priority: e.priority as '普通' | '紧急' | '危重',
      examTime: e.examTime,
      // 扩展字段
      patientType: patientType,
      queueLevel: queueLevel,
      appointmentTime: `${8 + Math.floor(i / 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      calledCount: i === 1 ? 1 : 0,
      lastCalledTime: i === 1 ? new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : undefined,
    }
  })
}

function initializeExamRooms(): ExamRoomState[] {
  return initialExamRooms.slice(0, 7).map((r, i) => {
    const doctors = [
      { name: '李明辉', title: '主任医师' },
      { name: '王秀峰', title: '副主任医师' },
      { name: '张海涛', title: '主治医师' },
      { name: '刘芳', title: '主治医师' },
      { name: '赵东', title: '技师' },
      { name: '钱伟', title: '技师' },
      { name: '孙杰', title: '主管技师' },
    ]
    const statuses: ('空闲' | '使用中' | '暂停' | '维护中')[] = ['使用中', '使用中', '空闲', '空闲', '暂停', '维护中', '空闲']
    return {
      id: r.id,
      name: r.name,
      roomNumber: r.roomNumber,
      modality: r.modality,
      deviceName: r.deviceName.split('（')[0],
      status: statuses[i % statuses.length],
      currentPatient: statuses[i % statuses.length] === '使用中' ? initialRadiologyExams[i]?.patientName || '张志刚' : null,
      currentQueueNum: statuses[i % statuses.length] === '使用中' ? generateQueueNum(r.modality[0], i) : null,
      completedToday: Math.floor(Math.random() * 30 + 10),
      waitCount: Math.floor(Math.random() * 8),
      doctorName: doctors[i % doctors.length].name,
      doctorTitle: doctors[i % doctors.length].title,
    }
  })
}

// ============================================================
// 音频播放Hook
// ============================================================
function useAudioCall() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playCallSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.15)
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3)
      oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.45)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.log('Audio play failed:', e)
    }
  }, [])

  return { playCallSound }
}

// ============================================================
// 主组件
// ============================================================
export default function QueueCallPage() {
  // ===== 状态 =====
  const [activeTab, setActiveTab] = useState<'大屏' | '管理'>('大屏')
  const [adminSubTab, setAdminSubTab] = useState<'队列' | '规则' | '统计' | '历史'>('队列')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [queue, setQueue] = useState<QueueItem[]>(() => initializeQueue())
  const [examRooms, setExamRooms] = useState<ExamRoomState[]>(() => initializeExamRooms())
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null)
  const [hoveredQueueItem, setHoveredQueueItem] = useState<string | null>(null)
  const [queueListHovered, setQueueListHovered] = useState<string | null>(null)

  // ============================================================
  // 分诊管理扩展状态
  // ============================================================

  // 叫号历史记录
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    // 初始化一些模拟历史数据
    const history: CallHistoryItem[] = [
      { id: '1', queueNum: 'CT001', patientName: '张志刚', modality: 'CT', examRoom: 'CT室1', callTime: '08:30', callType: '叫号', operator: '系统', waitMinutes: 15 },
      { id: '2', queueNum: 'MR002', patientName: '李秀英', modality: 'MR', examRoom: 'MR室1', callTime: '08:35', callType: '完成', operator: '系统', waitMinutes: 22 },
      { id: '3', queueNum: 'DR003', patientName: '王建国', modality: 'DR', examRoom: 'DR室1', callTime: '08:40', callType: '重呼', operator: '系统', waitMinutes: 8 },
      { id: '4', queueNum: 'CT004', patientName: '刘芳', modality: 'CT', examRoom: 'CT室2', callTime: '08:45', callType: '跳号', operator: '张三', waitMinutes: 35 },
      { id: '5', queueNum: 'MR005', patientName: '陈东', modality: 'MR', examRoom: 'MR室2', callTime: '08:50', callType: '优先', operator: '李四', waitMinutes: 5 },
      { id: '6', queueNum: 'DR006', patientName: '赵敏', modality: 'DR', examRoom: 'DR室2', callTime: '08:55', callType: '叫号', operator: '系统', waitMinutes: 12 },
      { id: '7', queueNum: 'CT007', patientName: '孙伟', modality: 'CT', examRoom: 'CT室1', callTime: '09:00', callType: '完成', operator: '系统', waitMinutes: 18 },
    ]
    return history
  })

  // 分诊规则配置
  const [triageRules, setTriageRules] = useState<TriageRule[]>([
    { id: '1', name: '患者类型优先级', enabled: true, priority: ['急诊', '住院', '门诊', '体检'], maxWaitMinutes: 60, autoPriority: true },
    { id: '2', name: '检查类型分组', enabled: true, priority: ['急诊', '住院', '门诊', '体检'], maxWaitMinutes: 45, autoPriority: false },
    { id: '3', name: '预约时段管理', enabled: false, priority: ['急诊', '住院', '门诊', '体检'], maxWaitMinutes: 30, autoPriority: true },
    { id: '4', name: '自动平衡各检查室', enabled: true, priority: ['急诊', '住院', '门诊', '体检'], maxWaitMinutes: 90, autoPriority: false },
  ])

  // 预约时段配置
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([
    { id: '1', startTime: '08:00', endTime: '09:00', capacity: 20, booked: 15, modality: 'CT', enabled: true },
    { id: '2', startTime: '09:00', endTime: '10:00', capacity: 20, booked: 18, modality: 'CT', enabled: true },
    { id: '3', startTime: '10:00', endTime: '11:00', capacity: 20, booked: 12, modality: 'CT', enabled: true },
    { id: '4', startTime: '11:00', endTime: '12:00', capacity: 20, booked: 8, modality: 'CT', enabled: true },
    { id: '5', startTime: '14:00', endTime: '15:00', capacity: 20, booked: 16, modality: 'CT', enabled: true },
    { id: '6', startTime: '15:00', endTime: '16:00', capacity: 20, booked: 14, modality: 'CT', enabled: true },
    { id: '7', startTime: '16:00', endTime: '17:00', capacity: 20, booked: 10, modality: 'CT', enabled: true },
    { id: '8', startTime: '17:00', endTime: '18:00', capacity: 20, booked: 5, modality: 'CT', enabled: false },
  ])

  // 排队规则设置
  const [queueRules, setQueueRules] = useState<QueueRule[]>([
    { id: '1', ruleName: 'CT优先规则', ruleType: 'modality', value: 'CT', weight: 1.2, enabled: true },
    { id: '2', ruleName: '急诊优先规则', ruleType: 'priority', value: '急诊', weight: 2.0, enabled: true },
    { id: '3', ruleName: 'CT室1专用规则', ruleType: 'room', value: 'CT室1', weight: 1.0, enabled: false },
    { id: '4', ruleName: '高峰时段规则', ruleType: 'time', value: '09:00-11:00', weight: 1.5, enabled: true },
  ])

  // 语音提示显示状态
  const [showVoiceToast, setShowVoiceToast] = useState(false)
  const [voiceToastText, setVoiceToastText] = useState('')

  // 优先呼叫模态框
  const [showPriorityModal, setShowPriorityModal] = useState(false)
  const [priorityPatient, setPriorityPatient] = useState<QueueItem | null>(null)

  // 模拟分诊统计数据
  const [triageStats] = useState<TriageStats>({
    avgWaitMinutes: 18,
    completionRate: 76.5,
    peakHour: '09:00-10:00',
    totalCompleted: 127,
    totalCalled: 168,
    avgExamDuration: 25,
    waitDistribution: {
      range0to15: 45,
      range15to30: 38,
      range30to60: 25,
      range60plus: 12,
    },
    hourlyStats: [
      { hour: '08:00', completed: 8, called: 12, avgWait: 12 },
      { hour: '09:00', completed: 15, called: 20, avgWait: 18 },
      { hour: '10:00', completed: 18, called: 22, avgWait: 22 },
      { hour: '11:00', completed: 16, called: 18, avgWait: 25 },
      { hour: '12:00', completed: 5, called: 8, avgWait: 15 },
      { hour: '14:00', completed: 12, called: 16, avgWait: 20 },
      { hour: '15:00', completed: 20, called: 25, avgWait: 18 },
      { hour: '16:00', completed: 18, called: 22, avgWait: 16 },
      { hour: '17:00', completed: 15, called: 18, avgWait: 14 },
      { hour: '18:00', completed: 5, called: 7, avgWait: 10 },
    ],
    modalityStats: [
      { modality: 'CT', completed: 45, waiting: 8, avgWait: 20 },
      { modality: 'MR', completed: 32, waiting: 5, avgWait: 25 },
      { modality: 'DR', completed: 38, waiting: 6, avgWait: 15 },
      { modality: 'DSA', completed: 8, waiting: 2, avgWait: 30 },
      { modality: '乳腺钼靶', completed: 4, waiting: 1, avgWait: 18 },
    ],
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const { playCallSound } = useAudioCall()

  // ===== 定时器 =====
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ===== 派生数据 =====
  const waitingQueue = queue.filter(q => q.status === '等待中')
  const calledPatient = queue.find(q => q.status === '已呼叫')
  const examingPatient = queue.find(q => q.status === '检查中')
  const completedToday = queue.filter(q => q.status === '已完成')

  const currentCalled = calledPatient || examingPatient

  const nextPatient = waitingQueue[0] || null
  const secondNextPatient = waitingQueue[1] || null

  const totalWaitMinutes = waitingQueue.reduce((sum, q) => sum + q.waitMinutes, 0)
  const avgWaitMinutes = waitingQueue.length > 0 ? Math.round(totalWaitMinutes / waitingQueue.length) : 0

  const onlineRooms = examRooms.filter(r => r.status !== '维护中' && r.status !== '暂停').length
  const activeRooms = examRooms.filter(r => r.status === '使用中').length

  // ============================================================
  // 分诊管理扩展派生数据
  // ============================================================

  // 按候诊等级分类
  const levelOneQueue = queue.filter(q => q.queueLevel === '一级候诊' && q.status !== '已完成')
  const levelTwoQueue = queue.filter(q => q.queueLevel === '二级候诊' && q.status !== '已完成')

  // 按患者类型分类
  const emergencyQueue = queue.filter(q => q.patientType === '急诊' && q.status === '等待中')
  const inpatientQueue = queue.filter(q => q.patientType === '住院' && q.status === '等待中')
  const outpatientQueue = queue.filter(q => q.patientType === '门诊' && q.status === '等待中')
  const checkupQueue = queue.filter(q => q.patientType === '体检' && q.status === '等待中')

  // 按检查类型分组
  const ctQueue = queue.filter(q => q.modality === 'CT' && q.status === '等待中')
  const mrQueue = queue.filter(q => q.modality === 'MR' && q.status === '等待中')
  const drQueue = queue.filter(q => q.modality === 'DR' && q.status === '等待中')

  // 优先队列（急诊和住院）
  const priorityQueue = queue.filter(q =>
    (q.patientType === '急诊' || q.patientType === '住院') &&
    q.status === '等待中'
  )

  // 今日队列统计
  const todayStats = useMemo(() => ({
    total: queue.length,
    waiting: waitingQueue.length,
    called: calledPatient ? 1 : 0,
    examing: examingPatient ? 1 : 0,
    completed: completedToday.length,
    levelOne: levelOneQueue.length,
    levelTwo: levelTwoQueue.length,
    emergency: emergencyQueue.length,
    inpatient: inpatientQueue.length,
    outpatient: outpatientQueue.length,
    checkup: checkupQueue.length,
  }), [queue, waitingQueue, calledPatient, examingPatient, completedToday, levelOneQueue, levelTwoQueue, emergencyQueue, inpatientQueue, outpatientQueue, checkupQueue])

  // ============================================================
  // 操作函数
  // ============================================================

  // 叫号
  const handleCall = useCallback((patientId?: string) => {
    const targetId = patientId || selectedPatient
    if (!targetId) return

    const patient = queue.find(q => q.id === targetId && q.status === '等待中')
    if (!patient) return

    // 播放声音
    if (soundEnabled) {
      playCallSound()
    }

    setQueue(prev => prev.map(q => {
      if (q.status === '已呼叫') return { ...q, status: '等待中' }
      if (q.id === targetId) return { ...q, status: '已呼叫' }
      return q
    }))

    // 更新检查室状态
    setExamRooms(prev => prev.map(r => {
      if (r.id === patient.roomId) {
        return {
          ...r,
          status: '使用中' as const,
          currentPatient: patient.patientName,
          currentQueueNum: patient.queueNum,
          waitCount: r.waitCount > 0 ? r.waitCount - 1 : 0,
        }
      }
      return r
    }))

    setSelectedPatient('')
  }, [queue, selectedPatient, soundEnabled, playCallSound])

  // 重呼
  const handleRecall = useCallback(() => {
    if (!currentCalled) return
    if (soundEnabled) {
      playCallSound()
    }
  }, [currentCalled, soundEnabled, playCallSound])

  // 完成检查
  const handleFinish = useCallback(() => {
    if (!currentCalled && !examingPatient) return

    const patient = currentCalled || examingPatient
    if (!patient) return

    setQueue(prev => prev.map(q => {
      if (q.id === patient.id) return { ...q, status: '已完成' }
      return q
    }))

    setExamRooms(prev => prev.map(r => {
      if (r.id === patient.roomId) {
        return {
          ...r,
          status: '空闲' as const,
          currentPatient: null,
          currentQueueNum: null,
          completedToday: r.completedToday + 1,
        }
      }
      return r
    }))
  }, [currentCalled, examingPatient])

  // 下一位
  const handleNext = useCallback(() => {
    if (waitingQueue.length === 0) return

    // 如果当前有被呼叫的患者，将其设为跳过
    if (currentCalled) {
      setQueue(prev => prev.map(q => {
        if (q.id === currentCalled.id) return { ...q, status: '跳过' }
        return q
      }))
    }

    // 叫下一位
    const next = waitingQueue[0]
    if (soundEnabled) {
      playCallSound()
    }

    setQueue(prev => prev.map(q => {
      if (q.id === next.id) return { ...q, status: '已呼叫' }
      return q
    }))

    // 更新检查室
    setExamRooms(prev => prev.map(r => {
      if (r.id === next.roomId) {
        return {
          ...r,
          status: '使用中' as const,
          currentPatient: next.patientName,
          currentQueueNum: next.queueNum,
          waitCount: r.waitCount > 0 ? r.waitCount - 1 : 0,
        }
      }
      return r
    }))
  }, [waitingQueue, currentCalled, soundEnabled, playCallSound])

  // 跳过
  const handleSkip = useCallback((patientId: string) => {
    const patient = queue.find(q => q.id === patientId && q.status === '等待中')
    if (!patient) return

    setQueue(prev => prev.map(q => {
      if (q.id === patientId) return { ...q, status: '跳过' }
      return q
    }))

    setExamRooms(prev => prev.map(r => {
      if (r.id === patient.roomId) {
        return {
          ...r,
          waitCount: r.waitCount > 0 ? r.waitCount - 1 : 0,
        }
      }
      return r
    }))
  }, [queue])

  // 移除
  const handleRemove = useCallback((patientId: string) => {
    setQueue(prev => prev.filter(q => q.id !== patientId))
  }, [])

  // 转到（重新呼叫）
  const handleReCall = useCallback((patientId: string) => {
    const patient = queue.find(q => q.id === patientId)
    if (!patient) return

    if (soundEnabled) {
      playCallSound()
    }

    setQueue(prev => prev.map(q => {
      if (q.id === patientId) return { ...q, status: '已呼叫' }
      if (q.status === '已呼叫') return { ...q, status: '等待中' }
      return q
    }))
  }, [queue, soundEnabled, playCallSound])

  // 切换检查室状态
  const toggleRoomStatus = useCallback((roomId: string) => {
    setExamRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r

      const statusCycle: Record<string, '空闲' | '使用中' | '暂停' | '维护中'> = {
        '空闲': '使用中',
        '使用中': '暂停',
        '暂停': '空闲',
        '维护中': '空闲',
      }

      const newStatus = statusCycle[r.status] || '空闲'

      return {
        ...r,
        status: newStatus,
        currentPatient: newStatus === '空闲' || newStatus === '维护中' ? null : r.currentPatient,
        currentQueueNum: newStatus === '空闲' || newStatus === '维护中' ? null : r.currentQueueNum,
      }
    }))
  }, [])

  // 拖拽排序
  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    setQueue(prev => {
      const draggedIdx = prev.findIndex(q => q.id === draggedItem)
      const targetIdx = prev.findIndex(q => q.id === targetId)

      if (draggedIdx === -1 || targetIdx === -1) return prev

      const newQueue = [...prev]
      const [dragged] = newQueue.splice(draggedIdx, 1)
      newQueue.splice(targetIdx, 0, dragged)

      return newQueue
    })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  // 刷新数据
  const handleRefresh = () => {
    setQueue(initializeQueue())
    setExamRooms(initializeExamRooms())
    setCurrentTime(new Date())
  }

  // ============================================================
  // 分诊管理扩展操作函数
  // ============================================================

  // 添加到叫号历史
  const addToCallHistory = useCallback((
    patient: QueueItem,
    callType: '叫号' | '重呼' | '跳号' | '优先' | '完成',
    operator: string = '系统'
  ) => {
    const historyItem: CallHistoryItem = {
      id: generateId(),
      queueNum: patient.queueNum,
      patientName: patient.patientName,
      modality: patient.modality,
      examRoom: patient.examRoom,
      callTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      callType,
      operator,
      waitMinutes: patient.waitMinutes,
    }
    setCallHistory(prev => [historyItem, ...prev.slice(0, 49)]) // 保留最近50条
  }, [])

  // 显示语音提示
  const displayVoiceToast = useCallback((text: string) => {
    setVoiceToastText(text)
    setShowVoiceToast(true)
    setTimeout(() => setShowVoiceToast(false), 2500)
  }, [])

  // 优先呼叫处理
  const handlePriorityCall = useCallback((patient: QueueItem) => {
    if (soundEnabled) {
      playCallSound()
    }

    // 语音播报（模拟）
    if (voiceEnabled) {
      speakText(`${patient.patientName}，请到${patient.examRoom}进行检查，您是优先患者`)
      displayVoiceToast(`优先患者：${patient.patientName}`)
    }

    setQueue(prev => prev.map(q => {
      if (q.status === '已呼叫') return { ...q, status: '等待中' }
      if (q.id === patient.id) return { ...q, status: '已呼叫', calledCount: q.calledCount + 1, lastCalledTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
      return q
    }))

    addToCallHistory(patient, '优先', '系统')
    setShowPriorityModal(false)
    setPriorityPatient(null)
  }, [soundEnabled, voiceEnabled, playCallSound, addToCallHistory, displayVoiceToast])

  // 跳号处理
  const handleJump = useCallback((patientId: string) => {
    const patient = queue.find(q => q.id === patientId && q.status === '等待中')
    if (!patient) return

    setQueue(prev => prev.map(q => {
      if (q.id === patientId) return { ...q, status: '跳过' }
      return q
    }))

    addToCallHistory(patient, '跳号', '系统')
  }, [queue, addToCallHistory])

  // 恢复跳过的患者
  const handleRestore = useCallback((patientId: string) => {
    setQueue(prev => prev.map(q => {
      if (q.id === patientId && q.status === '跳过') return { ...q, status: '等待中' }
      return q
    }))
  }, [])

  // 切换分诊规则
  const toggleTriageRule = useCallback((ruleId: string) => {
    setTriageRules(prev => prev.map(r => {
      if (r.id === ruleId) return { ...r, enabled: !r.enabled }
      return r
    }))
  }, [])

  // 切换排队规则
  const toggleQueueRule = useCallback((ruleId: string) => {
    setQueueRules(prev => prev.map(r => {
      if (r.id === ruleId) return { ...r, enabled: !r.enabled }
      return r
    }))
  }, [])

  // 切换预约时段
  const toggleSlot = useCallback((slotId: string) => {
    setAppointmentSlots(prev => prev.map(s => {
      if (s.id === slotId) return { ...s, enabled: !s.enabled }
      return s
    }))
  }, [])

  // 获取等待人数
  const getWaitCountAhead = (patientId: string): number => {
    const idx = waitingQueue.findIndex(q => q.id === patientId)
    return idx
  }

  // 搜索患者
  const filteredQueue = searchTerm
    ? queue.filter(q =>
        q.patientName.includes(searchTerm) ||
        q.queueNum.includes(searchTerm) ||
        q.modality.includes(searchTerm)
      )
    : queue.filter(q => q.status !== '已完成')

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div style={s.root}>
      {/* ========== 顶部导航 ========== */}
      <nav style={s.topNav}>
        <div style={s.navLeft}>
          {/* Logo */}
          <div style={s.navLogo}>
            <div style={s.navLogoIcon}>
              <Activity size={22} color="#fff" />
            </div>
            <div>
              <div style={s.navTitle}>排队叫号系统</div>
              <div style={s.navSubtitle}>汉东省人民医院 · 放射科</div>
            </div>
          </div>

          {/* 标签切换 */}
          <div style={s.tabContainer}>
            <button
              style={{
                ...s.tab,
                ...(activeTab === '大屏' ? s.tabActive : s.tabInactive),
              }}
              onClick={() => setActiveTab('大屏')}
            >
              <Monitor size={16} />
              叫号大屏
            </button>
            <button
              style={{
                ...s.tab,
                ...(activeTab === '分诊' ? s.tabActive : s.tabInactive),
              }}
              onClick={() => setActiveTab('分诊')}
            >
              <Stethoscope size={16} />
              分诊管理
            </button>
            <button
              style={{
                ...s.tab,
                ...(activeTab === '管理' ? s.tabActive : s.tabInactive),
              }}
              onClick={() => setActiveTab('管理')}
            >
              <Settings size={16} />
              后台管理
            </button>
          </div>
        </div>

        <div style={s.navRight}>
          {/* 时间显示 */}
          <div style={s.timeDisplay}>
            <div style={s.timeValue}>{formatTime(currentTime)}</div>
            <div style={s.dateValue}>{formatDate(currentTime)}</div>
          </div>

          {/* 声音开关 */}
          <button
            style={s.navBtn}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? '关闭声音' : '开启声音'}
          >
            {soundEnabled ? <Volume1 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* 语音开关 */}
          <button
            style={s.navBtn}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? '关闭语音播报' : '开启语音播报'}
          >
            {voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          {/* 刷新 */}
          <button style={s.navBtn} onClick={handleRefresh} title="刷新数据">
            <RefreshCw size={16} />
          </button>
        </div>
      </nav>

      {/* ========== 主内容区 ========== */}
      <div style={s.mainContent}>
        {/* ========== 左侧叫号大屏 (70%) ========== */}
        {activeTab === '大屏' && (
          <div style={s.callScreen}>
            {/* 主叫号显示区 */}
            <div style={s.callMainBanner}>
              <div style={s.callBannerBg} />

              {currentCalled ? (
                <div style={s.callBannerContent}>
                  <div style={s.callLabel}>正在呼叫 · NOW CALLING</div>
                  <div style={s.callNumber}>{currentCalled.queueNum}</div>
                  <div style={s.callPatientName}>{currentCalled.patientName}</div>
                  <div style={s.callInfo}>
                    {currentCalled.modality} · {currentCalled.examItemName}
                  </div>
                  <div style={s.callRoom}>
                    请到 {currentCalled.examRoom} 检查
                  </div>
                  <div style={s.callWaitHint}>
                    <Users size={18} />
                    前方等待 {getWaitCountAhead(currentCalled.id)} 人
                  </div>
                  <div style={{ ...s.callCorner, ...s.callCornerTopRight } as React.CSSProperties}>
                    <Signal size={14} />
                    检查室 {currentCalled.examRoom}
                  </div>
                  <div style={{ ...s.callCorner, ...s.callCornerBottomLeft } as React.CSSProperties}>
                    <Clock size={14} />
                    呼叫时间 {new Date().toLocaleTimeString('zh-CN')}
                  </div>
                  <div style={{ ...s.callCorner, ...s.callCornerBottomRight } as React.CSSProperties}>
                    <Stethoscope size={14} />
                    {currentCalled.gender} · {currentCalled.age}岁
                  </div>
                </div>
              ) : examingPatient ? (
                <div style={s.callBannerContent}>
                  <div style={s.callLabel}>正在检查 · EXAMINING</div>
                  <div style={s.callNumber}>{examingPatient.queueNum}</div>
                  <div style={s.callPatientName}>{examingPatient.patientName}</div>
                  <div style={s.callInfo}>
                    {examingPatient.modality} · {examingPatient.examItemName}
                  </div>
                  <div style={s.callRoom}>
                    {examingPatient.examRoom} 检查中
                  </div>
                  <div style={s.callWaitHint}>
                    <Activity size={18} />
                    检查进行中，请稍候
                  </div>
                </div>
              ) : (
                <div style={s.callEmptyState}>
                  <div style={s.callEmptyIcon}>
                    <VolumeX size={48} color="rgba(255,255,255,0.5)" />
                  </div>
                  <div style={s.callEmptyText}>暂无候诊患者</div>
                  <div style={s.callEmptySubtext}>请在后台管理中添加患者</div>
                </div>
              )}
            </div>

            {/* 次显示区：下一位、再下一位 */}
            <div style={s.callSecondaryRow}>
              {nextPatient ? (
                <div style={s.callSecondaryCard}>
                  <div style={s.callSecondaryLabel}>
                    <ChevronRight size={14} />
                    下一位 NEXT
                  </div>
                  <div style={s.callSecondaryNum}>{nextPatient.queueNum}</div>
                  <div style={s.callSecondaryName}>{nextPatient.patientName}</div>
                  <div style={s.callSecondaryInfo}>
                    {nextPatient.modality} · {nextPatient.examItemName} · {nextPatient.examRoom}
                  </div>
                </div>
              ) : (
                <div style={s.callSecondaryCard}>
                  <div style={s.callSecondaryLabel}>
                    <ChevronRight size={14} />
                    下一位 NEXT
                  </div>
                  <div style={{ ...s.callSecondaryNum, opacity: 0.3 }}>----</div>
                  <div style={{ ...s.callSecondaryName, opacity: 0.3 }}>暂无候诊</div>
                </div>
              )}

              {secondNextPatient ? (
                <div style={s.callSecondaryCard}>
                  <div style={s.callSecondaryLabel}>
                    <ChevronsRight size={14} />
                    再下一位
                  </div>
                  <div style={s.callSecondaryNum}>{secondNextPatient.queueNum}</div>
                  <div style={s.callSecondaryName}>{secondNextPatient.patientName}</div>
                  <div style={s.callSecondaryInfo}>
                    {secondNextPatient.modality} · {secondNextPatient.examItemName} · {secondNextPatient.examRoom}
                  </div>
                </div>
              ) : (
                <div style={s.callSecondaryCard}>
                  <div style={s.callSecondaryLabel}>
                    <ChevronsRight size={14} />
                    再下一位
                  </div>
                  <div style={{ ...s.callSecondaryNum, opacity: 0.3 }}>----</div>
                  <div style={{ ...s.callSecondaryName, opacity: 0.3 }}>暂无候诊</div>
                </div>
              )}
            </div>

            {/* 候诊队列列表 */}
            <div style={s.queueListPanel}>
              <div style={s.queueListHeader}>
                <div style={s.queueListTitle}>
                  <List size={18} color={PRIMARY} />
                  候诊队列
                </div>
                <div style={s.queueListCount}>{waitingQueue.length}人</div>
              </div>
              <div style={s.queueScroll}>
                {waitingQueue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                    <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div>暂无候诊患者</div>
                  </div>
                ) : (
                  waitingQueue.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        ...s.queueItem,
                        ...(queueListHovered === q.id ? { background: '#f1f5f9' } : {}),
                      }}
                      onMouseEnter={() => setQueueListHovered(q.id)}
                      onMouseLeave={() => setQueueListHovered(null)}
                    >
                      <div style={{ ...s.queueNum, color: modalityColors[q.modality] || PRIMARY }}>
                        {q.queueNum}
                      </div>
                      <div style={s.queueName}>{hidePatientName(q.patientName)}</div>
                      <div style={{
                        ...s.queueModality,
                        background: (modalityColors[q.modality] || '#64748b') + '15',
                        color: modalityColors[q.modality] || '#64748b',
                      }}>
                        {q.modality}
                      </div>
                      <div style={s.queueTime}>
                        <Clock size={12} />
                        {q.registerTime}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: q.priority === '危重' ? ACCENT_RED : q.priority === '紧急' ? ACCENT_YELLOW : '#94a3b8',
                        fontWeight: q.priority === '危重' || q.priority === '紧急' ? 700 : 400,
                      }}>
                        {q.priority === '危重' ? '危重' : q.priority === '紧急' ? '紧急' : '普通'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        第{idx + 1}位
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 设备状态栏 */}
            <div style={s.deviceStatusBar}>
              <div style={s.deviceStatusTitle}>
                <Bed size={18} color={PRIMARY} />
                检查室状态
                <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b', marginLeft: 8 }}>
                  点击可切换状态
                </span>
              </div>
              <div style={s.deviceGrid}>
                {examRooms.map(room => {
                  const statusColor = roomStatusColors[room.status]
                  const isHovered = hoveredDevice === room.id
                  return (
                    <div
                      key={room.id}
                      style={{
                        ...s.deviceCard,
                        ...(room.status === '使用中' ? s.deviceCardActive : {}),
                        ...(room.status === '暂停' ? s.deviceCardPaused : {}),
                        ...(isHovered ? { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } : {}),
                      }}
                      onMouseEnter={() => setHoveredDevice(room.id)}
                      onMouseLeave={() => setHoveredDevice(null)}
                      onClick={() => toggleRoomStatus(room.id)}
                    >
                      <div style={s.deviceHeader}>
                        <div style={s.deviceName}>{room.name}</div>
                        <div style={{
                          ...s.deviceStatus,
                          background: statusColor.bg,
                          color: statusColor.color,
                        }}>
                          {room.status === '空闲' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor.color }} />}
                          {room.status}
                        </div>
                      </div>
                      <div style={s.deviceDoctor}>
                        {room.doctorName} · {room.doctorTitle}
                      </div>
                      {room.currentPatient ? (
                        <div style={s.devicePatient}>
                          当前: {room.currentPatient} ({room.currentQueueNum})
                        </div>
                      ) : (
                        <div style={{ ...s.devicePatient, color: '#94a3b8' }}>
                          空闲中
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>今日完成: {room.completedToday}</span>
                        <span>等待: {room.waitCount}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========== 分诊管理面板 (70%) ========== */}
        {activeTab === '分诊' && (
          <div style={s.callScreen}>
            {/* 子Tab导航 */}
            <div style={s.subTabContainer}>
              <button
                style={{
                  ...s.subTab,
                  ...(adminSubTab === '队列' ? s.subTabActive : {}),
                }}
                onClick={() => setAdminSubTab('队列')}
              >
                <Users size={16} />
                候诊队列
              </button>
              <button
                style={{
                  ...s.subTab,
                  ...(adminSubTab === '规则' ? s.subTabActive : {}),
                }}
                onClick={() => setAdminSubTab('规则')}
              >
                <GitBranch size={16} />
                分诊规则
              </button>
              <button
                style={{
                  ...s.subTab,
                  ...(adminSubTab === '统计' ? s.subTabActive : {}),
                }}
                onClick={() => setAdminSubTab('统计')}
              >
                <BarChart3 size={16} />
                分诊统计
              </button>
              <button
                style={{
                  ...s.subTab,
                  ...(adminSubTab === '历史' ? s.subTabActive : {}),
                }}
                onClick={() => setAdminSubTab('历史')}
              >
                <History size={16} />
                叫号历史
              </button>
            </div>

            {/* 候诊队列子Tab */}
            {adminSubTab === '队列' && (
              <>
                {/* 今日队列统计概览 */}
                <div style={s.statsGrid}>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#dbeafe' }}>
                      <Users size={18} color={ACCENT_BLUE} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{todayStats.levelOne}</div>
                      <div style={s.miniStatLabel}>一级候诊</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#fef3c7' }}>
                      <Clock4 size={18} color={ACCENT_YELLOW} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{todayStats.levelTwo}</div>
                      <div style={s.miniStatLabel}>二级候诊</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#fee2e2' }}>
                      <Ambulance size={18} color={ACCENT_RED} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{todayStats.emergency}</div>
                      <div style={s.miniStatLabel}>急诊患者</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#dcfce7' }}>
                      <CheckCircle size={18} color={ACCENT_GREEN} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{todayStats.completed}</div>
                      <div style={s.miniStatLabel}>今日完成</div>
                    </div>
                  </div>
                </div>

                {/* 患者类型分布 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <PieChart size={18} color={PRIMARY} />
                      患者类型分布
                    </div>
                  </div>
                  <div style={s.adminSectionBody}>
                    <div style={s.statsGrid}>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${patientTypeColors['急诊'].color}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: patientTypeColors['急诊'].color }}>{emergencyQueue.length}</div>
                          <div style={s.miniStatLabel}>急诊患者</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${patientTypeColors['住院'].color}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: patientTypeColors['住院'].color }}>{inpatientQueue.length}</div>
                          <div style={s.miniStatLabel}>住院患者</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${patientTypeColors['门诊'].color}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: patientTypeColors['门诊'].color }}>{outpatientQueue.length}</div>
                          <div style={s.miniStatLabel}>门诊患者</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${patientTypeColors['体检'].color}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: patientTypeColors['体检'].color }}>{checkupQueue.length}</div>
                          <div style={s.miniStatLabel}>体检患者</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 候诊等级分类列表 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <Layers size={18} color={PRIMARY} />
                      一级候诊（登记后等待）
                    </div>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                      {levelOneQueue.length}人
                    </span>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' as const }}>
                    {levelOneQueue.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>暂无一级候诊患者</div>
                    ) : (
                      <table style={s.table}>
                        <thead>
                          <tr>
                            <th style={s.th}>排队号</th>
                            <th style={s.th}>姓名</th>
                            <th style={s.th}>类型</th>
                            <th style={s.th}>检查项目</th>
                            <th style={s.th}>登记时间</th>
                            <th style={s.th}>等候</th>
                            <th style={s.th}>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {levelOneQueue.map(q => (
                            <tr key={q.id} style={s.trHover}>
                              <td style={{ ...s.td, fontWeight: 700, color: PRIMARY }}>{q.queueNum}</td>
                              <td style={s.td}>
                                <div style={{ fontWeight: 600 }}>{q.patientName}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{q.gender} · {q.age}岁</div>
                              </td>
                              <td style={s.td}>
                                <span style={{ ...s.patientTypeBadge, ...patientTypeColors[q.patientType] }}>
                                  {q.patientType}
                                </span>
                              </td>
                              <td style={s.td}>
                                <div style={{ fontSize: 12 }}>{q.modality}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>{q.examItemName}</div>
                              </td>
                              <td style={{ ...s.td, fontSize: 12, color: '#64748b' }}>{q.registerTime}</td>
                              <td style={s.td}>
                                <span style={{ color: q.waitMinutes > 30 ? ACCENT_RED : '#64748b', fontWeight: 600 }}>
                                  {q.waitMinutes}分钟
                                </span>
                              </td>
                              <td style={s.td}>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnCall }}
                                  onClick={() => handleCall(q.id)}
                                >
                                  <Volume2 size={12} />
                                  叫号
                                </button>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnSkip }}
                                  onClick={() => setShowPriorityModal(true) || setPriorityPatient(q)}
                                  title="优先"
                                >
                                  <Star size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <Clock4 size={18} color={PRIMARY} />
                      二级候诊（已叫号等待检查）
                    </div>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                      {levelTwoQueue.length}人
                    </span>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' as const }}>
                    {levelTwoQueue.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>暂无二级候诊患者</div>
                    ) : (
                      <table style={s.table}>
                        <thead>
                          <tr>
                            <th style={s.th}>排队号</th>
                            <th style={s.th}>姓名</th>
                            <th style={s.th}>类型</th>
                            <th style={s.th}>检查室</th>
                            <th style={s.th}>呼叫次数</th>
                            <th style={s.th}>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {levelTwoQueue.map(q => (
                            <tr key={q.id} style={s.trHover}>
                              <td style={{ ...s.td, fontWeight: 700, color: PRIMARY }}>{q.queueNum}</td>
                              <td style={s.td}>
                                <div style={{ fontWeight: 600 }}>{q.patientName}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{q.gender} · {q.age}岁</div>
                              </td>
                              <td style={s.td}>
                                <span style={{ ...s.patientTypeBadge, ...patientTypeColors[q.patientType] }}>
                                  {q.patientType}
                                </span>
                              </td>
                              <td style={s.td}>{q.examRoom}</td>
                              <td style={s.td}>
                                <span style={{ color: q.calledCount > 2 ? ACCENT_RED : '#64748b', fontWeight: 600 }}>
                                  {q.calledCount}次
                                </span>
                                {q.lastCalledTime && (
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>最后: {q.lastCalledTime}</div>
                                )}
                              </td>
                              <td style={s.td}>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnCall }}
                                  onClick={handleRecall}
                                >
                                  <RefreshCw size={12} />
                                  重呼
                                </button>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnSkip }}
                                  onClick={() => handleJump(q.id)}
                                >
                                  <SkipForward size={12} />
                                  跳号
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* 检查类型分组 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <FilterIcon size={18} color={PRIMARY} />
                      按检查类型分组
                    </div>
                  </div>
                  <div style={s.adminSectionBody}>
                    <div style={s.statsGrid}>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${modalityColors['CT']}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: modalityColors['CT'] }}>{ctQueue.length}</div>
                          <div style={s.miniStatLabel}>CT检查</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${modalityColors['MR']}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: modalityColors['MR'] }}>{mrQueue.length}</div>
                          <div style={s.miniStatLabel}>MR检查</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${modalityColors['DR']}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: modalityColors['DR'] }}>{drQueue.length}</div>
                          <div style={s.miniStatLabel}>DR检查</div>
                        </div>
                      </div>
                      <div style={{ ...s.miniStatCard, borderLeft: `4px solid ${PRIMARY}` }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>{waitingQueue.length}</div>
                          <div style={s.miniStatLabel}>总候诊</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 分诊规则子Tab */}
            {adminSubTab === '规则' && (
              <>
                {/* 患者类型优先级配置 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <Target size={18} color={PRIMARY} />
                      患者类型优先级配置
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>急诊 {'>'} 住院 {'>'} 门诊 {'>'} 体检</span>
                  </div>
                  <div style={s.adminSectionBody}>
                    <div style={s.rulePriorityList}>
                      {(['急诊', '住院', '门诊', '体检'] as PatientType[]).map((type, idx) => (
                        <div
                          key={type}
                          style={{
                            ...s.rulePriorityTag,
                            background: patientTypeColors[type].bg,
                            color: patientTypeColors[type].color,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 16, fontWeight: 800 }}>{idx + 1}</span>
                          <Ambulance size={14} />
                          {type}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#475569' }}>优先级说明：</div>
                      <div>1. 急诊患者始终优先于其他类型患者</div>
                      <div>2. 住院患者优先于门诊和体检患者</div>
                      <div>3. 相同类型患者按登记时间排序</div>
                      <div>4. 等待超过30分钟自动提升优先级</div>
                    </div>
                  </div>
                </div>

                {/* 分诊规则列表 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <GitBranch size={18} color={PRIMARY} />
                      分诊规则配置
                    </div>
                  </div>
                  <div style={s.adminSectionBody}>
                    {triageRules.map(rule => (
                      <div key={rule.id} style={s.ruleCard}>
                        <div style={s.ruleHeader}>
                          <div style={s.ruleName}>
                            <Shield size={16} />
                            {rule.name}
                          </div>
                          <button
                            style={{
                              ...s.toggle,
                              ...(rule.enabled ? s.toggleEnabled : {}),
                            }}
                            onClick={() => toggleTriageRule(rule.id)}
                          >
                            <div style={{
                              ...s.toggleKnob,
                              ...(rule.enabled ? s.toggleKnobEnabled : {}),
                            }} />
                          </button>
                        </div>
                        <div style={s.ruleDesc}>
                          最大等待时间: {rule.maxWaitMinutes}分钟 | 自动提升优先级: {rule.autoPriority ? '是' : '否'}
                        </div>
                        <div style={s.rulePriorityList}>
                          {rule.priority.map(p => (
                            <span
                              key={p}
                              style={{
                                ...s.rulePriorityTag,
                                ...patientTypeColors[p],
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 预约时段管理 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <CalendarDays size={18} color={PRIMARY} />
                      预约时段管理
                    </div>
                  </div>
                  <div style={s.adminSectionBody}>
                    <div style={s.slotGrid}>
                      {appointmentSlots.map(slot => (
                        <div
                          key={slot.id}
                          style={{
                            ...s.slotCard,
                            ...(slot.enabled ? s.slotEnabled : {}),
                            cursor: 'pointer',
                            opacity: slot.enabled ? 1 : 0.6,
                          }}
                          onClick={() => toggleSlot(slot.id)}
                        >
                          <div style={s.slotTime}>{slot.startTime}</div>
                          <div style={s.slotInfo}>
                            {slot.booked}/{slot.capacity}人
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: slot.enabled ? '#16a34a' : '#94a3b8',
                            marginTop: 4,
                          }}>
                            {slot.enabled ? '● 可用' : '○ 禁用'}
                          </div>
                          <div style={s.progressBar}>
                            <div
                              style={{
                                ...s.progressFill,
                                width: `${(slot.booked / slot.capacity) * 100}%`,
                                background: slot.booked / slot.capacity > 0.8 ? ACCENT_RED : ACCENT_GREEN,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 排队规则设置 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <ArrowRightLeft size={18} color={PRIMARY} />
                      排队规则设置
                    </div>
                  </div>
                  <div style={s.adminSectionBody}>
                    {queueRules.map(rule => (
                      <div key={rule.id} style={s.ruleCard}>
                        <div style={s.ruleHeader}>
                          <div style={s.ruleName}>
                            {rule.ruleType === 'modality' && <FilterIcon size={14} />}
                            {rule.ruleType === 'priority' && <Shield size={14} />}
                            {rule.ruleType === 'room' && <Building2 size={14} />}
                            {rule.ruleType === 'time' && <Clock size={14} />}
                            {rule.ruleName}
                          </div>
                          <button
                            style={{
                              ...s.toggle,
                              ...(rule.enabled ? s.toggleEnabled : {}),
                            }}
                            onClick={() => toggleQueueRule(rule.id)}
                          >
                            <div style={{
                              ...s.toggleKnob,
                              ...(rule.enabled ? s.toggleKnobEnabled : {}),
                            }} />
                          </button>
                        </div>
                        <div style={s.ruleDesc}>
                          规则类型: {rule.ruleType === 'modality' ? '检查类型' :
                            rule.ruleType === 'priority' ? '优先级' :
                              rule.ruleType === 'room' ? '检查室' : '时段'} | 权重: {rule.weight}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 分诊统计子Tab */}
            {adminSubTab === '统计' && (
              <>
                {/* 关键指标卡片 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                  <div style={s.statCardLarge}>
                    <div style={s.statCardTitle}>
                      <Timer size={16} />
                      平均等待时间
                    </div>
                    <div style={s.statCardValue}>{triageStats.avgWaitMinutes}</div>
                    <div style={s.statCardSub}>分钟</div>
                    <div style={{ ...s.statCardTrend, ...s.statCardTrendDown }}>
                      <TrendingDown size={14} />
                      较昨日下降 12%
                    </div>
                  </div>
                  <div style={s.statCardLarge}>
                    <div style={s.statCardTitle}>
                      <CheckCircle size={16} />
                      检查完成率
                    </div>
                    <div style={s.statCardValue}>{triageStats.completionRate}%</div>
                    <div style={s.statCardSub}>今日完成 {triageStats.totalCompleted} / {triageStats.totalCalled}</div>
                    <div style={{ ...s.statCardTrend, ...s.statCardTrendUp }}>
                      <TrendingUp size={14} />
                      较昨日提升 5%
                    </div>
                  </div>
                  <div style={s.statCardLarge}>
                    <div style={s.statCardTitle}>
                      <Gauge size={16} />
                      平均检查时长
                    </div>
                    <div style={s.statCardValue}>{triageStats.avgExamDuration}</div>
                    <div style={s.statCardSub}>分钟</div>
                  </div>
                  <div style={s.statCardLarge}>
                    <div style={s.statCardTitle}>
                      <Clock size={16} />
                      高峰时段
                    </div>
                    <div style={{ ...s.statCardValue, fontSize: 24 }}>{triageStats.peakHour}</div>
                    <div style={s.statCardSub}>呼叫量最大时段</div>
                  </div>
                </div>

                {/* 等待时长分布 */}
                <div style={s.chartContainer}>
                  <div style={s.chartTitle}>
                    <BarChart2 size={18} color={PRIMARY} />
                    候诊时长分布
                  </div>
                  <div style={s.barChart}>
                    <div style={s.barChartRow}>
                      <div style={s.barChartLabel}>0-15分钟</div>
                      <div style={s.barChartBar}>
                        <div style={{ ...s.barChartFill, width: `${(triageStats.waitDistribution.range0to15 / 120) * 100}%`, background: ACCENT_GREEN }} />
                      </div>
                      <div style={s.barChartValue}>{triageStats.waitDistribution.range0to15}人</div>
                    </div>
                    <div style={s.barChartRow}>
                      <div style={s.barChartLabel}>15-30分钟</div>
                      <div style={s.barChartBar}>
                        <div style={{ ...s.barChartFill, width: `${(triageStats.waitDistribution.range15to30 / 120) * 100}%`, background: ACCENT_YELLOW }} />
                      </div>
                      <div style={s.barChartValue}>{triageStats.waitDistribution.range15to30}人</div>
                    </div>
                    <div style={s.barChartRow}>
                      <div style={s.barChartLabel}>30-60分钟</div>
                      <div style={s.barChartBar}>
                        <div style={{ ...s.barChartFill, width: `${(triageStats.waitDistribution.range30to60 / 120) * 100}%`, background: ACCENT_YELLOW }} />
                      </div>
                      <div style={s.barChartValue}>{triageStats.waitDistribution.range30to60}人</div>
                    </div>
                    <div style={s.barChartRow}>
                      <div style={s.barChartLabel}>60分钟以上</div>
                      <div style={s.barChartBar}>
                        <div style={{ ...s.barChartFill, width: `${(triageStats.waitDistribution.range60plus / 120) * 100}%`, background: ACCENT_RED }} />
                      </div>
                      <div style={s.barChartValue}>{triageStats.waitDistribution.range60plus}人</div>
                    </div>
                  </div>
                </div>

                {/* 每小时呼叫/完成统计 */}
                <div style={s.chartContainer}>
                  <div style={s.chartTitle}>
                    <LineChart size={18} color={PRIMARY} />
                    每小时呼叫/完成统计
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: ACCENT_BLUE }} />
                      呼叫数
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: ACCENT_GREEN }} />
                      完成数
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
                    {triageStats.hourlyStats.map((stat, idx) => {
                      const maxVal = Math.max(...triageStats.hourlyStats.map(s => Math.max(s.called, s.completed)))
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ height: `${(stat.called / maxVal) * 100}px`, background: ACCENT_BLUE, borderRadius: 2, minHeight: 4 }} />
                            <div style={{ height: `${(stat.completed / maxVal) * 100}px`, background: ACCENT_GREEN, borderRadius: 2, minHeight: 4 }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{stat.hour.slice(0, 5)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 检查类型统计 */}
                <div style={s.chartContainer}>
                  <div style={s.chartTitle}>
                    <PieChartIcon size={18} color={PRIMARY} />
                    检查类型统计
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                    {triageStats.modalityStats.map(stat => (
                      <div key={stat.modality} style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: modalityColors[stat.modality] || PRIMARY }}>
                          {stat.completed}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{stat.modality}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          等待: {stat.waiting} | 均等: {stat.avgWait}分钟
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 高峰时段分析 */}
                <div style={s.chartContainer}>
                  <div style={s.chartTitle}>
                    <TrendingUp size={18} color={PRIMARY} />
                    高峰时段热力图
                  </div>
                  <div style={s.heatmapGrid}>
                    {triageStats.hourlyStats.map((stat, idx) => {
                      const intensity = stat.called / 25 // 归一化到0-1
                      const bgColor = intensity > 0.7 ? ACCENT_RED : intensity > 0.4 ? ACCENT_YELLOW : ACCENT_GREEN
                      return (
                        <div
                          key={idx}
                          style={{
                            ...s.heatmapCell,
                            background: bgColor,
                            opacity: 0.5 + intensity * 0.5,
                          }}
                          title={`${stat.hour}: 呼叫${stat.called}人, 完成${stat.completed}人`}
                        >
                          {stat.hour.slice(0, 5)}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
                    <span>低负荷</span>
                    <span style={{ display: 'flex', gap: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: ACCENT_GREEN }} /> 空闲
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: ACCENT_YELLOW }} /> 正常
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: ACCENT_RED }} /> 高峰
                      </span>
                    </span>
                    <span>高负荷</span>
                  </div>
                </div>
              </>
            )}

            {/* 叫号历史子Tab */}
            {adminSubTab === '历史' && (
              <>
                {/* 历史记录统计 */}
                <div style={s.statsGrid} style2={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#dbeafe' }}>
                      <Phone size={18} color={ACCENT_BLUE} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{callHistory.filter(h => h.callType === '叫号').length}</div>
                      <div style={s.miniStatLabel}>今日呼叫</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#fef3c7' }}>
                      <RefreshCw size={18} color={ACCENT_YELLOW} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{callHistory.filter(h => h.callType === '重呼').length}</div>
                      <div style={s.miniStatLabel}>重呼次数</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#fee2e2' }}>
                      <FastForward size={18} color={ACCENT_RED} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{callHistory.filter(h => h.callType === '跳号').length}</div>
                      <div style={s.miniStatLabel}>跳号次数</div>
                    </div>
                  </div>
                </div>

                {/* 历史记录列表 */}
                <div style={s.adminSection}>
                  <div style={s.adminSectionHeader}>
                    <div style={s.adminSectionTitle}>
                      <History size={18} color={PRIMARY} />
                      叫号历史记录
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      共 {callHistory.length} 条记录
                    </div>
                  </div>
                  <div style={{ maxHeight: 500, overflowY: 'auto' as const }}>
                    {callHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                        <History size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <div>暂无历史记录</div>
                      </div>
                    ) : (
                      callHistory.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            ...s.historyItem,
                            ...(idx === 0 ? { background: '#f0f9ff' } : {}),
                          }}
                        >
                          <div style={{
                            ...s.historyIcon,
                            background: callTypeColors[item.callType].bg,
                          }}>
                            {item.callType === '叫号' && <Volume2 size={18} color={callTypeColors[item.callType].color} />}
                            {item.callType === '重呼' && <RefreshCw size={18} color={callTypeColors[item.callType].color} />}
                            {item.callType === '跳号' && <SkipForward size={18} color={callTypeColors[item.callType].color} />}
                            {item.callType === '优先' && <Star size={18} color={callTypeColors[item.callType].color} />}
                            {item.callType === '完成' && <CheckCircle size={18} color={callTypeColors[item.callType].color} />}
                          </div>
                          <div style={s.historyContent}>
                            <div style={s.historyMain}>
                              {item.queueNum} - {item.patientName}
                              <span style={{
                                ...s.statusBadge,
                                ...callTypeColors[item.callType],
                                marginLeft: 8,
                              }}>
                                {item.callType}
                              </span>
                            </div>
                            <div style={s.historySub}>
                              {item.modality} · {item.examRoom} · 操作员: {item.operator} · 等候 {item.waitMinutes} 分钟
                            </div>
                          </div>
                          <div style={s.historyTime}>
                            {item.callTime}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========== 右侧管理面板 (30%) ========== */}
        {activeTab === '管理' && (
          <div style={s.adminPanel}>
            {/* ===== 叫号控制面板 ===== */}
            <div style={s.callControlPanel}>
              <div style={s.adminSectionHeader}>
                <div style={s.adminSectionTitle}>
                  <Phone size={18} color={PRIMARY} />
                  叫号控制
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      ...s.navBtn,
                      background: soundEnabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: soundEnabled ? ACCENT_GREEN : ACCENT_RED,
                      border: `1px solid ${soundEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      padding: '4px 10px',
                      fontSize: 12,
                    }}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume1 size={14} /> : <VolumeX size={14} />}
                    {soundEnabled ? '声音开' : '声音关'}
                  </button>
                </div>
              </div>
              <div style={s.controlRow}>
                <div>
                  <div style={s.controlLabel}>
                    <Building2 size={14} />
                    选择检查室
                  </div>
                  <select
                    style={s.select}
                    value={selectedRoom}
                    onChange={e => setSelectedRoom(e.target.value)}
                  >
                    <option value="">-- 请选择检查室 --</option>
                    {examRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.modality.join('/')})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={s.controlLabel}>
                    <User size={14} />
                    选择患者 / 输入排队号
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...s.input, paddingLeft: 36 }}
                      placeholder="搜索患者姓名或排队号..."
                      value={selectedPatient}
                      onChange={e => setSelectedPatient(e.target.value)}
                      onFocus={() => setShowPatientModal(true)}
                    />
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>

                  {/* 患者选择下拉 */}
                  {showPatientModal && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      borderRadius: 10,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      maxHeight: 240,
                      overflowY: 'auto',
                      zIndex: 50,
                      marginTop: 4,
                    }}>
                      {waitingQueue
                        .filter(q =>
                          (!selectedRoom || q.roomId === selectedRoom) &&
                          (!selectedPatient ||
                            q.patientName.includes(selectedPatient) ||
                            q.queueNum.toLowerCase().includes(selectedPatient.toLowerCase()))
                        )
                        .slice(0, 8)
                        .map(q => (
                          <div
                            key={q.id}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onClick={() => {
                              setSelectedPatient(q.queueNum + ' - ' + q.patientName)
                              setShowPatientModal(false)
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{q.patientName}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{q.queueNum} · {q.modality} · {q.examRoom}</div>
                            </div>
                            <div style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              background: (modalityColors[q.modality] || '#64748b') + '15',
                              color: modalityColors[q.modality] || '#64748b',
                              fontWeight: 600,
                            }}>
                              {q.modality}
                            </div>
                          </div>
                        ))}
                      {waitingQueue.filter(q => !selectedRoom || q.roomId === selectedRoom).length === 0 && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                          暂无候诊患者
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作按钮组 */}
                <div style={s.btnGroup}>
                  <button
                    style={{
                      ...s.btnCall,
                      ...(waitingQueue.length === 0 ? s.btnDisabled : {}),
                    }}
                    onClick={() => {
                      const patient = waitingQueue.find(q =>
                        selectedPatient.includes(q.queueNum) || selectedPatient.includes(q.patientName)
                      )
                      if (patient) handleCall(patient.id)
                    }}
                    disabled={waitingQueue.length === 0}
                  >
                    <Volume2 size={18} />
                    呼叫
                  </button>
                  <button
                    style={{
                      ...s.btnRecall,
                      ...(!currentCalled ? s.btnDisabled : {}),
                    }}
                    onClick={handleRecall}
                    disabled={!currentCalled}
                  >
                    <RefreshCw size={18} />
                    重呼
                  </button>
                </div>
                <div style={s.btnGroup}>
                  <button
                    style={{
                      ...s.btnFinish,
                      ...(!currentCalled && !examingPatient ? s.btnDisabled : {}),
                    }}
                    onClick={handleFinish}
                    disabled={!currentCalled && !examingPatient}
                  >
                    <CheckCircle size={18} />
                    完成检查
                  </button>
                  <button
                    style={{
                      ...s.btnNext,
                      ...(waitingQueue.length === 0 ? s.btnDisabled : {}),
                    }}
                    onClick={handleNext}
                    disabled={waitingQueue.length === 0}
                  >
                    <SkipForward size={18} />
                    下一位
                  </button>
                </div>
              </div>
            </div>

            {/* ===== 统计信息 ===== */}
            <div style={s.adminSection}>
              <div style={s.adminSectionHeader}>
                <div style={s.adminSectionTitle}>
                  <TrendingUp size={18} color={PRIMARY} />
                  今日统计
                </div>
              </div>
              <div style={s.adminSectionBody}>
                <div style={s.statsGrid}>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#dbeafe' }}>
                      <Users size={18} color={ACCENT_BLUE} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{waitingQueue.length}</div>
                      <div style={s.miniStatLabel}>待检查人数</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#dcfce7' }}>
                      <CheckCircle size={18} color={ACCENT_GREEN} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{completedToday.length}</div>
                      <div style={s.miniStatLabel}>今日已完成</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#fef3c7' }}>
                      <Timer size={18} color={ACCENT_YELLOW} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{avgWaitMinutes}</div>
                      <div style={s.miniStatLabel}>平均等候(分钟)</div>
                    </div>
                  </div>
                  <div style={s.miniStatCard}>
                    <div style={{ ...s.miniStatIcon, background: '#f3e8ff' }}>
                      <Activity size={18} color={ACCENT_PURPLE} />
                    </div>
                    <div>
                      <div style={s.miniStatValue}>{onlineRooms}/{examRooms.length}</div>
                      <div style={s.miniStatLabel}>设备在线</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 检查室管理 ===== */}
            <div style={s.adminSection}>
              <div style={s.adminSectionHeader}>
                <div style={s.adminSectionTitle}>
                  <Building2 size={18} color={PRIMARY} />
                  检查室管理
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  共{examRooms.length}间 · {activeRooms}间使用中
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>检查室</th>
                      <th style={s.th}>设备</th>
                      <th style={s.th}>状态</th>
                      <th style={s.th}>当前患者</th>
                      <th style={s.th}>等待</th>
                      <th style={s.th}>今日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examRooms.map(room => {
                      const statusColor = roomStatusColors[room.status]
                      return (
                        <tr
                          key={room.id}
                          style={{
                            ...s.trHover,
                            background: selectedRoom === room.id ? '#f0fdf4' : undefined,
                          }}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <td style={{ ...s.td, fontWeight: 600, color: PRIMARY }}>
                            {room.name}
                          </td>
                          <td style={s.td}>
                            <div style={{ fontSize: 12, color: '#475569' }}>{room.modality.join('/')}</div>
                          </td>
                          <td style={s.td}>
                            <span style={{
                              ...s.statusBadge,
                              background: statusColor.bg,
                              color: statusColor.color,
                            }}>
                              {room.status}
                            </span>
                          </td>
                          <td style={s.td}>
                            {room.currentPatient ? (
                              <span style={{ fontWeight: 500 }}>{room.currentPatient}</span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: 12 }}>--</span>
                            )}
                          </td>
                          <td style={s.td}>
                            <span style={{
                              background: room.waitCount > 5 ? '#fee2e2' : room.waitCount > 0 ? '#fef3c7' : '#f1f5f9',
                              color: room.waitCount > 5 ? '#dc2626' : room.waitCount > 0 ? '#d97706' : '#64748b',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 600,
                            }}>
                              {room.waitCount}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontWeight: 600, color: PRIMARY }}>{room.completedToday}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== 候诊队列管理 ===== */}
            <div style={s.adminSection}>
              <div style={s.adminSectionHeader}>
                <div style={s.adminSectionTitle}>
                  <List size={18} color={PRIMARY} />
                  候诊队列管理
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    style={{
                      ...s.input,
                      width: 140,
                      padding: '6px 10px',
                      fontSize: 12,
                    }}
                    placeholder="搜索..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={{ ...s.th, width: 40 }}></th>
                      <th style={s.th}>排队号</th>
                      <th style={s.th}>姓名</th>
                      <th style={s.th}>检查项目</th>
                      <th style={s.th}>登记时间</th>
                      <th style={s.th}>状态</th>
                      <th style={{ ...s.th, width: 120 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue
                      .filter(q => q.status !== '已完成')
                      .map((q, idx) => (
                        <tr
                          key={q.id}
                          style={{
                            ...s.trHover,
                            background: draggedItem === q.id ? '#f0f9ff' : undefined,
                          }}
                          draggable
                          onDragStart={() => handleDragStart(q.id)}
                          onDragOver={e => handleDragOver(e, q.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <td style={s.td}>
                            <div style={s.dragHandle}>
                              <GripVertical size={14} />
                            </div>
                          </td>
                          <td style={{ ...s.td, fontWeight: 700, color: PRIMARY }}>
                            {q.queueNum}
                          </td>
                          <td style={{ ...s.td, fontWeight: 600 }}>
                            {q.patientName}
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>
                              {q.gender} · {q.age}岁 · {q.priority === '普通' ? '' : q.priority}
                            </div>
                          </td>
                          <td style={s.td}>
                            <div style={{ fontSize: 12 }}>{q.modality}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{q.examItemName}</div>
                          </td>
                          <td style={{ ...s.td, fontSize: 12, color: '#64748b' }}>
                            {q.registerTime}
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                              等候{q.waitMinutes}分钟
                            </div>
                          </td>
                          <td style={s.td}>
                            <span style={{
                              ...s.statusBadge,
                              ...statusColors[q.status],
                            }}>
                              {q.status}
                            </span>
                          </td>
                          <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                            {q.status === '等待中' && (
                              <>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnCall }}
                                  onClick={() => handleCall(q.id)}
                                  title="叫号"
                                >
                                  <Volume2 size={12} />
                                  叫号
                                </button>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnSkip }}
                                  onClick={() => handleSkip(q.id)}
                                  title="跳过"
                                >
                                  <SkipForward size={12} />
                                </button>
                              </>
                            )}
                            {(q.status === '已呼叫' || q.status === '检查中') && (
                              <>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnCall }}
                                  onClick={handleRecall}
                                  title="重呼"
                                >
                                  <RefreshCw size={12} />
                                  重呼
                                </button>
                                <button
                                  style={{ ...s.actionBtn, ...s.actionBtnFinish }}
                                  onClick={handleFinish}
                                  title="完成"
                                >
                                  <CheckCircle size={12} />
                                </button>
                              </>
                            )}
                            <button
                              style={{ ...s.actionBtn, ...s.actionBtnRemove }}
                              onClick={() => handleRemove(q.id)}
                              title="移除"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {filteredQueue.filter(q => q.status !== '已完成').length === 0 && (
                  <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                    <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div>暂无候诊患者</div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== 已完成记录 ===== */}
            {completedToday.length > 0 && (
              <div style={s.adminSection}>
                <div style={s.adminSectionHeader}>
                  <div style={s.adminSectionTitle}>
                    <CheckCircle size={18} color={ACCENT_GREEN} />
                    今日已完成 ({completedToday.length}人)
                  </div>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' as const }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>排队号</th>
                        <th style={s.th}>姓名</th>
                        <th style={s.th}>检查项目</th>
                        <th style={s.th}>完成时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedToday.map(q => (
                        <tr key={q.id}>
                          <td style={{ ...s.td, fontWeight: 600, color: PRIMARY }}>{q.queueNum}</td>
                          <td style={s.td}>{q.patientName}</td>
                          <td style={s.td}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: (modalityColors[q.modality] || '#64748b') + '15',
                              color: modalityColors[q.modality] || '#64748b',
                            }}>
                              {q.modality}
                            </span>
                          </td>
                          <td style={{ ...s.td, fontSize: 12, color: '#64748b' }}>
                            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 关闭患者选择模态框的点击区域 */}
      {showPatientModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
          onClick={() => setShowPatientModal(false)}
        />
      )}

      {/* 语音提示 Toast */}
      {showVoiceToast && (
        <div style={s.voiceToast}>
          <Volume2 size={24} />
          {voiceToastText}
        </div>
      )}

      {/* 优先呼叫模态框 */}
      {showPriorityModal && (
        <div style={s.overlay} onClick={() => setShowPriorityModal(false)}>
          <div style={s.priorityModalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>
              <Star size={22} color={ACCENT_YELLOW} />
              优先呼叫
            </div>
            <div style={{ marginBottom: 20, color: '#64748b', fontSize: 14 }}>
              请选择优先呼叫的原因：
            </div>

            {/* 优先呼叫选项 */}
            <div
              style={{
                ...s.priorityOption,
                ...(priorityPatient ? s.priorityOptionSelected : {}),
              }}
              onClick={() => priorityPatient && handlePriorityCall(priorityPatient)}
            >
              <div style={{ ...s.priorityIcon, background: '#fee2e2' }}>
                <Ambulance size={22} color={ACCENT_RED} />
              </div>
              <div style={s.priorityText}>
                <div style={s.priorityTitle}>急诊优先</div>
                <div style={s.priorityDesc}>危重急诊患者，需立即检查</div>
              </div>
              <ArrowUp size={20} color={ACCENT_RED} />
            </div>

            <div
              style={s.priorityOption}
              onClick={() => priorityPatient && handlePriorityCall(priorityPatient)}
            >
              <div style={{ ...s.priorityIcon, background: '#dbeafe' }}>
                <UserPlus size={22} color={ACCENT_BLUE} />
              </div>
              <div style={s.priorityText}>
                <div style={s.priorityTitle}>住院优先</div>
                <div style={s.priorityDesc}>住院患者检查，优先安排</div>
              </div>
              <ArrowUp size={20} color={ACCENT_BLUE} />
            </div>

            <div
              style={s.priorityOption}
              onClick={() => priorityPatient && handlePriorityCall(priorityPatient)}
            >
              <div style={{ ...s.priorityIcon, background: '#fef3c7' }}>
                <Clock4 size={22} color={ACCENT_YELLOW} />
              </div>
              <div style={s.priorityText}>
                <div style={s.priorityTitle}>等候超时</div>
                <div style={s.priorityDesc}>等待时间过长，提升优先级</div>
              </div>
              <ArrowUp size={20} color={ACCENT_YELLOW} />
            </div>

            <div
              style={s.priorityOption}
              onClick={() => priorityPatient && handlePriorityCall(priorityPatient)}
            >
              <div style={{ ...s.priorityIcon, background: '#f3e8ff' }}>
                <Stethoscope size={22} color={ACCENT_PURPLE} />
              </div>
              <div style={s.priorityText}>
                <div style={s.priorityTitle}>临床需要</div>
                <div style={s.priorityDesc}>临床医生特别要求优先检查</div>
              </div>
              <ArrowUp size={20} color={ACCENT_PURPLE} />
            </div>

            <button
              style={{
                width: '100%',
                marginTop: 16,
                padding: '12px 20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
              }}
              onClick={() => setShowPriorityModal(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* CSS动画 */}
      <style>{`
        @keyframes voiceToastAnim {
          0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
