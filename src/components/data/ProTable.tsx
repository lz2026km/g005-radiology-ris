/**
 * G005 放射RIS系统 v3.0.0 - Data 业务组件
 * Phase T2-W4: ProTable / Statistic / Descriptions / Tabs / Collapse
 */

import { useState, useMemo, type ReactNode } from 'react';
import {
  Table,
  Statistic as AntStatistic,
  Descriptions,
  Tabs,
  Collapse,
  Input,
  Space,
  Segmented,
  Empty,
  type TableProps,
  type TablePaginationConfig,
} from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@utils/performance';

// ============= ProTable 业务封装(搜索 + 筛选 + 分页 + 导出) =============
export interface ProTableProps<T = Record<string, unknown>> extends Omit<TableProps<T>, 'dataSource' | 'columns'> {
  dataSource: T[];
  columns: ProColumn<T>[];
  /** 唯一 key 字段 */
  rowKey: keyof T | ((record: T) => string);
  /** 搜索字段(默认搜索所有 string 字段) */
  searchFields?: (keyof T)[];
  /** 搜索占位 */
  searchPlaceholder?: string;
  /** 显示工具栏 */
  showToolbar?: boolean;
  /** 导出回调 */
  onExport?: (data: T[]) => void;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 初始分页 */
  pageSize?: number;
  /** 行选择 */
  rowSelection?: TableProps<T>['rowSelection'];
}

export interface ProColumn<T = Record<string, unknown>> {
  title: ReactNode;
  dataIndex?: keyof T | string;
  key?: string;
  width?: number | string;
  fixed?: 'left' | 'right';
  /** 排序 */
  sorter?: (a: T, b: T) => number;
  /** 过滤 */
  filters?: Array<{ text: string; value: string | number }>;
  /** 自定义渲染 */
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /** 文本对齐 */
  align?: 'left' | 'center' | 'right';
  /** 是否可搜索(默认 false) */
  searchable?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
}

export function ProTable<T extends Record<string, unknown> = Record<string, unknown>>({
  dataSource,
  columns,
  rowKey,
  searchFields,
  searchPlaceholder,
  showToolbar = true,
  onExport,
  onRefresh,
  pageSize = 20,
  rowSelection,
  ...restProps
}: ProTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // 过滤 + 搜索
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return dataSource;
    const q = debouncedSearch.toLowerCase();
    const fields = (searchFields ?? columns
      .filter((c) => c.searchable)
      .map((c) => c.dataIndex ?? c.key)
      .filter(Boolean) as (keyof T)[]);
    if (fields.length === 0) {
      // 默认搜索所有 string 字段
      return dataSource.filter((row) =>
        Object.entries(row).some(([, v]) =>
          typeof v === 'string' && v.toLowerCase().includes(q)
        )
      );
    }
    return dataSource.filter((row) =>
      fields.some((field) => {
        const v = row[field];
        return typeof v === 'string' && v.toLowerCase().includes(q);
      })
    );
  }, [dataSource, debouncedSearch, columns, searchFields]);

  // 过滤掉 hidden 列
  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns]
  );

  const pagination: TablePaginationConfig = {
    pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `${t('common.total')} ${total} ${t('common.records')}`,
    pageSizeOptions: [10, 20, 50, 100],
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
      {showToolbar && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: 16,
            borderBottom: '1px solid var(--border-subtle)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder={searchPlaceholder ?? t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
            aria-label={t('common.search')}
          />
          <div style={{ flex: 1 }} />
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={{
                border: '1px solid var(--border-default)',
                background: 'transparent',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              aria-label={t('common.refresh')}
            >
              <ReloadOutlined /> {t('common.refresh')}
            </button>
          )}
          {onExport && filteredData.length > 0 && (
            <button
              type="button"
              onClick={() => onExport(filteredData)}
              style={{
                border: '1px solid var(--border-default)',
                background: 'transparent',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              aria-label={t('common.export')}
            >
              <DownloadOutlined /> {t('common.export')}
            </button>
          )}
        </div>
      )}

      <Table<T>
        {...restProps}
        rowKey={rowKey as string}
        columns={visibleColumns as never}
        dataSource={filteredData}
        pagination={pagination}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        size="middle"
        locale={{ emptyText: <Empty description={t('common.noData')} /> }}
      />
    </div>
  );
}

// ============= Statistic 业务封装 =============
export interface AppStatisticProps {
  title: ReactNode;
  value: number | string;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** 趋势(对比上一周期) */
  trend?: { value: number; positive: boolean };
  /** 颜色 */
  color?: string;
  /** 帮助 */
  help?: ReactNode;
  /** 加载 */
  loading?: boolean;
}

export function AppStatistic({
  title,
  value,
  precision = 0,
  prefix,
  suffix,
  trend,
  color,
  help,
  loading = false,
}: AppStatisticProps) {
  return (
    <AntStatistic
      title={
        <span style={{ color: 'var(--color-gray-600)' }}>{title}</span>
      }
      value={value}
      precision={precision}
      prefix={prefix}
      suffix={suffix}
      loading={loading}
      valueStyle={{ color: color ?? 'var(--color-gray-900)', fontSize: 28, fontWeight: 600 }}
    >
      {trend && (
        <div
          style={{
            fontSize: 12,
            color: trend.positive ? 'var(--color-success-600)' : 'var(--color-error-600)',
            marginTop: 4,
          }}
        >
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% 较上期
        </div>
      )}
    </AntStatistic>
  );
}

// ============= Descriptions 业务封装 =============
export interface AppDescriptionsProps {
  title?: ReactNode;
  items: Array<{
    key: string;
    label: ReactNode;
    value: ReactNode;
    span?: number;
  }>;
  column?: number;
  bordered?: boolean;
  size?: 'default' | 'middle' | 'small';
}

export function AppDescriptions({
  title,
  items,
  column = 2,
  bordered = true,
  size = 'default',
}: AppDescriptionsProps) {
  return (
    <Descriptions
      title={title}
      column={column}
      bordered={bordered}
      size={size}
      items={items.map((item) => ({
        key: item.key,
        label: item.label,
        children: item.value,
        span: item.span,
      }))}
    />
  );
}

// ============= Tabs 业务封装 =============
export interface AppTabsProps {
  items: Array<{
    key: string;
    label: ReactNode;
    children: ReactNode;
    disabled?: boolean;
  }>;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'default' | 'small' | 'large';
  position?: 'top' | 'right' | 'bottom' | 'left';
  tabBarExtraContent?: ReactNode;
}

export function AppTabs({
  items,
  defaultActiveKey,
  onChange,
  type = 'line',
  size = 'default',
  position = 'top',
  tabBarExtraContent,
}: AppTabsProps) {
  return (
    <Tabs
      items={items.map((item) => ({
        key: item.key,
        label: item.label,
        children: item.children,
        disabled: item.disabled,
      }))}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      type={type}
      size={size}
      tabPosition={position}
      tabBarExtraContent={tabBarExtraContent}
    />
  );
}

// ============= Collapse 业务封装 =============
export interface AppCollapseProps {
  items: Array<{
    key: string;
    label: ReactNode;
    children: ReactNode;
    extra?: ReactNode;
    disabled?: boolean;
  }>;
  defaultActiveKey?: string | string[];
  accordion?: boolean;
  bordered?: boolean;
}

export function AppCollapse({
  items,
  defaultActiveKey,
  accordion = false,
  bordered = true,
}: AppCollapseProps) {
  return (
    <Collapse
      items={items.map((item) => ({
        key: item.key,
        label: item.label,
        children: item.children,
        extra: item.extra,
        disabled: item.disabled,
      }))}
      defaultActiveKey={defaultActiveKey as never}
      accordion={accordion}
      bordered={bordered}
    />
  );
}

// ============= Segmented Filter(业务) =============
export interface AppSegmentedFilterProps<T extends string> {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}

export function AppSegmentedFilter<T extends string>({
  options,
  value,
  onChange,
}: AppSegmentedFilterProps<T>) {
  return (
    <Segmented
      options={options}
      value={value}
      onChange={(v) => onChange(v as T)}
    />
  );
}

// ============= PageContainer(页面容器) =============
export interface PageContainerProps {
  title?: ReactNode;
  extra?: ReactNode;
  breadcrumb?: ReactNode;
  children: ReactNode;
  /** 是否有 padding */
  noPadding?: boolean;
  /** 是否有 background */
  noBackground?: boolean;
}

export function PageContainer({
  title,
  extra,
  breadcrumb,
  children,
  noPadding = false,
  noBackground = false,
}: PageContainerProps) {
  return (
    <div
      style={{
        background: noBackground ? 'transparent' : 'var(--content-bg, var(--color-gray-50))',
        minHeight: '100%',
        padding: noPadding ? 0 : 'var(--space-6)',
      }}
    >
      {(title || extra) && (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {breadcrumb}
          {title && (
            <h1
              style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700,
                color: 'var(--content-fg, var(--color-gray-900))',
                margin: 0,
              }}
            >
              {title}
            </h1>
          )}
          {extra && <Space>{extra}</Space>}
        </header>
      )}
      {children}
    </div>
  );
}
