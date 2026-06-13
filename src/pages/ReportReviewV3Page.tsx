/**
 * G005 放射RIS系统 v3.0.0 - 报告审核 V3 完整重构
 * Phase T3-W8: reportMachine 初审/终审 + 业务组件
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppEmpty,
  AppSearchInput,
  type SidebarItem,
  useToast,
  useConfirm,
} from '@components/antd';
import {
  Tag,
  Space,
  Button,
  Drawer,
  Descriptions,
  Input,
  Timeline,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { reportMachine, REPORT_STATE_LABEL, type ReportStateName } from '@machines/reportMachine';
import { useMachine } from '@xstate/react';
import { reportSubsystemMock } from '@data/reportSubsystemMock';
import { useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { useReportStore } from '../store';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'review', icon: <EyeOutlined />, label: '报告审核', path: '/report-review' },
  { key: 'reports', icon: <FileTextOutlined />, label: '报告', path: '/reports' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 待审报告 =============
const PENDING_REVIEWS = (reportSubsystemMock as Array<Record<string, unknown>>)
  .filter((r) => ['已提交', '初审中', '终审中', '已审核', '已驳回'].includes(r.status as string))
  .slice(0, 10)
  .map((r) => ({
    id: r.id as string,
    reportId: r.reportId as string,
    patientName: r.patientName as string,
    gender: r.gender as string,
    age: r.age as number,
    modality: r.modality as string,
    bodyPart: r.bodyPart as string,
    findings: r.examFindings as string,
    diagnosis: r.diagnosis as string,
    qualityScore: r.qualityScore as number,
    submittedBy: '张明远',
    submittedAt: '2026-06-06 09:30',
    currentState: r.status as string,
    criticalFinding: r.criticalFinding as boolean,
  }));

// ============= 单报告审核组件(XState 集成) =============
function ReviewDrawerContent({ report, onClose }: { report: typeof PENDING_REVIEWS[0]; onClose: () => void }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce } = useScreenReaderAnnouncer();

  // XState 模拟审核流程
  const [state, send] = useMachine(reportMachine, {
    input: { reportId: report.id, patientId: 'P001', radiologistId: 'D002' },
  });

  // 拒绝意见
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = useCallback(() => {
    confirm.confirm({
      title: '审核通过?',
      content: '确认此报告通过初审。',
      onOk: async () => {
        send({ type: 'APPROVE' });
        await useReportStore.getState().review(report.id, 'initial', 'D002', '张明远', '', 90);
        announce('已审核通过');
        toast.success('审核通过');
        setTimeout(onClose, 1000);
      },
    });
  }, [confirm, send, announce, toast, onClose, report.id]);

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) {
      toast.error('请填写驳回原因');
      return;
    }
    confirm.confirm({
      title: '驳回报告?',
      content: `驳回原因: ${rejectReason}`,
      okButtonProps: { danger: true },
      onOk: async () => {
        send({ type: 'REJECT', reason: rejectReason });
        await useReportStore.getState().reject(report.id);
        announce('报告已驳回');
        toast.warning('报告已驳回');
        setTimeout(onClose, 1000);
      },
    });
  }, [rejectReason, confirm, send, announce, toast, onClose, report.id]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 状态机当前状态 */}
      <Alert
        type={['rejected', 'withdrawn'].includes(state.value as string) ? 'error' : 'info'}
        message={`当前状态: ${REPORT_STATE_LABEL[state.value as ReportStateName]}`}
        showIcon
      />

      {/* 患者信息 */}
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="报告 ID">{report.reportId}</Descriptions.Item>
        <Descriptions.Item label="患者">{report.patientName}</Descriptions.Item>
        <Descriptions.Item label="性别 / 年龄">{report.gender} / {report.age} 岁</Descriptions.Item>
        <Descriptions.Item label="检查">
          <Tag color="blue">{report.modality}</Tag> {report.bodyPart}
        </Descriptions.Item>
        <Descriptions.Item label="提交医生">{report.submittedBy}</Descriptions.Item>
        <Descriptions.Item label="提交时间">{report.submittedAt}</Descriptions.Item>
        <Descriptions.Item label="质量评分">
          <Tag color={report.qualityScore >= 90 ? 'green' : report.qualityScore >= 80 ? 'blue' : 'orange'}>
            {report.qualityScore}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="危急值">
          {report.criticalFinding ? <Tag color="red">是</Tag> : <Tag>否</Tag>}
        </Descriptions.Item>
      </Descriptions>

      {/* 所见 + 诊断 */}
      <CardSection title="影像所见">
        <p style={{ whiteSpace: 'pre-wrap' }}>{report.findings || '(空)'}</p>
      </CardSection>
      <CardSection title="诊断意见">
        <p style={{ whiteSpace: 'pre-wrap' }}>{report.diagnosis || '(空)'}</p>
      </CardSection>

      {/* 驳回意见 */}
      <CardSection title="审核意见" extra={<span style={{ color: '#dc2626' }}>*</span>}>
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="如需驳回,请填写原因(审核通过可不填)"
          rows={3}
          maxLength={500}
          showCount
        />
      </CardSection>

      {/* 审核时间线 */}
      <CardSection title="流转时间线">
        <Timeline>
          <Timeline.Item color="blue" dot={<EditOutlined />}>
            2026-06-06 09:30 - 张明远 提交
          </Timeline.Item>
          <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
            {report.submittedAt} - 等待初审
          </Timeline.Item>
          {(['已审核', '已签发', '已发布'].includes(state.value as string)) && (
            <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
              已审核通过 - {REPORT_STATE_LABEL[state.value as ReportStateName]}
            </Timeline.Item>
          )}
          {state.value === '已驳回' && (
            <Timeline.Item color="red" dot={<CloseCircleOutlined />}>
              已驳回 - {rejectReason || '(无原因)'}
            </Timeline.Item>
          )}
        </Timeline>
      </CardSection>

      {/* 操作按钮 */}
      <Space>
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
          通过
        </Button>
        <Button danger icon={<CloseCircleOutlined />} onClick={handleReject}>
          驳回
        </Button>
        <Button onClick={onClose}>关闭</Button>
      </Space>
    </Space>
  );
}

// ============= 主组件 =============
export default function ReportReviewV3Page(): JSX.Element {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [detailReport, setDetailReport] = useState<typeof PENDING_REVIEWS[0] | null>(null);

  const filtered = useMemo(() => {
    let result = PENDING_REVIEWS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.patientName.toLowerCase().includes(q) || r.reportId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search]);

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '李慧敏', role: '副主任医师' }} notificationCount={PENDING_REVIEWS.length}>
      <PageContainer
        title="报告审核"
        extra={
          <Space>
            <Button>批量审核</Button>
          </Space>
        }
      >
        {/* 统计 */}
        <AppGrid cols={4} gap={12} style={{ marginBottom: 16 }}>
          <CardSection hoverable>
            <div style={{ textAlign: 'center' }}>
              <Tag color="orange">待初审</Tag>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                {PENDING_REVIEWS.filter((r) => r.currentState === '已提交' || r.currentState === '初审中').length}
              </div>
            </div>
          </CardSection>
          <CardSection hoverable>
            <div style={{ textAlign: 'center' }}>
              <Tag color="cyan">待终审</Tag>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                {PENDING_REVIEWS.filter((r) => r.currentState === '终审中' || r.currentState === '已审核').length}
              </div>
            </div>
          </CardSection>
          <CardSection hoverable>
            <div style={{ textAlign: 'center' }}>
              <Tag color="red">已驳回</Tag>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                {PENDING_REVIEWS.filter((r) => r.currentState === '已驳回').length}
              </div>
            </div>
          </CardSection>
          <CardSection hoverable>
            <div style={{ textAlign: 'center' }}>
              <Tag color="green">平均质量</Tag>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                {Math.round(
                  PENDING_REVIEWS.reduce((acc, r) => acc + r.qualityScore, 0) / PENDING_REVIEWS.length
                )}
              </div>
            </div>
          </CardSection>
        </AppGrid>

        {/* 筛选 */}
        <CardSection style={{ marginBottom: 16 }}>
          <AppSearchInput value={search} onChange={setSearch} placeholder="搜索患者/报告 ID" width={300} />
        </CardSection>

        {/* 待审报告列表 */}
        {filtered.length === 0 ? (
          <AppEmpty variant="no-data" />
        ) : (
          <AppGrid cols={2} gap={16}>
            {filtered.map((report) => (
              <CardSection
                key={report.id}
                hoverable
                onClick={() => setDetailReport(report)}
                title={
                  <Space>
                    <strong>{report.patientName}</strong>
                    <Tag color="blue">{report.modality}</Tag>
                    {report.criticalFinding && <Tag color="red">危急值</Tag>}
                  </Space>
                }
                extra={
                  <Tag color={
                    ['已驳回', 'withdrawn'].includes(report.currentState) ? 'red' :
                    ['已提交', '初审中'].includes(report.currentState) ? 'orange' : 'blue'
                  }>
                    {report.currentState}
                  </Tag>
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    <strong>{report.reportId}</strong> · {report.submittedBy} · {report.submittedAt}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {report.findings.slice(0, 80)}...
                  </div>
                  <div style={{ fontSize: 12, color: '#1e40af' }}>
                    诊断: {report.diagnosis}
                  </div>
                  <Space>
                    <Tag color={report.qualityScore >= 90 ? 'green' : 'orange'}>
                      质量 {report.qualityScore}
                    </Tag>
                    <Button size="small" type="primary" onClick={(e) => {
                      e.stopPropagation();
                      setDetailReport(report);
                    }}>
                      审核
                    </Button>
                  </Space>
                </Space>
              </CardSection>
            ))}
          </AppGrid>
        )}

        {/* 详情抽屉 */}
        <Drawer
          open={!!detailReport}
          onClose={() => setDetailReport(null)}
          title={detailReport ? `审核 - ${detailReport.reportId}` : ''}
          width={720}
        >
          {detailReport && <ReviewDrawerContent report={detailReport} onClose={() => setDetailReport(null)} />}
        </Drawer>
      </PageContainer>
    </AppLayout>
  );
}
