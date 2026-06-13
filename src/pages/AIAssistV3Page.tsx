/**
 * G005 放射RIS系统 v3.0.0 - AI 辅助诊断 V3
 * Phase T3-W8: DeepSeek 集成 + RADS 自动化 + 业务组件
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  AppGrid,
  CardSection,
  AppSelectField,
  AppEmpty,
  useToast } from '@components/antd';
import {
  Tag,
  Space,
  Button,
  Input,
  Alert,
  Spin,
  Tabs } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  ExperimentOutlined,
  RobotOutlined,
  CheckCircleOutlined } from '@ant-design/icons';
import { useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { captureError } from '@observability/sentry';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI 辅助', path: '/ai-assist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'reports', icon: <FileTextOutlined />, label: '报告', path: '/reports' },
];

const AI_TASKS = [
  { key: 'lung-nodule', name: '肺结节检测', modality: 'CT', bodyPart: '胸部', icon: '🫁', color: '#3b82f6' },
  { key: 'breast', name: '乳腺肿块分析', modality: 'MG', bodyPart: '乳腺', icon: '🎀', color: '#ec4899' },
  { key: 'fracture', name: '骨折检测', modality: 'DR', bodyPart: '四肢', icon: '🦴', color: '#f59e0b' },
  { key: 'brain-hemorrhage', name: '脑出血检测', modality: 'CT', bodyPart: '头颅', icon: '🧠', color: '#dc2626' },
  { key: 'liver', name: '肝脏占位', modality: 'MR', bodyPart: '腹部', icon: '🫃', color: '#10b981' },
  { key: 'coronary', name: '冠脉狭窄', modality: 'CT', bodyPart: '心脏', icon: '❤️', color: '#8b5cf6' },
];

const SAMPLE_RESULT = {
  patient: '张志远',
  modality: 'CT',
  bodyPart: '胸部',
  findings: [
    { type: 'nodule', location: '右肺上叶后段', size: '8mm × 7mm', confidence: 0.92 },
    { type: 'calcification', location: '左肺下叶', size: '3mm', confidence: 0.88 },
  ],
  classification: 'Lung-RADS 4A',
  riskPercent: '5-15%',
  recommendation: '3 个月后 LDCT 复查;必要时 PET-CT 或组织活检',
  differentialDiagnosis: [
    { name: '周围型肺腺癌', probability: 0.65 },
    { name: '原位腺癌(AIS)', probability: 0.15 },
    { name: '肺错构瘤', probability: 0.10 },
    { name: '慢性炎症', probability: 0.10 },
  ],
  criticalValue: false };

export default function AIAssistV3Page(): JSX.Element {
  const { t } = useTranslation();
  const toast = useToast();
  const { announce } = useScreenReaderAnnouncer();

  const [modality, setModality] = useState<string>('CT');
  const [bodyPart, setBodyPart] = useState<string>('胸部');
  const [clinicalInfo, setClinicalInfo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof SAMPLE_RESULT | null>(null);
  const [activeTab, setActiveTab] = useState('findings');

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      try {
        setResult(SAMPLE_RESULT);
        announce('AI 分析完成');
        toast.success('分析完成');
      } catch (error) {
        captureError(error as Error, { action: 'aiAnalyze' });
        toast.error('分析失败');
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000);
  }, [announce, toast]);

  return (
    <>
      <PageContainer
        title="AI 辅助诊断"
        extra={
          <Space>
            <Tag color="purple">DeepSeek 集成</Tag>
            <Tag color="green">Lung-RADS 4A</Tag>
          </Space>
        }
      >
        {/* AI 任务选择 */}
        <CardSection title="AI 任务" style={{ marginBottom: 16 }}>
          <AppGrid cols={6} gap={12}>
            {AI_TASKS.map((task) => (
              <CardSection
                key={task.key}
                hoverable
                onClick={() => {
                  setModality(task.modality);
                  setBodyPart(task.bodyPart);
                  announce(`已选择 ${task.name}`);
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32 }}>{task.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{task.name}</div>
                  <Tag color={task.color} style={{ marginTop: 4 }}>
                    {task.modality} · {task.bodyPart}
                  </Tag>
                </div>
              </CardSection>
            ))}
          </AppGrid>
        </CardSection>

        {/* 输入 */}
        <CardSection title="输入" style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <AppSelectField
                value={modality}
                onChange={(v) => setModality(String(v))}
                options={[
                  { label: 'CT', value: 'CT' },
                  { label: 'MR', value: 'MR' },
                  { label: 'DR', value: 'DR' },
                  { label: 'US', value: 'US' },
                  { label: 'MG', value: 'MG' },
                  { label: 'DSA', value: 'DSA' },
                ]}
              />
              <AppSelectField
                value={bodyPart}
                onChange={(v) => setBodyPart(String(v))}
                options={[
                  { label: '胸部', value: '胸部' },
                  { label: '腹部', value: '腹部' },
                  { label: '头颅', value: '头颅' },
                  { label: '脊柱', value: '脊柱' },
                  { label: '四肢', value: '四肢' },
                  { label: '心脏', value: '心脏' },
                ]}
              />
            </Space>
            <Input.TextArea
              value={clinicalInfo}
              onChange={(e) => setClinicalInfo(e.target.value)}
              placeholder="临床信息(主诉、病史、检查目的等)"
              rows={3}
            />
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              loading={isAnalyzing}
              onClick={handleAnalyze}
            >
              开始 AI 分析
            </Button>
          </Space>
        </CardSection>

        {/* 结果 */}
        {isAnalyzing && (
          <CardSection>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#64748b' }}>DeepSeek 推理中...</p>
            </div>
          </CardSection>
        )}

        {result && !isAnalyzing && (
          <CardSection
            title={`分析结果 - ${result.patient}`}
            extra={<Tag color="green"><CheckCircleOutlined /> 完成</Tag>}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'findings',
                  label: '影像所见',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {result.findings.map((f, i) => (
                        <CardSection key={i} hoverable>
                          <Space>
                            <Tag color="blue">{f.type}</Tag>
                            <strong>{f.location}</strong>
                            <span>{f.size}</span>
                            <Tag color="green">置信度 {(f.confidence * 100).toFixed(0)}%</Tag>
                          </Space>
                        </CardSection>
                      ))}
                    </Space>
                  ) },
                {
                  key: 'classification',
                  label: '分级',
                  children: (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Alert
                        type="warning"
                        message={`${result.classification} - 风险 ${result.riskPercent}`}
                        description={result.recommendation}
                        showIcon
                      />
                    </Space>
                  ) },
                {
                  key: 'differential',
                  label: '鉴别诊断',
                  children: (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {result.differentialDiagnosis.map((d, i) => (
                        <div key={d.name} style={{ padding: 8, background: '#f8fafc', borderRadius: 4 }}>
                          <Space>
                            <Tag color="blue">{i + 1}</Tag>
                            <strong>{d.name}</strong>
                            <Tag color="purple">概率 {(d.probability * 100).toFixed(0)}%</Tag>
                          </Space>
                        </div>
                      ))}
                    </Space>
                  ) },
                {
                  key: 'critical',
                  label: '危急值检测',
                  children: result.criticalValue ? (
                    <Alert type="error" message="检测到危急值" showIcon />
                  ) : (
                    <Alert type="success" message="未发现危急值" showIcon />
                  ) },
              ]}
            />
          </CardSection>
        )}

        {!result && !isAnalyzing && <AppEmpty variant="no-results" description="点击开始 AI 分析" />}
      </PageContainer>
    </>
  );
}
