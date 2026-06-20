import React, { useState } from "react";
import { Button, Tag, Tooltip, message } from "antd";
import {
  ChevronLeft,
  FileText,
  Save,
  Send,
  Sparkles,
  Mic,
  Maximize2,
  Minimize2,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";
import type { useV4PanelLayout } from "../../hooks/useV4PanelLayout";

interface Props {
  reportState: V4ReportState & V4ReportActions;
  layout: ReturnType<typeof useV4PanelLayout>;
  onClose?: () => void;
}

const V4TopBar: React.FC<Props> = ({ reportState, layout, onClose }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { report, autoSaveStatus, isDirty, saveDraft } = reportState;

  const handleSave = () => {
    setSaving(true);
    saveDraft();
    setTimeout(() => {
      setSaving(false);
      message.success("草稿已保存");
    }, 500);
  };

  const handleBack = () => {
    if (isDirty) {
      message.warning("有未保存的更改");
      return;
    }
    if (onClose) onClose();
    else navigate(-1);
  };

  return (
    <div
      className={`v4-topbar ${layout.topBarCollapsed ? "v4-topbar--collapsed" : ""}`}
    >
      <div className="v4-topbar-left">
        <Tooltip title="返回">
          <Button
            type="text"
            icon={<ChevronLeft className="v4-icon" />}
            onClick={handleBack}
          />
        </Tooltip>
        <div className="v4-topbar-divider" />
        <FileText className="v4-icon v4-icon--primary" />
        <span className="v4-topbar-title">报告书写 V4</span>
        <Tag color="blue" className="v4-topbar-tag">
          {report.id}
        </Tag>
        <Tag color="purple" className="v4-topbar-tag">
          {report.modality} - {report.bodyPart}
        </Tag>
        <Tag
          color={report.structured.score >= 80 ? "green" : "orange"}
          className="v4-topbar-tag"
        >
          {report.structured.score >= 80 ? "可提交" : "需完善"}
        </Tag>
        {report.status === "submitted" && <Tag color="green">已提交</Tag>}
        <Tag color="cyan" className="v4-topbar-tag">
          {report.templateId}
        </Tag>
      </div>

      <div className="v4-topbar-center">
        <Tooltip
          title={autoSaveStatus === "saving" ? "正在自动保存..." : "草稿已保存"}
        >
          <span className={`v4-autosave v4-autosave--${autoSaveStatus}`}>
            <span className="v4-autosave-dot" />
            {autoSaveStatus === "saving"
              ? "保存中..."
              : autoSaveStatus === "saved"
                ? "已保存"
                : "未保存"}
          </span>
        </Tooltip>
      </div>

      <div className="v4-topbar-right">
        <Tooltip title="保存草稿 (F2)">
          <Button
            icon={<Save className="v4-icon" />}
            onClick={handleSave}
            loading={saving}
          >
            保存
          </Button>
        </Tooltip>
        <Tooltip title="AI 草稿 (F4)">
          <Button
            icon={<Sparkles className="v4-icon" />}
            type={
              layout.rightDrawerOpen && layout.activeDrawer === "ai"
                ? "primary"
                : "default"
            }
            onClick={() => layout.toggleDrawer("ai")}
          />
        </Tooltip>
        <Tooltip title="语音听写 (F5)">
          <Button
            icon={<Mic className="v4-icon" />}
            type={
              layout.rightDrawerOpen && layout.activeDrawer === "voice"
                ? "primary"
                : "default"
            }
            onClick={() => layout.toggleDrawer("voice")}
          />
        </Tooltip>
        <Tooltip title="合规检查">
          <Button
            icon={<ListChecks className="v4-icon" />}
            onClick={() => {
              layout.toggleDrawer("compliance");
              message.info("合规检查完成");
            }}
          />
        </Tooltip>
        <div className="v4-topbar-divider" />
        <Tooltip
          title={layout.rightDrawerOpen ? "关闭右侧面板" : "打开右侧面板"}
        >
          <Button
            type="text"
            icon={
              layout.rightDrawerOpen ? (
                <ChevronLeft className="v4-icon" />
              ) : (
                <ChevronLeft className="v4-icon" />
              )
            }
            onClick={() => layout.toggleDrawer(layout.activeDrawer)}
          />
        </Tooltip>
        <Tooltip
          title={reportState.fullscreen ? "退出全屏 (F11)" : "全屏模式 (F11)"}
        >
          <Button
            type="text"
            icon={
              reportState.fullscreen ? (
                <Minimize2 className="v4-icon" />
              ) : (
                <Maximize2 className="v4-icon" />
              )
            }
            onClick={() => reportState.toggleFullscreen()}
          />
        </Tooltip>
        <Tooltip title={layout.topBarCollapsed ? "展开工具栏" : "折叠工具栏"}>
          <Button
            type="text"
            icon={
              <ChevronDown
                className={`v4-icon v4-icon--rotatable ${layout.topBarCollapsed ? "" : "v4-icon--rotated"}`}
              />
            }
            onClick={() => layout.setTopBarCollapsed(!layout.topBarCollapsed)}
          />
        </Tooltip>
        <div className="v4-topbar-divider" />
        <Button
          type="primary"
          icon={<Send className="v4-icon" />}
          onClick={() => reportState.submitReport()}
          loading={reportState.submitting}
          disabled={report.status === "submitted"}
        >
          提交审核
        </Button>
      </div>
    </div>
  );
};

export default V4TopBar;
