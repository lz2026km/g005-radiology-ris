import React, { useRef, useCallback } from "react";
import { Tabs, Button, Tooltip, Space } from "antd";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";
import type { useV4PanelLayout } from "../../hooks/useV4PanelLayout";
import V4SmartSnippet from "../editor/V4SmartSnippet";

interface Props {
  reportState: V4ReportState & V4ReportActions;
  layout?: ReturnType<typeof useV4PanelLayout>;
}

const SECTION_LABELS: Record<string, string> = {
  findings: "所见",
  impression: "诊断",
  recommendation: "建议",
  all: "综合视图",
};

const V4CenterEditor: React.FC<Props> = ({ reportState }) => {
  const { activeSection, setSection, updateContent, report, format } =
    reportState;
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (key: string) => {
    setSection(key as typeof activeSection);
  };

  const handleFormat = useCallback(
    (cmd: string) => {
      format(cmd);
      editorRef.current?.focus();
    },
    [format],
  );

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      updateContent({ findings: editorRef.current.innerHTML });
    }
  }, [updateContent]);

  const handleSnippetInsert = useCallback(
    (text: string) => {
      if (editorRef.current) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.innerHTML += text;
        }
        handleContentChange();
      }
    },
    [handleContentChange],
  );

  const formatButtons = [
    {
      cmd: "bold",
      icon: <Bold className="v4-icon v4-icon--sm" />,
      tooltip: "粗体 (Ctrl+B)",
    },
    {
      cmd: "italic",
      icon: <Italic className="v4-icon v4-icon--sm" />,
      tooltip: "斜体 (Ctrl+I)",
    },
    {
      cmd: "underline",
      icon: <Underline className="v4-icon v4-icon--sm" />,
      tooltip: "下划线 (Ctrl+U)",
    },
    {
      cmd: "insertOrderedList",
      icon: <ListOrdered className="v4-icon v4-icon--sm" />,
      tooltip: "有序列表",
    },
    {
      cmd: "insertUnorderedList",
      icon: <List className="v4-icon v4-icon--sm" />,
      tooltip: "无序列表",
    },
  ];

  const currentContent = report.content;
  const tabItems = [
    { key: "all", label: SECTION_LABELS["all"] },
    { key: "findings", label: SECTION_LABELS["findings"] },
    { key: "impression", label: SECTION_LABELS["impression"] },
    { key: "recommendation", label: SECTION_LABELS["recommendation"] },
  ];

  return (
    <div className="v4-center-editor">
      <div className="v4-editor-toolbar">
        <Tabs
          activeKey={activeSection}
          onChange={handleSectionChange}
          items={tabItems}
          size="small"
          className="v4-editor-tabs"
        />
        <div className="v4-editor-actions">
          <Space size={4}>
            {formatButtons.map((btn) => (
              <Tooltip key={btn.cmd} title={btn.tooltip}>
                <Button
                  type="text"
                  size="small"
                  icon={btn.icon}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat(btn.cmd);
                  }}
                />
              </Tooltip>
            ))}
            <div className="v4-editor-divider" />
            <V4SmartSnippet onInsert={handleSnippetInsert} />
          </Space>
        </div>
      </div>

      <div className="v4-editor-content">
        <div
          ref={editorRef}
          className="v4-editor-richtext"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: currentContent.findings }}
        />
      </div>
    </div>
  );
};

export default V4CenterEditor;
