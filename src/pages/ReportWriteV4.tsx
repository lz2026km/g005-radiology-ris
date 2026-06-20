/**
 * G005 放射RIS系统 v3.0.6.8-18 - 报告书写 V4
 * 三栏可拖拽布局 + 浮动工具栏 + 智能片段 + 快捷键 + V3 全部组件集成
 */
import React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import V4TopBar from './v4/components/layout/V4TopBar';
import V4StatusBar from './v4/components/layout/V4StatusBar';
import V4LeftPanel from './v4/components/layout/V4LeftPanel';
import V4CenterEditor from './v4/components/layout/V4CenterEditor';
import V4RightDrawer from './v4/components/layout/V4RightDrawer';
import V4BottomStrip from './v4/components/layout/V4BottomStrip';
import V4FAB from './v4/components/layout/V4FAB';
import { useV4ReportState } from './v4/hooks/useV4ReportState';
import { useV4PanelLayout } from './v4/hooks/useV4PanelLayout';
import { useV4KeyboardShortcuts } from './v4/hooks/useV4KeyboardShortcuts';
import './v4/styles/v4Global.css';

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
        <Group orientation="horizontal" className="v4-main">
          {!layout.leftCollapsed && (
            <>
              <Panel
                defaultSize={layout.leftWidth}
                minSize={15}
                maxSize={40}
                onResize={(ps) => layout.setLeftWidth(ps.asPercentage)}
              >
                <V4LeftPanel reportState={reportState} setTemplateDrawerOpen={layout.toggleDrawer} />
              </Panel>
              <Separator className="v4-separator" />
            </>
          )}

          <Panel defaultSize={layout.centerWidth} minSize={40}>
            <V4CenterEditor reportState={reportState} />
          </Panel>

          {!layout.rightCollapsed && (
            <>
              <Separator className="v4-separator" />
              <Panel
                defaultSize={layout.rightWidth}
                minSize={20}
                maxSize={45}
                onResize={(ps) => layout.setRightWidth(ps.asPercentage)}
              >
                <V4RightDrawer reportState={reportState} layout={layout} />
              </Panel>
            </>
          )}
          </Group>
      )}

      {reportState.fullscreen && (
        <div className="v4-main v4-main--fullscreen">
          <V4CenterEditor reportState={reportState} />
        </div>
      )}

      {!reportState.fullscreen && layout.bottomStripVisible && (
        <V4BottomStrip reportState={reportState} />
      )}

      <V4FAB reportState={reportState} />

      {!reportState.fullscreen && <V4StatusBar reportState={reportState} />}
    </div>
  );
};

export default ReportWriteV4;
