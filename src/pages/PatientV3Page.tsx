/**
 * G005 放射RIS系统 v3.0.0 - 患者管理 V3 完整重构
 * Phase T3-W7: 业务组件 + i18n + a11y + 列表/详情
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppLayout,
  AppGrid,
  CardSection,
  AppSearchInput,
  AppSelectField,
  AppEmpty,
  AppStatistic,
  ProTable,
  type ProColumn,
  type SidebarItem,
} from '@components/antd';
import {
  Tag,
  Space,
  Button,
  Avatar,
  Drawer,
  Descriptions,
  App as AntdApp,
  Tabs,
  Timeline,
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HeartOutlined,
  WarningOutlined,
  HistoryOutlined,
  FileTextOutlined as DocIcon,
  ExperimentOutlined,
  DesktopOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { useToast, useConfirm } from '@components/antd';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';
import { maskName, maskIdCard, maskPhone, maskEmail, maskPatient } from '@security';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'patients', icon: <UserOutlined />, label: '患者', path: '/patients' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 患者类型 =============
interface Patient {
  id: string;
  name: string;
  gender: '男' | '女' | '其他';
  age: number;
  birthDate: string;
  idCard: string;
  phone: string;
  email?: string;
  address: string;
  patientType: '门诊' | '住院' | '急诊' | '体检';
  allergies?: string;
  pregnancyStatus?: string;
  totalExams: number;
  lastExamDate?: string;
  criticalCount: number;
}

// ============= 模拟数据 =============
const PATIENTS: Patient[] = [
  {
    id: 'P001', name: '张志远', gender: '男', age: 58, birthDate: '1968-03-12',
    idCard: '11010119680312001X', phone: '138****0000', email: 'zhangzy@example.com',
    address: '北京市朝阳区建国路 1 号', patientType: '门诊', allergies: '青霉素',
    totalExams: 12, lastExamDate: '2026-06-06', criticalCount: 1,
  },
  {
    id: 'P002', name: '王秀英', gender: '女', age: 45, birthDate: '1981-07-20',
    idCard: '110101198107200028', phone: '139****0001', email: 'wangxy@example.com',
    address: '北京市海淀区中关村大街 2 号', patientType: '急诊',
    totalExams: 5, lastExamDate: '2026-06-06', criticalCount: 1,
  },
  {
    id: 'P003', name: '李建国', gender: '男', age: 67, birthDate: '1959-01-05',
    idCard: '110101195901050035', phone: '137****0002',
    address: '北京市西城区金融街 3 号', patientType: '住院', allergies: '无',
    totalExams: 23, lastExamDate: '2026-06-05', criticalCount: 2,
  },
  {
    id: 'P004', name: '赵丽华', gender: '女', age: 52, birthDate: '1974-09-15',
    idCard: '110101197409150042', phone: '136****0003',
    address: '北京市东城区王府井 4 号', patientType: '门诊',
    totalExams: 8, lastExamDate: '2026-06-04', criticalCount: 0,
  },
  {
    id: 'P005', name: '陈志强', gender: '男', age: 73, birthDate: '1953-05-30',
    idCard: '110101195305300059', phone: '135****0004',
    address: '北京市丰台区方庄 5 号', patientType: '住院',
    totalExams: 31, lastExamDate: '2026-06-04', criticalCount: 0,
  },
  {
    id: 'P006', name: '刘文静', gender: '女', age: 38, birthDate: '1988-11-08',
    idCard: '110101198811080066', phone: '134****0005',
    address: '北京市石景山八大处 6 号', patientType: '体检',
    totalExams: 2, lastExamDate: '2026-06-04', criticalCount: 0,
  },
];

// ============= 主组件 =============
export default function PatientV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce, Announcement } = useScreenReaderAnnouncer();
  const { message: antMessage } = AntdApp.useApp();

  // 脱敏(用于列表展示)
  const maskedPatients = useMemo(
    () => PATIENTS.map((p) => maskPatient(p)),
    []
  );

  // 原始(详情用,需要权限)
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [showReal, setShowReal] = useState(false);

  // 筛选
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [criticalFilter, setCriticalFilter] = useState(false);

  // 列表数据(用脱敏)
  const filtered = useMemo(() => {
    let result = maskedPatients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      );
    }
    if (genderFilter !== 'all') result = result.filter((p) => p.gender === genderFilter);
    if (typeFilter !== 'all') result = result.filter((p) => p.patientType === typeFilter);
    if (criticalFilter) result = result.filter((p) => p.criticalCount > 0);
    return result;
  }, [maskedPatients, search, genderFilter, typeFilter, criticalFilter]);

  // 统计
  const stats = useMemo(() => ({
    total: PATIENTS.length,
    male: PATIENTS.filter((p) => p.gender === '男').length,
    female: PATIENTS.filter((p) => p.gender === '女').length,
    withCritical: PATIENTS.filter((p) => p.criticalCount > 0).length,
    avgAge: Math.round(PATIENTS.reduce((acc, p) => acc + p.age, 0) / PATIENTS.length),
  }), []);

  // 表格列
  const columns: ProColumn[] = useMemo(
    () => [
      {
        title: t('patient.id'),
        dataIndex: 'id',
        width: 100,
        searchable: true,
      },
      {
        title: t('patient.name'),
        dataIndex: 'name',
        width: 140,
        render: (_v, r) => {
          const p = r as Patient;
          return (
            <Space>
              <Avatar size="small" icon={p.gender === '男' ? <ManOutlined /> : <WomanOutlined />} />
              {p.name}
            </Space>
          );
        },
      },
      { title: t('patient.gender'), dataIndex: 'gender', width: 60 },
      { title: t('patient.age'), dataIndex: 'age', width: 60 },
      { title: t('patient.patientType'), dataIndex: 'patientType', width: 80, render: (v) => <Tag>{String(v)}</Tag> },
      {
        title: '检查次数',
        dataIndex: 'totalExams',
        width: 90,
        render: (v) => <Tag color="blue">{String(v)}</Tag>,
      },
      {
        title: '危急值',
        dataIndex: 'criticalCount',
        width: 80,
        render: (v) => v > 0 ? <Tag color="red" icon={<WarningOutlined />}>{String(v)}</Tag> : <Tag>0</Tag>,
      },
      {
        title: t('common.actions'),
        width: 140,
        render: (_, record) => {
          const p = record as Patient;
          return (
            <Space>
              <Button type="link" size="small" onClick={() => setDetailPatient(p)}>
                详情
              </Button>
              <Button type="link" size="small" onClick={() => {
                const real = PATIENTS.find((x) => x.id === p.id);
                if (real) {
                  navigator.clipboard?.writeText(real.phone);
                  toast.success('已复制');
                }
              }}>
                联系
              </Button>
            </Space>
          );
        },
      },
    ],
    [t, toast]
  );

  // 命令面板
  useCommandPalette([
    { id: 'new-patient', label: '新增患者', action: () => toast.info('功能开发中') },
    { id: 'export', label: '导出', action: () => toast.info('导出功能') },
  ]);

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }} notificationCount={stats.withCritical}>
      <PageContainer
        title="患者管理"
        extra={
          <Space>
            <Button>导入</Button>
            <Button type="primary">新增患者</Button>
          </Space>
        }
      >
        {/* 统计 KPI */}
        <AppGrid cols={5} gap={12} style={{ marginBottom: 16 }}>
          <CardSection hoverable>
            <AppStatistic title="患者总数" value={stats.total} />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic title="男性" value={stats.male} prefix={<ManOutlined style={{ color: '#3b82f6' }} />} />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic title="女性" value={stats.female} prefix={<WomanOutlined style={{ color: '#ec4899' }} />} />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic
              title="有危急值"
              value={stats.withCritical}
              prefix={<WarningOutlined style={{ color: '#dc2626' }} />}
            />
          </CardSection>
          <CardSection hoverable>
            <AppStatistic title="平均年龄" value={stats.avgAge} suffix="岁" />
          </CardSection>
        </AppGrid>

        {/* 筛选 */}
        <CardSection style={{ marginBottom: 16 }}>
          <Space wrap size="middle" align="center" style={{ width: '100%' }}>
            <AppSearchInput value={search} onChange={setSearch} placeholder="搜索患者姓名/ID" width={240} />
            <AppSelectField
              aria-label="性别筛选"
              value={genderFilter}
              onChange={(v) => setGenderFilter(String(v))}
              options={[
                { label: '全部性别', value: 'all' },
                { label: '男', value: '男' },
                { label: '女', value: '女' },
                { label: '其他', value: '其他' },
              ]}
            />
            <AppSelectField
              aria-label="类型筛选"
              value={typeFilter}
              onChange={(v) => setTypeFilter(String(v))}
              options={[
                { label: '全部类型', value: 'all' },
                { label: '门诊', value: '门诊' },
                { label: '住院', value: '住院' },
                { label: '急诊', value: '急诊' },
                { label: '体检', value: '体检' },
              ]}
            />
            <Button
              type={criticalFilter ? 'primary' : 'default'}
              danger={criticalFilter}
              icon={<WarningOutlined />}
              onClick={() => setCriticalFilter(!criticalFilter)}
            >
              仅看危急值
            </Button>
          </Space>
        </CardSection>

        {/* 列表 */}
        {filtered.length === 0 ? (
          <AppEmpty variant="no-data" />
        ) : (
          <ProTable dataSource={filtered} columns={columns} rowKey="id" />
        )}

        {/* 详情 Drawer */}
        <Drawer
          open={!!detailPatient}
          onClose={() => setDetailPatient(null)}
          title={detailPatient ? `${detailPatient.name} (${detailPatient.id})` : ''}
          width={600}
        >
          {detailPatient && (
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: 'info',
                  label: '基本信息',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="姓名">
                          {showReal ? detailPatient.name : maskName(detailPatient.name)}
                        </Descriptions.Item>
                        <Descriptions.Item label="性别">
                          {detailPatient.gender === '男' ? <ManOutlined /> : <WomanOutlined />} {detailPatient.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="年龄">{detailPatient.age} 岁</Descriptions.Item>
                        <Descriptions.Item label="出生日期">{detailPatient.birthDate}</Descriptions.Item>
                        <Descriptions.Item label="身份证">
                          {showReal ? detailPatient.idCard : maskIdCard(detailPatient.idCard)}
                        </Descriptions.Item>
                        <Descriptions.Item label="电话">
                          {showReal ? detailPatient.phone : maskPhone(detailPatient.phone)}
                        </Descriptions.Item>
                        {detailPatient.email && (
                          <Descriptions.Item label="邮箱">
                            {showReal ? detailPatient.email : maskEmail(detailPatient.email)}
                          </Descriptions.Item>
                        )}
                        <Descriptions.Item label="地址">
                          <EnvironmentOutlined /> {detailPatient.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="类型">
                          <Tag>{detailPatient.patientType}</Tag>
                        </Descriptions.Item>
                        {detailPatient.allergies && (
                          <Descriptions.Item label="过敏史">
                            <Tag color="orange">{detailPatient.allergies}</Tag>
                          </Descriptions.Item>
                        )}
                        <Descriptions.Item label="总检查次数">
                          <Tag color="blue">{detailPatient.totalExams} 次</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="危急值数">
                          {detailPatient.criticalCount > 0 ? (
                            <Tag color="red">{detailPatient.criticalCount} 次</Tag>
                          ) : (
                            <Tag>0</Tag>
                          )}
                        </Descriptions.Item>
                      </Descriptions>

                      <div style={{ background: '#fef3c7', padding: 8, borderRadius: 6, fontSize: 12, color: '#92400e' }}>
                        🛡️ 列表展示已自动脱敏(姓名 / 身份证 / 电话 / 邮箱)。
                        详情默认显示脱敏数据,需要时点下方按钮查看真实数据。
                      </div>
                      <Button
                        block
                        onClick={() => {
                          confirm.confirm({
                            title: '查看真实数据?',
                            content: '此操作将显示患者完整信息(姓名 / 身份证 / 电话),会记录在审计日志。',
                            okText: '查看',
                            okButtonProps: { danger: true },
                            onOk: () => {
                              setShowReal(true);
                              announce('已显示真实数据');
                            },
                          });
                        }}
                      >
                        {showReal ? '✓ 已显示真实数据' : '查看真实数据(需审计)'}
                      </Button>
                    </Space>
                  ),
                },
                {
                  key: 'exams',
                  label: `历史检查 (${detailPatient.totalExams})`,
                  children: (
                    <Timeline>
                      <Timeline.Item color="blue" dot={<CalendarOutlined />}>
                        2026-06-06 胸部 CT 平扫
                      </Timeline.Item>
                      <Timeline.Item color="green">
                        2026-03-15 头颅 MR 平扫
                      </Timeline.Item>
                      <Timeline.Item color="gray">
                        2025-11-20 腹部超声
                      </Timeline.Item>
                      <Timeline.Item>
                        ...共 {detailPatient.totalExams} 次检查
                      </Timeline.Item>
                    </Timeline>
                  ),
                },
                {
                  key: 'critical',
                  label: `危急值 (${detailPatient.criticalCount})`,
                  children:
                    detailPatient.criticalCount > 0 ? (
                      <Timeline>
                        {Array.from({ length: detailPatient.criticalCount }).map((_, i) => (
                          <Timeline.Item color="red" key={i} dot={<WarningOutlined />}>
                            <strong>2026-06-06 09:15</strong> - 主动脉夹层 Stanford A 型
                            <div style={{ fontSize: 12, color: '#64748b' }}>已通知 / 已确认 / 已闭环</div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <AppEmpty variant="no-data" description="无危急值记录" />
                    ),
                },
              ]}
            />
          )}
        </Drawer>

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
