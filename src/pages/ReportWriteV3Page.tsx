/**
 * G005 放射RIS系统 v3.0.0 - 报告书写 V3 完整重构
 * Phase T3-W8: reportMachine 14 态 + 业务组件 + AI 辅助 + i18n + a11y
 *
 * 三栏布局:
 *   - 左:影像/历史(预留)
 *   - 中:所见/诊断/印象/建议(4 段 + XState 状态机)
 *   - 右:模板/术语/AI 辅助
 *
 * XState 流转:
 *   pendingAssignment → assigned → writing → submitted → reviewing → reviewed → signing → signed → published
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachine } from '@xstate/react';
import {
  PageContainer,
  AppLayout,
  CardSection,
  AppTextArea,
  type SidebarItem,
} from '@components/antd';
import {
  Tag,
  Space,
  Button,
  Steps,
  App as AntdApp,
  Drawer,
  Spin,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  AlertOutlined,
  UserOutlined,
  ExperimentOutlined,
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  HistoryOutlined,
  BulbOutlined,
  DesktopOutlined,
  FileTextOutlined as DocIcon,
} from '@ant-design/icons';
import { reportMachine, REPORT_STATE_LABEL, type ReportStateName } from '@machines/reportMachine';
import { REPORT_DOCTORS } from '@data/reportSubsystemMock';
import { useToast, useConfirm } from '@components/antd';
import { useCommandPalette, useScreenReaderAnnouncer } from '@/a11y/SkipLink';
import { useIsMobile } from '@hooks/useBreakpoint';
import { useDebounce } from '@utils/performance';
import { captureError } from '@observability/sentry';

// ============= 侧边栏 =============
const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: 'worklist', icon: <FileTextOutlined />, label: '工作列表', path: '/worklist' },
  { key: 'critical', icon: <AlertOutlined />, label: '危急值', path: '/critical-value' },
  { key: 'reports', icon: <FileTextOutlined />, label: '报告', path: '/reports' },
  { key: 'ai', icon: <ExperimentOutlined />, label: 'AI', path: '/ai-assist' },
];

// ============= 模板 + 术语 模拟数据 =============
const TEMPLATES = [
  { id: 't-001', name: '胸部 CT 平扫', modality: 'CT', bodyPart: '胸部', icon: '🫁' },
  { id: 't-002', name: '头颅 CT 平扫', modality: 'CT', bodyPart: '头颅', icon: '🧠' },
  { id: 't-003', name: '腹部 MR 平扫', modality: 'MR', bodyPart: '腹部', icon: '🫃' },
  { id: 't-004', name: '乳腺钼靶', modality: 'MG', bodyPart: '乳腺', icon: '🎀' },
  { id: 't-005', name: '冠脉 CTA', modality: 'CT', bodyPart: '心脏', icon: '❤️' },
];

const TERMS = [
  { id: 'tm-001', text: '右肺上叶', category: 'anatomy' },
  { id: 'tm-002', text: '磨玻璃结节', category: 'imaging_sign' },
  { id: 'tm-003', text: '分叶征', category: 'imaging_sign' },
  { id: 'tm-004', text: '胸腔积液', category: 'disease' },
  { id: 'tm-005', text: '肺不张', category: 'disease' },
  { id: 'tm-006', text: '实性结节', category: 'imaging_sign' },
  { id: 'tm-007', text: '占位性病变', category: 'imaging_sign' },
];

const AI_SUGGESTIONS = [
  { id: 'ai-001', title: '智能起草所见', desc: '基于临床信息自动生成影像所见', icon: <RobotOutlined />, color: '#1e40af' },
  { id: 'ai-002', title: '诊断建议', desc: '基于所见推荐鉴别诊断', icon: <BulbOutlined />, color: '#f59e0b' },
  { id: 'ai-003', title: '危急值检测', desc: 'AI 自动识别危急关键字', icon: <AlertOutlined />, color: '#dc2626' },
  { id: 'ai-004', title: '历史报告对比', desc: '调取同患者历次报告', icon: <HistoryOutlined />, color: '#10b981' },
];

// ============= 主组件 =============
export default function ReportWriteV3Page(): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { announce, Announcement } = useScreenReaderAnnouncer();

  // XState - 当前报告状态机
  const [state, send] = useMachine(reportMachine, {
    input: { reportId: 'rpt-001', patientId: 'P001', radiologistId: 'D001' },
  });
  const currentState = state.value as ReportStateName;

  // 表单字段
  const [findings, setFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 防抖保存
  const debouncedFindings = useDebounce(findings, 1500);
  const debouncedDiagnosis = useDebounce(diagnosis, 1500);

  // 自动保存(模拟)
  useEffect(() => {
    if (debouncedFindings || debouncedDiagnosis) {
      try {
        const now = new Date().toISOString();
        setLastSaved(now);
      } catch (error) {
        captureError(error as Error, { action: 'autoSave' });
      }
    }
  }, [debouncedFindings, debouncedDiagnosis]);

  // 应用模板
  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      try {
        const tpl = TEMPLATES.find((t) => t.id === templateId);
        if (!tpl) return;
        if (tpl.modality === 'CT' && tpl.bodyPart === '胸部') {
          setFindings('双肺纹理清晰,右肺上叶后段见一磨玻璃结节影,直径约 8mm,边缘可见分叶征及短毛刺。纵隔内未见明显肿大淋巴结。双侧胸腔未见积液。');
          setDiagnosis('右肺上叶磨玻璃结节(Lung-RADS 4A),考虑周围型肺腺癌可能。');
          setImpression('建议 3 个月后复查 LDCT,必要时 PET-CT 检查或组织活检。');
        } else {
          setFindings(`【${tpl.name} 模板】请补充详细影像所见...`);
          setDiagnosis(`【${tpl.name} 诊断模板】`);
        }
        setSelectedTemplate(templateId);
        announce(`已应用模板 ${tpl.name}`);
        toast.success('模板已应用');
      } catch (error) {
        captureError(error as Error, { action: 'applyTemplate', templateId });
        toast.error('模板应用失败');
      }
    },
    [announce, toast]
  );

  // 插入术语
  const handleInsertTerm = useCallback(
    (term: string) => {
      setFindings((prev) => (prev ? `${prev}、${term}` : term));
      announce(`已插入术语 ${term}`);
    },
    [announce]
  );

  // AI 辅助
  const handleAIAssist = useCallback(
    (type: 'generate' | 'differential' | 'critical') => {
      setIsAILoading(true);
      setIsAIPanelOpen(true);
      setAiSuggestion('');
      setTimeout(() => {
        const suggestions: Record<typeof type, string> = {
          generate: '【AI 起草所见】\n\n双肺纹理清晰,右肺上叶后段见一磨玻璃结节影,直径约 8mm,边缘可见分叶征及短毛刺。\n纵隔内未见明显肿大淋巴结。\n双侧胸腔未见积液。\n\n【AI 诊断建议】\n1. 周围型肺腺癌可能(Lung-RADS 4A)\n2. 肺错构瘤\n3. 慢性炎症',
          differential: '【鉴别诊断】\n\n基于所见(右肺上叶磨玻璃结节 8mm),建议考虑:\n1. 周围型肺腺癌(最可能,Lung-RADS 4A)\n2. 原位腺癌(AIS)\n3. 微浸润腺癌(MIA)\n4. 肺错构瘤\n5. 慢性炎症\n6. 肺结核球\n\n建议进一步检查:PET-CT、增强 CT、必要时穿刺活检。',
          critical: '【危急值检测】\n\n已扫描当前报告,未发现危急值关键字。\n\n✓ 主动脉夹层\n✓ 肺栓塞\n✓ 张力性气胸\n✓ 急性脑疝\n✓ 消化道穿孔\n\n报告可正常提交。',
        };
        setAiSuggestion(suggestions[type]);
        setIsAILoading(false);
        announce('AI 辅助完成');
      }, 1500);
    },
    [announce]
  );

  // 提交
  const handleSubmit = useCallback(() => {
    if (!findings.trim() || !diagnosis.trim()) {
      toast.error('请先填写所见和诊断');
      return;
    }
    confirm.submit(`报告 #001`, () => {
      try {
        send({ type: 'SUBMIT' });
        announce('报告已提交审核');
        toast.success('报告已提交审核');
      } catch (error) {
        captureError(error as Error, { action: 'submit' });
        toast.error('提交失败');
      }
    });
  }, [findings, diagnosis, confirm, send, announce, toast]);

  // 保存草稿
  const handleSaveDraft = useCallback(() => {
    try {
      send({ type: 'UPDATE_CONTENT', findings, diagnosis, impression, recommendations });
      toast.success('草稿已保存');
      setLastSaved(new Date().toISOString());
    } catch (error) {
      captureError(error as Error, { action: 'saveDraft' });
      toast.error('保存失败');
    }
  }, [findings, diagnosis, impression, recommendations, send, toast]);

  // 命令面板
  useCommandPalette([
    { id: 'save', label: '保存草稿', shortcut: 'Ctrl+S', action: () => handleSaveDraft() },
    { id: 'submit', label: '提交审核', shortcut: 'Ctrl+Enter', action: () => handleSubmit() },
    { id: 'ai', label: 'AI 辅助', shortcut: 'Ctrl+I', action: () => handleAIAssist('generate') },
  ]);

  // 步骤条
  const getStep = (s: ReportStateName): number => {
    if (['pendingAssignment', 'assigned', 'writing'].includes(s)) return 0;
    if (['submitted', 'reviewing', 'reviewed'].includes(s)) return 1;
    if (['signing', 'signed'].includes(s)) return 2;
    if (s === 'published') return 3;
    if (['amending', 'amended', 'withdrawn', 'rejected', 'archived'].includes(s)) return -1;
    return 0;
  };

  const wordCount = useMemo(
    () => findings.length + diagnosis.length + impression.length + recommendations.length,
    [findings, diagnosis, impression, recommendations]
  );

  return (
    <AppLayout sidebarItems={SIDEBAR_ITEMS} user={{ name: '张明远', role: '主任医师' }} notificationCount={0}>
      <PageContainer
        title={`报告 #001 - ${REPORT_STATE_LABEL[currentState]}`}
        extra={
          <Space>
            {lastSaved && (
              <span style={{ fontSize: 12, color: '#64748b' }}>
                <CheckCircleOutlined /> 自动保存于 {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
              保存草稿
            </Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} disabled={currentState === '已发布'}>
              提交审核
            </Button>
          </Space>
        }
      >
        {/* XState 14 态进度条 */}
        <CardSection style={{ marginBottom: 16 }}>
          <Steps
            current={getStep(currentState)}
            status={
              ['rejected', 'withdrawn'].includes(currentState) ? 'error' :
              currentState === 'archived' ? 'finish' : 'process'
            }
            items={[
              { title: '草稿', description: '分配 / 书写' },
              { title: '审核', description: '提交 / 初审 / 终审' },
              { title: '签发', description: 'CA 签名' },
              { title: '发布', description: '已发布' },
            ]}
          />
          {currentState === 'rejected' && (
            <Alert
              type="error"
              message="报告已被驳回"
              description="请根据审核意见修改后重新提交"
              style={{ marginTop: 12 }}
              showIcon
            />
          )}
        </CardSection>

        {/* 主内容(3 栏) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '200px 1fr 280px',
            gap: 16,
          }}
        >
          {/* 左栏:历史 */}
          {!isMobile && (
            <CardSection title="历史报告" style={{ height: 'fit-content' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {REPORT_DOCTORS.slice(0, 5).map((doc) => (
                  <div key={doc.id} style={{ padding: 6, background: '#f8fafc', borderRadius: 4, fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ color: '#64748b' }}>{doc.title}</div>
                  </div>
                ))}
              </Space>
            </CardSection>
          )}

          {/* 中栏:所见/诊断/印象/建议 */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <CardSection
              title={
                <Space>
                  <DocIcon /> 影像所见 <span style={{ color: '#dc2626' }}>*</span>
                </Space>
              }
              extra={
                <Space size="small">
                  <Tag color="blue">{findings.length} 字</Tag>
                  <Button size="small" icon={<RobotOutlined />} onClick={() => handleAIAssist('generate')}>
                    AI 起草
                  </Button>
                </Space>
              }
            >
              <AppTextArea value={findings} onChange={setFindings} placeholder="详细描述..." rows={6} showCount maxLength={2000} />
            </CardSection>

            <CardSection
              title={
                <Space>
                  <CheckCircleOutlined /> 诊断意见 <span style={{ color: '#dc2626' }}>*</span>
                </Space>
              }
              extra={
                <Space size="small">
                  <Tag color="blue">{diagnosis.length} 字</Tag>
                  <Button size="small" icon={<BulbOutlined />} onClick={() => handleAIAssist('differential')}>
                    鉴别诊断
                  </Button>
                </Space>
              }
            >
              <AppTextArea value={diagnosis} onChange={setDiagnosis} placeholder="主诊断 + 次诊断..." rows={4} showCount maxLength={1000} />
            </CardSection>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <CardSection title="印象 / 结论" extra={<Tag>{impression.length} 字</Tag>}>
                <AppTextArea value={impression} onChange={setImpression} placeholder="简明总结..." rows={3} />
              </CardSection>
              <CardSection title="建议" extra={<Tag>{recommendations.length} 字</Tag>}>
                <AppTextArea value={recommendations} onChange={setRecommendations} placeholder="随访 / 进一步检查..." rows={3} />
              </CardSection>
            </div>

            <CardSection title="状态机操作" extra={<Tag color="blue">XState 5 驱动</Tag>}>
              <Space wrap>
                {currentState === 'pendingAssignment' && (
                  <Button onClick={() => send({ type: 'ASSIGN', radiologistId: 'D001' })}>分配给自己</Button>
                )}
                {currentState === 'writing' && (
                  <Button onClick={() => send({ type: 'WITHDRAW' })} danger>撤回</Button>
                )}
                <Button onClick={handleSubmit} type="primary" icon={<SendOutlined />}>提交到审核</Button>
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
                  当前状态: <Tag color="blue">{REPORT_STATE_LABEL[currentState]}</Tag>
                </span>
              </Space>
            </CardSection>
          </Space>

          {/* 右栏:模板/术语/AI */}
          {!isMobile && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <CardSection title="📋 报告模板" extra={<Tag>{TEMPLATES.length}</Tag>}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {TEMPLATES.map((tpl) => (
                    <Button
                      key={tpl.id}
                      type={selectedTemplate === tpl.id ? 'primary' : 'default'}
                      block
                      size="small"
                      onClick={() => handleApplyTemplate(tpl.id)}
                    >
                      {tpl.icon} {tpl.name}
                    </Button>
                  ))}
                </Space>
              </CardSection>

              <CardSection title="📚 术语联想" extra={<Tag>{TERMS.length}</Tag>}>
                <Space wrap size="small">
                  {TERMS.map((term) => (
                    <Tag key={term.id} style={{ cursor: 'pointer' }} onClick={() => handleInsertTerm(term.text)}>
                      {term.text}
                    </Tag>
                  ))}
                </Space>
              </CardSection>

              <CardSection title="🤖 AI 辅助" extra={<Tag color="purple">DeepSeek</Tag>}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {AI_SUGGESTIONS.map((ai) => (
                    <Button
                      key={ai.id}
                      block
                      size="small"
                      style={{ borderColor: ai.color, color: ai.color, textAlign: 'left' }}
                      icon={ai.icon}
                      onClick={() => handleAIAssist(ai.id === 'ai-001' ? 'generate' : ai.id === 'ai-002' ? 'differential' : 'critical')}
                    >
                      {ai.title}
                    </Button>
                  ))}
                </Space>
              </CardSection>

              <CardSection title="📊 统计">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>总字数: <strong>{wordCount}</strong></div>
                  <div>所见: <strong>{findings.length}</strong></div>
                  <div>诊断: <strong>{diagnosis.length}</strong></div>
                </Space>
              </CardSection>
            </Space>
          )}
        </div>

        {/* AI 抽屉 */}
        <Drawer
          open={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          title="AI 辅助建议"
          width={500}
        >
          {isAILoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#64748b' }}>AI 正在分析...</p>
            </div>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert message="DeepSeek 推理完成" type="success" showIcon />
              <pre
                style={{
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 8,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {aiSuggestion}
              </pre>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setFindings(aiSuggestion);
                    setIsAIPanelOpen(false);
                    toast.success('已应用 AI 建议');
                  }}
                >
                  应用到所见
                </Button>
                <Button onClick={() => setIsAIPanelOpen(false)}>关闭</Button>
              </Space>
            </Space>
          )}
        </Drawer>

        <Announcement />
      </PageContainer>
    </AppLayout>
  );
}
