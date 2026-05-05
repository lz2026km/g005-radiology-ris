// G005 放射科RIS系统 - 胶片打印管理页面 v2.0.0
import React, { useState } from 'react'
import {
  Printer, Settings, FileText, Film, Clock, CheckCircle, XCircle,
  Search, Filter, Plus, X, Eye, Edit2, Trash2, RefreshCw, Download,
  BarChart, PieChart, TrendingUp, TrendingDown, AlertCircle, Info,
  ChevronLeft, ChevronRight, Check, Copy, Layers, Box, DollarSign,
  Calendar, User, Monitor, Network, HardDrive, Cog, FileBarChart,
  PrinterIcon, ScrollText, Database, Zap, Timer, BarChart2, Activity,
  Server, Wifi, WifiOff, FileSpreadsheet, Users, Building2, Receipt
} from 'lucide-react'
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts'

// ============================================================
// 样式常量 - WIN10风格
// ============================================================
const C = {
  primary: '#1e40af',        // 深蓝主色
  primaryLight: '#3b82f6',   // 浅蓝
  primaryLighter: '#dbeafe', // 淡蓝背景
  accent: '#0891b2',         // 青色辅色
  accentLight: '#06b6d4',    // 浅青
  white: '#ffffff',          // 白色卡片
  bg: '#e8e8e8',             // 浅灰背景
  border: '#d1d5db',         // 边框色
  textDark: '#1f2937',       // 深色文字
  textMid: '#4b5563',        // 中色文字
  textLight: '#9ca3af',      // 浅色文字
  success: '#059669',        // 成功绿
  warning: '#d97706',        // 警告橙
  danger: '#dc2626',         // 危险红
  info: '#2563eb',           // 信息蓝
}

// ============================================================
// 模拟数据
// ============================================================

// 打印机列表数据
const PRINTERS = [
  { id: 'P001', name: '柯尼卡 DICOM 打印机 1', type: 'network', status: 'online', location: 'CT检查室1', filmSpec: '14x17', defaultCopies: 1, dpi: 300 },
  { id: 'P002', name: '柯尼卡 DICOM 打印机 2', type: 'network', status: 'online', location: 'MR检查室', filmSpec: '14x17', defaultCopies: 1, dpi: 300 },
  { id: 'P003', name: '富士 DICOM 打印机', type: 'network', status: 'online', location: 'DR检查室', filmSpec: '10x12', defaultCopies: 1, dpi: 600 },
  { id: 'P004', name: '本地报告打印机', type: 'local', status: 'online', location: '登记台', filmSpec: 'A4', defaultCopies: 2, dpi: 600 },
  { id: 'P005', name: '激光报告打印机', type: 'local', status: 'offline', location: '诊断室1', filmSpec: 'A4', defaultCopies: 1, dpi: 1200 },
]

// 胶片规格配置
const FILM_SPECS = [
  { id: 'FS001', name: '14"×17" (35×43cm)', code: '14x17', size: '35×43cm', dpi: '300/600', default: true },
  { id: 'FS002', name: '10"×12" (25×30cm)', code: '10x12', size: '25×30cm', dpi: '300/600', default: false },
  { id: 'FS003', name: '8"×10" (20×25cm)', code: '8x10', size: '20×25cm', dpi: '300/600', default: false },
  { id: 'FS004', name: '14"×14" (35×35cm)', code: '14x14', size: '35×35cm', dpi: '300/600', default: false },
  { id: 'FS005', name: '11"×14" (28×35cm)', code: '11x14', size: '28×35cm', dpi: '300/600', default: false },
]

// DICOM打印参数预设
const DICOM_PRESETS = [
  { id: 'DP001', name: '标准DICOM打印', orientation: 'PORTRAIT', mediumType: 'BLUE FILM', filmDestination: 'MAGAZINE', trimming: 'NO' },
  { id: 'DP002', name: '高对比度打印', orientation: 'LANDSCAPE', mediumType: 'CLEAR FILM', filmDestination: 'PROCESSOR', trimming: 'YES' },
  { id: 'DP003', name: '乳腺打印', orientation: 'PORTRAIT', mediumType: 'MAMMO BLUE', filmDestination: 'MAGAZINE', trimming: 'NO' },
]

// 报告打印模板
const REPORT_TEMPLATES = [
  { id: 'RT001', name: '标准CT报告', type: 'CT', copies: 1, includeImages: true, includeLogo: true },
  { id: 'RT002', name: '标准MR报告', type: 'MR', copies: 1, includeImages: true, includeLogo: true },
  { id: 'RT003', name: 'DR简明报告', type: 'DR', copies: 1, includeImages: false, includeLogo: true },
  { id: 'RT004', name: '介入手术报告', type: '介入', copies: 2, includeImages: true, includeLogo: true },
  { id: 'RT005', name: '急诊报告', type: '急诊', copies: 2, includeImages: true, includeLogo: false },
]

// 打印队列数据
const PRINT_QUEUE = [
  { id: 'PQ001', patientId: 'P20260501001', patientName: '张三', modality: 'CT', studyDesc: '胸部CT平扫', filmSpec: '14x17', copies: 1, status: 'printing', printer: 'P001', requestTime: '2026-05-02 10:30:00', progress: 65 },
  { id: 'PQ002', patientId: 'P20260501002', patientName: '李四', modality: 'MR', studyDesc: '头颅MR平扫', filmSpec: '14x14', copies: 1, status: 'queued', printer: 'P002', requestTime: '2026-05-02 10:25:00', progress: 0 },
  { id: 'PQ003', patientId: 'P20260501003', patientName: '王五', modality: 'DR', studyDesc: '胸部DR正侧位', filmSpec: '10x12', copies: 2, status: 'queued', printer: 'P001', requestTime: '2026-05-02 10:20:00', progress: 0 },
  { id: 'PQ004', patientId: 'P20260501004', patientName: '赵六', modality: 'CT', studyDesc: '腹部CT增强', filmSpec: '14x17', copies: 1, status: 'completed', printer: 'P001', requestTime: '2026-05-02 09:45:00', progress: 100 },
  { id: 'PQ005', patientId: 'P20260501005', patientName: '钱七', modality: 'CT', studyDesc: '胸部CT平扫', filmSpec: '14x17', copies: 1, status: 'error', printer: 'P002', requestTime: '2026-05-02 09:30:00', progress: 30, errorMsg: '打印机缺纸' },
]

// 打印记录数据
const PRINT_HISTORY = [
  { id: 'PH001', patientId: 'P20260501004', patientName: '赵六', modality: 'CT', studyDesc: '腹部CT增强', filmSpec: '14x17', copies: 1, pages: 2, printer: '柯尼卡 DICOM 打印机 1', operator: '李医生', printTime: '2026-05-02 09:50:00', status: 'success', cost: 25.0 },
  { id: 'PH002', patientId: 'P20260501006', patientName: '孙八', modality: 'MR', studyDesc: '腰椎MR平扫', filmSpec: '14x17', copies: 1, pages: 4, printer: '柯尼卡 DICOM 打印机 2', operator: '王医生', printTime: '2026-05-02 09:35:00', status: 'success', cost: 50.0 },
  { id: 'PH003', patientId: 'P20260501007', patientName: '周九', modality: 'DR', studyDesc: '胸部DR正位', filmSpec: '10x12', copies: 1, pages: 1, printer: '富士 DICOM 打印机', operator: '李医生', printTime: '2026-05-02 09:20:00', status: 'success', cost: 12.5 },
  { id: 'PH004', patientId: 'P20260501008', patientName: '吴十', modality: 'CT', studyDesc: '头颅CT平扫', filmSpec: '14x17', copies: 1, pages: 2, printer: '柯尼卡 DICOM 打印机 1', operator: '张医生', printTime: '2026-05-02 08:55:00', status: 'success', cost: 25.0 },
  { id: 'PH005', patientId: 'P20260501009', patientName: '郑十一', modality: 'CT', studyDesc: '肺部CT低剂量', filmSpec: '14x17', copies: 1, pages: 2, printer: '柯尼卡 DICOM 打印机 1', operator: '李医生', printTime: '2026-05-02 08:40:00', status: 'success', cost: 25.0 },
]

// 胶片使用量统计数据
const FILM_USAGE_STATS = [
  { date: '04-26', films14x17: 45, films10x12: 22, films8x10: 8, total: 75, cost: 937.5 },
  { date: '04-27', films14x17: 52, films10x12: 18, films8x10: 12, total: 82, cost: 1025.0 },
  { date: '04-28', films14x17: 38, films10x12: 25, films8x10: 5, total: 68, cost: 850.0 },
  { date: '04-29', films14x17: 61, films10x12: 30, films8x10: 15, total: 106, cost: 1325.0 },
  { date: '04-30', films14x17: 55, films10x12: 28, films8x10: 10, total: 93, cost: 1162.5 },
  { date: '05-01', films14x17: 48, films10x12: 20, films8x10: 8, total: 76, cost: 950.0 },
  { date: '05-02', films14x17: 42, films10x12: 24, films8x10: 6, total: 72, cost: 900.0 },
]

// 设备打印量统计
const DEVICE_PRINT_STATS = [
  { device: 'CT-1', printCount: 156, totalFilms: 312, cost: 3900 },
  { device: 'CT-2', printCount: 142, totalFilms: 284, cost: 3550 },
  { device: 'MR-1', printCount: 98, totalFilms: 392, cost: 4900 },
  { device: 'DR-1', printCount: 210, totalFilms: 210, cost: 2625 },
  { device: 'DR-2', printCount: 185, totalFilms: 185, cost: 2312.5 },
]

// 耗材成本分析
const CONSUMABLE_COSTS = [
  { name: '14×17胶片', unit: '张', price: 12.5, used: 341, total: 4262.5 },
  { name: '10×12胶片', unit: '张', price: 10.0, used: 167, total: 1670 },
  { name: '8×10胶片', unit: '张', price: 8.0, used: 64, total: 512 },
  { name: 'A4纸(报告)', unit: '张', price: 0.3, used: 520, total: 156 },
]

// 打印效率统计
const EFFICIENCY_STATS = [
  { hour: '08:00', avgTime: 45, completed: 5 },
  { hour: '09:00', avgTime: 38, completed: 12 },
  { hour: '10:00', avgTime: 42, completed: 18 },
  { hour: '11:00', avgTime: 35, completed: 15 },
  { hour: '12:00', avgTime: 50, completed: 8 },
  { hour: '13:00', avgTime: 40, completed: 10 },
  { hour: '14:00', avgTime: 36, completed: 14 },
  { hour: '15:00', avgTime: 33, completed: 16 },
  { hour: '16:00', avgTime: 38, completed: 13 },
]

// ============================================================
// DICOM打印队列数据 (20条虚构数据)
// ============================================================

// DICOM打印服务器配置
const DICOM_SERVERS = [
  { id: 'DCS001', name: 'DICOM打印服务器主', ip: '192.168.1.100', port: 11112, status: 'online', aet: 'PRINT_SERVER', description: '主打印服务器' },
  { id: 'DCS002', name: 'DICOM打印服务器备', ip: '192.168.1.101', port: 11112, status: 'online', aet: 'PRINT_SERVER_BAK', description: '备份打印服务器' },
]

// DICOM打印机列表
const DICOM_PRINTERS = [
  { id: 'DP001', name: '柯尼卡 DICOM 打印机 #1', serverId: 'DCS001', status: 'online', location: 'CT检查室1', filmsToday: 45 },
  { id: 'DP002', name: '柯尼卡 DICOM 打印机 #2', serverId: 'DCS001', status: 'online', location: 'MR检查室', filmsToday: 38 },
  { id: 'DP003', name: '富士 DICOM 打印机', serverId: 'DCS001', status: 'online', location: 'DR检查室', filmsToday: 62 },
  { id: 'DP004', name: 'GE DICOM 打印机', serverId: 'DCS002', status: 'offline', location: '普放检查室', filmsToday: 0 },
  { id: 'DP005', name: '飞利浦 DICOM 打印机', serverId: 'DCS002', status: 'online', location: 'ICU', filmsToday: 28 },
]

// 胶片规格选项
const FILM_SPEC_OPTIONS = [
  { value: '14x17', label: '14×17英寸 (35×43cm)' },
  { value: '10x12', label: '10×12英寸 (25×30cm)' },
  { value: '8x10', label: '8×10英寸 (20×25cm)' },
  { value: 'A4_LANDSCAPE', label: 'A4横向' },
  { value: 'CUSTOM', label: '自定义' },
]

// 介质类型选项
const MEDIUM_TYPES = [
  { value: 'BLUE_FILM', label: '蓝基胶片' },
  { value: 'CLEAR_FILM', label: '透明胶片' },
  { value: 'PAPER', label: '纸质' },
]

// DICOM打印队列表格 - 20条虚构数据
const DICOM_PRINT_TASKS: Array<{
  id: string;
  patientId: string;
  patientName: string;
  modality: string;
  studyType: string;
  filmSpec: string;
  copies: number;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  submitTime: string;
  completeTime: string | null;
  printer: string;
  mediumType: string;
}> = [
  { id: 'DPT001', patientId: 'P20260502001', patientName: '王建国', modality: 'CT', studyType: '胸部CT平扫', filmSpec: '14×17', copies: 1, status: 'printing', submitTime: '2026-05-03 08:30:00', completeTime: null, printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT002', patientId: 'P20260502002', patientName: '刘淑芳', modality: 'MR', studyType: '头颅MR平扫', filmSpec: '14×17', copies: 1, status: 'queued', submitTime: '2026-05-03 08:25:00', completeTime: null, printer: '柯尼卡 #2', mediumType: '蓝基胶片' },
  { id: 'DPT003', patientId: 'P20260502003', patientName: '陈志强', modality: 'DR', studyType: '胸部DR正侧位', filmSpec: '10×12', copies: 2, status: 'queued', submitTime: '2026-05-03 08:20:00', completeTime: null, printer: '富士', mediumType: '蓝基胶片' },
  { id: 'DPT004', patientId: 'P20260502004', patientName: '赵秀英', modality: 'CT', studyType: '腹部CT增强', filmSpec: '14×17', copies: 1, status: 'completed', submitTime: '2026-05-03 08:00:00', completeTime: '2026-05-03 08:05:23', printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT005', patientId: 'P20260502005', patientName: '孙伟东', modality: 'CT', studyType: '胸部CT平扫', filmSpec: '14×17', copies: 1, status: 'failed', submitTime: '2026-05-03 07:55:00', completeTime: '2026-05-03 08:00:10', printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT006', patientId: 'P20260502006', patientName: '周丽华', modality: 'MR', studyType: '腰椎MR平扫', filmSpec: '14×17', copies: 1, status: 'completed', submitTime: '2026-05-03 07:50:00', completeTime: '2026-05-03 07:56:45', printer: '柯尼卡 #2', mediumType: '蓝基胶片' },
  { id: 'DPT007', patientId: 'P20260502007', patientName: '吴敏', modality: 'DR', studyType: '膝关节DR', filmSpec: '8×10', copies: 1, status: 'queued', submitTime: '2026-05-03 07:45:00', completeTime: null, printer: '富士', mediumType: '透明胶片' },
  { id: 'DPT008', patientId: 'P20260502008', patientName: '郑海涛', modality: 'CT', studyType: '头颅CT平扫', filmSpec: '14×17', copies: 1, status: 'completed', submitTime: '2026-05-03 07:30:00', completeTime: '2026-05-03 07:35:18', printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT009', patientId: 'P20260502009', patientName: '黄晓燕', modality: 'MR', studyType: '肩关节MR', filmSpec: '10×12', copies: 2, status: 'queued', submitTime: '2026-05-03 07:25:00', completeTime: null, printer: '柯尼卡 #2', mediumType: '透明胶片' },
  { id: 'DPT010', patientId: 'P20260502010', patientName: '杨建军', modality: 'CT', studyType: '肺部CT低剂量', filmSpec: '14×17', copies: 1, status: 'printing', submitTime: '2026-05-03 07:20:00', completeTime: null, printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT011', patientId: 'P20260502011', patientName: '林淑珍', modality: 'DR', studyType: '胸部DR正位', filmSpec: '10×12', copies: 1, status: 'completed', submitTime: '2026-05-03 07:15:00', completeTime: '2026-05-03 07:20:33', printer: '富士', mediumType: '蓝基胶片' },
  { id: 'DPT012', patientId: 'P20260502012', patientName: '徐志远', modality: 'CT', studyType: '腹部CT平扫', filmSpec: '14×17', copies: 1, status: 'queued', submitTime: '2026-05-03 07:10:00', completeTime: null, printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT013', patientId: 'P20260502013', patientName: '马晓丽', modality: 'MR', studyType: '盆腔MR平扫', filmSpec: '14×17', copies: 1, status: 'completed', submitTime: '2026-05-03 07:00:00', completeTime: '2026-05-03 07:08:52', printer: '柯尼卡 #2', mediumType: '蓝基胶片' },
  { id: 'DPT014', patientId: 'P20260502014', patientName: '朱强', modality: 'DR', studyType: '腕关节DR', filmSpec: '8×10', copies: 1, status: 'failed', submitTime: '2026-05-03 06:55:00', completeTime: '2026-05-03 06:58:20', printer: '富士', mediumType: '纸质' },
  { id: 'DPT015', patientId: 'P20260502015', patientName: '胡文静', modality: 'CT', studyType: '颈部CT平扫', filmSpec: '14×17', copies: 1, status: 'completed', submitTime: '2026-05-03 06:50:00', completeTime: '2026-05-03 06:55:41', printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT016', patientId: 'P20260502016', patientName: '郭永强', modality: 'MR', studyType: '膝关节MR', filmSpec: '10×12', copies: 1, status: 'queued', submitTime: '2026-05-03 06:45:00', completeTime: null, printer: '柯尼卡 #2', mediumType: '透明胶片' },
  { id: 'DPT017', patientId: 'P20260502017', patientName: '林志豪', modality: 'CT', studyType: '心脏CTA', filmSpec: '14×17', copies: 2, status: 'printing', submitTime: '2026-05-03 06:40:00', completeTime: null, printer: '柯尼卡 #1', mediumType: '透明胶片' },
  { id: 'DPT018', patientId: 'P20260502018', patientName: '张美玲', modality: 'DR', studyType: '腰椎DR正侧位', filmSpec: '10×12', copies: 2, status: 'completed', submitTime: '2026-05-03 06:35:00', completeTime: '2026-05-03 06:42:15', printer: '富士', mediumType: '蓝基胶片' },
  { id: 'DPT019', patientId: 'P20260502019', patientName: '李志鹏', modality: 'CT', studyType: '胰腺CT增强', filmSpec: '14×17', copies: 1, status: 'queued', submitTime: '2026-05-03 06:30:00', completeTime: null, printer: '柯尼卡 #1', mediumType: '蓝基胶片' },
  { id: 'DPT020', patientId: 'P20260502020', patientName: '赵雅琴', modality: 'MR', studyType: '乳腺MR动态增强', filmSpec: '14×17', copies: 1, status: 'queued', submitTime: '2026-05-03 06:25:00', completeTime: null, printer: '柯尼卡 #2', mediumType: '透明胶片' },
]

// 打印计费配置 - 各规格单价
const FILM_PRICE_CONFIG: Array<{ spec: string; pricePerSheet: number; unit: string }> = [
  { spec: '14×17英寸', pricePerSheet: 25.0, unit: '元/张' },
  { spec: '10×12英寸', pricePerSheet: 20.0, unit: '元/张' },
  { spec: '8×10英寸', pricePerSheet: 15.0, unit: '元/张' },
  { spec: 'A4横向', pricePerSheet: 5.0, unit: '元/张' },
  { spec: '自定义', pricePerSheet: 30.0, unit: '元/张' },
]

// 科室计费统计数据
const DEPARTMENT_BILLING: Array<{ dept: string; patientCount: number; filmCount: number; amount: number }> = [
  { dept: 'CT室', patientCount: 156, filmCount: 312, amount: 7800.0 },
  { dept: 'MR室', patientCount: 98, filmCount: 294, amount: 7350.0 },
  { dept: 'DR室', patientCount: 210, filmCount: 315, amount: 6300.0 },
  { dept: '普放室', patientCount: 85, filmCount: 102, amount: 2040.0 },
  { dept: 'ICU', patientCount: 28, filmCount: 56, amount: 1400.0 },
]

// 打印成本报表数据
const COST_REPORT: Array<{ date: string; filmCost: number; paperCost: number; inkCost: number; total: number }> = [
  { date: '2026-04-27', filmCost: 1025.0, paperCost: 45.0, inkCost: 120.0, total: 1190.0 },
  { date: '2026-04-28', filmCost: 850.0, paperCost: 38.0, inkCost: 95.0, total: 983.0 },
  { date: '2026-04-29', filmCost: 1325.0, paperCost: 52.0, inkCost: 140.0, total: 1517.0 },
  { date: '2026-04-30', filmCost: 1162.5, paperCost: 48.0, inkCost: 125.0, total: 1335.5 },
  { date: '2026-05-01', filmCost: 950.0, paperCost: 42.0, inkCost: 110.0, total: 1102.0 },
  { date: '2026-05-02', filmCost: 900.0, paperCost: 40.0, inkCost: 105.0, total: 1045.0 },
  { date: '2026-05-03', filmCost: 875.0, paperCost: 35.0, inkCost: 98.0, total: 1008.0 },
]

// ============================================================
// 辅助函数
// ============================================================

// 获取状态颜色
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return C.success
    case 'offline': return C.danger
    case 'printing': return C.info
    case 'queued': return C.warning
    case 'completed': return C.success
    case 'failed': return C.danger
    case 'error': return C.danger
    default: return C.textLight
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'printing': return '打印中'
    case 'queued': return '排队中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    case 'error': return '错误'
    default: return '未知'
  }
}

// 获取设备图标
const getModalityIcon = (modality: string): React.ReactNode => {
  switch (modality) {
    case 'CT': return <Monitor size={16} />
    case 'MR': return <Layers size={16} />
    case 'DR': return <HardDrive size={16} />
    default: return <Printer size={16} />
  }
}

// ============================================================
// 卡片组件
// ============================================================
interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ title, icon, children, style }) => (
  <div style={{
    background: C.white,
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: `1px solid ${C.border}`,
    ...style
  }}>
    {title && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${C.border}`
      }}>
        {icon && <span style={{ color: C.primary }}>{icon}</span>}
        <span style={{ fontWeight: 600, fontSize: 14, color: C.textDark }}>{title}</span>
      </div>
    )}
    {children}
  </div>
)

// 标签页组件
interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div style={{
    display: 'flex', gap: 4, marginBottom: 16,
    background: C.bg, borderRadius: 6, padding: 4
  }}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          flex: 1, padding: '8px 12px', border: 'none', borderRadius: 4,
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          background: activeTab === tab.id ? C.white : 'transparent',
          color: activeTab === tab.id ? C.primary : C.textMid,
          boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ marginRight: 6 }}>{tab.icon}</span>
        {tab.label}
      </button>
    ))}
  </div>
)

// 状态标签组件
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
    background: `${getStatusColor(status)}20`,
    color: getStatusColor(status)
  }}>
    {status === 'online' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(status) }} />}
    {getStatusText(status)}
  </span>
)

// 进度条组件
interface ProgressBarProps {
  progress: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color }) => (
  <div style={{ width: '100%', height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
    <div style={{
      width: `${progress}%`, height: '100%',
      background: color || C.primary,
      borderRadius: 3, transition: 'width 0.3s'
    }} />
  </div>
)

// 搜索栏组件
interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', flex: 1 }}>
    <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
        border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13,
        outline: 'none', boxSizing: 'border-box'
      }}
    />
  </div>
)

// ============================================================
// 主组件
// ============================================================
export default function PrintManagementPage() {
  // 状态定义
  const [activeSection, setActiveSection] = useState<string>('printConfig')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null)
  const [showPrinterModal, setShowPrinterModal] = useState<boolean>(false)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)
  const [previewItem, setPreviewItem] = useState<any>(null)

  // 打印配置相关状态
  const [printers] = useState(PRINTERS)
  const [filmSpecs] = useState(FILM_SPECS)
  const [dicomPresets] = useState(DICOM_PRESETS)
  const [reportTemplates] = useState(REPORT_TEMPLATES)
  const [printQueue] = useState(PRINT_QUEUE)
  const [printHistory] = useState(PRINT_HISTORY)

  // 统计相关状态
  const [filmUsageStats] = useState(FILM_USAGE_STATS)
  const [devicePrintStats] = useState(DEVICE_PRINT_STATS)
  const [consumableCosts] = useState(CONSUMABLE_COSTS)
  const [efficiencyStats] = useState(EFFICIENCY_STATS)

  // 配置默认值
  const [defaultCopies, setDefaultCopies] = useState<number>(1)
  const [defaultFilmSpec, setDefaultFilmSpec] = useState<string>('14x17')
  const [selectedPreset, setSelectedPreset] = useState<string>('DP001')

  // 批量打印选中
  const [selectedQueueItems, setSelectedQueueItems] = useState<string[]>([])

  // 模板预览/编辑状态
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  // 刷新/暂停队列状态
  const [queuePaused, setQueuePaused] = useState<boolean>(false)

  // Toast状态
  const [toastMessage, setToastMessage] = useState<string>('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [showToast, setShowToast] = useState<boolean>(false)

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'primary' | 'danger';
  }>({ show: false, title: '', message: '', onConfirm: () => {} })

  // 模板编辑弹窗状态
  const [showTemplateEditModal, setShowTemplateEditModal] = useState<boolean>(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [isNewTemplate, setIsNewTemplate] = useState<boolean>(false)

  // 显示Toast的辅助函数
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // DICOM打印队列相关状态
  const [dicomQueueSearch, setDicomQueueSearch] = useState<string>('')
  const [selectedFilmSpec, setSelectedFilmSpec] = useState<string>('14x17')
  const [selectedMediumType, setSelectedMediumType] = useState<string>('BLUE_FILM')
  const [printCopies, setPrintCopies] = useState<number>(1)
  const [customFilmWidth, setCustomFilmWidth] = useState<string>('')
  const [customFilmHeight, setCustomFilmHeight] = useState<string>('')

  // 统计卡片数据
  const todayPrints = printHistory.filter(p => p.printTime.startsWith('2026-05-02')).length
  const todayFilms = filmUsageStats.find(f => f.date === '05-02')?.total || 0
  const todayCost = filmUsageStats.find(f => f.date === '05-02')?.cost || 0
  const activePrinters = printers.filter(p => p.status === 'online').length

  // 打印量趋势数据
  const trendData = filmUsageStats.map(f => ({
    date: f.date,
    prints: f.total,
    cost: f.cost
  }))

  // 胶片规格分布
  const filmDistData = [
    { name: '14×17', value: filmUsageStats.reduce((sum, f) => sum + f.films14x17, 0), color: C.primary },
    { name: '10×12', value: filmUsageStats.reduce((sum, f) => sum + f.films10x12, 0), color: C.accent },
    { name: '8×10', value: filmUsageStats.reduce((sum, f) => sum + f.films8x10, 0), color: '#8b5cf6' },
  ]

  // 各设备打印占比
  const deviceDistData = DEVICE_PRINT_STATS.map(d => ({
    name: d.device,
    value: d.printCount,
    color: ['#1e40af', '#0891b2', '#8b5cf6', '#d97706', '#dc2626'][DEVICE_PRINT_STATS.indexOf(d) % 5]
  }))

  // DICOM打印队列表格筛选
  const filteredDicomTasks = DICOM_PRINT_TASKS.filter(task =>
    task.patientName.includes(dicomQueueSearch) ||
    task.patientId.includes(dicomQueueSearch) ||
    task.studyType.includes(dicomQueueSearch)
  )

  // DICOM统计
  const dicomQueuedCount = DICOM_PRINT_TASKS.filter(t => t.status === 'queued').length
  const dicomPrintingCount = DICOM_PRINT_TASKS.filter(t => t.status === 'printing').length
  const dicomCompletedCount = DICOM_PRINT_TASKS.filter(t => t.status === 'completed').length
  const dicomFailedCount = DICOM_PRINT_TASKS.filter(t => t.status === 'failed').length

  // ============================================================
  // 事件处理函数
  // ============================================================

  // 编辑DICOM预设
  const handleEditDicomPreset = (): void => {
    const preset = dicomPresets.find(p => p.id === selectedPreset)
    setConfirmModal({
      show: true,
      title: '编辑DICOM预设',
      message: `确定要编辑预设 "${preset?.name || selectedPreset}" 吗？`,
      confirmText: '确定',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast(`已提交编辑请求: ${preset?.name || selectedPreset}`, 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // 预览模板
  const handlePreviewTemplate = (template: any): void => {
    setPreviewTemplate(template)
    setConfirmModal({
      show: true,
      title: '预览模板',
      message: `即将预览模板 "${template.name}"`,
      confirmText: '预览',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast(`正在预览: ${template.name}`, 'info')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // 编辑模板
  const handleEditTemplate = (template: any): void => {
    setEditingTemplate(template)
    setIsNewTemplate(false)
    setShowTemplateEditModal(true)
  }

  // 新建模板
  const handleNewTemplate = (): void => {
    setIsNewTemplate(true)
    setEditingTemplate({ name: '', type: 'CT', copies: 1, includeImages: true, includeLogo: true })
    setShowTemplateEditModal(true)
  }

  // 立即打印报告
  const handlePrintReport = (): void => {
    setConfirmModal({
      show: true,
      title: '确认打印',
      message: '确定要立即打印此报告吗？',
      confirmText: '打印',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast('报告已开始打印', 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // 下载PDF
  const handleDownloadPdf = (): void => {
    setConfirmModal({
      show: true,
      title: '确认下载',
      message: '确定要下载此报告的PDF文件吗？',
      confirmText: '下载',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast('PDF文件已开始下载', 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // 刷新队列
  const handleRefreshQueue = (): void => {
    displayToast('打印队列已刷新', 'success')
  }

  // 暂停/恢复队列
  const handleTogglePauseQueue = (): void => {
    setQueuePaused(!queuePaused)
    displayToast(queuePaused ? '打印队列已恢复' : '打印队列已暂停', 'success')
  }

  // 立即打印胶片任务
  const handlePrintFilmNow = (item: any): void => {
    setConfirmModal({
      show: true,
      title: '确认立即打印',
      message: `确定要立即打印 ${item.patientName} 的胶片任务吗？`,
      confirmText: '打印',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast(`已开始打印: ${item.patientName}`, 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // 重新打印
  const handleReprint = (): void => {
    if (previewItem) {
      setConfirmModal({
        show: true,
        title: '确认重新打印',
        message: `确定要重新打印 ${previewItem.patientName} 的胶片吗？`,
        confirmText: '重新打印',
        cancelText: '取消',
        type: 'primary',
        onConfirm: () => {
          displayToast(`已开始重新打印: ${previewItem.patientName}`, 'success')
          setShowPreviewModal(false)
          setConfirmModal(prev => ({ ...prev, show: false }))
        }
      })
    }
  }

  // DICOM打印队列操作
  const handleDicomPrintNow = (taskId: string): void => {
    setConfirmModal({
      show: true,
      title: '确认立即打印',
      message: `确定要立即打印任务 ${taskId} 吗？`,
      confirmText: '打印',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast(`已开始打印任务: ${taskId}`, 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  const handleCancelTask = (taskId: string): void => {
    setConfirmModal({
      show: true,
      title: '确认取消任务',
      message: `确定要取消任务 ${taskId} 吗？此操作无法撤销。`,
      confirmText: '取消任务',
      cancelText: '返回',
      type: 'danger',
      onConfirm: () => {
        displayToast(`已取消任务: ${taskId}`, 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  const handleRetryTask = (taskId: string): void => {
    setConfirmModal({
      show: true,
      title: '确认重试任务',
      message: `确定要重试任务 ${taskId} 吗？`,
      confirmText: '重试',
      cancelText: '取消',
      type: 'primary',
      onConfirm: () => {
        displayToast(`已开始重试任务: ${taskId}`, 'success')
        setConfirmModal(prev => ({ ...prev, show: false }))
      }
    })
  }

  // ============================================================
  // 渲染函数
  // ============================================================

  // 渲染打印配置管理
  const renderPrintConfig = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* 打印机列表 */}
      <Card title="打印机列表" icon={<Printer size={16} />}>
        <div style={{ marginBottom: 12 }}>
          <SearchBar value={searchKeyword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchKeyword(e.target.value)} placeholder="搜索打印机..." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {printers.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase())).map(printer => (
            <div
              key={printer.id}
              onClick={() => { setSelectedPrinter(printer); setShowPrinterModal(true) }}
              style={{
                padding: 10, borderRadius: 4, border: `1px solid ${C.border}`,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: selectedPrinter?.id === printer.id ? C.primaryLighter : C.white
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {printer.type === 'network' ? <Network size={14} /> : <HardDrive size={14} />}
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{printer.name}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  <span style={{ marginRight: 12 }}>{printer.location}</span>
                  <span>默认: {printer.defaultCopies}份</span>
                </div>
              </div>
              <StatusBadge status={printer.status} />
            </div>
          ))}
        </div>
        <button
          onClick={() => { setSelectedPrinter(null); setShowPrinterModal(true) }}
          style={{
            marginTop: 12, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 4,
            background: C.primary, color: C.white, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <Plus size={14} /> 添加打印机
        </button>
      </Card>

      {/* 胶片规格配置 */}
      <Card title="胶片规格配置" icon={<Film size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filmSpecs.map(spec => (
            <div
              key={spec.id}
              style={{
                padding: 10, borderRadius: 4, border: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: spec.code === defaultFilmSpec ? C.primaryLighter : C.white
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{spec.name}</span>
                  {spec.default && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: C.primary, color: C.white }}>
                      默认
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                  尺寸: {spec.size} | 分辨率: {spec.dpi}
                </div>
              </div>
              <button
                onClick={() => setDefaultFilmSpec(spec.code)}
                style={{
                  padding: '4px 12px', border: `1px solid ${C.border}`, borderRadius: 4,
                  background: spec.code === defaultFilmSpec ? C.primary : C.white,
                  color: spec.code === defaultFilmSpec ? C.white : C.textMid,
                  fontSize: 12, cursor: 'pointer'
                }}
              >
                {spec.code === defaultFilmSpec ? '已默认' : '设为默认'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 默认打印设置 */}
      <Card title="默认打印设置" icon={<Settings size={16} />}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 6 }}>默认打印份数</label>
            <select
              value={defaultCopies}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDefaultCopies(Number(e.target.value))}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13, outline: 'none'
              }}
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} 份</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 6 }}>默认胶片规格</label>
            <select
              value={defaultFilmSpec}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDefaultFilmSpec(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13, outline: 'none'
              }}
            >
              {filmSpecs.map(spec => <option key={spec.id} value={spec.code}>{spec.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* DICOM打印参数 */}
      <Card title="DICOM打印参数" icon={<Database size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dicomPresets.map(preset => (
            <div
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              style={{
                padding: 10, borderRadius: 4, border: `1px solid ${C.border}`,
                cursor: 'pointer',
                background: preset.id === selectedPreset ? C.primaryLighter : C.white
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{preset.name}</span>
                {preset.id === selectedPreset && <CheckCircle size={16} color={C.primary} />}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '方向', value: preset.orientation },
                  { label: '介质', value: preset.mediumType },
                  { label: '输出', value: preset.filmDestination },
                  { label: '裁剪', value: preset.trimming },
                ].map(p => (
                  <span key={p.label} style={{ fontSize: 11, padding: '2px 6px', background: C.bg, borderRadius: 3, color: C.textMid }}>
                    {p.label}: {p.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleEditDicomPreset}
          style={{
            marginTop: 12, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 4,
            background: C.accent, color: C.white, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <Cog size={14} /> 编辑DICOM预设
        </button>
      </Card>
    </div>
  )

  // 渲染图文报告打印
  const renderReportPrint = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* 报告打印模板 */}
      <Card title="报告打印模板" icon={<ScrollText size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reportTemplates.map(template => (
            <div
              key={template.id}
              style={{
                padding: 10, borderRadius: 4, border: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{template.name}</span>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 10,
                    background: `${C.accent}20`, color: C.accent
                  }}>
                    {template.type}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.textMid, display: 'flex', gap: 8 }}>
                  <span>默认 {template.copies} 份</span>
                  {template.includeImages && <span>含图像</span>}
                  {template.includeLogo && <span>含Logo</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => handlePreviewTemplate(template)} style={{ padding: 6, border: 'none', borderRadius: 4, background: C.primaryLighter, cursor: 'pointer' }}>
                  <Eye size={14} color={C.primary} />
                </button>
                <button onClick={() => handleEditTemplate(template)} style={{ padding: 6, border: 'none', borderRadius: 4, background: C.bg, cursor: 'pointer' }}>
                  <Edit2 size={14} color={C.textMid} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleNewTemplate}
          style={{
            marginTop: 12, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 4,
            background: C.primary, color: C.white, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <Plus size={14} /> 新建模板
        </button>
      </Card>

      {/* 打印预览 */}
      <Card title="打印预览" icon={<Eye size={16} />}>
        <div style={{
          background: C.bg, borderRadius: 4, padding: 16, minHeight: 300,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <FileText size={48} color={C.textLight} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: C.textMid, margin: 0 }}>选择报告进行预览</p>
          <p style={{ fontSize: 12, color: C.textLight, margin: '8px 0 0 0' }}>
            支持实时预览报告排版和图像布局
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={handlePrintReport} style={{
            flex: 1, padding: '8px 12px', border: 'none', borderRadius: 4,
            background: C.primary, color: C.white, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Printer size={14} /> 立即打印
          </button>
          <button onClick={handleDownloadPdf} style={{
            flex: 1, padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 4,
            background: C.white, color: C.textMid, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Download size={14} /> 下载PDF
          </button>
        </div>
      </Card>

      {/* 批量打印 */}
      <Card title="批量打印" icon={<Copy size={16} />}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.textMid }}>
              已选择 <span style={{ color: C.primary, fontWeight: 600 }}>{selectedQueueItems.length}</span> 份报告
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedQueueItems(printHistory.map((_: any, i: number) => `batch-${i}`))}
                style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                全选
              </button>
              <button
                onClick={() => setSelectedQueueItems([])}
                style={{ fontSize: 12, color: C.textMid, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                清空
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {printHistory.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  const key = `batch-${idx}`
                  setSelectedQueueItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 4, border: `1px solid ${C.border}`, cursor: 'pointer',
                  background: selectedQueueItems.includes(`batch-${idx}`) ? C.primaryLighter : C.white
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedQueueItems.includes(`batch-${idx}`)}
                  onChange={() => {}}
                  style={{ accentColor: C.primary }}
                />
                <span style={{ fontSize: 12, color: C.textDark }}>{item.patientName}</span>
                <span style={{ fontSize: 11, color: C.textLight }}>{item.modality} - {item.studyDesc}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          disabled={selectedQueueItems.length === 0}
          style={{
            width: '100%', padding: '8px 12px', border: 'none', borderRadius: 4,
            background: selectedQueueItems.length > 0 ? C.primary : C.border,
            color: C.white, fontSize: 13, cursor: selectedQueueItems.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <Printer size={14} /> 批量打印 ({selectedQueueItems.length})
        </button>
      </Card>

      {/* 打印记录 */}
      <Card title="打印记录" icon={<FileBarChart size={16} />}>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: C.textMid, fontWeight: 500 }}>患者</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: C.textMid, fontWeight: 500 }}>检查</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: C.textMid, fontWeight: 500 }}>时间</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', color: C.textMid, fontWeight: 500 }}>费用</th>
              </tr>
            </thead>
            <tbody>
              {printHistory.map(record => (
                <tr key={record.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '6px' }}>
                    <div style={{ fontWeight: 500, color: C.textDark }}>{record.patientName}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{record.patientId}</div>
                  </td>
                  <td style={{ padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {getModalityIcon(record.modality)}
                      <span>{record.modality}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{record.studyDesc}</div>
                  </td>
                  <td style={{ padding: '6px', color: C.textMid }}>{record.printTime.slice(11)}</td>
                  <td style={{ padding: '6px', color: C.success, fontWeight: 500 }}>¥{record.cost.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  // 渲染胶片打印管理
  const renderFilmPrintManagement = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* 胶片打印队列 */}
      <Card title="胶片打印队列" icon={<Layers size={16} />} style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleRefreshQueue} style={{
              padding: '4px 12px', borderRadius: 4, border: 'none', fontSize: 12,
              background: C.primary, color: C.white, cursor: 'pointer'
            }}>
              刷新
            </button>
            <button onClick={handleTogglePauseQueue} style={{
              padding: '4px 12px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12,
              background: C.white, color: C.textMid, cursor: 'pointer'
            }}>
              {queuePaused ? '恢复全部' : '暂停全部'}
            </button>
          </div>
          <span style={{ fontSize: 12, color: C.textMid }}>
            队列: <span style={{ color: C.primary }}>{printQueue.length}</span> 项
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {printQueue.map(item => (
            <div
              key={item.id}
              style={{
                padding: 12, borderRadius: 4, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 12
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {getModalityIcon(item.modality)}
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{item.patientName}</span>
                  <span style={{ fontSize: 11, padding: '1px 6px', background: `${C.accent}20`, color: C.accent, borderRadius: 3 }}>
                    {item.modality}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>
                  {item.studyDesc} | 规格: {item.filmSpec} | 份数: {item.copies}
                </div>
                {item.status === 'printing' && (
                  <ProgressBar progress={item.progress} />
                )}
                {item.status === 'error' && (
                  <div style={{ fontSize: 11, color: C.danger }}>错误: {item.errorMsg}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {item.status === 'queued' && (
                  <button onClick={() => handlePrintFilmNow(item)} style={{ padding: 6, border: 'none', borderRadius: 4, background: C.primary, cursor: 'pointer' }}>
                    <Zap size={14} color={C.white} />
                  </button>
                )}
                <button
                  onClick={() => { setPreviewItem(item); setShowPreviewModal(true) }}
                  style={{ padding: 6, border: 'none', borderRadius: 4, background: C.bg, cursor: 'pointer' }}
                >
                  <Eye size={14} color={C.textMid} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 打印状态追踪 */}
      <Card title="打印状态追踪" icon={<Activity size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '在线打印机', value: activePrinters, total: printers.length, color: C.success },
            { label: '排队任务', value: printQueue.filter(q => q.status === 'queued').length, total: printQueue.length, color: C.warning },
            { label: '正在打印', value: printQueue.filter(q => q.status === 'printing').length, total: printQueue.length, color: C.info },
            { label: '今日完成', value: todayPrints, total: 0, color: C.primary },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: C.textDark }}>{stat.label}</div>
                {stat.total > 0 && <div style={{ fontSize: 11, color: C.textLight }}>总共 {stat.total} 项</div>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 打印费用统计 */}
      <Card title="打印费用统计" icon={<DollarSign size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: 16, background: `${C.success}10`, borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>今日费用</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.success }}>¥{todayCost.toFixed(1)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '打印张数', value: todayFilms, unit: '张' },
              { label: '平均费用', value: todayFilms > 0 ? (todayCost / todayFilms).toFixed(1) : '0', unit: '元/张' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: 10, background: C.bg, borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: C.textMid }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.textDark }}>{item.value} <span style={{ fontSize: 12 }}>{item.unit}</span></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 胶片使用量统计 */}
      <Card title="胶片使用量统计" icon={<BarChart2 size={16} />}>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={filmUsageStats.slice(-7)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textLight} />
              <YAxis tick={{ fontSize: 10 }} stroke={C.textLight} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: C.textDark }}
              />
              <Bar dataKey="films14x17" name="14×17" fill={C.primary} stackId="a" />
              <Bar dataKey="films10x12" name="10×12" fill={C.accent} stackId="a" />
              <Bar dataKey="films8x10" name="8×10" fill="#8b5cf6" stackId="a" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          {[{ label: '14×17', color: C.primary }, { label: '10×12', color: C.accent }, { label: '8×10', color: '#8b5cf6' }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textMid }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  // 渲染DICOM打印队列
  const renderDicomPrintQueue = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* 打印服务器配置面板 */}
      <Card title="打印服务器配置" icon={<Server size={16} />} style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {DICOM_SERVERS.map(server => (
            <div
              key={server.id}
              style={{
                padding: 12, borderRadius: 4, border: `1px solid ${C.border}`,
                background: server.status === 'online' ? `${C.success}05` : `${C.danger}05`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={18} color={server.status === 'online' ? C.success : C.danger} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{server.name}</span>
                </div>
                <StatusBadge status={server.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: C.textLight }}>服务器名称: </span>
                  <span style={{ color: C.textDark }}>{server.aet}</span>
                </div>
                <div>
                  <span style={{ color: C.textLight }}>IP/端口: </span>
                  <span style={{ color: C.textDark }}>{server.ip}:{server.port}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: C.textLight }}>描述: </span>
                  <span style={{ color: C.textDark }}>{server.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DICOM打印机列表 */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 8 }}>DICOM打印机列表</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {DICOM_PRINTERS.map(printer => (
              <div
                key={printer.id}
                style={{
                  padding: 10, borderRadius: 4, border: `1px solid ${C.border}`,
                  background: printer.status === 'online' ? C.white : C.bg,
                  opacity: printer.status === 'online' ? 1 : 0.7
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {printer.status === 'online' ? (
                    <Wifi size={14} color={C.success} />
                  ) : (
                    <WifiOff size={14} color={C.danger} />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>{printer.name}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textMid }}>{printer.location}</div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
                  今日: <span style={{ color: C.primary }}>{printer.filmsToday}</span> 张
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 胶片规格选择 */}
      <Card title="胶片规格选择" icon={<Film size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 6 }}>胶片规格</label>
            <select
              value={selectedFilmSpec}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFilmSpec(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13, outline: 'none', background: C.white
              }}
            >
              {FILM_SPEC_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {selectedFilmSpec === 'CUSTOM' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 4 }}>宽度(cm)</label>
                <input
                  type="text"
                  value={customFilmWidth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomFilmWidth(e.target.value)}
                  placeholder="例: 35"
                  style={{
                    width: '100%', padding: '6px 10px', border: `1px solid ${C.border}`,
                    borderRadius: 4, fontSize: 12, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 4 }}>高度(cm)</label>
                <input
                  type="text"
                  value={customFilmHeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomFilmHeight(e.target.value)}
                  placeholder="例: 43"
                  style={{
                    width: '100%', padding: '6px 10px', border: `1px solid ${C.border}`,
                    borderRadius: 4, fontSize: 12, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 6 }}>介质类型</label>
            <select
              value={selectedMediumType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMediumType(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13, outline: 'none', background: C.white
              }}
            >
              {MEDIUM_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: C.textMid, marginBottom: 6 }}>打印份数</label>
            <select
              value={printCopies}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrintCopies(Number(e.target.value))}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13, outline: 'none', background: C.white
              }}
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} 份</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 打印状态统计 */}
      <Card title="DICOM打印状态" icon={<Activity size={16} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            { label: '排队中', value: dicomQueuedCount, color: C.warning },
            { label: '打印中', value: dicomPrintingCount, color: C.info },
            { label: '已完成', value: dicomCompletedCount, color: C.success },
            { label: '失败', value: dicomFailedCount, color: C.danger },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                padding: 12, borderRadius: 4, background: `${stat.color}10`,
                border: `1px solid ${stat.color}30`, textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: C.textMid }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: C.bg, borderRadius: 4 }}>
          <div style={{ fontSize: 12, color: C.textMid }}>
            今日总任务: <span style={{ color: C.primary, fontWeight: 600 }}>{DICOM_PRINT_TASKS.length}</span> 项
          </div>
        </div>
      </Card>

      {/* 打印队列表格 */}
      <Card title="DICOM打印队列" icon={<FileSpreadsheet size={16} />} style={{ gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SearchBar
            value={dicomQueueSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDicomQueueSearch(e.target.value)}
            placeholder="搜索患者姓名/ID/检查类型..."
          />
          <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <button
              onClick={handleRefreshQueue}
              style={{
                padding: '6px 12px', borderRadius: 4, border: `1px solid ${C.border}`,
                background: C.white, color: C.textMid, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <RefreshCw size={14} /> 刷新
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['任务ID', '患者姓名', '检查类型', '胶片规格', '份数', '状态', '提交时间', '完成时间', '操作'].map(header => (
                  <th
                    key={header}
                    style={{
                      padding: '10px 8px', textAlign: 'left', color: C.textMid,
                      fontWeight: 500, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap'
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDicomTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: C.textMid }}>{task.id}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: 500, color: C.textDark }}>{task.patientName}</div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{task.patientId}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {getModalityIcon(task.modality)}
                      <span>{task.modality}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight }}>{task.studyType}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ padding: '2px 6px', background: `${C.primary}15`, color: C.primary, borderRadius: 3, fontSize: 11 }}>
                      {task.filmSpec}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{task.copies}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td style={{ padding: '10px 8px', color: C.textMid }}>{task.submitTime}</td>
                  <td style={{ padding: '10px 8px', color: C.textMid }}>
                    {task.completeTime || '-'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {task.status === 'queued' && (
                        <button
                          onClick={() => handleDicomPrintNow(task.id)}
                          style={{
                            padding: '4px 8px', border: 'none', borderRadius: 3,
                            background: C.primary, color: C.white, fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          立即打印
                        </button>
                      )}
                      {task.status === 'failed' && (
                        <button
                          onClick={() => handleRetryTask(task.id)}
                          style={{
                            padding: '4px 8px', border: 'none', borderRadius: 3,
                            background: C.warning, color: C.white, fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          重试
                        </button>
                      )}
                      {(task.status === 'queued' || task.status === 'failed') && (
                        <button
                          onClick={() => handleCancelTask(task.id)}
                          style={{
                            padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 3,
                            background: C.white, color: C.danger, fontSize: 11, cursor: 'pointer'
                          }}
                        >
                          取消
                        </button>
                      )}
                      {task.status === 'printing' && (
                        <span style={{ fontSize: 11, color: C.info }}>打印中...</span>
                      )}
                      {task.status === 'completed' && (
                        <span style={{ fontSize: 11, color: C.success }}>已完成</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 打印计费 - 各规格单价 */}
      <Card title="各规格单价（元/张）" icon={<Receipt size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FILM_PRICE_CONFIG.map(item => (
            <div
              key={item.spec}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 4, background: C.bg
              }}
            >
              <span style={{ fontSize: 13, color: C.textDark }}>{item.spec}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.success }}>¥{item.pricePerSheet.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 打印计费 - 科室计费统计 */}
      <Card title="科室计费统计" icon={<Building2 size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DEPARTMENT_BILLING.map(dept => (
            <div
              key={dept.dept}
              style={{
                padding: 10, borderRadius: 4, border: `1px solid ${C.border}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{dept.dept}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.success }}>¥{dept.amount.toFixed(1)}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.textMid }}>
                <span>患者: {dept.patientCount}</span>
                <span>胶片: {dept.filmCount}张</span>
              </div>
              <div style={{ marginTop: 6, height: 4, background: C.bg, borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(dept.filmCount / 350) * 100}%`,
                    background: C.primary,
                    borderRadius: 2
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 打印计费 - 打印成本报表 */}
      <Card title="打印成本报表" icon={<FileBarChart size={16} />} style={{ gridColumn: 'span 2' }}>
        <div style={{ height: 200, marginBottom: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={COST_REPORT} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textLight} />
              <YAxis tick={{ fontSize: 10 }} stroke={C.textLight} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: C.textDark }}
              />
              <Bar dataKey="filmCost" name="胶片成本" fill={C.primary} stackId="a" />
              <Bar dataKey="paperCost" name="纸张成本" fill={C.accent} stackId="a" />
              <Bar dataKey="inkCost" name="油墨成本" fill="#8b5cf6" stackId="a" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          {[
            { label: '胶片成本', color: C.primary },
            { label: '纸张成本', color: C.accent },
            { label: '油墨成本', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.textMid }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  // 渲染打印统计
  const renderPrintStatistics = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* 打印量趋势 */}
      <Card title="打印量趋势" icon={<TrendingUp size={16} />} style={{ gridColumn: 'span 2' }}>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={C.textLight} />
              <YAxis tick={{ fontSize: 10 }} stroke={C.textLight} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: C.textDark }}
              />
              <Area type="monotone" dataKey="prints" name="打印张数" stroke={C.primary} fill={C.primaryLighter} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 各设备打印量 */}
      <Card title="各设备打印量" icon={<Monitor size={16} />}>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={DEVICE_PRINT_STATS} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="device" tick={{ fontSize: 10 }} stroke={C.textLight} />
              <YAxis tick={{ fontSize: 10 }} stroke={C.textLight} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: C.textDark }}
              />
              <Bar dataKey="printCount" name="打印次数" fill={C.primary} radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 耗材成本分析 */}
      <Card title="耗材成本分析" icon={<Box size={16} />}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ height: 200, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={filmDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: C.textLight, strokeWidth: 1 }}
                >
                  {filmDistData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                  formatter={(value: number) => [`${value} 张`, '使用量']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {CONSUMABLE_COSTS.map(item => (
              <div key={item.name} style={{ fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid, marginBottom: 2 }}>
                  <span>{item.name}</span>
                  <span>¥{item.total.toFixed(1)}</span>
                </div>
                <ProgressBar progress={(item.used / 500) * 100} color={C.accent} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 打印效率统计 */}
      <Card title="打印效率统计" icon={<Timer size={16} />}>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={EFFICIENCY_STATS} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke={C.textLight} />
              <YAxis tick={{ fontSize: 10 }} stroke={C.textLight} />
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: C.textDark }}
                formatter={(value: number, name: string) => [
                  name === 'avgTime' ? `${value}秒` : `${value}份`,
                  name === 'avgTime' ? '平均耗时' : '完成数'
                ]}
              />
              <Line type="monotone" dataKey="avgTime" name="平均耗时" stroke={C.warning} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" name="完成数" stroke={C.success} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 设备打印占比 */}
      <Card title="设备打印占比" icon={<PieChart size={16} />}>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={deviceDistData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: C.textLight, strokeWidth: 1 }}
              >
                {deviceDistData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }}
                formatter={(value: number) => [`${value} 次`, '打印次数']}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )

  // ============================================================
  // 弹窗渲染
  // ============================================================

  // 打印机详情弹窗
  const renderPrinterModal = () => {
    if (!showPrinterModal) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: C.white, borderRadius: 8, padding: 24, width: 480,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>
              {selectedPrinter ? '编辑打印机' : '添加打印机'}
            </span>
            <button onClick={() => setShowPrinterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color={C.textMid} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '打印机名称', key: 'name', type: 'input' },
              { label: '位置', key: 'location', type: 'input' },
              { label: '类型', key: 'type', type: 'select', options: ['network', 'local'] },
              { label: '默认胶片规格', key: 'filmSpec', type: 'select', options: ['14x17', '10x12', '8x10'] },
              { label: '默认打印份数', key: 'defaultCopies', type: 'select', options: [1, 2, 3] },
              { label: '分辨率(DPI)', key: 'dpi', type: 'select', options: [300, 600, 1200] },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 4 }}>{field.label}</label>
                {field.type === 'input' ? (
                  <input
                    type="text"
                    defaultValue={selectedPrinter?.[field.key] || ''}
                    style={{
                      width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                      borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <select
                    defaultValue={selectedPrinter?.[field.key] || field.options[0]}
                    style={{
                      width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`,
                      borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    {field.options.map((opt: any) => (
                      <option key={opt} value={opt}>{field.key === 'type' ? (opt === 'network' ? '网络打印机' : '本地打印机') : opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button
              onClick={() => setShowPrinterModal(false)}
              style={{
                flex: 1, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 4,
                background: C.white, color: C.textMid, fontSize: 13, cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button
              onClick={() => setShowPrinterModal(false)}
              style={{
                flex: 1, padding: '10px 12px', border: 'none', borderRadius: 4,
                background: C.primary, color: C.white, fontSize: 13, cursor: 'pointer'
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 预览弹窗
  const renderPreviewModal = () => {
    if (!showPreviewModal || !previewItem) return null
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: C.white, borderRadius: 8, padding: 24, width: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>胶片打印预览</span>
            <button onClick={() => setShowPreviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color={C.textMid} />
            </button>
          </div>
          <div style={{ background: C.bg, borderRadius: 4, padding: 20, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Film size={48} color={C.primary} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {[
                { label: '患者姓名', value: previewItem.patientName },
                { label: '患者ID', value: previewItem.patientId },
                { label: '检查项目', value: previewItem.studyDesc },
                { label: '设备类型', value: previewItem.modality },
                { label: '胶片规格', value: previewItem.filmSpec },
                { label: '打印份数', value: `${previewItem.copies} 份` },
              ].map(item => (
                <div key={item.label} style={{ padding: '6px 8px', background: C.white, borderRadius: 4 }}>
                  <div style={{ fontSize: 11, color: C.textLight, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: C.textDark, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
            {previewItem.status === 'printing' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: C.textMid }}>打印进度</span>
                  <span style={{ color: C.primary }}>{previewItem.progress}%</span>
                </div>
                <ProgressBar progress={previewItem.progress} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowPreviewModal(false)}
              style={{
                flex: 1, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 4,
                background: C.white, color: C.textMid, fontSize: 13, cursor: 'pointer'
              }}
            >
              关闭
            </button>
            <button
              onClick={handleReprint}
              style={{
                flex: 1, padding: '10px 12px', border: 'none', borderRadius: 4,
                background: C.primary, color: C.white, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Printer size={14} /> 重新打印
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // Toast提示组件
  // ============================================================
  const Toast = () => {
    if (!showToast) return null
    const toastColors = {
      success: { bg: '#059669', text: '#ffffff' },
      error: { bg: '#dc2626', text: '#ffffff' },
      info: { bg: '#2563eb', text: '#ffffff' }
    }
    const colors = toastColors[toastType]
    return (
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: colors.bg,
        color: colors.text,
        padding: '12px 20px',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {toastType === 'success' && <CheckCircle size={18} />}
        {toastType === 'error' && <XCircle size={18} />}
        {toastType === 'info' && <Info size={18} />}
        <span style={{ fontSize: 14, fontWeight: 500 }}>{toastMessage}</span>
      </div>
    )
  }

  // ============================================================
  // 确认弹窗组件
  // ============================================================
  const ConfirmModal = () => {
    if (!confirmModal.show) return null
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500
      }}>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: 24,
          width: 400,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            {confirmModal.type === 'danger' ? (
              <AlertCircle size={24} color={C.danger} />
            ) : (
              <Info size={24} color={C.primary} />
            )}
            <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>
              {confirmModal.title}
            </span>
          </div>
          <p style={{ fontSize: 14, color: C.textMid, marginBottom: 20 }}>
            {confirmModal.message}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                background: C.white,
                color: C.textMid,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {confirmModal.cancelText || '取消'}
            </button>
            <button
              onClick={confirmModal.onConfirm}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: 4,
                background: confirmModal.type === 'danger' ? C.danger : C.primary,
                color: C.white,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {confirmModal.confirmText || '确定'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 模板编辑弹窗组件
  // ============================================================
  const TemplateEditModal = () => {
    if (!showTemplateEditModal) return null
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: C.white,
          borderRadius: 8,
          padding: 24,
          width: 480,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>
              {isNewTemplate ? '新建模板' : '编辑模板'}
            </span>
            <button
              onClick={() => setShowTemplateEditModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color={C.textMid} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 4 }}>
                模板名称
              </label>
              <input
                type="text"
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                placeholder="请输入模板名称"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 4 }}>
                报告类型
              </label>
              <select
                value={editingTemplate?.type || 'CT'}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  fontSize: 13,
                  outline: 'none',
                  background: C.white
                }}
              >
                <option value="CT">CT</option>
                <option value="MR">MR</option>
                <option value="DR">DR</option>
                <option value="介入">介入</option>
                <option value="急诊">急诊</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: C.textMid, marginBottom: 4 }}>
                默认份数
              </label>
              <select
                value={editingTemplate?.copies || 1}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, copies: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  fontSize: 13,
                  outline: 'none',
                  background: C.white
                }}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} 份</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button
              onClick={() => setShowTemplateEditModal(false)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                background: C.white,
                color: C.textMid,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button
              onClick={() => {
                displayToast(isNewTemplate ? '模板已创建' : '模板已保存', 'success')
                setShowTemplateEditModal(false)
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: 4,
                background: C.primary,
                color: C.white,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 主渲染
  // ============================================================

  const sections: Tab[] = [
    { id: 'printConfig', label: '打印配置', icon: <Settings size={14} /> },
    { id: 'reportPrint', label: '图文报告', icon: <FileText size={14} /> },
    { id: 'filmPrint', label: '胶片打印', icon: <Film size={14} /> },
    { id: 'dicPrint', label: 'DICOM打印队列', icon: <Database size={14} /> },
    { id: 'statistics', label: '打印统计', icon: <BarChart size={14} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: 16 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.textDark, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Printer size={24} color={C.primary} />
          胶片打印管理
        </h1>
        <p style={{ fontSize: 13, color: C.textMid, margin: '4px 0 0 0' }}>
          管理打印设备、胶片规格、打印队列和统计分析
        </p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '今日打印', value: todayPrints, unit: '份', icon: <Printer size={20} />, color: C.primary },
          { label: '使用胶片', value: todayFilms, unit: '张', icon: <Film size={20} />, color: C.accent },
          { label: '今日费用', value: `¥${todayCost.toFixed(0)}`, unit: '', icon: <DollarSign size={20} />, color: C.success },
          { label: '在线打印机', value: activePrinters, unit: `/ ${printers.length}`, icon: <Network size={20} />, color: C.warning },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: C.white, borderRadius: 6, padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 12
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 8, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.textMid }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.textDark }}>
                {stat.value}
                <span style={{ fontSize: 12, fontWeight: 400, color: C.textLight }}> {stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 标签页切换 */}
      <Tabs tabs={sections} activeTab={activeSection} onChange={setActiveSection} />

      {/* 内容区域 */}
      {activeSection === 'printConfig' && renderPrintConfig()}
      {activeSection === 'reportPrint' && renderReportPrint()}
      {activeSection === 'filmPrint' && renderFilmPrintManagement()}
      {activeSection === 'dicPrint' && renderDicomPrintQueue()}
      {activeSection === 'statistics' && renderPrintStatistics()}

      {/* 弹窗 */}
      {renderPrinterModal()}
      {renderPreviewModal()}
      <Toast />
      <ConfirmModal />
      <TemplateEditModal />
    </div>
  )
}
