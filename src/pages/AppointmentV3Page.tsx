/**
 * G005 放射RIS系统 v3.0.0 - 预约管理 V3 完整重构
 * Phase T3-W6: 5 态预约状态机 + 日历视图 + 业务组件
 *
 * 状态机:
 *   scheduled(已预约) → checkedIn(已报到) → completed(已完成)
 *   + cancelled(已取消) / noShow(未到)
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppSearchInput,
  AppSelectField,
  AppDatePicker,
  AppEmpty,
  type SidebarItem,
} from '@components/antd';
import { Tag, Space, Button, Badge, Calendar, Modal, Descriptions, App as AntdApp, App as AntApp } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useToast, useConfirm } from '@components/antd';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';

// ============= 预约状态机 =============
type AppointmentState = 'scheduled' | 'checkedIn' | 'completed' | 'cancelled' | 'noShow';

const STATE_CONFIG: Record<AppointmentState, { color: string; bg: string; label: string }> = {
  scheduled: { color: 'blue', bg: '#dbeafe', label: '已预约' },
  checkedIn: { color: 'cyan', bg: '#cffafe', label: '已报到' },
  completed: { color: 'green', bg: '#dcfce7', label: '已完成' },
  cancelled: { color: 'default', bg: '#f1f5f9', label: '已取消' },
  noShow: { color: 'red', bg: '#fee2e2', label: '未到' },
};

const appointmentMachine = createMachine({
  id: 'appointment',
  initial: 'scheduled',
  context: { reportId: '' } as { reportId: string },
  types: {} as { context: { reportId: string } },
  states: {
    scheduled: {
      on: {
        CHECK_IN: 'checkedIn',
        CANCEL: 'cancelled',
        NO_SHOW: 'noShow',
      },
    },
    checkedIn: {
      on: {
        COMPLETE: 'completed',
        CANCEL: 'cancelled',
      },
    },
    completed: { type: 'final' },
    cancelled: { type: 'final' },
    noShow: { type: 'final' },
  },
});

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'appointment', icon: <CalendarOutlined />, label: '预约', path: '/appointment' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 预约类型 =============
interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  modality: string;
  bodyPart: string;
  appointmentDate: string;  // YYYY-MM-DD
  timeSlot: string;         // HH:mm
  deviceId: string;
  deviceName: string;
  roomId: string;
  doctorName: string;
  state: AppointmentState;
  notes?: string;
}

// ============= 模拟数据 =============
const TODAY = '2026-06-06';
const APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001', patientName: '张志远', patientPhone: '138****0000',
    modality: 'CT', bodyPart: '胸部',
    appointmentDate: '2026-06-06', timeSlot: '09:00',
    deviceId: 'CT-1', deviceName: '64排CT', roomId: 'CT室1',
    doctorName: '张明远', state: 'checkedIn',
  },
  {
    id: 'apt-002', patientName: '王秀英', patientPhone: '139****0000',
    modality: 'CT', bodyPart: '头颅',
    appointmentDate: '2026-06-06', timeSlot: '10:00',
    deviceId: 'CT-1', deviceName: '64排CT', roomId: 'CT室1',
    doctorName: '李慧敏', state: 'scheduled',
  },
  {
    id: 'apt-003', patientName: '李建国', patientPhone: '137****0000',
    modality: 'MR', bodyPart: '腹部',
    appointmentDate: '2026-06-06', timeSlot: '14:00',
    deviceId: 'MR-1', deviceName: '3.0T MR', roomId: 'MR室1',
    doctorName: '王建华', state: 'scheduled',
  },
  {
    id: 'apt-004', patientName: '赵丽华', patientPhone: '136****0000',
    modality: 'MG', bodyPart: '乳腺',
    appointmentDate: '2026-06-06', timeSlot: '15:30',
    deviceId: 'MG-1', deviceName: '乳腺钼靶', roomId: '钼靶室',
    doctorName: '陈晓燕', state: 'scheduled',
  },
  {
    id: 'apt-005', patientName: '陈志强', patientPhone: '135****0000',
    modality: 'DR', bodyPart: '胸部',
    appointmentDate: '2026-06-06', timeSlot: '16:00',
    deviceId: 'DR-1', deviceName: 'DR系统', roomId: 'DR室1',
    doctorName: '李慧敏', state: 'completed',
  },
  {
    id: 'apt-006', patientName: '刘文静', patientPhone: '134****0000',
    modality: 'US', bodyPart: '甲状腺',
    appointmentDate: '2026-06-07', timeSlot: '09:30',
    deviceId: 'US-1', deviceName: '超声', roomId: '超声室',
    doctorName: '王建华', state: 'scheduled',
  },
  {
    id: 'apt-007', patientName: '孙明华', patientPhone: '133****0000',
    modality: 'CT', bodyPart: '冠脉',
    appointmentDate: '2026-06-07', timeSlot: '10:00',
    deviceId: 'CT-1', deviceName: '64排CT', roomId: 'CT室1',
    doctorName: '张明远', state: 'cancelled',
    notes: '患者要求改期',
  },
];

// ============= 单预约卡片 =============
function AppointmentCard({
  apt,
  onAction,
  onSelect,
}: {
  apt: Appointment;
  onAction: (apt: Appointment, action: 'checkIn' | 'complete' | 'cancel' | 'noShow') => void;
  onSelect: (apt: Appointment) => void;
}) {
  const config = STATE_CONFIG[apt.state];

  return (
    <CardSection
      hoverable
      onClick={() => onSelect(apt)}
      title={
        <Space>
          <span style={{ fontWeight: 600 }}>{apt.patientName}</span>
          <Tag color="blue">{apt.modality}</Tag>
        </Space>
      }
      extra={
        <Tag color={config.color} style={{ background: config.bg }}>
          {config.label}
        </Tag>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <ClockCircleOutlined /> {apt.timeSlot} · {apt.bodyPart}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          设备: {apt.deviceName} · {apt.roomId}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>医生: {apt.doctorName}</div>

        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {apt.state === 'scheduled' && (
            <>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => onAction(apt, 'checkIn')}>
                报到
              </Button>
              <Button size="small" danger onClick={() => onAction(apt, 'cancel')}>
                取消
              </Button>
            </>
          )}
          {apt.state === 'checkedIn' && (
            <Button size="small" type="primary" onClick={() => onAction(apt, 'complete')}>
              完成
            </Button>
          )}
        </div>
      </Space>
    </CardSection>
  );
}

// ============= 主组件 =============
export default function AppointmentV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<AppointmentState | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);

  // 筛选
  const filtered = useMemo(() => {
    let result = appointments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.patientName.toLowerCase().includes(q) || a.modality.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'all') result = result.filter((a) => a.state === stateFilter);
    return result;
  }, [appointments, search, stateFilter]);

  // 选中日期的预约
  const dayAppointments = useMemo(
    () => filtered.filter((a) => a.appointmentDate === selectedDate),
    [filtered, selectedDate]
  );

  // 状态计数
  const stateCount = useMemo(() => {
    const counts: Record<AppointmentState, number> = {
      scheduled: 0, checkedIn: 0, completed: 0, cancelled: 0, noShow: 0,
    };
    for (const a of appointments) counts[a.state]++;
    return counts;
  }, [appointments]);

  // 操作
  const handleAction = useCallback(
    (apt: Appointment, action: 'checkIn' | 'complete' | 'cancel' | 'noShow') => {
      try {
        const next: Record<string, AppointmentState> = {
          checkIn: 'checkedIn',
          complete: 'completed',
          cancel: 'cancelled',
          noShow: 'noShow',
        };
        setAppointments((prev) =>
          prev.map((a) => (a.id === apt.id ? { ...a, state: next[action]! } : a))
        );
        announce(`${apt.patientName} 状态已更新`);
        toast.success('状态已更新');
      } catch (error) {
        captureError(error as Error, { action, aptId: apt.id });
        toast.error('操作失败');
      }
    },
    [announce, toast]
  );

  // 日历单元格渲染
  const dateCellRender = (value: any) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayList = appointments.filter((a) => a.appointmentDate === dateStr);
    if (dayList.length === 0) return null;
    return (
      <div style={{ fontSize: 11 }}>
        {dayList.slice(0, 3).map((a) => (
          <div
            key={a.id}
            style={{
              background: STATE_CONFIG[a.state].bg,
              padding: '1px 4px',
              borderRadius: 2,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {a.timeSlot} {a.patientName}
          </div>
        ))}
        {dayList.length > 3 && <div style={{ fontSize: 10, color: '#94a3b8' }}>+{dayList.length - 3} 更多</div>}
      </div>
    );
  };

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }} notificationCount={stateCount.scheduled}>
      <PageContainer
        title="预约管理"
        extra={
          <Space>
            <Button>新增预约</Button>
          </Space>
        }
      >
        {/* 状态概览 */}
        <AppGrid cols={5} gap={12} style={{ marginBottom: 16 }}>
          {(Object.keys(STATE_CONFIG) as AppointmentState[]).map((state) => {
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
                    {cfg.label}
                  </Tag>
                  <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
                    {stateCount[state]}
                  </div>
                </div>
              </CardSection>
            );
          })}
        </AppGrid>

        {/* 筛选 + 视图切换 */}
        <CardSection style={{ marginBottom: 16 }}>
          <Space wrap size="middle" align="center" style={{ width: '100%' }}>
            <AppSearchInput value={search} onChange={setSearch} placeholder="搜索患者/设备" width={240} />
            <AppSelectField
              value={stateFilter}
              onChange={(v) => setStateFilter(v as AppointmentState | 'all')}
              options={[
                { label: '全部状态', value: 'all' },
                ...(Object.keys(STATE_CONFIG) as AppointmentState[]).map((s) => ({
                  label: STATE_CONFIG[s].label,
                  value: s,
                })),
              ]}
            />
            <div style={{ flex: 1 }} />
            <Space.Compact>
              <Button type={view === 'list' ? 'primary' : 'default'} onClick={() => setView('list')}>
                列表
              </Button>
              <Button type={view === 'calendar' ? 'primary' : 'default'} onClick={() => setView('calendar')}>
                日历
              </Button>
            </Space.Compact>
          </Space>
        </CardSection>

        {/* 列表视图 */}
        {view === 'list' && (
          dayAppointments.length === 0 ? (
            <AppEmpty variant="no-data" />
          ) : (
            <AppGrid cols={3} gap={16}>
              {dayAppointments.map((apt) => (
                <AppointmentCard key={apt.id} apt={apt} onAction={handleAction} onSelect={setDetailApt} />
              ))}
            </AppGrid>
          )
        )}

        {/* 日历视图 */}
        {view === 'calendar' && (
          <CardSection>
            <Calendar
              value={undefined}
              onSelect={(value: any) => setSelectedDate(value.format('YYYY-MM-DD'))}
              cellRender={(current, info) => {
                if (info.type === 'date') return dateCellRender(current);
                return info.originNode;
              }}
            />
          </CardSection>
        )}

        {/* 详情 Modal */}
        <Modal
          open={!!detailApt}
          onCancel={() => setDetailApt(null)}
          onOk={() => setDetailApt(null)}
          title={detailApt ? `${detailApt.patientName} - 预约详情` : ''}
          width={600}
        >
          {detailApt && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="预约 ID">{detailApt.id}</Descriptions.Item>
              <Descriptions.Item label="患者">{detailApt.patientName}</Descriptions.Item>
              <Descriptions.Item label="电话">{detailApt.patientPhone}</Descriptions.Item>
              <Descriptions.Item label="设备">
                <Tag color="blue">{detailApt.modality}</Tag> {detailApt.bodyPart}
              </Descriptions.Item>
              <Descriptions.Item label="时间">{detailApt.appointmentDate} {detailApt.timeSlot}</Descriptions.Item>
              <Descriptions.Item label="设备">{detailApt.deviceName} · {detailApt.roomId}</Descriptions.Item>
              <Descriptions.Item label="医生">{detailApt.doctorName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATE_CONFIG[detailApt.state].color}>{STATE_CONFIG[detailApt.state].label}</Tag>
              </Descriptions.Item>
              {detailApt.notes && <Descriptions.Item label="备注">{detailApt.notes}</Descriptions.Item>}
            </Descriptions>
          )}
        </Modal>

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
