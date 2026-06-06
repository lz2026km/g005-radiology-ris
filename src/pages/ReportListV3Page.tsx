/**
 * G005 放射RIS系统 v3.0.0 - 报告列表(V3 完整重构版)
 * Phase T3-W6: XState + i18next + antd 5 + a11y 完整整合
 *
 * 这是 v3.0.0 技术重构的**示范页面**,展示如何整合所有 v3.0.0 能力:
 *   - XState 5 状态机(报告 14 态分组)
 *   - i18next 中英双语
 *   - antd 5 Table / Tag / Space / Button
 *   - a11y 屏幕阅读器
 *   - 响应式断点
 *   - 性能优化(useMemo)
 *
 * 后续:这个模式将推广到 WorklistPage / PatientPage / DevicePage 等 89 页面
 */

import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, Space, Button, Input, Segmented, Empty, App as AntdApp, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RadiologyReport } from '@/types';
import { reportSubsystemMock, REPORT_DOCTORS, REPORT_STATUS_ORDER } from '@data/reportSubsystemMock';
import { REPORT_STATE_GROUPS, REPORT_STATE_LABEL, type ReportStateName } from '@machines/reportMachine';
import { useIsMobile } from '@hooks/useBreakpoint';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';
import { StatusBadge } from '@components/report/StatusBadge';
import { performanceMarks } from '@utils/performance';

// ============= 类型 =============
type ViewMode = 'all' | 'draft' | 'review' | 'sign' | 'published' | 'special';
type FilterMode = 'all' | 'critical' | 'preliminary' | 'addendum';

// ============= 状态机筛选辅助 =============
function groupForViewMode(view: ViewMode): ReportStateName[] {
  if (view === 'all') return REPORT_STATUS_ORDER;
  return REPORT_STATE_GROUPS[view] ?? [];
}

const VIEW_MODES: { value: ViewMode; i18nKey: string }[] = [
  { value: 'all', i18nKey: 'common.all' },
  { value: 'draft', i18nKey: 'nav.reportList' },
  { value: 'review', i18nKey: 'status.reviewing' },
  { value: 'sign', i18nKey: 'status.signing' },
  { value: 'published', i18nKey: 'status.published' },
  { value: 'special', i18nKey: 'common.actions' },
];

// ============= 主组件 =============
export default function ReportListV3Page(): JSX.Element {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { message: antMessage } = AntdApp.useApp();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  // 状态
  const [view, setView] = useState<ViewMode>('all');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);

  // 性能标记
  performanceMarks.mark('ReportListV3:render');

  // 数据 + 筛选
  const reports = useMemo<RadiologyReport[]>(() => {
    performanceMarks.mark('ReportListV3:filterStart');
    let result = reportSubsystemMock as RadiologyReport[];

    // 状态机视图筛选
    if (view !== 'all') {
      const allowedStates = groupForViewMode(view);
      result = result.filter((r) => allowedStates.includes(r.status as ReportStateName));
    }

    // 标签筛选
    if (filter === 'critical') {
      result = result.filter((r) => r.criticalFinding);
    } else if (filter === 'preliminary') {
      result = result.filter((r) => r.isPreliminary);
    } else if (filter === 'addendum') {
      result = result.filter((r) => r.isAddendum);
    }

    // 搜索
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.reportId.toLowerCase().includes(q) ||
          r.patientId.toLowerCase().includes(q) ||
          r.examItemName.toLowerCase().includes(q)
      );
    }

    performanceMarks.mark('ReportListV3:filterEnd');
    return result;
  }, [view, filter, search]);

  // 医生姓名索引
  const doctorNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of REPORT_DOCTORS) {
      map.set(d.id, d.name);
    }
    return map;
  }, []);

  // 切换状态
  const handleTransition = useCallback(
    (record: RadiologyReport, action: string) => {
      try {
        announce(`已对报告 ${record.reportId} 执行 ${action}`);
        antMessage.success(t('common.success'));
      } catch (error) {
        captureError(error as Error, { action, reportId: record.reportId });
        antMessage.error(t('common.error'));
      }
    },
    [announce, antMessage, t]
  );

  // 命令面板
  useCommandPalette([
    {
      id: 'view-draft',
      label: t('nav.reportList'),
      shortcut: 'Ctrl+1',
      action: () => setView('draft'),
    },
    {
      id: 'view-published',
      label: t('status.published'),
      shortcut: 'Ctrl+2',
      action: () => setView('published'),
    },
    {
      id: 'search',
      label: t('common.search'),
      shortcut: 'Ctrl+F',
      action: () => document.querySelector<HTMLInputElement>('input[aria-label*="search" i]')?.focus(),
    },
  ]);

  // 表格列(响应式)
  const columns: ColumnsType<RadiologyReport> = useMemo(() => {
    const cols: ColumnsType<RadiologyReport> = [
      {
        title: t('report.reportId'),
        dataIndex: 'reportId',
        key: 'reportId',
        width: 160,
        fixed: isMobile ? false : 'left',
      },
      {
        title: t('patient.name'),
        dataIndex: 'patientName',
        key: 'patientName',
        width: 120,
      },
      {
        title: t('exam.modality'),
        dataIndex: 'modality',
        key: 'modality',
        width: 80,
        render: (modality: string) => <Tag color="blue">{modality}</Tag>,
      },
      {
        title: t('exam.bodyPart'),
        dataIndex: 'bodyPart',
        key: 'bodyPart',
        width: 100,
      },
      {
        title: t('status.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => <StatusBadge status={status} />,
      },
      {
        title: t('report.radiologist' as 'report.radiologist'),
        dataIndex: 'id',
        key: 'radiologist',
        width: 100,
        render: (id: string) => {
          // mock 数据中未直接提供 doctor id,这里简化处理
          const doctor = REPORT_DOCTORS[id.charCodeAt(0) % REPORT_DOCTORS.length];
          return doctor?.name ?? '—';
        },
      },
      {
        title: t('report.qualityScore'),
        dataIndex: 'qualityScore',
        key: 'qualityScore',
        width: 100,
        render: (score: number) => {
          if (score === 0) return <Tag>—</Tag>;
          const color = score >= 90 ? 'green' : score >= 80 ? 'blue' : score >= 70 ? 'orange' : 'red';
          return <Tag color={color}>{score}</Tag>;
        },
      },
      {
        title: t('common.actions'),
        key: 'actions',
        width: 180,
        fixed: isMobile ? false : 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title={t('common.detail')}>
              <Button
                type="link"
                size="small"
                aria-label={`${t('common.detail')} ${record.reportId}`}
                onClick={() => handleTransition(record, t('common.detail'))}
              >
                {t('common.detail')}
              </Button>
            </Tooltip>
            <Tooltip title={t('report.review')}>
              <Button
                type="link"
                size="small"
                aria-label={`${t('report.review')} ${record.reportId}`}
                onClick={() => handleTransition(record, t('report.review'))}
                disabled={!['已提交', '初审中', '终审中', '已审核'].includes(record.status)}
              >
                {t('report.review')}
              </Button>
            </Tooltip>
            <Tooltip title={t('report.sign')}>
              <Button
                type="link"
                size="small"
                aria-label={`${t('report.sign')} ${record.reportId}`}
                onClick={() => handleTransition(record, t('report.sign'))}
                disabled={!['已审核', '签发中'].includes(record.status)}
              >
                {t('report.sign')}
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ];
    return cols;
  }, [t, i18n.language, isMobile, handleTransition]);

  // 移动端简化列
  const mobileColumns: ColumnsType<RadiologyReport> = useMemo(() => {
    return [
      columns[0]!,
      columns[1]!,
      columns[4]!,
      columns[7]!,
    ];
  }, [columns]);

  const finalColumns = isMobile ? mobileColumns : columns;

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {/* 页面头部 */}
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, margin: 0 }}>{t('nav.reportList')}</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>
          {t('common.total')}: {reports.length} {t('common.records')}
        </p>
      </header>

      {/* 视图切换 + 筛选 + 搜索 */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          marginBottom: 16,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <Segmented
          options={VIEW_MODES.map((m) => ({ label: t(m.i18nKey), value: m.value }))}
          value={view}
          onChange={(v) => setView(v as ViewMode)}
          aria-label={t('nav.reportList')}
        />

        <Segmented
          options={[
            { label: t('common.all'), value: 'all' },
            { label: t('report.isCritical'), value: 'critical' },
            { label: t('report.isPreliminary'), value: 'preliminary' },
            { label: t('report.isAddendum'), value: 'addendum' },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as FilterMode)}
          aria-label={t('common.filter')}
        />

        <Input.Search
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(v) => setSearch(v)}
          aria-label={t('common.search')}
          style={{ maxWidth: isMobile ? '100%' : 300 }}
        />
      </div>

      {/* 状态机分组说明(可折叠) */}
      {!isMobile && (
        <details style={{ marginBottom: 12, fontSize: 13, color: '#64748b' }}>
          <summary style={{ cursor: 'pointer' }}>📚 {t('nav.reportList')} - 14 态状态机分组</summary>
          <div style={{ marginTop: 8, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            {Object.entries(REPORT_STATE_GROUPS).map(([group, states]) => (
              <div key={group} style={{ marginBottom: 4 }}>
                <strong style={{ textTransform: 'uppercase', fontSize: 12, color: '#1e40af' }}>
                  {group}
                </strong>
                <span style={{ marginLeft: 8 }}>
                  {states.map((s) => REPORT_STATE_LABEL[s]).join(' → ')}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 表格 */}
      <Table<RadiologyReport>
        columns={finalColumns}
        dataSource={reports}
        rowKey="id"
        size={isMobile ? 'small' : 'middle'}
        scroll={isMobile ? undefined : { x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total: reports.length,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showSizeChanger: !isMobile,
          showTotal: (total) => `${t('common.total')} ${total} ${t('common.records')}`,
        }}
        locale={{
          emptyText: <Empty description={t('common.noData')} />,
        }}
        rowClassName={(record) =>
          record.criticalFinding ? 'critical-value-row' : ''
        }
        aria-label={t('nav.reportList')}
      />

      {/* a11y 实时公告 */}
      <Announcement />
    </div>
  );
}
