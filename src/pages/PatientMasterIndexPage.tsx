// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - PIX/eMPI 患者主索引页 v1.0.0
// 患者主索引管理：跨机构患者匹配、合并、搜索
// ============================================================
import { useState, useMemo, useEffect } from 'react'
import {
  Search, User, Phone, AlertCircle, Calendar, Plus, X, ChevronLeft, ChevronRight,
  Eye, Edit2, FileText, Download, RefreshCw, Filter, ChevronDown, ChevronUp,
  Users, UserCheck, Clock, Activity, Heart, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, PieChart, FilterX, Save, ArrowLeft, Stethoscope, Shield, MapPin,
  Contact, CreditCard, History, Image, PlusCircle, Trash2, UserPlus, Link2,
  GitMerge, Unlink, ArrowRightLeft, CompareArrows, Building2, Wifi, ShieldAlert
} from 'lucide-react'
import { PATIENT_MASTER_INDEX } from '../data/initialData'

// ==================== 类型定义 ====================
type TabKey = 'search' | 'list' | 'detail' | 'merge' | 'linking'
type GenderFilter = '全部' | '男' | '女'
type PatientTypeFilter = '全部' | '门诊' | '住院' | '体检' | '急诊'
type MergeStatus = '待合并' | '已合并' | '已拆分' | '已驳回'

interface PatientMasterRecord {
  id: string
  empiId: string
  name: string
  gender: '男' | '女'
  age: number
  idCard: string
  phone: string
  address: string
  patientType: PatientTypeFilter
  primaryDiagnosis: string
  allergyHistory: string
  registrationDate: string
  linkedFacilities: string[]
  mergeStatus: MergeStatus
  mergedWith?: string
  confidenceScore: number
  lastUpdated: string
}

interface LinkCandidate {
  patientId: string
  name: string
  gender: '男' | '女'
  age: number
  idCard: string
  phone: string
  facility: string
  confidenceScore: number
  matchFields: string[]
}

interface MergeRequest {
  id: string
  primaryPatientId: string
  secondaryPatientId: string
  mergeType: '自动' | '手动'
  status: MergeStatus
  requestedBy: string
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reason: string
}

// ==================== 工具函数 ====================
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

const getAgeFromIdCard = (idCard: string): number => {
  if (!idCard || idCard.length < 6) return 0
  const birthYear = parseInt(idCard.substring(0, 4))
  const currentYear = new Date().getFullYear()
  return currentYear - birthYear
}

const getBirthDateFromIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 14) return '-'
  return `${idCard.substring(0, 4)}-${idCard.substring(4, 6)}-${idCard.substring(6, 8)}`
}

const calculateConfidence = (p1: PatientMasterRecord, p2: LinkCandidate): number => {
  let score = 0
  const fields: string[] = []
  
  if (p1.name === p2.name) { score += 30; fields.push('姓名') }
  if (p1.gender === p2.gender) { score += 15; fields.push('性别') }
  if (p1.idCard === p2.idCard) { score += 35; fields.push('身份证') }
  if (p1.phone === p2.phone) { score += 15; fields.push('电话') }
  if (Math.abs(p1.age - p2.age) <= 2) { score += 5; fields.push('年龄') }
  
  return { score, fields }
}

// ==================== 子组件：统计卡片 ====================
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ==================== 子组件：标签页按钮 ====================
interface TabButtonProps {
  tabKey: TabKey
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  badge?: number | string
}

function TabButton({ label, icon, isActive, onClick, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        border: 'none',
        borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
        background: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#1d4ed8' : '#64748b',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span style={{
          background: isActive ? '#3b82f6' : '#e2e8f0',
          color: isActive ? '#fff' : '#64748b',
          borderRadius: 10,
          padding: '1px 6px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ==================== 子组件：分页控件 ====================
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
    }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>
        显示 {startItem}-{endItem} 条，共 {totalItems} 条记录
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} color="#64748b" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1
          if (totalPages > 5) {
            if (currentPage > 3) {
              pageNum = currentPage - 2 + i
            }
            if (currentPage > totalPages - 2) {
              pageNum = totalPages - 4 + i
            }
          }
          if (pageNum < 1 || pageNum > totalPages) return null
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid',
                borderColor: currentPage === pageNum ? '#3b82f6' : '#e2e8f0',
                background: currentPage === pageNum ? '#3b82f6' : '#fff',
                color: currentPage === pageNum ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '0 8px',
              }}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} color="#64748b" />
        </button>
      </div>
    </div>
  )
}

// ==================== 子组件：高级筛选面板 ====================
interface AdvancedFilters {
  gender: GenderFilter
  ageMin: string
  ageMax: string
  patientType: PatientTypeFilter
  mergeStatus: MergeStatus | '全部'
  linkedFacilities: string
  dateFrom: string
  dateTo: string
}

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters
  onChange: (filters: AdvancedFilters) => void
  onReset: () => void
}

function AdvancedFilterPanel({ filters, onChange, onReset }: AdvancedFilterPanelProps) {
  const mergeStatuses: (MergeStatus | '全部')[] = ['全部', '待合并', '已合并', '已拆分', '已驳回']

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {/* 性别筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>性别</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['全部', '男', '女'] as GenderFilter[]).map(g => (
              <button
                key={g}
                onClick={() => onChange({ ...filters, gender: g })}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: filters.gender === g ? '#3b82f6' : '#e2e8f0',
                  background: filters.gender === g ? '#eff6ff' : '#fff',
                  color: filters.gender === g ? '#1d4ed8' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 年龄范围 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>年龄范围</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              placeholder="最小"
              value={filters.ageMin}
              onChange={e => onChange({ ...filters, ageMin: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <span style={{ color: '#64748b' }}>-</span>
            <input
              type="number"
              placeholder="最大"
              value={filters.ageMax}
              onChange={e => onChange({ ...filters, ageMax: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* 患者类型 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>患者类型</label>
          <select
            value={filters.patientType}
            onChange={e => onChange({ ...filters, patientType: e.target.value as PatientTypeFilter })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
              background: '#fff',
            }}
          >
            {(['全部', '门诊', '住院', '体检', '急诊'] as PatientTypeFilter[]).map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
        </div>

        {/* 合并状态 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>合并状态</label>
          <select
            value={filters.mergeStatus}
            onChange={e => onChange({ ...filters, mergeStatus: e.target.value as MergeStatus | '全部' })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
              background: '#fff',
            }}
          >
            {mergeStatuses.map(ms => (
              <option key={ms} value={ms}>{ms}</option>
            ))}
          </select>
        </div>

        {/* 建档日期从 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期从</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 建档日期至 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期至</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onChange({ ...filters, dateTo: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, gridColumn: 'span 2' }}>
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} />
            重置
          </button>
          <button
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Search size={12} />
            筛选
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 子组件：患者详情面板 ====================
interface PatientDetailPanelProps {
  patient: PatientMasterRecord
  onClose: () => void
  onMerge: (patient: PatientMasterRecord) => void
  onLink: (patient: PatientMasterRecord) => void
}

function PatientDetailPanel({ patient, onClose, onMerge, onLink }: PatientDetailPanelProps) {
  const statusColors: Record<MergeStatus, string> = {
    '待合并': '#f59e0b',
    '已合并': '#10b981',
    '已拆分': '#6366f1',
    '已驳回': '#ef4444',
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 480,
      height: '100vh',
      background: '#fff',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>患者详情</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>EMPI: {patient.empiId}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* 基本信息 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>基本信息</div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>姓名</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>性别</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.gender}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>年龄</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.age}岁</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>患者类型</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.patientType}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>身份证</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.idCard}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>联系电话</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.phone}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>地址</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 医疗信息 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>医疗信息</div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>主要诊断</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.primaryDiagnosis}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b' }}>过敏史</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: patient.allergyHistory === '无' ? '#10b981' : '#ef4444' }}>
                {patient.allergyHistory}
              </div>
            </div>
          </div>
        </div>

        {/* 主索引信息 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>主索引信息</div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>本地ID</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>EMPI ID</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d4ed8' }}>{patient.empiId}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>合并状态</div>
                <div style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: '#fff',
                  background: statusColors[patient.mergeStatus],
                  padding: '2px 8px',
                  borderRadius: 4,
                  display: 'inline-block',
                  marginTop: 2
                }}>
                  {patient.mergeStatus}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>匹配度</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.confidenceScore}%</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>关联机构</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {patient.linkedFacilities.map((facility, i) => (
                    <span key={i} style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#1d4ed8',
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>建档日期</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.registrationDate}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>最后更新</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>{patient.lastUpdated}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{
        padding: 16,
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: 12,
      }}>
        <button
          onClick={() => onMerge(patient)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #3b82f6',
            background: '#fff',
            color: '#3b82f6',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <GitMerge size={16} />
          合并患者
        </button>
        <button
          onClick={() => onLink(patient)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Link2 size={16} />
          跨机构匹配
        </button>
      </div>
    </div>
  )
}

// ==================== 子组件：合并对比面板 ====================
interface MergeComparePanelProps {
  primaryPatient: PatientMasterRecord
  secondaryPatient: PatientMasterRecord | null
  onConfirm: () => void
  onCancel: () => void
}

function MergeComparePanel({ primaryPatient, secondaryPatient, onConfirm, onCancel }: MergeComparePanelProps) {
  if (!secondaryPatient) return null

  const comparisonFields = [
    { label: '姓名', getValue: (p: PatientMasterRecord) => p.name, match: primaryPatient.name === secondaryPatient.name },
    { label: '性别', getValue: (p: PatientMasterRecord) => p.gender, match: primaryPatient.gender === secondaryPatient.gender },
    { label: '年龄', getValue: (p: PatientMasterRecord) => p.age.toString(), match: primaryPatient.age === secondaryPatient.age },
    { label: '身份证', getValue: (p: PatientMasterRecord) => p.idCard, match: primaryPatient.idCard === secondaryPatient.idCard },
    { label: '电话', getValue: (p: PatientMasterRecord) => p.phone, match: primaryPatient.phone === secondaryPatient.phone },
    { label: '地址', getValue: (p: PatientMasterRecord) => p.address, match: primaryPatient.address === secondaryPatient.address },
    { label: '患者类型', getValue: (p: PatientMasterRecord) => p.patientType, match: primaryPatient.patientType === secondaryPatient.patientType },
    { label: '主要诊断', getValue: (p: PatientMasterRecord) => p.primaryDiagnosis, match: primaryPatient.primaryDiagnosis === secondaryPatient.primaryDiagnosis },
  ]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 800,
        maxHeight: '90vh',
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
          color: '#fff',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>患者记录合并确认</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>请确认以下两条记录是否来自同一患者</div>
        </div>

        {/* 对比表格 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>比对字段</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>主记录</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>待合并记录</div>
          </div>
          
          {comparisonFields.map((field, i) => (
            <div key={i} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 2fr 2fr', 
              gap: 16, 
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{field.label}</div>
              <div style={{ fontSize: 13, color: '#1e3a5f' }}>{field.getValue(primaryPatient)}</div>
              <div style={{ 
                fontSize: 13, 
                color: field.match ? '#10b981' : '#ef4444',
                fontWeight: field.match ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {field.getValue(secondaryPatient)}
                {field.match ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : (
                  <AlertTriangle size={16} color="#ef4444" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div style={{
          padding: 16,
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#10b981',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <GitMerge size={16} />
            确认合并
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 子组件：跨机构匹配面板 ====================
interface LinkingPanelProps {
  patient: PatientMasterRecord
  candidates: LinkCandidate[]
  onClose: () => void
  onLink: (candidate: LinkCandidate) => void
}

function LinkingPanel({ patient, candidates, onClose, onLink }: LinkingPanelProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 900,
        maxHeight: '90vh',
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>跨机构患者匹配</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                为 {patient.name} ({patient.idCard}) 查找跨机构匹配记录
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 候选列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <div style={{ fontSize: 14 }}>未找到匹配记录</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {candidates.map((candidate, i) => (
                <div key={i} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  background: candidate.confidenceScore >= 80 ? '#f0fdf4' : '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: candidate.confidenceScore >= 80 ? '#10b981' : '#f59e0b',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                    }}>
                      {candidate.confidenceScore}%
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>{candidate.name}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{candidate.gender} {candidate.age}岁</span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#fff',
                          background: '#3b82f6',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}>
                          <Building2 size={12} style={{ marginRight: 4 }} />
                          {candidate.facility}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                        身份证: {candidate.idCard} | 电话: {candidate.phone}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {candidate.matchFields.map((field, j) => (
                          <span key={j} style={{
                            fontSize: 11,
                            color: '#10b981',
                            background: '#d1fae5',
                            padding: '2px 6px',
                            borderRadius: 3,
                          }}>
                            {field}匹配
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onLink(candidate)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Link2 size={14} />
                      关联
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function PatientMasterIndexPage() {
  // 状态
  const [activeTab, setActiveTab] = useState<TabKey>('search')
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({ show: false, type: 'success', message: '' })
  useEffect(() => { if (toast.show) { const t = setTimeout(() => setToast(v => ({ ...v, show: false })), 3000); return () => clearTimeout(t) } }, [toast.show])

  const [search, setSearch] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    gender: '全部',
    ageMin: '',
    ageMax: '',
    patientType: '全部',
    mergeStatus: '全部',
    linkedFacilities: '',
    dateFrom: '',
    dateTo: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<PatientMasterRecord | null>(null)
  const [pageSize] = useState(20)

  // 合并相关状态
  const [mergePrimary, setMergePrimary] = useState<PatientMasterRecord | null>(null)
  const [mergeSecondary, setMergeSecondary] = useState<PatientMasterRecord | null>(null)
  const [showMergeConfirm, setShowMergeConfirm] = useState(false)

  // 跨机构匹配状态
  const [linkPatient, setLinkPatient] = useState<PatientMasterRecord | null>(null)
  const [linkCandidates, setLinkCandidates] = useState<LinkCandidate[]>([])
  const [showLinkingPanel, setShowLinkingPanel] = useState(false)

  const patients = PATIENT_MASTER_INDEX

  // 统计数据
  const stats = useMemo(() => {
    return {
      totalPatients: patients.length,
      mergedPatients: patients.filter(p => p.mergeStatus === '已合并').length,
      pendingMerge: patients.filter(p => p.mergeStatus === '待合并').length,
      linkedFacilities: new Set(patients.flatMap(p => p.linkedFacilities)).size,
    }
  }, [patients])

  // 高级筛选重置
  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      gender: '全部',
      ageMin: '',
      ageMax: '',
      patientType: '全部',
      mergeStatus: '全部',
      linkedFacilities: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  // 筛选逻辑
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // 关键词搜索
      if (search) {
        const s = search.toLowerCase()
        const matchSearch =
          p.name.toLowerCase().includes(s) ||
          p.id.toLowerCase().includes(s) ||
          p.empiId.toLowerCase().includes(s) ||
          p.idCard.includes(search) ||
          p.phone.includes(search)
        if (!matchSearch) return false
      }

      // 性别筛选
      if (advancedFilters.gender !== '全部' && p.gender !== advancedFilters.gender) return false

      // 年龄筛选
      if (advancedFilters.ageMin && p.age < parseInt(advancedFilters.ageMin)) return false
      if (advancedFilters.ageMax && p.age > parseInt(advancedFilters.ageMax)) return false

      // 患者类型筛选
      if (advancedFilters.patientType !== '全部' && p.patientType !== advancedFilters.patientType) return false

      // 合并状态筛选
      if (advancedFilters.mergeStatus !== '全部' && p.mergeStatus !== advancedFilters.mergeStatus) return false

      // 建档日期筛选
      if (advancedFilters.dateFrom && p.registrationDate < advancedFilters.dateFrom) return false
      if (advancedFilters.dateTo && p.registrationDate > advancedFilters.dateTo) return false

      // 关联机构筛选
      if (advancedFilters.linkedFacilities) {
        const facility = advancedFilters.linkedFacilities.toLowerCase()
        if (!p.linkedFacilities.some(f => f.toLowerCase().includes(facility))) return false
      }

      return true
    })
  }, [search, advancedFilters, patients])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPatients.slice(start, start + pageSize)
  }, [filteredPatients, currentPage, pageSize])

  // 重置页码当搜索变化时
  useEffect(() => {
    setCurrentPage(1)
  }, [search, advancedFilters])

  // 合并状态颜色
  const getStatusColor = (status: MergeStatus) => {
    const colors: Record<MergeStatus, string> = {
      '待合并': '#f59e0b',
      '已合并': '#10b981',
      '已拆分': '#6366f1',
      '已驳回': '#ef4444',
    }
    return colors[status]
  }

  // 处理合并
  const handleMerge = (patient: PatientMasterRecord) => {
    setMergePrimary(patient)
    // 模拟找到的可合并记录
    const similarPatient = patients.find(p => 
      p.id !== patient.id && 
      (p.idCard === patient.idCard || p.name === patient.name) &&
      p.mergeStatus !== '已合并'
    )
    if (similarPatient) {
      setMergeSecondary(similarPatient)
      setShowMergeConfirm(true)
    } else {
      setToast({ show: true, type: 'info', message: '未找到可合并的患者记录' })
    }
  }

  const handleConfirmMerge = () => {
    setShowMergeConfirm(false)
    setToast({ show: true, type: 'success', message: '患者记录合并成功' })
    setMergePrimary(null)
    setMergeSecondary(null)
  }

  // 处理跨机构匹配
  const handleLink = (patient: PatientMasterRecord) => {
    setLinkPatient(patient)
    // 模拟跨机构匹配候选
    const facilities = ['上海市第一人民医院', '上海市华东医院', '上海市中山医院', '上海市仁济医院']
    const candidates: LinkCandidate[] = []
    
    // 生成一些模拟匹配候选
    if (Math.random() > 0.3) {
      candidates.push({
        patientId: `EXT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: patient.name,
        gender: patient.gender,
        age: patient.age,
        idCard: patient.idCard,
        phone: patient.phone,
        facility: facilities[Math.floor(Math.random() * facilities.length)],
        confidenceScore: 85 + Math.floor(Math.random() * 15),
        matchFields: ['姓名', '身份证', '电话'],
      })
    }
    if (Math.random() > 0.5) {
      candidates.push({
        patientId: `EXT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: patient.name,
        gender: patient.gender,
        age: patient.age,
        idCard: patient.idCard.substring(0, 14) + 'XXXX',
        phone: patient.phone,
        facility: facilities[Math.floor(Math.random() * facilities.length)],
        confidenceScore: 70 + Math.floor(Math.random() * 15),
        matchFields: ['姓名', '电话'],
      })
    }
    
    setLinkCandidates(candidates)
    setShowLinkingPanel(true)
  }

  const handleConfirmLink = (candidate: LinkCandidate) => {
    setShowLinkingPanel(false)
    setToast({ show: true, type: 'success', message: `已成功关联到 ${candidate.facility}` })
    setLinkPatient(null)
    setLinkCandidates([])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 顶部标题栏 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
        padding: '20px 24px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Shield size={24} />
          <span style={{ fontSize: 20, fontWeight: 700 }}>PIX/eMPI 患者主索引管理</span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          患者主索引 (Patient Master Index) | 跨机构患者身份识别与匹配
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        padding: '16px 24px',
      }}>
        <StatCard
          label="患者总数"
          value={stats.totalPatients}
          icon={<Users size={24} />}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          label="已合并记录"
          value={stats.mergedPatients}
          icon={<GitMerge size={24} />}
          color="#10b981"
          bgColor="#d1fae5"
        />
        <StatCard
          label="待合并申请"
          value={stats.pendingMerge}
          icon={<Clock size={24} />}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <StatCard
          label="关联机构数"
          value={stats.linkedFacilities}
          icon={<Building2 size={24} />}
          color="#6366f1"
          bgColor="#e0e7ff"
        />
      </div>

      {/* 标签页 */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '0 24px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
      }}>
        <TabButton
          tabKey="search"
          label="患者搜索"
          icon={<Search size={16} />}
          isActive={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
        />
        <TabButton
          tabKey="list"
          label="患者列表"
          icon={<Users size={16} />}
          isActive={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          badge={filteredPatients.length}
        />
        <TabButton
          tabKey="merge"
          label="合并管理"
          icon={<GitMerge size={16} />}
          isActive={activeTab === 'merge'}
          onClick={() => setActiveTab('merge')}
        />
        <TabButton
          tabKey="linking"
          label="跨机构匹配"
          icon={<Link2 size={16} />}
          isActive={activeTab === 'linking'}
          onClick={() => setActiveTab('linking')}
        />
      </div>

      {/* 主内容区 */}
      <div style={{ padding: 24 }}>
        {/* 搜索和筛选 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 16,
          marginBottom: 16,
        }}>
          {/* 搜索框 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: showAdvanced ? 16 : 0 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="搜索患者姓名、ID、EMPI、身份证、电话..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: showAdvanced ? '#eff6ff' : '#fff',
                color: showAdvanced ? '#1d4ed8' : '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Filter size={16} />
              高级筛选
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* 高级筛选面板 */}
          {showAdvanced && (
            <AdvancedFilterPanel
              filters={advancedFilters}
              onChange={setAdvancedFilters}
              onReset={resetAdvancedFilters}
            />
          )}
        </div>

        {/* 患者列表表格 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>EMPI ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>姓名</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>性别</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>年龄</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>身份证</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>电话</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>类型</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>主要诊断</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>状态</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>匹配度</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient, i) => (
                <tr 
                  key={patient.id}
                  style={{ 
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>{patient.empiId}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{patient.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{patient.gender}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{patient.age}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{patient.idCard}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{patient.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{patient.patientType}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.primaryDiagnosis}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#fff',
                      background: getStatusColor(patient.mergeStatus),
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {patient.mergeStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: patient.confidenceScore >= 90 ? '#10b981' : patient.confidenceScore >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {patient.confidenceScore}%
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: 'none',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="查看详情"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleMerge(patient)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: 'none',
                          background: '#d1fae5',
                          color: '#10b981',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="合并"
                      >
                        <GitMerge size={14} />
                      </button>
                      <button
                        onClick={() => handleLink(patient)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: 'none',
                          background: '#e0e7ff',
                          color: '#6366f1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="跨机构匹配"
                      >
                        <Link2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPatients.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* 患者详情面板 */}
      {selectedPatient && (
        <PatientDetailPanel
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onMerge={handleMerge}
          onLink={handleLink}
        />
      )}

      {/* 合并确认面板 */}
      {showMergeConfirm && mergePrimary && mergeSecondary && (
        <MergeComparePanel
          primaryPatient={mergePrimary}
          secondaryPatient={mergeSecondary}
          onConfirm={handleConfirmMerge}
          onCancel={() => {
            setShowMergeConfirm(false)
            setMergePrimary(null)
            setMergeSecondary(null)
          }}
        />
      )}

      {/* 跨机构匹配面板 */}
      {showLinkingPanel && linkPatient && (
        <LinkingPanel
          patient={linkPatient}
          candidates={linkCandidates}
          onClose={() => {
            setShowLinkingPanel(false)
            setLinkPatient(null)
            setLinkCandidates([])
          }}
          onLink={handleConfirmLink}
        />
      )}

      {/* Toast 通知 */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '12px 20px',
          borderRadius: 10,
          background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <XCircle size={18} />}
          {toast.type === 'info' && <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  )
}