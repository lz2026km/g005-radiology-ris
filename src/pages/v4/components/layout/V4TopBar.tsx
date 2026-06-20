import React, { useState } from 'react';
import { Button, Tag, Tooltip, message, Modal, Alert, Space } from 'antd';
import { ChevronLeft, FileText, Save, Send, Sparkles, Mic, Maximize2, Minimize2, ChevronDown, ListChecks, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';
import type { useV4PanelLayout } from '../../hooks/useV4PanelLayout';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
  layout: ReturnType<typeof useV4PanelLayout>;
  onClose?: () => void;
}

const V4TopBar: React.FC<Props> = ({ reportState, layout, onClose }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { context, preScore, reportId, isDirty, saveDraft, submitting, showSubmit, setShowSubmit, submitReportAction } = reportState;

  const handleSave = async () => {
    setSaving(true);
    await saveDraft();
    setSaving(false);
    message.success('草稿已保存');
  };

  const handleBack = () => {
    if (isDirty) { message.warning('有未保存的更改'); return; }
    if (onClose) onClose();
    else navigate(-1);
  };


  return (
    <>
      <div className="v4-topbar">
        <div className="v4-topbar-left">
          <Tooltip title="返回"><Button type="text" icon={<ChevronLeft className="v4-icon" />} onClick={handleBack} /></Tooltip>
          <div className="v4-topbar-divider" />
          <FileText className="v4-icon v4-icon--primary" />
          <span className="v4-topbar-title">报告书写 V4</span>
          <Tag color="blue" className="v4-topbar-tag">{reportId}</Tag>
          <Tag color="purple" className="v4-topbar-tag">{context.modality} - {context.bodyPart}</Tag>
          <Tag color={preScore.passed ? 'success' : 'orange'} className="v4-topbar-tag">
            {preScore.passed ? '可提交' : '需完善'}
          </Tag>
          <Tag color="cyan" className="v4-topbar-tag">{context.template?.name || 'RECIST 1.1'}</Tag>
        </div>

        <div className="v4-topbar-center">
          {isDirty && <span className="v4-autosave-dot v4-autosave-dot--dirty" />}
        </div>

        <div className="v4-topbar-right">
          <Tooltip title="保存草稿 (F2)">
            <Button icon={<Save className="v4-icon" />} onClick={handleSave} loading={saving}>保存</Button>
          </Tooltip>
          <Tooltip title="AI 草稿 (F4)">
            <Button icon={<Sparkles className="v4-icon" />} type={layout.activeDrawer === 'ai' ? 'primary' : 'default'} onClick={() => layout.toggleDrawer('ai')} />
          </Tooltip>
          <Tooltip title="语音听写 (F5)">
            <Button icon={<Mic className="v4-icon" />} type={layout.activeDrawer === 'voice' ? 'primary' : 'default'} onClick={() => layout.toggleDrawer('voice')} />
          </Tooltip>
          <Tooltip title="合规检查">
            <Button icon={<ListChecks className="v4-icon" />} onClick={() => { layout.toggleDrawer('compliance'); message.info('合规检查完成'); }} />
          </Tooltip>
          <div className="v4-topbar-divider" />
          <Tooltip title={reportState.fullscreen ? '退出全屏 (F11)' : '全屏模式 (F11)'}>
            <Button type="text" icon={reportState.fullscreen ? <Minimize2 className="v4-icon" /> : <Maximize2 className="v4-icon" />} onClick={() => reportState.toggleFullscreen()} />
          </Tooltip>
          <Tooltip title={layout.topBarCollapsed ? '展开工具栏' : '折叠工具栏'}>
            <Button type="text" icon={<ChevronDown className={`v4-icon v4-icon--rotatable ${layout.topBarCollapsed ? '' : 'v4-icon--rotated'}`} />} onClick={() => layout.setTopBarCollapsed(!layout.topBarCollapsed)} />
          </Tooltip>
          <div className="v4-topbar-divider" />
          <Button type="primary" icon={<Send className="v4-icon" />} onClick={() => setShowSubmit(true)} loading={submitting}>
            提交审核
          </Button>
        </div>
      </div>

      <Modal
        title={<Space><Send className="v4-icon" /><span>提交审核确认</span></Space>}
        open={showSubmit}
        onCancel={() => setShowSubmit(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert
          type={preScore.passed ? 'success' : 'warning'}
          showIcon
          className="v4-modal-alert"
          message={preScore.passed ? '所有检查项已通过,可以提交' : '部分检查项未通过,建议补充后再提交'}
        />
        <div className="v4-modal-body">
          <div className="v4-modal-section">
            <div className="v4-modal-section-title">检查清单 ({preScore.checklist.filter((c: any) => c.passed).length}/{preScore.checklist.length})</div>
            <div className="v4-modal-checklist">
              {preScore.checklist.map((c: any) => (
                <div key={c.id} className="v4-modal-check-row">
                  {c.passed ? <CheckCircle2 className="v4-icon v4-icon--sm v4-icon--green" /> : <AlertCircle className="v4-icon v4-icon--sm v4-icon--amber" />}
                  <span className={c.passed ? 'v4-modal-check-passed' : 'v4-modal-check-failed'}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="v4-modal-stats">
            <div className="v4-modal-stat">
              <div className="v4-modal-stat-label">预评分</div>
              <div className="v4-modal-stat-value" style={{ color: preScore.passed ? '#10b981' : '#f59e0b' }}>{preScore.score} / 100</div>
            </div>
            <div className="v4-modal-stat">
              <div className="v4-modal-stat-label">字数 / 时长</div>
              <div className="v4-modal-stat-value">{context.document.wordCount} 字 / {Math.round(context.document.writingDurationSec / 60)} 分</div>
            </div>
          </div>
          <div className="v4-modal-actions">
            <Button onClick={() => setShowSubmit(false)}>取消</Button>
            <Button type="primary" icon={<Send className="v4-icon v4-icon--sm" />} onClick={submitReportAction} loading={submitting}>确认提交</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default V4TopBar;
