// @ts-nocheck
import React, { useState, useMemo } from 'react'
import { Search, X, Eye, ChevronLeft, ChevronRight, Cpu, AlertCircle, CheckCircle, Clock } from 'lucide-react'

// 模拟50+条AI医疗器械注册证数据
const generateAIMedicalDevices = () => {
  const manufacturers = [
    '上海联影医疗科技有限公司', '北京推想医疗科技股份有限公司', '深圳腾讯医疗健康科技有限公司',
    '杭州阿里云计算有限公司', '科大讯飞股份有限公司', '华为技术有限公司',
    '北京昆仑万维科技股份有限公司', '四川大学华西医院', '北京医渡云科技有限公司',
    '平安智慧城市科技股份有限公司', '百度在线网络技术有限公司', '字节跳动科技有限公司'
  ]

  const deviceTypes = [
    'AI辅助诊断系统', '影像AI分析软件', '智能医学影像诊断系统', 'AI眼底病变检测软件',
    'AI肺结节辅助检测系统', '智能病理分析系统', 'AI心血管影像分析软件', '智能骨折检测系统',
    'AI乳腺钼靶分析系统', '智能皮肤病变检测系统', 'AI颅脑影像分析系统', '智能超声诊断辅助系统',
    'AI消化内镜辅助系统', '智能医学影像质控系统', 'AI医学影像增强处理系统'
  ]

  const models = [
    'UNIQ-2024-Pro', 'THINKING-AI-V3', 'Tencent-Health-AI', 'Ali-Cloud-Medical',
    'iFLYTEK-Med-2', 'Huawei-Med AI-5', 'Kunlun-Diagnosis-V2', 'WestChina-AI-2023',
    'YiduCloud-Med-1', 'PingAn-Smart-Med', 'Baidu-Medical-AI', 'ByteDance-MedTech',
    'SmartScan-Pro', 'ImageAI-Ultra', 'MedVision-Plus', 'AI-Reader-V4', 'Radiology-AI-X'
  ]

  const devices = []
  const today = new Date()

  for (let i = 1; i <= 55; i++) {
    const regNum = `国械注${2020 + (i % 5)}${String(i).padStart(6, '0')}`
    const manufacturer = manufacturers[i % manufacturers.length]
    const deviceType = deviceTypes[i % deviceTypes.length]
    const model = models[i % models.length]

    // 随机生成有效期：部分已过期、部分即将过期、部分有效
    let expiryDate
    let status
    const monthsOffset = (i % 12) - 5
    if (monthsOffset < -2) {
      expiryDate = new Date(today.getFullYear() - 1, (i % 11), (i % 28) + 1)
      status = 'expired'
    } else if (monthsOffset < 2) {
      expiryDate = new Date(today.getFullYear(), today.getMonth() + monthsOffset, (i % 28) + 1)
      status = 'expiring'
    } else {
      expiryDate = new Date(today.getFullYear() + (i % 3), (i % 11), (i % 28) + 1)
      status = 'valid'
    }

    devices.push({
      id: i,
      regNumber: regNum,
      deviceName: deviceType,
      model: model,
      manufacturer: manufacturer,
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: status,
      category: i % 3 === 0 ? '三类' : '二类',
      applicationArea: ['放射科', '病理科', '超声科', '内科', '外科', '眼科'][i % 6],
      certifiedDate: new Date(2020 + (i % 4), i % 11, 15).toISOString().split('T')[0],
      certificateOrg: '国家药品监督管理局',
      softwareVersion: `v${2 + (i % 3)}.${i % 10}.${i % 20}`,
      aiAlgorithm: ['深度学习', '机器学习', '卷积神经网络', '迁移学习'][i % 4],
      accuracy: (85 + (i % 15)).toFixed(1) + '%',
      approvedIndications: `适用于${['肺部', '乳腺', '心血管', '颅脑', '眼底', '皮肤'][i % 6]}影像的辅助诊断`,
    })
  }
  return devices
}

const allDevices = generateAIMedicalDevices()

// 状态徽章组件
const StatusBadge = ({ status }) => {
  const styles = {
    valid: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={12} /> },
    expiring: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={12} /> },
    expired: { bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle size={12} /> },
  }
  const labels = { valid: '有效', expiring: '即将过期', expired: '已过期' }
  const s = styles[status] || styles.valid
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.icon} {labels[status]}
    </span>
  )
}

export default function AIMedicalDevicePage() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const pageSize = 20

  const filteredDevices = useMemo(() => {
    return allDevices.filter(d => {
      const matchSearch = !searchText || 
        d.deviceName.includes(searchText) || 
        d.regNumber.includes(searchText) || 
        d.manufacturer.includes(searchText)
      const matchStatus = statusFilter === 'all' || d.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [searchText, statusFilter])

  const totalPages = Math.ceil(filteredDevices.length / pageSize)
  const paginatedDevices = filteredDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const isExpiringSoon = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 90
  }

  const counts = useMemo(() => ({
    all: allDevices.length,
    valid: allDevices.filter(d => d.status === 'valid').length,
    expiring: allDevices.filter(d => d.status === 'expiring').length,
    expired: allDevices.filter(d => d.status === 'expired').length,
  }), [])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff' }}>
      {/* 蓝色渐变卡片头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
        padding: '24px 32px',
        borderBottom: '1px solid #dbeafe',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>AI医疗器械注册证管理</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              共 {counts.all} 条注册证记录 | 有效 {counts.valid} | 即将过期 {counts.expiring} | 已过期 {counts.expired}
            </p>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div style={{ padding: '20px 32px', background: '#fff', borderBottom: '1px solid #dbeafe' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setCurrentPage(1) }}
              placeholder="按设备名称/注册证编号/厂商搜索..."
              style={{
                width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #dbeafe',
                borderRadius: 8, fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#dbeafe'}
            />
            {searchText && (
              <X size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => { setSearchText(''); setCurrentPage(1) }} />
            )}
          </div>

          {/* 状态筛选按钮 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'all', label: '全部', count: counts.all },
              { key: 'valid', label: '有效', count: counts.valid },
              { key: 'expiring', label: '即将过期', count: counts.expiring },
              { key: 'expired', label: '已过期', count: counts.expired },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => { setStatusFilter(btn.key); setCurrentPage(1) }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid',
                  borderColor: statusFilter === btn.key ? '#3b82f6' : '#dbeafe',
                  background: statusFilter === btn.key ? '#eff6ff' : '#fff',
                  color: statusFilter === btn.key ? '#1e40af' : '#64748b',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {btn.label} <span style={{ opacity: 0.7 }}>({btn.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 表格区域 */}
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dbeafe', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f9ff', borderBottom: '2px solid #dbeafe' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>注册证编号</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>设备名称</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>型号</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>生产商</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>有效期</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>状态</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((device, idx) => (
                <tr key={device.id} style={{ borderBottom: idx < paginatedDevices.length - 1 ? '1px solid #f0f9ff' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#1e40af', fontWeight: 600 }}>{device.regNumber}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{device.deviceName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{device.model}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.manufacturer}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: isExpiringSoon(device.expiryDate) ? '#d97706' : '#374151', fontWeight: isExpiringSoon(device.expiryDate) ? 600 : 400 }}>
                    {formatDate(device.expiryDate)}
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={device.status} /></td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button onClick={() => setSelectedDevice(device)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Eye size={14} /> 详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #dbeafe', background: '#f0f9ff' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredDevices.length)} 条，共 {filteredDevices.length} 条
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #dbeafe', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
                <ChevronLeft size={14} /> 上一页
              </button>
              <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #dbeafe', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
                下一页 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedDevice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setSelectedDevice(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 560, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Cpu size={20} color="#fff" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>注册证详情</span>
              </div>
              <button onClick={() => setSelectedDevice(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#fff" />
              </button>
            </div>
            {/* 弹窗内容 */}
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>注册证编号</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>{selectedDevice.regNumber}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>设备名称</div>
                <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{selectedDevice.deviceName}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>型号</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.model}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>分类</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.category}</div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>生产商</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.manufacturer}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>发证日期</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{formatDate(selectedDevice.certifiedDate)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>有效期至</div>
                  <div style={{ fontSize: 13, color: isExpiringSoon(selectedDevice.expiryDate) ? '#d97706' : '#374151', fontWeight: isExpiringSoon(selectedDevice.expiryDate) ? 600 : 400 }}>{formatDate(selectedDevice.expiryDate)}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>发证机构</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.certificateOrg}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>应用科室</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.applicationArea}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>软件版本</div>
                  <div style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{selectedDevice.softwareVersion}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>AI算法</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.aiAlgorithm}</div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>诊断准确率</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{selectedDevice.accuracy}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>审批适应症</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{selectedDevice.approvedIndications}</div>
              </div>
              <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>状态</div>
                <StatusBadge status={selectedDevice.status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}