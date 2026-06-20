import React from 'react';
import { Tabs, Space, Button, message } from 'antd';
import { Sparkles, Mic, ListChecks, Eye, History, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIDraftPanel } from '@components/report/v3/R3.WRITING/AIDraftPanel';
import { VoiceDictation } from '@components/report/v3/R3.WRITING/VoiceDictation';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';
import type { useV4PanelLayout } from '../../hooks/useV4PanelLayout';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
  layout: ReturnType<typeof useV4PanelLayout>;
}

const TAB_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  ai: { icon: <Sparkles className="v4-icon v4-icon--sm" />, label: 'AI 草稿' },
  voice: { icon: <Mic className="v4-icon v4-icon--sm" />, label: '语音' },
  compliance: { icon: <ListChecks className="v4-icon v4-icon--sm" />, label: '合规' },
  collab: { icon: <Eye className="v4-icon v4-icon--sm" />, label: '协作' },
  history: { icon: <History className="v4-icon v4-icon--sm" />, label: '草稿' },
};

const V4RightDrawer: React.FC<Props> = ({ reportState, layout }) => {
  const { context, reportId, keywords, preScore, drafts } = reportState;

  const renderContent = () => {
    switch (layout.activeDrawer) {
      case 'ai':
        return (
          <AIDraftPanel
            reportId={reportId}
            clinicalInfo="女性 58 岁,体检发现右肺上叶结节 1 周"
            modality={context.modality}
            bodyPart={context.bodyPart}
            onAccept={() => message.success('已应用 AI 草稿到编辑器')}
          />
        );
      case 'voice':
        return (
          <VoiceDictation
            reportId={reportId}
            onTextChange={(_text: string) => {}}
            onInsert={() => message.success('已插入语音内容')}
          />
        );
      case 'compliance':
        return (
          <div className="v4-right-panel-content">
            <div className="v4-compliance-overall">
              <div className="v4-compliance-score">预评分: {preScore.score}/100</div>
              <div className="v4-compliance-status">
                <span className={`v4-tag v4-tag--${preScore.passed ? 'success' : 'warning'}`}>
                  {preScore.passed ? '可提交' : '需完善'}
                </span>
              </div>
            </div>
            <div className="v4-compliance-detail">
              {preScore.checklist.map((c: any) => (
                <div key={c.id} className="v4-compliance-row">
                  {c.passed
                    ? <CheckCircle2 className="v4-icon v4-icon--sm v4-icon--green" />
                    : <AlertCircle className="v4-icon v4-icon--sm v4-icon--amber" />}
                  <span className={c.passed ? 'v4-compliance-passed' : 'v4-compliance-failed'}>{c.label}</span>
                </div>
              ))}
            </div>
            <div className="v4-compliance-section">
              <h4 className="v4-compliance-section-title">报告统计</h4>
              <div className="v4-compliance-tips">
                字数 {context.document.wordCount} · 时长 {Math.round(context.document.writingDurationSec / 60)} 分钟
              </div>
            </div>
          </div>
        );
      case 'collab':
        return (
          <div className="v4-right-panel-content">
            <h4 className="v4-panel-title">协作人员</h4>
            <div className="v4-collab-list">
              {(context.collaborators || []).map((c: any) => (
                <div key={c.name} className="v4-collab-row">
                  <div className={`v4-collab-dot v4-collab-dot--${c.status || 'offline'}`} />
                  <div className="v4-collab-info">
                    <div className="v4-collab-name">{c.name}</div>
                    <div className="v4-collab-role">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="v4-right-panel-content">
            <h4 className="v4-panel-title">草稿版本</h4>
            <div className="v4-drafts-list">
              {drafts.map((d: any) => (
                <div key={d.id} className="v4-draft-row">
                  <div className="v4-draft-meta">
                    <span className={`v4-tag v4-tag--${d.autoSaved ? 'success' : 'default'}`}>{d.versionLabel}</span>
                    <span className="v4-draft-date">{new Date(d.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="v4-draft-stat">{d.wordCount} 字</div>
                </div>
              ))}
            </div>
            <h4 className="v4-panel-title" style={{ marginTop: 16 }}>关键词高亮</h4>
            <div className="v4-keywords-list">
              {keywords.map((k: any) => (
                <div key={k.term} className="v4-keyword-chip" style={{ background: k.bg || '#f0f5ff', color: k.color || '#1677ff' }}>
                  {k.term}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="v4-right-panel">
      <div className="v4-right-panel-header">
        <Space size={4}>
          {TAB_MAP[layout.activeDrawer]?.icon}
          <span className="v4-right-panel-title">{TAB_MAP[layout.activeDrawer]?.label}</span>
        </Space>
        <Button type="text" size="small" icon={<X className="v4-icon v4-icon--sm" />} onClick={layout.closeDrawer} />
      </div>
      <div className="v4-right-panel-body">{renderContent()}</div>
      <div className="v4-right-panel-footer">
        <Tabs
          activeKey={layout.activeDrawer}
          onChange={(key) => layout.toggleDrawer(key)}
          size="small"
          tabBarStyle={{ margin: 0 }}
          items={['ai', 'voice', 'compliance', 'collab', 'history'].map((key) => ({
            key,
            label: (
              <Space size={4}>
                {TAB_MAP[key]?.icon}
                <span className="v4-tab-label">{TAB_MAP[key]?.label}</span>
              </Space>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default V4RightDrawer;
