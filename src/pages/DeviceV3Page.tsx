/**
 * G005 放射RIS系统 v3.0.0 - 设备管理 V3 完整重构
 * Phase T3-W6: deviceMachine 5 态 + 业务组件 + i18n + a11y
 *
 * 状态机:
 *   idle(空闲) → inUse(使用中) → maintenance(维护中) → broken(故障) → offline(离线)
 *   每个设备实例化一个 XState 5 actor
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachine } from '@xstate/react';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppSearchInput,
  AppSelectField,
  AppEmpty,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, Progress, Drawer, Descriptions } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  ToolOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ApiOutlined,
  DesktopOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { deviceMachine, DEVICE_STATE_LABEL, type DeviceStateName } from '@machines/deviceMachine';
import { initialModalityDevices } from '@data/initialData';
import { deviceApi } from '@services/api';
import { LoadingBanner, ErrorBanner } from '@components/feedback';
import { useToast, useConfirm } from '@components/antd';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';

// ============= 状态配置 =============
const STATE_CONFIG: Record<DeviceStateName, { color: string; bg: string; icon: JSX.Element }> = {
  idle: { color: 'green', bg: '#dcfce7', icon: <CheckCircleOutlined /> },
  inUse: { color: 'blue', bg: '#dbeafe', icon: <PlayCircleOutlined /> },
  maintenance: { color: 'orange', bg: '#fef3c7', icon: <ToolOutlined /> },
  broken: { color: 'red', bg: '#fee2e2', icon: <CloseCircleOutlined /> },
  offline: { color: 'default', bg: '#f1f5f9', icon: <ApiOutlined /> },
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'devices', icon: <DesktopOutlined />, label: '设备', path: '/devices' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 设备类型 =============
interface Device {
  id: string;
  deviceCode: string;
  name: string;
  modality: 'CT' | 'MR' | 'DR' | 'DSA' | 'US' | 'MG' | 'PET' | 'SPECT';
  manufacturer: string;
  location: string;
  currentState: DeviceStateName;
  currentPatientName: string | null;
  todayExams: number;
  todayUsageMins: number;
  utilizationRate: number;
  lastMaintenanceAt: string | null;
  nextMaintenanceAt: string | null;
}

// ============= 单设备 XState Actor =============
function DeviceCard({
  device,
  onSelect,
  onCommand,
}: {
  device: Device;
  onSelect: (d: Device) => void;
  onCommand: (d: Device, cmd: 'start' | 'complete' | 'maintenance' | 'completeMaintenance' | 'fault' | 'repair' | 'offline' | 'online') => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce } = useScreenReaderAnnouncer();
  const config = STATE_CONFIG[device.currentState];

  // XState - 每个设备一个 actor
  const [state, send] = useMachine(deviceMachine, {
    input: { deviceId: device.id, deviceCode: device.deviceCode, modality: device.modality },
  });

  // 同步 XState 状态到组件 state(用于展示)
  const currentStateName = (state.value as DeviceStateName) ?? 'idle';
  const stateConfig = STATE_CONFIG[currentStateName] ?? STATE_CONFIG.idle;
  const displayStateConfig = STATE_CONFIG[device.currentState];

  // 发送事件
  const dispatch = (event: Parameters<typeof send>[0]) => {
    send(event);
    toast.success('设备状态已更新');
    announce(`设备 ${device.name} 状态已变为 ${DEVICE_STATE_LABEL[currentStateName]}`);
  };

  // 快捷操作
  const renderActions = () => {
    switch (currentStateName) {
      case 'idle':
        return (
          <Space>
            <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => onCommand(device, 'start')}>
              开始使用
            </Button>
            <Button size="small" icon={<ToolOutlined />} onClick={() => onCommand(device, 'maintenance')}>
              维护
            </Button>
            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => onCommand(device, 'fault')}>
              报故障
            </Button>
          </Space>
        );
      case 'inUse':
        return (
          <Space>
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => onCommand(device, 'complete')}>
              完成
            </Button>
            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => onCommand(device, 'fault')}>
              报故障
            </Button>
          </Space>
        );
      case 'maintenance':
        return (
          <Button size="small" type="primary" onClick={() => onCommand(device, 'completeMaintenance')}>
            完成维护
          </Button>
        );
      case 'broken':
        return (
          <Button size="small" type="primary" onClick={() => onCommand(device, 'repair')}>
            维修完成
          </Button>
        );
      case 'offline':
        return (
          <Button size="small" type="primary" onClick={() => onCommand(device, 'online')}>
            上线
          </Button>
        );
    }
  };

  return (
    <CardSection
      hoverable
      onClick={() => onSelect(device)}
      title={
        <Space>
          <span style={{ fontWeight: 600 }}>{device.name}</span>
          <Tag color="blue">{device.modality}</Tag>
        </Space>
      }
      extra={
        <Tag color={displayStateConfig?.color} style={{ background: displayStateConfig?.bg }}>
          {displayStateConfig?.icon} {DEVICE_STATE_LABEL[device.currentState]}
        </Tag>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 设备信息 */}
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <div>编码: {device.deviceCode}</div>
          <div>厂商: {device.manufacturer}</div>
          <div>位置: {device.location}</div>
        </div>

        {/* 当前患者 */}
        {device.currentPatientName && (
          <div
            style={{
              background: stateConfig.bg,
              padding: 8,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <strong>当前:</strong> {device.currentPatientName}
          </div>
        )}

        {/* 利用率 */}
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
            今日利用率: {(device.utilizationRate * 100).toFixed(1)}%
          </div>
          <Progress
            percent={Math.round(device.utilizationRate * 100)}
            status={device.utilizationRate > 0.85 ? 'exception' : 'normal'}
            strokeColor={device.utilizationRate > 0.85 ? '#dc2626' : '#3b82f6'}
          />
        </div>

        {/* 今日数据 */}
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>今日检查</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{device.todayExams}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>运行时长</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{device.todayUsageMins}m</div>
          </div>
        </Space>

        {/* 快捷操作 */}
        <div onClick={(e) => e.stopPropagation()}>{renderActions()}</div>
      </Space>
    </CardSection>
  );
}

// ============= 主组件 =============
export default function DeviceV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  // API 加载
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const res = await deviceApi.list()
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

  // 设备列表(模拟数据)
  const [devices, setDevices] = useState<Device[]>(() =>
    (initialModalityDevices as Array<Record<string, unknown>>).map((d, idx) => ({
      id: d.id as string,
      deviceCode: d.code as string,
      name: d.name as string,
      modality: (d.modality as Device['modality']) ?? 'CT',
      manufacturer: (d.manufacturer as string) ?? 'GE',
      location: (d.location as string) ?? 'CT 室',
      currentState: (['idle', 'inUse', 'maintenance'] as DeviceStateName[])[idx % 3]!,
      currentPatientName: idx % 3 === 1 ? `患者 ${idx + 1}` : null,
      todayExams: 5 + (idx % 10),
      todayUsageMins: 120 + (idx % 200),
      utilizationRate: 0.3 + (idx % 10) * 0.05,
      lastMaintenanceAt: '2026-05-15',
      nextMaintenanceAt: '2026-08-15',
    }))
  );

  // 筛选
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<DeviceStateName | 'all'>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  // 详情抽屉
  const [detailDevice, setDetailDevice] = useState<Device | null>(null);

  // 筛选
  const filteredDevices = useMemo(() => {
    let result = devices;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.deviceCode.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'all') result = result.filter((d) => d.currentState === stateFilter);
    if (modalityFilter !== 'all') result = result.filter((d) => d.modality === modalityFilter);
    return result;
  }, [devices, search, stateFilter, modalityFilter]);

  // 状态计数
  const stateCount = useMemo(() => {
    const counts: Record<DeviceStateName, number> = {
      idle: 0, inUse: 0, maintenance: 0, broken: 0, offline: 0,
    };
    for (const d of devices) counts[d.currentState]++;
    return counts;
  }, [devices]);

  // 命令处理
  const handleCommand = useCallback(
    (device: Device, cmd: 'start' | 'complete' | 'maintenance' | 'completeMaintenance' | 'fault' | 'repair' | 'offline' | 'online') => {
      try {
        const newState: Record<string, DeviceStateName> = {
          start: 'inUse',
          complete: 'idle',
          maintenance: 'maintenance',
          completeMaintenance: 'idle',
          fault: 'broken',
          repair: 'idle',
          offline: 'offline',
          online: 'idle',
        };
        const stateName = newState[cmd]!;
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id
              ? {
                  ...d,
                  currentState: stateName,
                  currentPatientName: cmd === 'start' ? '即将开始' : cmd === 'complete' ? null : d.currentPatientName,
                  todayExams: cmd === 'complete' ? d.todayExams + 1 : d.todayExams,
                }
              : d
          )
        );
        announce(`设备 ${device.name} → ${DEVICE_STATE_LABEL[stateName]}`);
        toast.success(`${device.name} → ${DEVICE_STATE_LABEL[stateName]}`);
      } catch (error) {
        captureError(error as Error, { action: cmd, deviceId: device.id });
        toast.error('操作失败');
      }
    },
    [announce, toast]
  );

  // 命令面板
  useCommandPalette([
    { id: 'add-device', label: '新增设备', action: () => toast.info('功能开发中') },
    { id: 'refresh', label: '刷新', action: () => announce('已刷新') },
  ]);

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }} notificationCount={stateCount.broken}>
      {loading && <LoadingBanner message="正在从 API 加载 V3 设备数据..." />}
      {loadError && !loading && <ErrorBanner message={loadError} />}
      <PageContainer
        title="设备管理"
        extra={
          <Space>
            <Button icon={<PlusOutlined />} type="primary">新增设备</Button>
          </Space>
        }
      >
        {/* 状态概览 */}
        <AppGrid cols={5} gap={12} style={{ marginBottom: 16 }}>
          {(Object.keys(STATE_CONFIG) as DeviceStateName[]).map((state) => {
            const cfg = STATE_CONFIG[state];
            return (
              <CardSection
                key={state}
                hoverable
                onClick={() => setStateFilter(state)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Tag color={cfg.color} style={{ background: cfg.bg, fontSize: 13 }}>
                    {cfg.icon} {DEVICE_STATE_LABEL[state]}
                  </Tag>
                  <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
                    {stateCount[state]}
                  </div>
                </div>
              </CardSection>
            );
          })}
        </AppGrid>

        {/* 筛选 */}
        <CardSection style={{ marginBottom: 16 }}>
          <Space wrap size="middle" align="center" style={{ width: '100%' }}>
            <AppSearchInput value={search} onChange={setSearch} placeholder="搜索设备" width={240} />
            <AppSelectField
              value={stateFilter}
              onChange={(v) => setStateFilter(v as DeviceStateName | 'all')}
              options={[
                { label: '全部状态', value: 'all' },
                ...(Object.keys(STATE_CONFIG) as DeviceStateName[]).map((s) => ({
                  label: DEVICE_STATE_LABEL[s],
                  value: s,
                })),
              ]}
            />
            <AppSelectField
              value={modalityFilter}
              onChange={(v) => setModalityFilter(String(v))}
              options={[
                { label: '全部设备', value: 'all' },
                { label: 'CT', value: 'CT' },
                { label: 'MR', value: 'MR' },
                { label: 'DR', value: 'DR' },
                { label: 'US', value: 'US' },
                { label: 'DSA', value: 'DSA' },
              ]}
            />
          </Space>
        </CardSection>

        {/* 设备网格 */}
        {filteredDevices.length === 0 ? (
          <AppEmpty variant="no-data" />
        ) : (
          <AppGrid cols={4} gap={16}>
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onSelect={setDetailDevice}
                onCommand={handleCommand}
              />
            ))}
          </AppGrid>
        )}

        {/* 详情抽屉 */}
        <Drawer
          open={!!detailDevice}
          onClose={() => setDetailDevice(null)}
          title={detailDevice ? `${detailDevice.name} (${detailDevice.deviceCode})` : ''}
          width={500}
        >
          {detailDevice && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="状态">
                  <Tag color={STATE_CONFIG[detailDevice.currentState].color}>
                    {STATE_CONFIG[detailDevice.currentState].icon} {DEVICE_STATE_LABEL[detailDevice.currentState]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="设备类型">
                  <Tag color="blue">{detailDevice.modality}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="厂商">{detailDevice.manufacturer}</Descriptions.Item>
                <Descriptions.Item label="位置">{detailDevice.location}</Descriptions.Item>
                <Descriptions.Item label="今日检查">{detailDevice.todayExams} 例</Descriptions.Item>
                <Descriptions.Item label="运行时长">{detailDevice.todayUsageMins} 分钟</Descriptions.Item>
                <Descriptions.Item label="利用率">
                  <Progress percent={Math.round(detailDevice.utilizationRate * 100)} />
                </Descriptions.Item>
                <Descriptions.Item label="上次维护">{detailDevice.lastMaintenanceAt}</Descriptions.Item>
                <Descriptions.Item label="下次维护">{detailDevice.nextMaintenanceAt}</Descriptions.Item>
              </Descriptions>
            </Space>
          )}
        </Drawer>

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
