/**
 * G005 放射RIS系统 v3.0.0 - 工作列表 V3 完整重构
 * Phase T3-W6: XState 5 状态机 + 业务组件 + i18n + a11y
 *
 * 状态机:
 *   - 每个检查(Exam)有自己的 deviceMachine(空闲 → 使用中 → ...)
 *   - 工作列表本身有 listMachine(加载 / 列表 / 看板 / 卡片)
 *   - 危急值 CV 用 criticalValueMachine
 *
 * 视图: 列表 / 卡片 / 看板(3 模式)
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachine } from '@xstate/react';
import {
  PageContainer,
  ProTable,
  AppLayout,
  AppGrid,
  CardSection,
  AppSearchInput,
  AppSelectField,
  AppEmpty,
  type ProColumn,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, Avatar, Segmented, App as AntdApp } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  ScanOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  PrinterOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ProjectOutlined,
  } from '@ant-design/icons';
import { deviceMachine } from '@machines/deviceMachine';
import { initialRadiologyExams, initialModalityDevices, initialUsers } from '@data/initialData';
import { examApi } from '@services/api';
import { LoadingBanner, ErrorBanner } from '@components/feedback';
import { useToast, useNotification } from '@components/antd';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { useIsMobile } from '@hooks/useBreakpoint';
import { useDebounce, performanceMarks } from '@utils/performance';
import { captureError } from '@observability/sentry';

// ============= 状态 =============
type ViewMode = 'list' | 'card' | 'kanban';

const STATUS_CONFIG: Record<string, { color: string; label: string; order: number }> = {
  '已登记': { color: 'blue', label: '已登记', order: 0 },
  '待检查': { color: 'purple', label: '待检查', order: 1 },
  '检查中': { color: 'magenta', label: '检查中', order: 2 },
  '待报告': { color: 'gold', label: '待报告', order: 3 },
  '已报告': { color: 'green', label: '已报告', order: 4 },
  '已发布': { color: 'success', label: '已发布', order: 5 },
  '已取消': { color: 'default', label: '已取消', order: 6 },
};

const KANBAN_COLUMNS = ['已登记', '待检查', '检查中', '待报告', '已报告', '已发布'] as const;
type KanbanColumn = (typeof KANBAN_COLUMNS)[number];

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  '普通': { color: 'default' },
  '紧急': { color: 'orange' },
  '危重': { color: 'red' },
  '会诊': { color: 'purple' },
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'patients', icon: <UserOutlined />, label: '患者', path: '/patients' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 主组件 =============
export default function WorklistV3Page(): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { message: antMessage } = AntdApp.useApp();
  const toast = useToast();
  const notification = useNotification();
  const { announce, Announcement } = useScreenReaderAnnouncer();
  performanceMarks.mark('WorklistV3:render');

  // XState - 单个设备状态机示例(设备 #1)
  const [, sendDeviceEvent] = useMachine(deviceMachine, {
    input: { deviceId: 'dev-CT-1', deviceCode: 'CT-1', modality: 'CT' },
  });

  // API 加载
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const res = await examApi.list({})
      if (cancelled) return
      if (res.success) {
        setLoadError(null)
      } else {
        setLoadError('API 不可用,使用本地数据')
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  // 视图状态
  const [view, setView] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // 数据筛选
  const exams = useMemo(() => {
    performanceMarks.mark('WorklistV3:filter');
    let result = initialRadiologyExams as Array<{
      id: string; examId: string; accessionNumber: string;
      patientId: string; patientName: string; gender: string; age: number;
      modality: string; bodyPart: string; examType: string;
      priority: string; status: string; deviceId?: string;
      roomId?: string; doctorId?: string; scheduledAt: string;
      patientType: string; clinicalDiagnosis?: string;
      isUrgent?: boolean; criticalFinding?: boolean;
    }>;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (e) => e.patientName.toLowerCase().includes(q) || e.examId.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== 'all') result = result.filter((e) => e.priority === priorityFilter);
    if (modalityFilter !== 'all') result = result.filter((e) => e.modality === modalityFilter);
    return result;
  }, [debouncedSearch, priorityFilter, modalityFilter]);

  // 状态计数
  const statusCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of exams) counts[e.status] = (counts[e.status] ?? 0) + 1;
    return counts;
  }, [exams]);

  // 设备查找
  const deviceMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of initialModalityDevices) map.set(d.id, d.name);
    return map;
  }, []);

  // 医生查找
  const doctorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of initialUsers) map.set(u.id, u.name);
    return map;
  }, []);

  // 操作回调
  const handleCheckIn = useCallback(
    (record: { id: string; patientName: string }) => {
      try {
        announce(`已为 ${record.patientName} 报到`);
        toast.success(`已为 ${record.patientName} 报到`);
        // 实际应调用 API
      } catch (error) {
        captureError(error as Error, { action: 'checkIn', recordId: record.id });
        toast.error('操作失败,请重试');
      }
    },
    [announce, toast]
  );

  const handleStartExam = useCallback(
    (record: { id: string; patientName: string; modality: string }) => {
      try {
        // 发送 XState 事件
        sendDeviceEvent({ type: 'START_USE', patientId: record.id, examId: record.id, by: 'doctor-001' });
        announce(`已开始检查 ${record.patientName}`);
        toast.success(`${record.patientName} 检查已开始`);
      } catch (error) {
        captureError(error as Error, { action: 'startExam', recordId: record.id });
        toast.error('启动失败');
      }
    },
    [announce, toast, sendDeviceEvent]
  );

  // 命令面板(Ctrl+K)
  useCommandPalette([
    { id: 'view-list', label: t('worklist.list'), shortcut: 'Ctrl+1', action: () => setView('list') },
    { id: 'view-card', label: t('worklist.card'), shortcut: 'Ctrl+2', action: () => setView('card') },
    { id: 'view-kanban', label: t('worklist.kanban'), shortcut: 'Ctrl+3', action: () => setView('kanban') },
    { id: 'refresh', label: t('common.refresh'), shortcut: 'F5', action: () => announce('数据已刷新') },
  ]);

  // 表格列
  const columns: ProColumn[] = useMemo(
    () => [
      { title: t('exam.examId'), dataIndex: 'examId', width: 160, searchable: true },
      {
        title: t('patient.name'),
        dataIndex: 'patientName',
        width: 120,
        render: (_v, r) => (
          <Space>
            <Avatar size="small">{(r as { patientName: string }).patientName[0]}</Avatar>
            {(r as { patientName: string }).patientName}
          </Space>
        ),
      },
      { title: t('exam.gender'), dataIndex: 'gender', width: 60, render: (v) => v === '男' ? '♂' : v === '女' ? '♀' : '⚧' },
      { title: t('exam.age'), dataIndex: 'age', width: 60 },
      { title: t('exam.modality'), dataIndex: 'modality', width: 80, render: (v) => <Tag color="blue">{String(v)}</Tag> },
      { title: t('exam.bodyPart'), dataIndex: 'bodyPart', width: 100 },
      {
        title: t('exam.priority'),
        dataIndex: 'priority',
        width: 80,
        render: (v) => <Tag color={PRIORITY_CONFIG[String(v)]?.color}>{String(v)}</Tag>,
      },
      {
        title: t('status.status'),
        dataIndex: 'status',
        width: 100,
        render: (v) => <Tag color={STATUS_CONFIG[String(v)]?.color}>{String(v)}</Tag>,
      },
      {
        title: t('exam.device'),
        dataIndex: 'deviceId',
        width: 120,
        render: (v) => (v ? deviceMap.get(String(v)) ?? '—' : '—'),
      },
      {
        title: t('exam.scheduledAt'),
        dataIndex: 'scheduledAt',
        width: 140,
        render: (v) => <Space size={4}><ClockCircleOutlined />{String(v)}</Space>,
      },
      {
        title: t('common.actions'),
        width: 180,
        render: (_, record) => {
          const r = record as { id: string; patientName: string; status: string };
          return (
            <Space size="small">
              {r.status === '已登记' && (
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleCheckIn(r)}
                >
                  {t('worklist.checkIn')}
                </Button>
              )}
              {r.status === '待检查' && (
                <Button
                  type="link"
                  size="small"
                  icon={<ScanOutlined />}
                  onClick={() => handleStartExam({ ...r, modality: 'CT' })}
                >
                  {t('worklist.start')}
                </Button>
              )}
              {r.status === '检查中' && (
                <Button type="link" size="small" disabled>
                  进行中
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [t, deviceMap, handleCheckIn, handleStartExam]
  );

  // 列表视图
  const renderListView = () => (
    <ProTable
      dataSource={exams}
      columns={columns}
      rowKey="id"
      pageSize={isMobile ? 10 : 20}
      onRefresh={() => announce('列表已刷新')}
      onExport={(data) => toast.success(`已导出 ${data.length} 条`)}
    />
  );

  // 卡片视图
  const renderCardView = () => (
    <AppGrid cols={isMobile ? 1 : 3} gap={16}>
      {exams.map((exam) => {
        const cfg = STATUS_CONFIG[exam.status];
        return (
          <CardSection
            key={exam.id}
            hoverable
            title={
              <Space>
                <span>{exam.patientName}</span>
                <Tag color={PRIORITY_CONFIG[exam.priority]?.color}>{exam.priority}</Tag>
              </Space>
            }
            extra={<Tag color={cfg?.color}>{exam.status}</Tag>}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                <strong>{exam.examId}</strong>
              </div>
              <div>
                <Tag color="blue">{exam.modality}</Tag>
                <span style={{ fontSize: 12 }}>{exam.bodyPart}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                <ClockCircleOutlined /> {exam.scheduledAt}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                设备:{exam.deviceId ? deviceMap.get(exam.deviceId) : '未分配'}
              </div>
              {exam.status === '已登记' && (
                <Button
                  type="primary"
                  block
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleCheckIn(exam)}
                >
                  {t('worklist.checkIn')}
                </Button>
              )}
              {exam.status === '待检查' && (
                <Button
                  type="primary"
                  block
                  icon={<ScanOutlined />}
                  onClick={() => handleStartExam({ ...exam, modality: exam.modality })}
                >
                  {t('worklist.start')}
                </Button>
              )}
            </Space>
          </CardSection>
        );
      })}
    </AppGrid>
  );

  // 看板视图
  const renderKanbanView = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(220px, 1fr))`,
        gap: 12,
        overflowX: 'auto',
        padding: '4px 0',
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colExams = exams.filter((e) => e.status === col);
        return (
          <div
            key={col}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 8,
              padding: 12,
              minHeight: 400,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Space>
                <Tag color={STATUS_CONFIG[col]?.color}>{col}</Tag>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{colExams.length}</span>
              </Space>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {colExams.length === 0 ? (
                <AppEmpty variant="no-data" />
              ) : (
                colExams.map((exam) => (
                  <div
                    key={exam.id}
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 6,
                      padding: 8,
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{exam.patientName}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {exam.modality} · {exam.bodyPart}
                    </div>
                    {exam.priority === '危重' && (
                      <Tag color="red" style={{ marginTop: 4, fontSize: 10 }}>
                        危重
                      </Tag>
                    )}
                  </div>
                ))
              )}
            </Space>
          </div>
        );
      })}
    </div>
  );

  return (
    <AppLayout
      sidebarItems={SIDEBAR_ITEMS}
      user={{ name: '张明远', role: '主任医师' }}
      notificationCount={statusCount['待检查'] ?? 0}
    >
      {loading && <LoadingBanner message="正在从 API 加载 V3 工作列表..." />}
      {loadError && !loading && <ErrorBanner message={loadError} />}
      <PageContainer
        title={t('worklist.title')}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />}>{t('common.refresh')}</Button>
            <Button icon={<PrinterOutlined />}>{t('common.print')}</Button>
            <Button icon={<DownloadOutlined />} type="primary">
              {t('common.export')}
            </Button>
          </Space>
        }
      >
        {/* 状态概览 KPI */}
        <AppGrid cols={6} gap={12} style={{ marginBottom: 16 }}>
          {Object.entries(statusCount).map(([status, count]) => (
            <CardSection key={status} hoverable>
              <div style={{ textAlign: 'center' }}>
                <Tag color={STATUS_CONFIG[status]?.color}>{STATUS_CONFIG[status]?.label}</Tag>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
                  {count}
                </div>
              </div>
            </CardSection>
          ))}
        </AppGrid>

        {/* 筛选栏 */}
        <CardSection style={{ marginBottom: 16 }}>
          <Space wrap size="middle" align="center" style={{ width: '100%' }}>
            <AppSearchInput
              value={search}
              onChange={setSearch}
              placeholder={`${t('common.search')} ${t('patient.name')}/${t('exam.examId')}`}
              width={280}
            />
            <AppSelectField
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(String(v))}
              options={[
                { label: t('common.all'), value: 'all' },
                { label: t('exam.routine'), value: '普通' },
                { label: t('exam.urgent'), value: '紧急' },
                { label: '危重', value: '危重' },
                { label: '会诊', value: '会诊' },
              ]}
            />
            <AppSelectField
              value={modalityFilter}
              onChange={(v) => setModalityFilter(String(v))}
              options={[
                { label: t('common.all') + t('exam.modality'), value: 'all' },
                { label: 'CT', value: 'CT' },
                { label: 'MR', value: 'MR' },
                { label: 'DR', value: 'DR' },
                { label: 'US', value: 'US' },
              ]}
            />
            <div style={{ flex: 1 }} />
            <Segmented
              value={view}
              onChange={(v) => setView(v as ViewMode)}
              options={[
                { value: 'list', label: <span><BarsOutlined /> {t('worklist.list')}</span> },
                { value: 'card', label: <span><AppstoreOutlined /> {t('worklist.card')}</span> },
                { value: 'kanban', label: <span><ProjectOutlined /> {t('worklist.kanban')}</span> },
              ]}
            />
          </Space>
        </CardSection>

        {/* 视图内容 */}
        {view === 'list' && renderListView()}
        {view === 'card' && renderCardView()}
        {view === 'kanban' && renderKanbanView()}

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
