/**
 * G005 放射RIS系统 v3.0.0 - EmptyState 业务组件
 * Phase T2-W4
 */

import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import { InboxOutlined, FileSearchOutlined, WarningOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';

export interface AppEmptyProps {
  /** 场景 */
  variant?: 'no-data' | 'no-results' | 'no-permission' | 'error';
  /** 自定义描述 */
  description?: ReactNode;
  /** 操作 */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 图片(可选自定义) */
  image?: ReactNode;
  /** 图片样式 */
  imageStyle?: CSSProperties;
}

const VARIANT_ICONS: Record<NonNullable<AppEmptyProps['variant']>, ReactNode> = {
  'no-data': <InboxOutlined style={{ fontSize: 64, color: '#94a3b8' }} />,
  'no-results': <FileSearchOutlined style={{ fontSize: 64, color: '#94a3b8' }} />,
  'no-permission': <WarningOutlined style={{ fontSize: 64, color: '#f59e0b' }} />,
  'error': <WarningOutlined style={{ fontSize: 64, color: '#dc2626' }} />,
};

const VARIANT_DEFAULTS: Record<NonNullable<AppEmptyProps['variant']>, string> = {
  'no-data': 'common.noData',
  'no-results': 'common.noResults',
  'no-permission': 'error.forbidden',
  'error': 'error.serverError',
};

export function AppEmpty({
  variant = 'no-data',
  description,
  action,
  image,
  imageStyle,
}: AppEmptyProps) {
  const { t } = useTranslation();
  const defaultDesc = t(VARIANT_DEFAULTS[variant]);
  const icon = image ?? VARIANT_ICONS[variant];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        minHeight: 300,
        textAlign: 'center',
      }}
      role="status"
    >
      <Empty
        image={icon}
        imageStyle={{ height: 80, ...imageStyle }}
        description={
          <span style={{ color: 'var(--color-gray-500)', fontSize: 14 }}>
            {description ?? defaultDesc}
          </span>
        }
      />
      {action && (
        <Button
          type="primary"
          onClick={action.onClick}
          style={{ marginTop: 16 }}
          aria-label={action.label}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============= Progress 业务封装 =============
export interface AppProgressProps {
  /** 0-100 */
  percent: number;
  /** 状态 */
  status?: 'normal' | 'success' | 'error' | 'active';
  /** 显示文字 */
  showInfo?: boolean;
  /** 大小 */
  size?: 'default' | 'small';
  /** 颜色 */
  strokeColor?: string | { from: string; to: string };
  /** aria-label */
  ariaLabel?: string;
}

import { Progress } from 'antd';

export function AppProgress({
  percent,
  status = 'normal',
  showInfo = true,
  size = 'default',
  strokeColor,
  ariaLabel,
}: AppProgressProps) {
  // 限制 0-100
  const safePercent = Math.max(0, Math.min(100, percent));

  // 自动根据 percent 推断 status
  let computedStatus: 'normal' | 'success' | 'error' | 'active' = status;
  if (status === 'normal') {
    if (safePercent >= 100) computedStatus = 'success';
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div aria-hidden="true">
        <Progress
          percent={safePercent}
          status={computedStatus}
          showInfo={showInfo}
          size={size}
          strokeColor={strokeColor}
        />
      </div>
    </div>
  );
}

// ============= Alert 业务封装 =============
export interface AppAlertProps {
  /** 类型 */
  type?: 'success' | 'info' | 'warning' | 'error';
  /** 标题 */
  message: ReactNode;
  /** 描述 */
  description?: ReactNode;
  /** 可关闭 */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 是否显示图标 */
  showIcon?: boolean;
}

import { Alert } from 'antd';

export function AppAlert({
  type = 'info',
  message,
  description,
  closable = false,
  onClose,
  showIcon = true,
}: AppAlertProps) {
  return (
    <Alert
      type={type}
      message={message}
      description={description}
      closable={closable}
      onClose={onClose}
      showIcon={showIcon}
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
    />
  );
}

// ============= Result 业务封装 =============
export interface AppResultProps {
  status: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
  title: ReactNode;
  subTitle?: ReactNode;
  extra?: ReactNode;
}

import { Result, Button } from 'antd';

export function AppResult({ status, title, subTitle, extra }: AppResultProps) {
  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={extra ?? <Button type="primary">返回</Button>}
    />
  );
}

// 重新导出 v3.0.2.7 新增的 API 状态横幅组件
export { LoadingBanner } from './LoadingBanner';
export { ErrorBanner } from './ErrorBanner';
