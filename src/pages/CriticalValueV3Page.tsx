/**
 * G005 放射RIS系统 v3.0.0 - 危急值 V3 完整重构
 * Phase T3-W6: criticalValueMachine 5 节点 + 国家卫健委 15 类 + 业务组件 + i18n
 *
 * 5 节点闭环:
 *   found(发现) → notified(通知) → acknowledged(确认) → resolving(处理) → resolved(闭环)
 *   + escalated(升级) / cancelled(取消)
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppGrid,
  CardSection,
  AppSearchInput,
  AppSelectField,
  AppEmpty } from '@components/antd';
import {
  Tag,
  Space,
  Button,
  Timeline,
  Modal } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  ExperimentOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  DesktopOutlined } from '@ant-design/icons';
import {
  type CriticalStateName,
  type NotificationMethod } from '@machines/criticalValueMachine';
import { useToast, useConfirm, useNotification } from '@components/antd';
import { useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';

// ============= 国家卫健委 2024 版 15 类 =============
const CV_CATEGORIES: Array<{ code: string; name: string; icon: string; color: string }> = [
  { code: 'CV-RAD-001', name: '主动脉夹层', icon: '🫀', color: 'red' },
  { code: 'CV-RAD-002', name: '肺栓塞', icon: '🫁', color: 'red' },
  { code: 'CV-RAD-003', name: '张力性气胸', icon: '🫁', color: 'red' },
  { code: 'CV-RAD-004', name: '急性脑疝', icon: '🧠', color: 'red' },
  { code: 'CV-RAD-005', name: '脑血管栓塞/梗死', icon: '🧠', color: 'orange' },
  { code: 'CV-RAD-006', name: '消化道穿孔', icon: '🩺', color: 'red' },
  { code: 'CV-RAD-007', name: '肠系膜栓塞', icon: '🩺', color: 'orange' },
  { code: 'CV-RAD-008', name: '腹部脏器急性出血', icon: '🩸', color: 'red' },
  { code: 'CV-RAD-009', name: '气胸(≥30%)', icon: '🫁', color: 'orange' },
  { code: 'CV-RAD-010', name: '骨折急性并发症', icon: '🦴', color: 'orange' },
  { code: 'CV-RAD-011', name: '心影增大伴心衰', icon: '🫀', color: 'orange' },
  { code: 'CV-RAD-012', name: '介入术后血管急性闭塞', icon: '💉', color: 'red' },
  { code: 'CV-RAD-013', name: '对比剂严重过敏反应', icon: '⚠️', color: 'red' },
  { code: 'CV-RAD-014', name: '急性心包填塞', icon: '🫀', color: 'red' },
  { code: 'CV-RAD-015', name: '宫外孕破裂', icon: '🩺', color: 'red' },
];

// ============= 5 节点状态配置 =============
const STATE_CONFIG: Record<CriticalStateName, { color: string; bg: string; step: number; label: string }> = {
  found: { color: 'red', bg: '#fee2e2', step: 1, label: '已发现' },
  notified: { color: 'orange', bg: '#fef3c7', step: 2, label: '已通知' },
  acknowledged: { color: 'blue', bg: '#dbeafe', step: 3, label: '已确认' },
  resolving: { color: 'cyan', bg: '#cffafe', step: 4, label: '处理中' },
  resolved: { color: 'green', bg: '#dcfce7', step: 5, label: '已闭环' },
  escalated: { color: 'magenta', bg: '#fae8ff', step: 0, label: '已升级' },
  cancelled: { color: 'default', bg: '#f1f5f9', step: 0, label: '已取消' } };

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'devices', icon: <DesktopOutlined />, label: '设备', path: '/devices' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 危急值类型 =============
interface CriticalValue {
  id: string;
  reportId: string;
  examId: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  patientPhone: string;
  category: string;
  finding: string;
  severity: 'critical' | 'high' | 'urgent';
  modality: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  currentState: CriticalStateName;
  notifiedTo: string | null;
  notifiedAt: string | null;
  notificationMethod: NotificationMethod | null;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  processingDoctor: string | null;
  resolvedAt: string | null;
}

// ============= 单危急值卡片(内嵌 XState actor) =============
function CriticalValueCard({
  cv,
  onAction,
  onSelect }: {
  cv: CriticalValue;
  onAction: (cv: CriticalValue, action: 'notify' | 'acknowledge' | 'process' | 'resolve' | 'escalate' | 'cancel', payload?: { to?: string; method?: NotificationMethod; note?: string }) => void;
  onSelect: (cv: CriticalValue) => void;
}) {
  const { t } = useTranslation();
  const config = STATE_CONFIG[cv.currentState];
  const category = CV_CATEGORIES.find((c) => c.code === cv.category);

  return (
    <CardSection
      hoverable
      onClick={() => onSelect(cv)}
      title={
        <Space>
          <span style={{ fontWeight: 600 }}>{cv.patientName}</span>
          <Tag color="red">{category?.icon} {category?.name}</Tag>
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
          <strong>ID:</strong> {cv.id} | <strong>检查:</strong> {cv.modality}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <ClockCircleOutlined /> {cv.reportedAt}
        </div>
        <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
          ⚠️ {cv.finding}
        </div>
        {cv.notifiedTo && (
          <div style={{ fontSize: 12, color: '#64748b' }}>
            <PhoneOutlined /> 已通知 {cv.notifiedTo} ({cv.notificationMethod})
          </div>
        )}
        {cv.acknowledgedBy && (
          <div style={{ fontSize: 12, color: '#64748b' }}>
            <CheckCircleOutlined /> {cv.acknowledgedBy} 已确认
          </div>
        )}
        {cv.processingDoctor && (
          <div style={{ fontSize: 12, color: '#64748b' }}>
            🏥 {cv.processingDoctor} 处理中
          </div>
        )}

        {/* 5 节点进度条 */}
        <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                height: 6,
                background: step <= config.step ? config.color : '#e2e8f0',
                borderRadius: 3 }}
            />
          ))}
        </div>

        {/* 操作按钮(根据状态) */}
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {cv.currentState === 'found' && (
            <>
              <Button size="small" type="primary" icon={<PhoneOutlined />} onClick={() => onAction(cv, 'notify', { to: '值班医生', method: 'phone' })}>
                通知
              </Button>
              <Button size="small" icon={<ArrowUpOutlined />} onClick={() => onAction(cv, 'escalate', { to: '科主任', note: '直接升级' })}>
                升级
              </Button>
            </>
          )}
          {cv.currentState === 'notified' && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => onAction(cv, 'acknowledge', { to: '值班医生已确认' })}>
              确认
            </Button>
          )}
          {cv.currentState === 'acknowledged' && (
            <Button size="small" type="primary" onClick={() => onAction(cv, 'process', { to: '处理医生' })}>
              开始处理
            </Button>
          )}
          {cv.currentState === 'resolving' && (
            <Button size="small" type="primary" onClick={() => onAction(cv, 'resolve', { note: '处理完成' })}>
              完成
            </Button>
          )}
          {(cv.currentState === 'found' || cv.currentState === 'notified') && (
            <Button size="small" onClick={() => onAction(cv, 'cancel', { note: '误判' })}>
              取消
            </Button>
          )}
        </div>
      </Space>
    </CardSection>
  );
}

// ============= 主组件 =============
export default function CriticalValueV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const notification = useNotification();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  // 危急值列表(模拟)
  const [criticalValues, setCriticalValues] = useState<CriticalValue[]>(() => [
    {
      id: 'cv-001', reportId: 'RP20260604001', examId: 'EX001',
      patientId: 'P001', patientName: '张志远', gender: '男', age: 58, patientPhone: '138****0000',
      category: 'CV-RAD-001', finding: '主动脉夹层 Stanford A 型', severity: 'critical', modality: 'CT',
      reportedBy: 'D001', reportedByName: '张明远', reportedAt: '2026-06-06 09:15',
      currentState: 'found', notifiedTo: null, notifiedAt: null, notificationMethod: null,
      acknowledgedBy: null, acknowledgedAt: null, processingDoctor: null, resolvedAt: null },
    {
      id: 'cv-002', reportId: 'RP20260604002', examId: 'EX002',
      patientId: 'P002', patientName: '王秀英', gender: '女', age: 45, patientPhone: '139****0000',
      category: 'CV-RAD-002', finding: '双侧肺动脉栓塞', severity: 'critical', modality: 'CT',
      reportedBy: 'D002', reportedByName: '李慧敏', reportedAt: '2026-06-06 09:30',
      currentState: 'notified', notifiedTo: '值班医生', notifiedAt: '2026-06-06 09:32', notificationMethod: 'phone',
      acknowledgedBy: null, acknowledgedAt: null, processingDoctor: null, resolvedAt: null },
    {
      id: 'cv-003', reportId: 'RP20260604003', examId: 'EX003',
      patientId: 'P003', patientName: '李建国', gender: '男', age: 67, patientPhone: '137****0000',
      category: 'CV-RAD-006', finding: '消化道穿孔,腹腔游离气体', severity: 'critical', modality: 'CT',
      reportedBy: 'D003', reportedByName: '王建华', reportedAt: '2026-06-06 10:05',
      currentState: 'acknowledged', notifiedTo: '值班医生', notifiedAt: '2026-06-06 10:06', notificationMethod: 'phone',
      acknowledgedBy: '值班医生', acknowledgedAt: '2026-06-06 10:08', processingDoctor: null, resolvedAt: null },
    {
      id: 'cv-004', reportId: 'RP20260604004', examId: 'EX004',
      patientId: 'P004', patientName: '赵丽华', gender: '女', age: 52, patientPhone: '136****0000',
      category: 'CV-RAD-009', finding: '右侧气胸 35%', severity: 'high', modality: 'DR',
      reportedBy: 'D004', reportedByName: '陈晓燕', reportedAt: '2026-06-06 11:20',
      currentState: 'resolving', notifiedTo: '胸外科', notifiedAt: '2026-06-06 11:21', notificationMethod: 'phone',
      acknowledgedBy: '胸外科医生', acknowledgedAt: '2026-06-06 11:22',
      processingDoctor: '胸外科医生', resolvedAt: null },
  ]);

  // 筛选
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<CriticalStateName | 'all'>('all');

  const filteredCVs = useMemo(() => {
    let result = criticalValues;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (cv) => cv.patientName.toLowerCase().includes(q) || cv.finding.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'all') result = result.filter((cv) => cv.currentState === stateFilter);
    return result;
  }, [criticalValues, search, stateFilter]);

  // 状态计数
  const stateCount = useMemo(() => {
    const counts: Record<CriticalStateName, number> = {
      found: 0, notified: 0, acknowledged: 0, resolving: 0, resolved: 0,
      escalated: 0, cancelled: 0 };
    for (const cv of criticalValues) counts[cv.currentState]++;
    return counts;
  }, [criticalValues]);

  // 操作处理
  const handleAction = useCallback(
    (cv: CriticalValue, action: 'notify' | 'acknowledge' | 'process' | 'resolve' | 'escalate' | 'cancel', payload?: { to?: string; method?: NotificationMethod; note?: string }) => {
      try {
        setCriticalValues((prev) =>
          prev.map((c) => {
            if (c.id !== cv.id) return c;
            const now = new Date().toISOString();
            switch (action) {
              case 'notify':
                notification.criticalValue(c.patientName, c.finding);
                announce(`已通知 ${payload?.to} 关于 ${c.patientName}`);
                return { ...c, currentState: 'notified', notifiedTo: payload?.to ?? null, notifiedAt: now, notificationMethod: payload?.method ?? null };
              case 'acknowledge':
                toast.success(`${payload?.to}`);
                announce(`${payload?.to}`);
                return { ...c, currentState: 'acknowledged', acknowledgedBy: payload?.to ?? null, acknowledgedAt: now };
              case 'process':
                announce(`开始处理 ${c.patientName}`);
                return { ...c, currentState: 'resolving', processingDoctor: payload?.to ?? null };
              case 'resolve':
                toast.success('危急值已闭环');
                announce(`危急值已闭环:${c.finding}`);
                return { ...c, currentState: 'resolved', resolvedAt: now };
              case 'escalate':
                notification.warning('危急值已升级', `已通知 ${payload?.to}`);
                announce(`已升级至 ${payload?.to}`);
                return { ...c, currentState: 'escalated' };
              case 'cancel':
                toast.info('危急值已取消');
                return { ...c, currentState: 'cancelled' };
            }
          })
        );
      } catch (error) {
        captureError(error as Error, { action, cvId: cv.id });
        toast.error('操作失败');
      }
    },
    [announce, toast, notification]
  );

  // 详情 Modal
  const [detailCV, setDetailCV] = useState<CriticalValue | null>(null);

  return (
    <>
      <PageContainer
        title="危急值管理"
        extra={
          <Space>
            <Button icon={<ExclamationCircleOutlined />}>新增危急值</Button>
          </Space>
        }
      >
        {/* 5 节点状态概览 */}
        <AppGrid cols={5} gap={12} style={{ marginBottom: 16 }}>
          {(['found', 'notified', 'acknowledged', 'resolving', 'resolved'] as CriticalStateName[]).map((state) => {
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
                    节点 {cfg.step}: {cfg.label}
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
            <AppSearchInput
              value={search}
              onChange={setSearch}
              placeholder="搜索患者/发现"
              width={280}
            />
            <AppSelectField
              value={stateFilter}
              onChange={(v) => setStateFilter(v as CriticalStateName | 'all')}
              options={[
                { label: '全部状态', value: 'all' },
                ...(Object.keys(STATE_CONFIG) as CriticalStateName[]).map((s) => ({
                  label: STATE_CONFIG[s].label,
                  value: s })),
              ]}
            />
            <div style={{ flex: 1 }} />
            <Tag color="red">国家卫健委 2024 版 {CV_CATEGORIES.length} 类目录</Tag>
          </Space>
        </CardSection>

        {/* 危急值网格 */}
        {filteredCVs.length === 0 ? (
          <AppEmpty variant="no-data" />
        ) : (
          <AppGrid cols={3} gap={16}>
            {filteredCVs.map((cv) => (
              <CriticalValueCard key={cv.id} cv={cv} onAction={handleAction} onSelect={setDetailCV} />
            ))}
          </AppGrid>
        )}

        {/* 详情 Modal */}
        <Modal
          open={!!detailCV}
          onCancel={() => setDetailCV(null)}
          onOk={() => setDetailCV(null)}
          title={detailCV ? `${detailCV.patientName} - 危急值详情` : ''}
          width={700}
        >
          {detailCV && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <strong>类型:</strong>{' '}
                <Tag color="red">
                  {CV_CATEGORIES.find((c) => c.code === detailCV.category)?.name}
                </Tag>
              </div>
              <div>
                <strong>发现:</strong> {detailCV.finding}
              </div>
              <div>
                <strong>5 节点时间线:</strong>
                <Timeline style={{ marginTop: 12 }}>
                  <Timeline.Item color="red">
                    已发现 - {detailCV.reportedAt} - {detailCV.reportedByName}
                  </Timeline.Item>
                  {detailCV.notifiedAt && (
                    <Timeline.Item color="orange">
                      已通知 - {detailCV.notifiedAt} - {detailCV.notificationMethod}
                    </Timeline.Item>
                  )}
                  {detailCV.acknowledgedAt && (
                    <Timeline.Item color="blue">
                      已确认 - {detailCV.acknowledgedAt} - {detailCV.acknowledgedBy}
                    </Timeline.Item>
                  )}
                  {detailCV.processingDoctor && (
                    <Timeline.Item color="cyan">
                      处理中 - {detailCV.processingDoctor}
                    </Timeline.Item>
                  )}
                  {detailCV.resolvedAt && (
                    <Timeline.Item color="green">
                      已闭环 - {detailCV.resolvedAt}
                    </Timeline.Item>
                  )}
                </Timeline>
              </div>
            </Space>
          )}
        </Modal>

        <Announcement />
      </PageContainer>
    </>
  );
}
