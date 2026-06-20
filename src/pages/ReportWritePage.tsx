/**
 * G005 放射RIS系统 v3.0.6.8-19 — 报告书写 V3（UI 重构 A2）
 * 重构: 顶栏精简 / 临床条横排 / 主区左右分栏 / Toolbar 3 段分组 / Sider 4+折叠
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Layout, Card, Space, Button, Tag, Tooltip, Tabs, Divider, Dropdown,
  Alert, message, Modal, Progress, Empty,
} from 'antd';
import {
  Save, Send, Mic, Image as ImageIcon,
  Brain, History, Eye, ChevronLeft, ChevronDown, Sparkles,
  Tag as TagIcon, BarChart3, AlertCircle,
  ListChecks, CheckCircle2, PanelRightClose, PanelRightOpen, MoreHorizontal, User,
  Hash, Stethoscope, Activity, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  REPORT_WRITING_CONTEXT_MOCK, REPORT_DRAFTS_MOCK, KEYWORD_HIGHLIGHTS_MOCK, PRE_SUBMIT_SCORE_MOCK,
} from '@data/reportWritingMock';
import { StructuredFieldForm } from '@components/report/v3/R3.WRITING/StructuredFieldForm';
import { ReportRichEditor } from '@components/report/v3/R3.WRITING/ReportRichEditor';
import { AIDraftPanel } from '@components/report/v3/R3.WRITING/AIDraftPanel';
import { VoiceDictation } from '@components/report/v3/R3.WRITING/VoiceDictation';
import { ImageAnchorComponent } from '@components/report/v3/R3.WRITING/ImageAnchor';

/* ==================== V3 UI Token ==================== */
const V3_STYLES = `
:root { --v3-bd:#e5e7eb; --v3-bd-soft:#f1f5f9; --v3-bg:#f8fafc; --v3-text:#0f172a; --v4-text-sec:#64748b; --v3-rd:6px; --v3-rd-lg:8px; --v3-sh:0 1px 2px rgba(0,0,0,0.04); --v3-sh-lg:0 4px 12px rgba(0,0,0,0.06); }
.v3-root { display:flex; flex-direction:column; height:100vh; min-height:100vh; background:var(--v3-bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; overflow:hidden; }
.v3-root .ant-layout { background:transparent; }
.v3-root .ant-layout-sider { background:#fff !important; }
.v3-root .ant-card { border:1px solid var(--v3-bd); box-shadow:var(--v3-sh); border-radius:var(--v3-rd-lg); }
.v3-root .ant-card-head { min-height:40px; padding:0 12px; border-bottom:1px solid var(--v3-bd-soft); }
.v3-root .ant-card-head-title { padding:8px 0; }
.v3-root .ant-card-body { padding:12px; }
.v3-root .ant-tabs { height:100%; }
.v3-root .ant-tabs-content-holder { display:none; }
.v3-root .ant-tabs-nav { margin-bottom:8px !important; }

/* 顶栏 */
.v3-topbar { display:flex; align-items:center; justify-content:space-between; height:48px; padding:0 16px; background:#fff; border-bottom:1px solid var(--v3-bd); flex-shrink:0; gap:16px; }
.v3-topbar-left, .v3-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.v3-topbar-title { font-size:15px; font-weight:600; color:var(--v3-text); white-space:nowrap; }
.v3-stats-pill { display:flex; align-items:center; gap:10px; padding:5px 14px; background:var(--v3-bg); border-radius:20px; font-size:12px; color:var(--v4-text-sec); white-space:nowrap; }
.v3-stats-pill-divider { width:1px; height:12px; background:var(--v3-bd); }
.v3-autosave-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-right:4px; vertical-align:middle; }
.v3-autosave-dot--saving { background:#3b82f6; animation: v3-pulse 1s infinite; }
@keyframes v3-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* 临床信息条 */
.v3-clinical-strip { display:flex; align-items:center; gap:12px; height:48px; padding:0 16px; background:#fff; border-bottom:1px solid var(--v3-bd); flex-shrink:0; overflow:hidden; }
.v3-clinical-item { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--v3-text); white-space:nowrap; }
.v3-clinical-item .v3-icon { color:var(--v4-text-sec); }
.v3-clinical-label { color:var(--v4-text-sec); font-size:11px; }
.v3-clinical-value { font-weight:500; }
.v3-clinical-divider { width:1px; height:16px; background:var(--v3-bd); }
.v3-clinical-dropdown { background:#fff; border:1px solid var(--v3-bd); border-radius:var(--v3-rd); padding:12px; min-width:380px; font-size:12px; line-height:1.7; }
.v3-clinical-dropdown b { color:var(--v3-text); margin-right:4px; }

/* 主区 */
.v3-main-grid { display:flex; flex:1; min-height:0; gap:8px; padding:8px; background:var(--v3-bg); overflow:hidden; }
.v3-editor-col { flex:1.6; min-width:0; display:flex; flex-direction:column; gap:8px; overflow:hidden; }
.v3-fields-col { width:400px; min-width:340px; max-width:480px; display:flex; flex-direction:column; gap:8px; overflow:hidden; flex-shrink:0; }
.v3-col-card { display:flex; flex-direction:column; flex:1; min-height:0; }
.v3-col-card .ant-card-body { flex:1; min-height:0; overflow-y:auto; padding:12px; }

/* Sider 折叠态 60px 图标条 */
.v3-sider-collapsed { display:flex; flex-direction:column; width:56px; flex-shrink:0; background:#fff; border-left:1px solid var(--v3-bd); align-items:center; padding-top:8px; gap:4px; }
.v3-sider-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:var(--v3-rd); cursor:pointer; color:var(--v4-text-sec); transition:all 0.15s; }
.v3-sider-icon:hover { background:#e0e7ff; color:var(--v4-text-sec); }
.v3-sider-icon--active { background:#dbeafe; color:#3b82f6; }
.v3-sider { display:flex; flex-direction:column; width:320px; flex-shrink:0; background:#fff; border-left:1px solid var(--v3-bd); }
.v3-sider-header { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-bottom:1px solid var(--v3-bd-soft); flex-shrink:0; }
.v3-sider-title { font-size:13px; font-weight:600; }
.v3-sider-body { flex:1; overflow-y:auto; padding:12px; }

/* 响应式 */
@media (max-width: 1280px) { .v3-fields-col { width:360px; } }
@media (max-width: 1024px) { .v3-main-grid { flex-direction:column; overflow-y:auto; } .v3-editor-col, .v3-fields-col { width:100%; max-width:100%; } .v3-sider, .v3-sider-collapsed { display:none; } }
@media (max-width: 768px) { .v3-stats-pill .v3-stats-pill-text { display:none; } .v3-clinical-strip { gap:8px; } .v3-clinical-item--hide-mobile { display:none; } }

/* 富文本编辑器工具栏 */
.rte-toolbar { display:flex; align-items:center; gap:2px; padding:6px 10px; border-bottom:1px solid var(--v3-bd-soft); background:#f8fafc; flex-shrink:0; flex-wrap:wrap; min-height:42px; }
.rte-main-row { display:flex; align-items:center; gap:2px; flex:1; min-width:0; flex-wrap:wrap; }
.rte-toolbar .ant-btn-sm { width:28px; height:28px; padding:0; display:inline-flex; align-items:center; justify-content:center; }
.rte-toolbar .ant-select-sm .ant-select-selector { padding:0 8px !important; height:28px !important; }

/* Antd Card body 全高 */
.v3-root .ant-card { display:flex; flex-direction:column; }
.v3-root .ant-card-body { display:flex; flex-direction:column; flex:1; min-height:0; }
`;

/* ==================== 右侧 Sider Tab 内容（懒加载）==================== */
function AITab({ reportId, modality, bodyPart }: { reportId: string; modality: string; bodyPart: string }) {
  return (
    <AIDraftPanel
      reportId={reportId}
      modality={modality}
      bodyPart={bodyPart}
      clinicalInfo="女性 58 岁,体检发现右肺上叶结节 1 周,无明显症状。"
      onAccept={() => message.success('已应用 AI 草稿到编辑器')}
    />
  );
}
function VoiceTab({ reportId }: { reportId: string }) {
  return <VoiceDictation reportId={reportId} />;
}
function HistoryTab({ priorReports }: { priorReports: any[] }) {
  if (priorReports.length === 0) return <Empty description="无历史报告" />;
  return (
    <div className="space-y-2">
      {priorReports.map((p: any) => (
        <div key={p.id} className="p-2 border border-slate-200 rounded text-xs">
          <div className="flex items-center justify-between">
            <Tag color="cyan">{p.reportId}</Tag>
            <span className="text-slate-400">{new Date(p.studyDate).toLocaleDateString()}</span>
          </div>
          <div className="text-slate-700 mt-1 line-clamp-2">{p.findings}</div>
          {p.comparisonDelta && <Tag color="orange" className="mt-1 text-[10px]">{p.comparisonDelta.summary}</Tag>}
        </div>
      ))}
    </div>
  );
}
function ScoreTab({ preScore }: { preScore: any }) {
  return (
    <>
      <div className="text-center mb-3">
        <Progress type="circle" percent={preScore.score} size={80} strokeColor={preScore.passed ? '#10b981' : '#f59e0b'} format={(p) => <span className="text-2xl font-bold">{p}</span>} />
        <div className="text-xs text-slate-500 mt-1">{preScore.passed ? '可提交' : '需完善'}</div>
      </div>
      <Divider className="my-2" />
      <h5 className="text-xs font-semibold mb-1">检查清单</h5>
      <div className="space-y-1">
        {preScore.checklist.map((c: any) => (
          <div key={c.id} className="flex items-center gap-1 text-xs">
            {c.passed ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
            <span className={c.passed ? 'text-slate-500' : 'text-slate-800'}>{c.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
function SimilarTab({ similarCases }: { similarCases: any[] }) {
  if (similarCases.length === 0) return <Empty description="无相似病例" />;
  return (
    <div className="space-y-2">
      {similarCases.map((c: any) => (
        <div key={c.id} className="p-2 border border-slate-200 rounded text-xs">
          <div className="flex items-center justify-between">
            <Tag color="purple">{c.reportId}</Tag>
            <Tag color="blue">{(c.similarityScore * 100).toFixed(0)}%</Tag>
          </div>
          <div className="text-slate-700 mt-1 line-clamp-2">{c.impression}</div>
        </div>
      ))}
    </div>
  );
}
function DraftsTab({ drafts }: { drafts: any[] }) {
  return (
    <div className="space-y-1.5">
      {drafts.map((d: any) => (
        <div key={d.id} className="p-2 border border-slate-200 rounded text-xs">
          <div className="flex items-center justify-between">
            <Tag color={d.autoSaved ? 'green' : 'default'}>{d.versionLabel}</Tag>
            <span className="text-slate-400">{new Date(d.updatedAt).toLocaleString()}</span>
          </div>
          <div className="text-slate-700 mt-1">{d.wordCount} 字</div>
        </div>
      ))}
    </div>
  );
}
function KWTab({ keywords }: { keywords: any[] }) {
  return (
    <div className="space-y-1">
      {keywords.map((k: any) => (
        <div key={k.term} className="flex items-center gap-2 text-xs p-1.5 rounded" style={{ background: k.bg, color: k.color }}>
          <Tag color="default" className="m-0">{k.category}</Tag>
          <span className="font-semibold">{k.term}</span>
          <span className="text-slate-500">/ {k.termEn}</span>
        </div>
      ))}
    </div>
  );
}
function ComplianceTab() {
  const items = [
    { id: 'c1', label: '患者姓名与检查号匹配', passed: true },
    { id: 'c2', label: '检查部位与申请单一致', passed: true },
    { id: 'c3', label: '影像所见覆盖全部检查部位', passed: true },
    { id: 'c4', label: '诊断意见与影像所见逻辑一致', passed: true },
    { id: 'c5', label: '危急值已标注并通知临床', passed: false },
    { id: 'c6', label: '术语符合 ICD 编码规范', passed: true },
    { id: 'c7', label: '测量数据与图像一致', passed: true },
  ];
  return (
    <div className="space-y-1">
      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-1 text-xs">
          {c.passed ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
          <span className={c.passed ? 'text-slate-500' : 'text-slate-800'}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
function CollabTab() {
  const collaborators = [
    { name: '陈医师', role: '报告医师', status: 'online', lastActive: '当前编辑' },
    { name: '王医师', role: '审核医师', status: 'online', lastActive: '10 分钟前' },
    { name: '李主任', role: '终审医师', status: 'offline', lastActive: '2 小时前' },
  ];
  return (
    <div className="space-y-2">
      {collaborators.map((c) => (
        <div key={c.name} className="flex items-center justify-between p-2 border border-slate-200 rounded text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${c.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-slate-400">{c.role}</div>
            </div>
          </div>
          <span className="text-slate-400">{c.lastActive}</span>
        </div>
      ))}
    </div>
  );
}

/* ==================== Sider Tab 定义 ==================== */
type TabKey = 'ai' | 'voice' | 'history' | 'score' | 'similar' | 'drafts' | 'kw' | 'compliance' | 'collab';
const SIDER_PRIMARY_TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'ai', label: 'AI 草稿', icon: <Sparkles className="v3-icon" /> },
  { key: 'voice', label: '语音', icon: <Mic className="v3-icon" /> },
  { key: 'history', label: '历史', icon: <History className="v3-icon" /> },
  { key: 'score', label: '预评分', icon: <BarChart3 className="v3-icon" /> },
];
const SIDER_MORE_TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'similar', label: '相似病例', icon: <Brain className="v3-icon" /> },
  { key: 'drafts', label: '草稿版本', icon: <Save className="v3-icon" /> },
  { key: 'kw', label: '关键词', icon: <TagIcon className="v3-icon" /> },
  { key: 'compliance', label: '合规', icon: <ListChecks className="v3-icon" /> },
  { key: 'collab', label: '协作', icon: <Eye className="v3-icon" /> },
];

/* ==================== 主页面 ==================== */
export default function ReportWritePage() {
  const navigate = useNavigate();
  const [reportId] = useState('rpt-038');
  const [context, setContext] = useState(REPORT_WRITING_CONTEXT_MOCK);
  const [preScore] = useState(PRE_SUBMIT_SCORE_MOCK);
  const [drafts] = useState(REPORT_DRAFTS_MOCK);
  const [showSubmit, setShowSubmit] = useState(false);
  const [siderMode, setSiderMode] = useState<'expanded' | 'collapsed' | 'hidden'>('hidden');
  const [activeSiderTab, setActiveSiderTab] = useState<TabKey>('ai');
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveTime, setAutoSaveTime] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAutoSaveTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setSaving(true);
      setTimeout(() => {
        setAutoSaveTime(new Date().toLocaleTimeString());
        setSaving(false);
      }, 600);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const r = await import('@services/writing/writingService').then((m) =>
      m.submitReport(reportId, {
        finalScore: preScore.score,
        structured: context.fields,
        html: context.document.html,
      })
    );
    setSubmitting(false);
    if (r.success) {
      message.success('报告已提交审核');
      setShowSubmit(false);
      setTimeout(() => navigate('/reports/review'), 1500);
    }
  }, [reportId, preScore, context, navigate]);

  const renderSiderTab = () => {
    switch (activeSiderTab) {
      case 'ai': return <AITab reportId={reportId} modality={context.modality} bodyPart={context.bodyPart} />;
      case 'voice': return <VoiceTab reportId={reportId} />;
      case 'history': return <HistoryTab priorReports={context.priorReports} />;
      case 'score': return <ScoreTab preScore={preScore} />;
      case 'similar': return <SimilarTab similarCases={context.similarCases} />;
      case 'drafts': return <DraftsTab drafts={drafts} />;
      case 'kw': return <KWTab keywords={KEYWORD_HIGHLIGHTS_MOCK} />;
      case 'compliance': return <ComplianceTab />;
      case 'collab': return <CollabTab />;
      default: return null;
    }
  };

  const moreMenuItems = SIDER_MORE_TABS.map((t) => ({
    key: t.key,
    label: (
      <Space size={6}>
        {t.icon}<span>{t.label}</span>
      </Space>
    ),
    onClick: () => setActiveSiderTab(t.key),
  }));

  const PASSED_COUNT = preScore.checklist.filter((c: any) => c.passed).length;
  const clinicalDropdownContent = (
    <div className="v3-clinical-dropdown">
      <div><b>主诉:</b>体检发现右肺结节 1 周</div>
      <div><b>现病史:</b>患者 1 周前体检发现右肺上叶结节,无明显咳嗽、咳痰、发热、胸痛等症状</div>
      <div><b>既往史:</b>无肿瘤病史,无手术外伤史,无药物过敏史</div>
      <div><b>体征:</b>双肺呼吸音清,未闻及干湿性啰音</div>
      <div><b>辅助检查:</b>胸部 CT 平扫 + 增强</div>
    </div>
  );

  return (
    <Layout className="v3-root">
      <style>{V3_STYLES}</style>

      {/* === 顶栏 (48px) === */}
      <div className="v3-topbar">
        <div className="v3-topbar-left">
          <Tooltip title="返回">
            <Button type="text" icon={<ChevronLeft className="v4-icon" />} onClick={() => navigate(-1)} />
          </Tooltip>
          <span className="v3-topbar-title">报告书写</span>
          <Tag color="blue" style={{ fontSize: 11 }}>{context.reportId}</Tag>
        </div>

        <div className="v3-stats-pill">
          <span className="v3-stats-pill-text">
            <Hash className="v4-icon" style={{ width: 12, height: 12, verticalAlign: 'middle', color: '#94a3b8' }} /> {context.document.wordCount} 字
          </span>
          <span className="v3-stats-pill-divider" />
          <span className="v3-stats-pill-text">段 {context.document.paragraphCount}</span>
          <span className="v3-stats-pill-divider" />
          <span className="v3-stats-pill-text">
            <Clock className="v4-icon" style={{ width: 12, height: 12, verticalAlign: 'middle', color: '#94a3b8' }} /> {Math.round(context.document.writingDurationSec / 60)} 分
          </span>
          <span className="v3-stats-pill-divider" />
          <span style={{ color: saving ? '#3b82f6' : '#22c55e' }}>
            <span className={`v3-autosave-dot ${saving ? 'v3-autosave-dot--saving' : ''}`} />
            {saving ? '保存中' : `已保存 ${autoSaveTime}`}
          </span>
        </div>

        <div className="v3-topbar-right">
          <Button icon={<Save className="v4-icon" />} onClick={() => message.success('草稿已保存')}>保存</Button>
          <Button
            type="primary"
            icon={<Send className="v4-icon" />}
            onClick={() => setShowSubmit(true)}
            loading={submitting}
            style={{ background: preScore.passed ? '#1677ff' : '#f59e0b' }}
          >
            提交审核
          </Button>
          <Tooltip title={siderMode === 'hidden' ? '打开侧栏' : '关闭侧栏'}>
            <Button
              type="text"
              icon={siderMode !== 'hidden' ? <PanelRightClose className="v4-icon" /> : <PanelRightOpen className="v4-icon" />}
              onClick={() => setSiderMode(siderMode === 'hidden' ? 'expanded' : 'hidden')}
            />
          </Tooltip>
        </div>
      </div>

      {/* === 临床信息条 (48px) === */}
      <div className="v3-clinical-strip">
        <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>
          <Stethoscope className="v4-icon" style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 2 }} />
          {context.modality} - {context.bodyPart}
        </Tag>
        <div className="v3-clinical-divider" />
        <div className="v3-clinical-item">
          <User className="v3-icon" style={{ width: 14, height: 14 }} />
          <span className="v3-clinical-value">张三</span>
        </div>
        <div className="v3-clinical-item v3-clinical-item--hide-mobile">
          <span className="v3-clinical-label">男 / 58 岁</span>
        </div>
        <div className="v3-clinical-divider" />
        <div className="v3-clinical-item">
          <Hash className="v3-icon" style={{ width: 14, height: 14 }} />
          <span className="v3-clinical-label">检查号</span>
          <span className="v3-clinical-code" style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{context.patientId}</span>
        </div>
        <div className="v3-clinical-item v3-clinical-item--hide-mobile">
          <Activity className="v3-icon" style={{ width: 14, height: 14 }} />
          <span className="v3-clinical-label">临床诊断</span>
          <span>右肺占位性病变</span>
        </div>
        <div style={{ flex: 1 }} />
        <Dropdown
          menu={{ items: [{ key: 'clinical', label: clinicalDropdownContent, type: 'group' }] }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" size="small">
            主诉/现病史/既往史 <ChevronDown className="v4-icon" style={{ width: 12, height: 12 }} />
          </Button>
        </Dropdown>
      </div>

      {/* === 主区 (左右分栏) === */}
      <div className="v3-main-grid">
        {/* 左: 富文本编辑器 (主焦点) */}
        <div className="v3-editor-col">
          <div className="v3-col-card" style={{ flex: 1 }}>
            <ReportRichEditor
              reportId={reportId}
              initialHtml={context.document.html}
              initialPlainText={context.document.plainText}
              onChange={(doc) => setContext((c) => ({ ...c, document: doc }))}
            />
          </div>
          <div className="v3-col-card">
            <Card
              size="small"
              className="shadow-sm"
              title={
                <Space size={6}>
                  <ImageIcon className="v4-icon" style={{ color: '#a855f7' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>关键图像与影像锚定</span>
                  <Tag color="purple" style={{ fontSize: 11 }}>{context.anchors.length}</Tag>
                </Space>
              }
            >
              <ImageAnchorComponent reportId={reportId} />
            </Card>
          </div>
        </div>

        {/* 右: 结构化字段 (常驻) */}
        <div className="v3-fields-col">
          <div className="v3-col-card">
            <StructuredFieldForm
              reportId={reportId}
              initialTemplateId="recist"
              initialValues={context.fields}
              onChange={(values) => setContext((c) => ({ ...c, fields: values }))}
            />
          </div>
        </div>
      </div>

      {/* === 右侧 Sider (懒加载) === */}
      {siderMode === 'expanded' && (
        <div className="v3-sider">
          <div className="v3-sider-header">
            <Space size={6}>
              {SIDER_PRIMARY_TABS.find((t) => t.key === activeSiderTab)?.icon}
              <span className="v3-sider-title">{SIDER_PRIMARY_TABS.find((t) => t.key === activeSiderTab)?.label || SIDER_MORE_TABS.find((t) => t.key === activeSiderTab)?.label}</span>
            </Space>
            <Space>
              <Dropdown menu={{ items: moreMenuItems }} trigger={['click']} placement="bottomRight">
                <Button type="text" size="small" icon={<MoreHorizontal className="v4-icon" />} />
              </Dropdown>
              <Button type="text" size="small" icon={<PanelRightClose className="v4-icon" />} onClick={() => setSiderMode('hidden')} />
            </Space>
          </div>
          <div className="v3-sider-body">{renderSiderTab()}</div>
          <Tabs
            activeKey={activeSiderTab}
            onChange={(k) => setActiveSiderTab(k as TabKey)}
            size="small"
            tabBarStyle={{ margin: 0, padding: '4px 8px 0 8px' }}
            items={[
              ...SIDER_PRIMARY_TABS.map((t) => ({ key: t.key, label: <Tooltip title={t.label}><span>{t.icon}</span></Tooltip> })),
              { key: 'more', label: <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}><MoreHorizontal className="v4-icon" /></Dropdown> },
            ]}
          />
        </div>
      )}

      {/* === Sider 折叠态: 56px 图标条 === */}
      {siderMode === 'collapsed' && (
        <div className="v3-sider-collapsed">
          <Tooltip title="展开" placement="left">
            <div className="v3-sider-icon" onClick={() => setSiderMode('expanded')}>
              <PanelRightOpen className="v4-icon" />
            </div>
          </Tooltip>
          <div style={{ width: 24, height: 1, background: 'var(--v3-bd)', margin: '4px 0' }} />
          {[...SIDER_PRIMARY_TABS, ...SIDER_MORE_TABS].map((t) => (
            <Tooltip key={t.key} title={t.label} placement="left">
              <div
                className={`v3-sider-icon ${activeSiderTab === t.key ? 'v3-sider-icon--active' : ''}`}
                onClick={() => { setActiveSiderTab(t.key); setSiderMode('expanded'); }}
              >
                {t.icon}
              </div>
            </Tooltip>
          ))}
        </div>
      )}

      {/* === 提交确认 Modal === */}
      <Modal
        title={
          <Space>
            <Send className="v4-icon" />
            <span>提交审核确认</span>
          </Space>
        }
        open={showSubmit}
        onCancel={() => setShowSubmit(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Alert
          type={preScore.passed ? 'success' : 'warning'}
          showIcon
          className="mb-3"
          message={preScore.passed ? '所有检查项已通过,可以提交' : `部分检查项未通过 (${PASSED_COUNT}/${preScore.checklist.length})`}
        />
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold mb-1">检查清单 ({PASSED_COUNT}/{preScore.checklist.length})</div>
            <div className="space-y-1">
              {preScore.checklist.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  {c.passed ? <CheckCircle2 className="v4-icon" style={{ color: '#10b981' }} /> : <AlertCircle className="v4-icon" style={{ color: '#f59e0b' }} />}
                  <span className={c.passed ? 'text-slate-500' : 'text-slate-800'}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Divider className="my-2" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded text-center">
              <div className="text-slate-500">预评分</div>
              <div className="text-lg font-semibold" style={{ color: preScore.passed ? '#10b981' : '#f59e0b' }}>{preScore.score} / 100</div>
            </div>
            <div className="p-3 bg-slate-50 rounded text-center">
              <div className="text-slate-500">字数 / 时长</div>
              <div className="text-lg font-semibold">{context.document.wordCount} 字 / {Math.round(context.document.writingDurationSec / 60)} 分</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setShowSubmit(false)}>取消</Button>
            <Button type="primary" icon={<Send className="v4-icon" style={{ width: 12, height: 12 }} />} onClick={handleSubmit} loading={submitting}>确认提交</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
