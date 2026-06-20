import React from "react";
import { Tabs, Space, Button } from "antd";
import { Sparkles, Mic, ListChecks, Eye, History, X } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";
import type { useV4PanelLayout } from "../../hooks/useV4PanelLayout";
import V4AIDrawerContent from "../drawer/V4AIDrawerContent";
import V4VoiceDrawerContent from "../drawer/V4VoiceDrawerContent";
import V4ComplianceDrawerContent from "../drawer/V4ComplianceDrawerContent";
import V4CollaborationDrawerContent from "../drawer/V4CollaborationDrawerContent";

interface Props {
  reportState: V4ReportState & V4ReportActions;
  layout: ReturnType<typeof useV4PanelLayout>;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  ai: <Sparkles className="v4-icon v4-icon--sm" />,
  voice: <Mic className="v4-icon v4-icon--sm" />,
  compliance: <ListChecks className="v4-icon v4-icon--sm" />,
  collab: <Eye className="v4-icon v4-icon--sm" />,
  history: <History className="v4-icon v4-icon--sm" />,
};

const TAB_LABELS: Record<string, string> = {
  ai: "AI 草稿",
  voice: "语音",
  compliance: "合规",
  collab: "协作",
  history: "历史",
};

const TAB_RENDER: Record<
  string,
  React.FC<{ reportState: V4ReportState & V4ReportActions }>
> = {
  ai: V4AIDrawerContent,
  voice: V4VoiceDrawerContent,
  compliance: V4ComplianceDrawerContent,
  collab: V4CollaborationDrawerContent,
  history: () => null,
};

const V4RightDrawer: React.FC<Props> = ({ reportState, layout }) => {
  const ActiveContent = TAB_RENDER[layout.activeDrawer] || null;

  return (
    <div className="v4-right-panel">
      <div className="v4-right-panel-header">
        <Space size={4}>
          {TAB_ICONS[layout.activeDrawer]}
          <span className="v4-right-panel-title">
            {TAB_LABELS[layout.activeDrawer]}
          </span>
        </Space>
        <Button
          type="text"
          size="small"
          icon={<X className="v4-icon v4-icon--sm" />}
          onClick={layout.closeDrawer}
        />
      </div>

      <div className="v4-right-panel-body">
        {ActiveContent && <ActiveContent reportState={reportState} />}
      </div>

      <div className="v4-right-panel-footer">
        <Tabs
          activeKey={layout.activeDrawer}
          onChange={(key) => layout.toggleDrawer(key)}
          size="small"
          tabBarStyle={{ margin: 0 }}
          items={Object.keys(TAB_LABELS).map((key) => ({
            key,
            label: (
              <Space size={4}>
                {TAB_ICONS[key]}
                <span className="v4-right-panel-tab-label">
                  {TAB_LABELS[key]}
                </span>
              </Space>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default V4RightDrawer;
