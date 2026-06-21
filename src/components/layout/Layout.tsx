/**
 * G005 放射RIS系统 v3.0.0 - Layout 业务组件
 * Phase T2-W4: PageLayout / Sidebar / Header / ContentContainer / SplitLayout
 */

import { useState, type ReactNode } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Breadcrumb, Tag, type MenuProps } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MAIN_CONTENT_ID } from '@/a11y/SkipLink';

const { Sider, Header, Content, Footer } = Layout;

// ============= 侧边栏菜单项类型 =============
export interface SidebarItem {
  key: string;
  icon?: ReactNode;
  label: ReactNode;
  path?: string;
  children?: SidebarItem[];
  disabled?: boolean;
}

// ============= 应用主布局 =============
export interface AppLayoutProps {
  /** 侧边栏菜单 */
  sidebarItems: SidebarItem[];
  /** 用户信息 */
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  /** Logo */
  logo?: ReactNode;
  /** 内容区 */
  children: ReactNode;
  /** 通知数量 */
  notificationCount?: number;
  /** 退出登录 */
  onLogout?: () => void;
  /** 个人中心 */
  onProfile?: () => void;
  /** 设置 */
  onSettings?: () => void;
  /** 面包屑(自动从路由生成) */
  breadcrumb?: boolean;
  /** 页脚 */
  footer?: ReactNode;
}

export function AppLayout({
  sidebarItems,
  user,
  logo,
  children,
  notificationCount = 0,
  onLogout,
  onProfile,
  onSettings,
  breadcrumb = true,
  footer,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // 递归展开所有 path 到 keys
  const flattenKeys = (items: SidebarItem[]): string[] => {
    const keys: string[] = [];
    items.forEach((item) => {
      if (item.path) keys.push(item.path);
      if (item.children) keys.push(...flattenKeys(item.children));
    });
    return keys;
  };

  // 当前选中和打开的 keys
  const selectedKeys = flattenKeys(sidebarItems).filter((p) => location.pathname === p);

  // 转换为 antd Menu items
  const menuItems: MenuProps['items'] = sidebarItems.map((item) => ({
    key: item.path ?? item.key,
    icon: item.icon,
    label: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
    disabled: item.disabled,
    children: item.children
      ? item.children.map((child) => ({
          key: child.path ?? child.key,
          icon: child.icon,
          label: child.path ? <Link to={child.path}>{child.label}</Link> : child.label,
          disabled: child.disabled,
        }))
      : undefined,
  }));

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('common.detail'), onClick: onProfile },
    { key: 'settings', icon: <SettingOutlined />, label: t('common.settings'), onClick: onSettings },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: t('common.logout'), onClick: onLogout, danger: true },
  ];

  // 自动面包屑
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <Link to="/">{t('nav.home')}</Link> },
    ...pathSegments.map((seg, idx) => ({
      title: <Link to={`/${pathSegments.slice(0, idx + 1).join('/')}`}>{seg}</Link>,
    })),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={64}
        style={{
          background: 'var(--sidebar-bg)',
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 16px',
            color: 'var(--sidebar-fg)',
            fontSize: 18,
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {logo ?? '🏥 G005'}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/* 头部 */}
        <Header
          style={{
            background: 'var(--header-bg)',
            borderBottom: '1px solid var(--header-border)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 'var(--z-sticky)',
          }}
        >
          <Space>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 18,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
              aria-label={collapsed ? t('app.expand') || '展开侧边栏' : t('app.collapse') || '收起侧边栏'}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            {breadcrumb && (
              <Breadcrumb items={breadcrumbItems} style={{ marginLeft: 16 }} />
            )}
          </Space>

          <Space size="large">
            {/* 通知 */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              style={{
                position: 'relative',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 18,
                color: 'var(--text-primary)',
                padding: 4,
              }}
              aria-label={t('nav.notification')}
            >
              <BellOutlined />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: 10,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {/* 语言切换(占位,实际由 App.tsx 处理) */}
            <button
              type="button"
              aria-label={t('common.language')}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 16,
                color: 'var(--text-primary)',
                padding: 4,
              }}
            >
              <GlobalOutlined />
            </button>

            {/* 用户菜单 */}
            {user && (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user.avatar} icon={!user.avatar ? <UserOutlined /> : undefined}>
                    {!user.avatar ? user.name[0] : undefined}
                  </Avatar>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{user.name}</div>
                    <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
                      {user.role}
                    </Tag>
                  </div>
                </Space>
              </Dropdown>
            )}
          </Space>
        </Header>

        {/* 内容区 */}
        <Content
          id={MAIN_CONTENT_ID}
          style={{
            padding: 24,
            background: 'var(--content-bg)',
            color: 'var(--content-fg)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>

        {/* 页脚 */}
        {footer !== undefined ? (
          footer
        ) : (
          <Footer style={{ textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
            G005 放射科 RIS 系统 © 2026 · 汉东省人民医院
          </Footer>
        )}
      </Layout>
    </Layout>
  );
}

// ============= 分割布局(主从) =============
export interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  /** 左右比例(默认 30 / 70) */
  leftRatio?: number;
  /** 可调整 */
  resizable?: boolean;
  /** 移动端是否堆叠 */
  stackOnMobile?: boolean;
}

export function SplitLayout({
  left,
  right,
  leftRatio = 30,
  resizable = false,
  stackOnMobile = true,
}: SplitLayoutProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: stackOnMobile
          ? undefined
          : `${leftRatio}% 1fr`,
        gap: 16,
        height: '100%',
        // 移动端堆叠
        '@media (max-width: 768px)': stackOnMobile
          ? { gridTemplateColumns: '1fr' }
          : undefined,
      } as React.CSSProperties}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          overflow: 'auto',
        }}
      >
        {left}
      </div>
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          overflow: 'auto',
        }}
      >
        {right}
      </div>
    </div>
  );
}

// ============= Card Section 业务封装 =============
export interface CardSectionProps {
  title?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

import { Card } from 'antd';

export function CardSection({
  title,
  extra,
  children,
  noPadding = false,
  bordered = true,
  hoverable = false,
}: CardSectionProps) {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={bordered}
      hoverable={hoverable}
      bodyStyle={noPadding ? { padding: 0 } : undefined}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        border: bordered ? '1px solid var(--border-subtle)' : 'none',
      }}
    >
      {children}
    </Card>
  );
}

// ============= Grid 业务封装 =============
export interface AppGridProps {
  cols?: number;
  gap?: number;
  /** 移动端列数 */
  mobileCols?: number;
  /** 平板列数 */
  tabletCols?: number;
  children: ReactNode;
  /** CSS 类 */
  className?: string;
}

export function AppGrid({
  cols = 3,
  gap = 16,
  mobileCols = 1,
  tabletCols = 2,
  children,
  className,
}: AppGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
        gap,
        // 响应式
        '@media (max-width: 768px)': { gridTemplateColumns: `repeat(${mobileCols}, 1fr)` },
        '@media (min-width: 769px) and (max-width: 1024px)': { gridTemplateColumns: `repeat(${tabletCols}, 1fr)` },
        '@media (min-width: 1025px)': { gridTemplateColumns: `repeat(${cols}, 1fr)` },
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// ============= 简单 Stack 垂直布局 =============
export interface StackProps {
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Stack({
  direction = 'column',
  gap = 12,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children,
  className,
  style,
}: StackProps) {
  const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
  const justifyMap = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around' };
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
