/**
 * G005 放射RIS系统 v3.0.0 - Layout Story
 * Phase T2-W5
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout, SplitLayout, CardSection, AppGrid, Stack, type SidebarItem } from './Layout';
import { Button, Card, Tag, Avatar, Space } from 'antd';
import { HomeOutlined, FileTextOutlined, AlertOutlined, UserOutlined, SettingOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const meta: Meta = {
  title: 'Layout/AppLayout SplitLayout CardSection AppGrid Stack',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const SAMPLE_SIDEBAR: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  {
    key: 'workbench',
    label: '工作台',
    children: [
      { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
      { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
    ],
  },
  {
    key: 'reports',
    label: '报告',
    children: [
      { key: 'report-list', icon: <FileTextOutlined />, label: '报告列表', path: '/reports' },
      { key: 'report-write', icon: <FileTextOutlined />, label: '报告书写', path: '/report-write-v2' },
      { key: 'report-review', icon: <FileTextOutlined />, label: '报告审核', path: '/report-review' },
    ],
  },
  {
    key: 'patients',
    label: '患者',
    children: [
      { key: 'patient-list', icon: <UserOutlined />, label: '患者列表', path: '/patients' },
      { key: 'patient-portal', icon: <UserOutlined />, label: '患者门户', path: '/patient-portal' },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    children: [
      { key: 'ai-assist', icon: <MedicineBoxOutlined />, label: 'AI 辅助诊断', path: '/ai-assist' },
      { key: 'ai-qc', icon: <MedicineBoxOutlined />, label: 'AI 质控', path: '/ai-qc' },
    ],
  },
  { key: 'settings', icon: <SettingOutlined />, label: '系统设置', path: '/settings' },
];

const SAMPLE_USER = {
  name: '张明远',
  role: '主任医师',
};

const SampleContent = () => (
  <div>
    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>报告列表</h1>
    <p style={{ color: '#64748b' }}>这是示例内容区域,展示 Layout 组件如何工作。</p>
    <Card style={{ marginTop: 16 }}>
      <p>主内容区(MAIN_CONTENT_ID)</p>
    </Card>
  </div>
);

// ============= AppLayout Story =============
export const AppLayoutBasic: Story = {
  render: () => (
    <AppLayout
      sidebarItems={SAMPLE_SIDEBAR}
      user={SAMPLE_USER}
      notificationCount={3}
      onLogout={() => alert('退出登录')}
      onProfile={() => alert('个人中心')}
      onSettings={() => alert('设置')}
    >
      <SampleContent />
    </AppLayout>
  ),
};

export const AppLayoutCollapsed: Story = {
  render: () => (
    <AppLayout
      sidebarItems={SAMPLE_SIDEBAR}
      user={SAMPLE_USER}
      notificationCount={99}
    >
      <SampleContent />
    </AppLayout>
  ),
};

export const AppLayoutNoUser: Story = {
  render: () => (
    <AppLayout sidebarItems={SAMPLE_SIDEBAR}>
      <SampleContent />
    </AppLayout>
  ),
};

export const AppLayoutCustomLogo: Story = {
  render: () => (
    <AppLayout
      sidebarItems={SAMPLE_SIDEBAR}
      logo="🏥 汉东省人民医院"
      user={SAMPLE_USER}
    >
      <SampleContent />
    </AppLayout>
  ),
};

// ============= SplitLayout Story =============
export const SplitLayoutBasic: Story = {
  render: () => (
    <div style={{ height: 500, padding: 16 }}>
      <SplitLayout
        left={
          <div>
            <h3>左侧 - 患者列表</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: 8, background: '#f1f5f9', marginBottom: 4, borderRadius: 4 }}>张志远</li>
              <li style={{ padding: 8, background: '#f1f5f9', marginBottom: 4, borderRadius: 4 }}>王秀英</li>
              <li style={{ padding: 8, background: '#f1f5f9', marginBottom: 4, borderRadius: 4 }}>李建国</li>
            </ul>
          </div>
        }
        right={
          <div>
            <h3>右侧 - 报告内容</h3>
            <p>选择左侧患者查看详情</p>
          </div>
        }
      />
    </div>
  ),
};

export const SplitLayout70_30: Story = {
  render: () => (
    <div style={{ height: 500, padding: 16 }}>
      <SplitLayout
        leftRatio={70}
        left={
          <div>
            <h3>主内容 70%</h3>
            <p>较大区域用于显示主要内容</p>
          </div>
        }
        right={
          <div>
            <h3>侧边 30%</h3>
            <p>较小区域</p>
          </div>
        }
      />
    </div>
  ),
};

// ============= CardSection Story =============
export const CardSectionBasic: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <CardSection title="基本信息" extra={<Button>编辑</Button>}>
        <p>报告 ID: RP20260604001</p>
        <p>患者: 张志远</p>
        <p>检查: 胸部 CT 平扫</p>
      </CardSection>
    </div>
  ),
};

export const CardSectionNoPadding: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <CardSection title="影像" noPadding>
        <div style={{ height: 300, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          [DICOM 图像]
        </div>
      </CardSection>
    </div>
  ),
};

export const CardSectionHoverable: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <Stack direction="row" gap={16} wrap>
        <CardSection hoverable title="今日检查" style={{ width: 240 }}>
          <Space direction="vertical" size="small">
            <Tag color="blue">总检查 247</Tag>
            <Tag color="green">已完成 150</Tag>
            <Tag color="orange">待报告 97</Tag>
          </Space>
        </CardSection>
        <CardSection hoverable title="危急值" style={{ width: 240 }}>
          <Space direction="vertical" size="small">
            <Tag color="red">未处理 3</Tag>
            <Tag color="orange">处理中 5</Tag>
            <Tag color="green">已完成 12</Tag>
          </Space>
        </CardSection>
        <CardSection hoverable title="设备状态" style={{ width: 240 }}>
          <Space direction="vertical" size="small">
            <Tag color="green">运行中 6</Tag>
            <Tag color="default">空闲 2</Tag>
            <Tag color="orange">维护 1</Tag>
          </Space>
        </CardSection>
      </Stack>
    </div>
  ),
};

// ============= AppGrid Story =============
export const AppGridBasic: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <AppGrid cols={4} gap={16}>
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSection key={i} title={`卡片 ${i + 1}`}>
            <p>响应式网格内容</p>
            <p>列数:{i + 1}</p>
          </CardSection>
        ))}
      </AppGrid>
    </div>
  ),
};

export const AppGridDashboard: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <AppGrid cols={4} gap={16}>
        <CardSection>
          <h3 style={{ color: '#1e40af' }}>247</h3>
          <p style={{ color: '#64748b' }}>今日检查</p>
        </CardSection>
        <CardSection>
          <h3 style={{ color: '#059669' }}>150</h3>
          <p style={{ color: '#64748b' }}>已完成报告</p>
        </CardSection>
        <CardSection>
          <h3 style={{ color: '#d97706' }}>97</h3>
          <p style={{ color: '#64748b' }}>待报告</p>
        </CardSection>
        <CardSection>
          <h3 style={{ color: '#dc2626' }}>3</h3>
          <p style={{ color: '#64748b' }}>危急值</p>
        </CardSection>
      </AppGrid>
    </div>
  ),
};

// ============= Stack Story =============
export const StackRow: Story = {
  render: () => (
    <Stack direction="row" gap={12} align="center">
      <Avatar icon={<UserOutlined />} />
      <div>
        <div style={{ fontWeight: 600 }}>张明远</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>主任医师</div>
      </div>
      <Tag color="blue">在岗</Tag>
      <Button size="small">详情</Button>
    </Stack>
  ),
};

export const StackColumn: Story = {
  render: () => (
    <Stack direction="column" gap={8} align="stretch" style={{ width: 300 }}>
      <CardSection title="任务 1" hoverable>
        <p>完善病历信息</p>
      </CardSection>
      <CardSection title="任务 2" hoverable>
        <p>审核 5 份报告</p>
      </CardSection>
      <CardSection title="任务 3" hoverable>
        <p>处理 2 个危急值</p>
      </CardSection>
    </Stack>
  ),
};

export const StackSpaceBetween: Story = {
  render: () => (
    <Stack direction="row" justify="between" align="center" style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
      <div>
        <div style={{ fontWeight: 600 }}>报告列表</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>共 247 条</div>
      </div>
      <Stack direction="row" gap={8}>
        <Button>导出</Button>
        <Button type="primary">新建</Button>
      </Stack>
    </Stack>
  ),
};
