import React, { useState } from 'react';

// ============================================================
// 虚构数据 - 10名医生
// ============================================================
const doctors = [
  { id: 'D001', name: '李明辉', title: '主任医师', exams: 145, reports: 142, positiveRate: 68.5, modifyRate: 2.1, formatScore: 96, diagScore: 98, timeScore: 94 },
  { id: 'D002', name: '王建军', title: '主任医师', exams: 138, reports: 135, positiveRate: 72.3, modifyRate: 2.5, formatScore: 94, diagScore: 97, timeScore: 92 },
  { id: 'D003', name: '张丽华', title: '副主任医师', exams: 152, reports: 148, positiveRate: 65.2, modifyRate: 3.2, formatScore: 95, diagScore: 96, timeScore: 93 },
  { id: 'D004', name: '陈晓东', title: '主治医师', exams: 168, reports: 162, positiveRate: 58.9, modifyRate: 4.8, formatScore: 92, diagScore: 94, timeScore: 95 },
  { id: 'D005', name: '刘芳', title: '主治医师', exams: 145, reports: 140, positiveRate: 62.4, modifyRate: 3.8, formatScore: 93, diagScore: 95, timeScore: 91 },
  { id: 'D006', name: '孙伟', title: '主治医师', exams: 132, reports: 128, positiveRate: 55.8, modifyRate: 4.2, formatScore: 91, diagScore: 93, timeScore: 90 },
  { id: 'D007', name: '赵强', title: '住院医师', exams: 118, reports: 112, positiveRate: 48.2, modifyRate: 6.5, formatScore: 88, diagScore: 90, timeScore: 92 },
  { id: 'D008', name: '周敏', title: '住院医师', exams: 108, reports: 102, positiveRate: 45.6, modifyRate: 7.2, formatScore: 86, diagScore: 89, timeScore: 88 },
  { id: 'D009', name: '吴昊', title: '住院医师', exams: 98, reports: 92, positiveRate: 42.3, modifyRate: 8.1, formatScore: 84, diagScore: 87, timeScore: 85 },
  { id: 'D010', name: '郑杰', title: '住院医师', exams: 92, reports: 86, positiveRate: 40.5, modifyRate: 8.8, formatScore: 82, diagScore: 86, timeScore: 83 },
];

// ============================================================
// 虚构数据 - 8台设备
// ============================================================
const devices = [
  { id: 'CT-001', name: 'SOMATOM Force', type: 'CT', utilization: 92, fullRate: 95, faultRate: 0.5 },
  { id: 'CT-002', name: 'SOMATOM Drive', type: 'CT', utilization: 85, fullRate: 88, faultRate: 1.2 },
  { id: 'MRI-001', name: 'Prisma 3T', type: 'MRI', utilization: 88, fullRate: 92, faultRate: 0.8 },
  { id: 'MRI-002', name: 'Signa Premier', type: 'MRI', utilization: 78, fullRate: 82, faultRate: 1.5 },
  { id: 'DXR-001', name: 'DigitalDiagnost', type: 'DXR', utilization: 72, fullRate: 75, faultRate: 2.1 },
  { id: 'DXR-002', name: 'DR-600', type: 'DXR', utilization: 65, fullRate: 68, faultRate: 1.8 },
  { id: 'US-001', name: 'Resona 7', type: 'US', utilization: 82, fullRate: 85, faultRate: 0.6 },
  { id: 'DSA-001', name: 'Artis Q', type: 'DSA', utilization: 55, fullRate: 58, faultRate: 2.5 },
];

// ============================================================
// 虚构数据 - 技师
// ============================================================
const technicians = [
  { id: 'T001', name: '马超', title: '主管技师', exams: 285, reports: 280, utilization: 95 },
  { id: 'T002', name: '林涛', title: '副主任技师', exams: 268, reports: 265, utilization: 92 },
  { id: 'T003', name: '高峰', title: '技师', exams: 245, reports: 242, utilization: 88 },
  { id: 'T004', name: '李雪', title: '技师', exams: 232, reports: 228, utilization: 85 },
  { id: 'T005', name: '王磊', title: '技师', exams: 218, reports: 215, utilization: 82 },
  { id: 'T006', name: '张欢', title: '技士', exams: 195, reports: 192, utilization: 78 },
];

// ============================================================
// 虚构数据 - 30天收入数据
// ============================================================
const dailyRevenue = [
  { day: 1, revenue: 125680 }, { day: 2, revenue: 118450 }, { day: 3, revenue: 132560 },
  { day: 4, revenue: 108320 }, { day: 5, revenue: 98560 }, { day: 6, revenue: 75680 },
  { day: 7, revenue: 68240 }, { day: 8, revenue: 138250 }, { day: 9, revenue: 142180 },
  { day: 10, revenue: 135420 }, { day: 11, revenue: 128650 }, { day: 12, revenue: 119830 },
  { day: 13, revenue: 112450 }, { day: 14, revenue: 105680 }, { day: 15, revenue: 145230 },
  { day: 16, revenue: 152340 }, { day: 17, revenue: 148920 }, { day: 18, revenue: 138560 },
  { day: 19, revenue: 125680 }, { day: 20, revenue: 132450 }, { day: 21, revenue: 118320 },
  { day: 22, revenue: 142180 }, { day: 23, revenue: 151230 }, { day: 24, revenue: 145680 },
  { day: 25, revenue: 138920 }, { day: 26, revenue: 125340 }, { day: 27, revenue: 118560 },
  { day: 28, revenue: 108320 }, { day: 29, revenue: 135680 }, { day: 30, revenue: 142850 },
];

// ============================================================
// 虚构数据 - 检查项目收入分布
// ============================================================
const examRevenue = [
  { name: 'CT检查', amount: 1856000, percent: 38, count: 1856 },
  { name: 'MRI检查', amount: 1425000, percent: 29, count: 950 },
  { name: 'X线摄影', amount: 685000, percent: 14, count: 3425 },
  { name: '超声检查', amount: 520000, percent: 11, count: 1040 },
  { name: 'DSA造影', amount: 245000, percent: 5, count: 122 },
  { name: '其他', amount: 155000, percent: 3, count: 310 },
];

// ============================================================
// 虚构数据 - 卫材成本
// ============================================================
const materialCost = {
  contrastAgent: 125600,
  film: 45600,
  syringe: 28300,
  needle: 18900,
  other: 34200,
  total: 252600,
};

// ============================================================
// 虚构数据 - 质控问题统计
// ============================================================
const qcIssues = [
  { type: '报告格式不规范', count: 28, rate: 2.8 },
  { type: '描述与结论不符', count: 15, rate: 1.5 },
  { type: '超时完成报告', count: 42, rate: 4.2 },
  { type: '图像质量不达标', count: 18, rate: 1.8 },
  { type: '漏填重要信息', count: 12, rate: 1.2 },
];

// ============================================================
// 顶部统计卡片类型
// ============================================================
interface StatCardData {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}

// ============================================================
// Tab类型
// ============================================================
type TabType = 'workload' | 'equipment' | 'quality' | 'revenue';

// ============================================================
// 主组件
// ============================================================
const DirectorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('workload');
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const dataAvailable = doctors.length > 0;

  // 样式定义
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as React.CSSProperties,
    header: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #1e40af',
    } as React.CSSProperties,
    headerTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
    } as React.CSSProperties,
    headerSubtitle: {
      fontSize: '14px',
      color: '#64748b',
    } as React.CSSProperties,
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    } as React.CSSProperties,
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderTop: '3px solid #1e40af',
    } as React.CSSProperties,
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: '4px',
    } as React.CSSProperties,
    statLabel: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '8px',
    } as React.CSSProperties,
    statSub: {
      fontSize: '12px',
      color: '#94a3b8',
    } as React.CSSProperties,
    tabContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    } as React.CSSProperties,
    tabHeader: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    } as React.CSSProperties,
    tabButton: (active: boolean) => ({
      padding: '14px 24px',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      color: active ? '#1e40af' : '#64748b',
      backgroundColor: active ? '#ffffff' : 'transparent',
      border: 'none',
      borderBottom: active ? '2px solid #1e40af' : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
    } as React.CSSProperties),
    tabContent: {
      padding: '24px',
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e2e8f0',
    } as React.CSSProperties,
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '13px',
    } as React.CSSProperties,
    th: {
      padding: '12px',
      textAlign: 'left' as const,
      backgroundColor: '#f8fafc',
      color: '#64748b',
      fontWeight: '600',
      borderBottom: '1px solid #e2e8f0',
    } as React.CSSProperties,
    td: {
      padding: '12px',
      borderBottom: '1px solid #e2e8f0',
      color: '#1e293b',
    } as React.CSSProperties,
    badge: (color: string) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: color,
      color: '#ffffff',
    } as React.CSSProperties),
    chartContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-end',
      height: '200px',
      padding: '16px 0',
    } as React.CSSProperties,
    chartBar: (height: number, color: string) => ({
      flex: 1,
      height: `${height}%`,
      backgroundColor: color,
      borderRadius: '4px 4px 0 0',
      transition: 'height 0.3s ease',
      position: 'relative' as const,
    } as React.CSSProperties),
    lineChart: {
      width: '100%',
      height: '200px',
      position: 'relative' as const,
    } as React.CSSProperties,
    pieChartContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
    } as React.CSSProperties,
    pieItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      minWidth: '180px',
    } as React.CSSProperties,
    pieColor: (color: string) => ({
      width: '16px',
      height: '16px',
      borderRadius: '4px',
      backgroundColor: color,
    } as React.CSSProperties),
    scoreContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '8px',
    } as React.CSSProperties,
    scoreItem: (color: string) => ({
      padding: '8px',
      backgroundColor: color + '15',
      borderRadius: '6px',
      textAlign: 'center' as const,
      border: `1px solid ${color}30`,
    } as React.CSSProperties),
    grid2Col: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    } as React.CSSProperties,
    progressBar: {
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '6px',
    } as React.CSSProperties,
    progressFill: (width: string, color: string) => ({
      height: '100%',
      width: width,
      backgroundColor: color,
      borderRadius: '4px',
    } as React.CSSProperties),
  };

  // 颜色
  const colors = ['#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const utilizationColor = (rate: number) => {
    if (rate > 85) return '#22c55e';
    if (rate > 70) return '#eab308';
    return '#ef4444';
  };

  // 计算统计数据
  const todayStats: StatCardData[] = [
    { label: '今日检查总量', value: '856', subValue: 'CT: 285 | MR: 198 | DXR: 373' },
    { label: '报告书写量', value: '782', subValue: '今日: 142 | 本周: 856 | 本月: 3248' },
    { label: '阳性检出率', value: '58.6%', subValue: '较上月 +2.3%', color: '#22c55e' },
    { label: '危急值处理率', value: '98.2%', subValue: '待处理: 2例', color: '#1e40af' },
    { label: '设备使用率', value: '77.8%', subValue: '运行中: 6/8台', color: '#f59e0b' },
    { label: '当日收入', value: '¥142,850', subValue: '较昨日 +5.2%', color: '#22c55e' },
  ];

  // 排名奖励
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', text: '金牌', bg: '#fef3c7', color: '#92400e' };
    if (rank === 2) return { emoji: '🥈', text: '银牌', bg: '#f3f4f6', color: '#4b5563' };
    if (rank === 3) return { emoji: '🥉', text: '铜牌', bg: '#fed7aa', color: '#9a3412' };
    return null;
  };

  // 渲染Tab1: 工作量排名
  const renderWorkloadTab = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={styles.sectionTitle}>🥇 医生工作量排名</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>排名</th>
              <th style={styles.th}>姓名</th>
              <th style={styles.th}>职称</th>
              <th style={styles.th}>检查数</th>
              <th style={styles.th}>报告数</th>
              <th style={styles.th}>阳性率</th>
              <th style={styles.th}>修改率</th>
              <th style={styles.th}>综合评分</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc, idx) => {
              const rank = getRankBadge(idx + 1);
              const totalScore = (doc.formatScore + doc.diagScore + doc.timeScore) / 3;
              return (
                <tr key={doc.id}>
                  <td style={styles.td}>
                    {rank ? (
                      <span style={styles.badge(rank.bg)}>
                        <span>{rank.emoji}</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{idx + 1}</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: rank ? '#92400e' : '#1e293b' }}>
                    {doc.name}
                  </td>
                  <td style={styles.td}>{doc.title}</td>
                  <td style={styles.td}>{doc.exams}</td>
                  <td style={styles.td}>{doc.reports}</td>
                  <td style={{ ...styles.td, color: doc.positiveRate > 60 ? '#22c55e' : '#64748b' }}>
                    {doc.positiveRate}%
                  </td>
                  <td style={{ ...styles.td, color: doc.modifyRate > 5 ? '#ef4444' : '#64748b' }}>
                    {doc.modifyRate}%
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: totalScore > 92 ? '#dcfce7' : '#fef3c7',
                      color: totalScore > 92 ? '#166534' : '#92400e',
                      borderRadius: '4px',
                      fontWeight: '600',
                    }}>
                      {totalScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div style={styles.sectionTitle}>🔧 技师工作量排名</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>排名</th>
              <th style={styles.th}>姓名</th>
              <th style={styles.th}>职称</th>
              <th style={styles.th}>检查数</th>
              <th style={styles.th}>报告数</th>
              <th style={styles.th}>设备使用率</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech, idx) => {
              const rank = getRankBadge(idx + 1);
              return (
                <tr key={tech.id}>
                  <td style={styles.td}>
                    {rank ? (
                      <span style={styles.badge(rank.bg)}>{rank.emoji}</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{idx + 1}</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: rank ? '#92400e' : '#1e293b' }}>
                    {tech.name}
                  </td>
                  <td style={styles.td}>{tech.title}</td>
                  <td style={styles.td}>{tech.exams}</td>
                  <td style={styles.td}>{tech.reports}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ ...styles.progressBar, width: '100px' }}>
                        <div style={styles.progressFill(`${tech.utilization}%`, utilizationColor(tech.utilization))} />
                      </div>
                      <span style={{ color: utilizationColor(tech.utilization), fontWeight: '600' }}>
                        {tech.utilization}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 渲染Tab2: 设备效率看板
  const renderEquipmentTab = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={styles.sectionTitle}>📊 设备使用率柱状图</div>
        <div style={styles.chartContainer}>
          {devices.map((device) => (
            <div key={device.id} style={{ flex: 1, textAlign: 'center' as const }}>
              <div style={styles.chartBar(device.utilization, utilizationColor(device.utilization))}>
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: utilizationColor(device.utilization),
                }}>
                  {device.utilization}%
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                {device.name.length > 10 ? device.name.substring(0, 8) + '..' : device.name}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '2px' }}></span>
            优良 (&gt;85%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#eab308', borderRadius: '2px' }}></span>
            正常 (70-85%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span>
            偏低 (&lt;70%)
          </span>
        </div>
      </div>

      <div style={styles.grid2Col}>
        <div>
          <div style={styles.sectionTitle}>📅 设备预约满员率排名</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>设备</th>
                <th style={styles.th}>满员率</th>
                <th style={styles.th}>状态</th>
              </tr>
            </thead>
            <tbody>
              {[...devices].sort((a, b) => b.fullRate - a.fullRate).map((device) => (
                <tr key={device.id}>
                  <td style={styles.td}>{device.name}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ ...styles.progressBar, width: '100px' }}>
                        <div style={styles.progressFill(`${device.fullRate}%`, '#1e40af')} />
                      </div>
                      <span style={{ fontWeight: '600' }}>{device.fullRate}%</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: device.fullRate > 85 ? '#dcfce7' : '#fef3c7',
                      color: device.fullRate > 85 ? '#166534' : '#92400e',
                    }}>
                      {device.fullRate > 85 ? '繁忙' : '可预约'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={styles.sectionTitle}>⚠️ 设备故障率统计</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>设备</th>
                <th style={styles.th}>故障率</th>
                <th style={styles.th}>风险等级</th>
              </tr>
            </thead>
            <tbody>
              {[...devices].sort((a, b) => b.faultRate - a.faultRate).map((device) => (
                <tr key={device.id}>
                  <td style={styles.td}>{device.name}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: device.faultRate > 2 ? '#ef4444' : '#64748b' }}>
                      {device.faultRate}%
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: device.faultRate > 2 ? '#fee2e2' : device.faultRate > 1 ? '#fef3c7' : '#dcfce7',
                      color: device.faultRate > 2 ? '#991b1b' : device.faultRate > 1 ? '#92400e' : '#166534',
                    }}>
                      {device.faultRate > 2 ? '高' : device.faultRate > 1 ? '中' : '低'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 渲染Tab3: 质控评分榜
  const renderQualityTab = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={styles.sectionTitle}>🏆 医生报告质量评分排名</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>排名</th>
              <th style={styles.th}>姓名</th>
              <th style={styles.th}>综合评分</th>
              <th style={styles.th}>格式规范</th>
              <th style={styles.th}>诊断准确</th>
              <th style={styles.th}>时效性</th>
              <th style={styles.th}>三维评分</th>
            </tr>
          </thead>
          <tbody>
            {doctors
              .map(d => ({
                ...d,
                totalScore: (d.formatScore + d.diagScore + d.timeScore) / 3
              }))
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((doc, idx) => {
                const rank = getRankBadge(idx + 1);
                return (
                  <tr key={doc.id}>
                    <td style={styles.td}>
                      {rank ? (
                        <span style={styles.badge(rank.bg)}>{rank.emoji}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: '500' }}>{idx + 1}</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '600', color: rank ? '#92400e' : '#1e293b' }}>
                      {doc.name}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: doc.totalScore > 92 ? '#dcfce7' : '#fef3c7',
                        color: doc.totalScore > 92 ? '#166534' : '#92400e',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}>
                        {doc.totalScore.toFixed(1)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.scoreItem('#3b82f6')}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>{doc.formatScore}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>分</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.scoreItem('#10b981')}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>{doc.diagScore}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>分</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.scoreItem('#f59e0b')}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#d97706' }}>{doc.timeScore}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>分</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '6px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                        <div style={{ width: '6px', height: '24px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                        <div style={{ width: '6px', height: '24px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div>
        <div style={styles.sectionTitle}>⚠️ 质控问题统计（本月）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {qcIssues.map((issue) => (
            <div key={issue.type} style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{issue.count}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{issue.type}</div>
              <div style={{
                marginTop: '8px',
                padding: '2px 8px',
                backgroundColor: issue.rate > 3 ? '#fee2e2' : '#fef3c7',
                color: issue.rate > 3 ? '#991b1b' : '#92400e',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {issue.rate}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染Tab4: 收入与成本
  const renderRevenueTab = () => {
    const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue));
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={styles.sectionTitle}>📈 每日收入折线图（近30天）</div>
          <div style={styles.lineChart}>
            <svg width="100%" height="200" viewBox="0 0 900 200" preserveAspectRatio="none">
              {/* 网格线 */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 50}
                  x2="900"
                  y2={i * 50}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}
              {/* 数据线 */}
              <polyline
                fill="none"
                stroke="#1e40af"
                strokeWidth="2"
                points={dailyRevenue.map((d, i) => {
                  const x = (i / (dailyRevenue.length - 1)) * 900;
                  const y = 200 - (d.revenue / maxRevenue) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {/* 数据点 */}
              {dailyRevenue.map((d, i) => {
                const x = (i / (dailyRevenue.length - 1)) * 900;
                const y = 200 - (d.revenue / maxRevenue) * 180;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#1e40af"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
              <span>第1天</span>
              <span>第10天</span>
              <span>第20天</span>
              <span>第30天</span>
            </div>
          </div>
        </div>

        <div style={styles.grid2Col}>
          <div>
            <div style={styles.sectionTitle}>💰 检查项目收入分布</div>
            <div style={styles.pieChartContainer}>
              {examRevenue.map((item, idx) => (
                <div key={item.name} style={styles.pieItem}>
                  <div style={styles.pieColor(colors[idx])} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>¥{(item.amount / 10000).toFixed(0)}万 ({item.percent}%)</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center' as const, fontSize: '14px', color: '#64748b' }}>
              总收入: <span style={{ fontWeight: '700', color: '#1e40af' }}>¥{(examRevenue.reduce((a, b) => a + b.amount, 0) / 10000).toFixed(0)}万元</span>
            </div>
          </div>

          <div>
            <div style={styles.sectionTitle}>🏥 卫材成本统计</div>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>造影剂</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>¥{materialCost.contrastAgent.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>胶片</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>¥{materialCost.film.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>注射器</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>¥{materialCost.syringe.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>针头</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>¥{materialCost.needle.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>其他耗材</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>¥{materialCost.other.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#1e40af', borderRadius: '6px', marginTop: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#ffffff' }}>总计成本</span>
                  <span style={{ fontWeight: '700', color: '#ffffff' }}>¥{materialCost.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>加载中...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (!dataAvailable) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>暂无数据</div>;

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>主任综合管理驾驶舱</div>
        <div style={styles.headerSubtitle}>
          汉东省人民医院 · 放射科 | 数据更新时间: {new Date().toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 顶部统计卡片 */}
      <div style={styles.statsGrid}>
        {todayStats.map((stat, idx) => (
          <div key={idx} style={styles.statCard}>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={{ ...styles.statValue, color: stat.color || '#1e40af' }}>{stat.value}</div>
            {stat.subValue && <div style={styles.statSub}>{stat.subValue}</div>}
          </div>
        ))}
      </div>

      {/* Tab容器 */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          <button
            style={styles.tabButton(activeTab === 'workload')}
            onClick={() => setActiveTab('workload')}
          >
            📊 工作量排名
          </button>
          <button
            style={styles.tabButton(activeTab === 'equipment')}
            onClick={() => setActiveTab('equipment')}
          >
            🔧 设备效率看板
          </button>
          <button
            style={styles.tabButton(activeTab === 'quality')}
            onClick={() => setActiveTab('quality')}
          >
            🏆 质控评分榜
          </button>
          <button
            style={styles.tabButton(activeTab === 'revenue')}
            onClick={() => setActiveTab('revenue')}
          >
            💰 收入与成本
          </button>
        </div>
        <div style={styles.tabContent}>
          {activeTab === 'workload' && renderWorkloadTab()}
          {activeTab === 'equipment' && renderEquipmentTab()}
          {activeTab === 'quality' && renderQualityTab()}
          {activeTab === 'revenue' && renderRevenueTab()}
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboardPage;
