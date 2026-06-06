/**
 * G005 放射RIS系统 v3.0.0 - 首页 V3 完整重构
 * Phase T3-W7: 整合所有 V3 能力
 */

import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppStatistic,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, App as AntdApp, Row, Col } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  ExperimentOutlined,
  DesktopOutlined,
  BarChartOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  FireOutlined,
  AppstoreOutlined,
  BookOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { useIsMobile } from '@hooks/useBreakpoint';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'patients', icon: <UserOutlined />, label: '患者', path: '/patients' },
  { key: 'devices', icon: <DesktopOutlined />, label: '设备', path: '/devices' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 快捷入口 =============
const QUICK_LINKS = [
  { key: 'worklist', label: '工作列表', path: '/worklist', icon: <FileTextOutlined />, color: '#1e40af' },
  { key: 'critical', label: '危急值', path: '/critical-value', icon: <AlertOutlined />, color: '#dc2626' },
  { key: 'patients', label: '患者管理', path: '/patients', icon: <UserOutlined />, color: '#10b981' },
  { key: 'devices', label: '设备管理', path: '/devices', icon: <DesktopOutlined />, color: '#f59e0b' },
  { key: 'ai-assist', label: 'AI 辅助', path: '/ai-assist', icon: <ExperimentOutlined />, color: '#8b5cf6' },
  { key: 'stats', label: '统计分析', path: '/statistics', icon: <BarChartOutlined />, color: '#06b6d4' },
  { key: 'dashboard', label: '院长驾驶舱', path: '/director-dashboard', icon: <RocketOutlined />, color: '#ec4899' },
  { key: 'docs', label: '帮助文档', path: '/docs', icon: <BookOutlined />, color: '#64748b' },
];

// ============= 主组件 =============
export default function HomeV3Page(): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  useCommandPalette([
    { id: 'go-worklist', label: '去工作列表', action: () => (window.location.href = '/worklist') },
    { id: 'go-critical', label: '去危急值', action: () => (window.location.href = '/critical-value') },
  ]);

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }} notificationCount={3}>
      <PageContainer
        title={
          <Space>
            <HomeOutlined />
            欢迎使用 G005 放射科信息系统
          </Space>
        }
        extra={
          <Space>
            <Button icon={<BookOutlined />}>帮助</Button>
            <Button type="primary" icon={<RocketOutlined />}>快速入门</Button>
          </Space>
        }
      >
        {/* 今日概览 KPI */}
        <CardSection title="今日概览" style={{ marginBottom: 16 }} extra={<Tag color="blue">2026-06-06</Tag>}>
          <AppGrid cols={isMobile ? 2 : 4} gap={12}>
            <CardSection hoverable>
              <AppStatistic
                title="今日检查"
                value={247}
                prefix={<FileTextOutlined />}
                trend={{ value: 12, positive: true }}
              />
            </CardSection>
            <CardSection hoverable>
              <AppStatistic
                title="待报告"
                value={97}
                prefix={<ClockCircleOutlined />}
                color="#d97706"
                trend={{ value: 8, positive: false }}
              />
            </CardSection>
            <CardSection hoverable>
              <AppStatistic
                title="已发布报告"
                value={150}
                prefix={<CheckCircleOutlined />}
                color="#059669"
                trend={{ value: 15, positive: true }}
              />
            </CardSection>
            <CardSection hoverable>
              <AppStatistic
                title="危急值"
                value={3}
                prefix={<FireOutlined />}
                color="#dc2626"
                trend={{ value: 25, positive: false }}
              />
            </CardSection>
          </AppGrid>
        </CardSection>

        {/* 快捷入口 */}
        <CardSection title="快捷入口" style={{ marginBottom: 16 }} extra={<AppstoreOutlined />}>
          <AppGrid cols={isMobile ? 2 : 4} gap={12}>
            {QUICK_LINKS.map((link) => (
              <Link to={link.path} key={link.key} style={{ textDecoration: 'none' }}>
                <CardSection hoverable>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: link.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{link.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>→ {link.path}</div>
                    </div>
                  </div>
                </CardSection>
              </Link>
            ))}
          </AppGrid>
        </CardSection>

        {/* 今日趋势 + 系统状态 */}
        <AppGrid cols={isMobile ? 1 : 2} gap={16} style={{ marginBottom: 16 }}>
          <CardSection title="本周检查量趋势" extra={<RiseOutlined />}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '16px 0' }}>
              {[220, 245, 260, 230, 280, 195, 170].map((val, i) => {
                const days = ['一', '二', '三', '四', '五', '六', '日'];
                const max = 280;
                const h = (val / max) * 120;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: h,
                        background: i === 6 ? '#1e40af' : '#3b82f6',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s',
                      }}
                      title={`周${days[i]}: ${val} 例`}
                    />
                    <span style={{ fontSize: 11, color: '#64748b' }}>周{days[i]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </CardSection>

          <CardSection title="系统状态" extra={<HeartOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {[
                { name: 'API 服务', status: 'operational', latency: '45ms' },
                { name: 'AI 推理', status: 'operational', latency: '320ms' },
                { name: 'DICOM PACS', status: 'operational', latency: '120ms' },
                { name: 'MSW 模拟', status: 'operational', latency: '12ms' },
                { name: 'Sentry 监控', status: 'operational', latency: '8ms' },
                { name: 'Web Vitals', status: 'operational', latency: '5ms' },
              ].map((svc) => (
                <div
                  key={svc.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 8,
                    background: '#f0fdf4',
                    borderLeft: '3px solid #22c55e',
                    borderRadius: 4,
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 14 }}>🟢</span>
                    <strong>{svc.name}</strong>
                  </Space>
                  <Space>
                    <Tag color="green">正常</Tag>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{svc.latency}</span>
                  </Space>
                </div>
              ))}
            </Space>
          </CardSection>
        </AppGrid>

        {/* v3.0.0 能力总览 */}
        <CardSection title="v3.0.0 技术能力总览" style={{ marginBottom: 16 }} extra={<RocketOutlined />}>
          <AppGrid cols={isMobile ? 2 : 4} gap={12}>
            {[
              { label: '业务组件', value: '60+', color: '#1e40af' },
              { label: 'Design Tokens', value: '200+', color: '#3b82f6' },
              { label: 'i18n 词条', value: '800+', color: '#10b981' },
              { label: 'XState 状态机', value: '5', color: '#f59e0b' },
              { label: 'MSW 端点', value: '56', color: '#8b5cf6' },
              { label: 'Storybook Story', value: '60+', color: '#ec4899' },
              { label: '测试覆盖', value: '52%', color: '#06b6d4' },
              { label: 'V3 页面', value: '7', color: '#dc2626' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  textAlign: 'center',
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </AppGrid>
        </CardSection>

        {/* 帮助 + 反馈 */}
        <CardSection title="需要帮助?" extra={<BookOutlined />}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>📚 查看 <Link to="/docs">完整文档</Link> 了解系统全部能力</div>
            <div>🐛 提交 <Link to="/issues">问题反馈</Link> 帮助我们改进</div>
            <div>💡 通过 <Link to="/suggestions">建议箱</Link> 提交您的想法</div>
            <div>📞 紧急联系:医院信息科 0571-8888-8888</div>
          </Space>
        </CardSection>

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
