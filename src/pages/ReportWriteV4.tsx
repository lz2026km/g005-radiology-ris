import React from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import V4TopBar from "./v4/components/layout/V4TopBar";
import V4StatusBar from "./v4/components/layout/V4StatusBar";
import V4LeftPanel from "./v4/components/layout/V4LeftPanel";
import V4CenterEditor from "./v4/components/layout/V4CenterEditor";
import V4RightDrawer from "./v4/components/layout/V4RightDrawer";
import V4BottomStrip from "./v4/components/layout/V4BottomStrip";
import V4FAB from "./v4/components/layout/V4FAB";
import { useV4ReportState } from "./v4/hooks/useV4ReportState";
import { useV4PanelLayout } from "./v4/hooks/useV4PanelLayout";
import { useV4KeyboardShortcuts } from "./v4/hooks/useV4KeyboardShortcuts";
import "./v4/styles/v4Global.css";

interface ReportWriteV4Props {
  reportId?: string;
  onClose?: () => void;
}

const ReportWriteV4: React.FC<ReportWriteV4Props> = ({ reportId, onClose }) => {
  const reportState = useV4ReportState(reportId);
  const layout = useV4PanelLayout();
  useV4KeyboardShortcuts(reportState);

  return (
    <div className="v4-root">
      <V4TopBar reportState={reportState} layout={layout} onClose={onClose} />

      {!reportState.fullscreen && (
        <PanelGroup orientation="horizontal" className="v4-main">
          {/* 左侧面板 — 临床 / 结构化 / 历史 / 相似病例 */}
          {!layout.leftCollapsed && (
            <>
              <Panel
                defaultSize={layout.leftWidth}
                minSize={15}
                maxSize={40}
                onResize={(panelSize) =>
                  layout.setLeftWidth(panelSize.asPercentage)
                }
              >
                <V4LeftPanel reportState={reportState} />
              </Panel>
              <PanelResizeHandle className="v4-resize-handle" />
            </>
          )}

          {/* 中间编辑区 — 所见 / 诊断 / 建议三段 */}
          <Panel defaultSize={layout.centerWidth} minSize={40}>
            <V4CenterEditor reportState={reportState} />
          </Panel>

          {/* 右侧抽屉 — AI / 语音 / 合规 / 协作 */}
          {!layout.rightCollapsed && (
            <>
              <PanelResizeHandle className="v4-resize-handle" />
              <Panel
                defaultSize={layout.rightWidth}
                minSize={20}
                maxSize={45}
                onResize={(panelSize) =>
                  layout.setRightWidth(panelSize.asPercentage)
                }
              >
                <V4RightDrawer reportState={reportState} layout={layout} />
              </Panel>
            </>
          )}
        </PanelGroup>
      )}

      {/* 全屏模式 — 仅编辑器 */}
      {reportState.fullscreen && (
        <div className="v4-main">
          <V4CenterEditor reportState={reportState} />
        </div>
      )}

      {/* 底部缩略条 strip */}
      {!reportState.fullscreen && layout.bottomStripVisible && (
        <V4BottomStrip reportState={reportState} />
      )}

      {/* 浮动操作按钮 */}
      <V4FAB reportState={reportState} />

      {/* 底部状态栏 */}
      {!reportState.fullscreen && <V4StatusBar reportState={reportState} />}
    </div>
  );
};

export default ReportWriteV4;
