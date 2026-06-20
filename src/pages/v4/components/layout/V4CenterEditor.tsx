import React, { useRef, useCallback } from 'react';
import { Tabs, Button, Tooltip, Space } from 'antd';
import { Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { ReportRichEditor } from '@components/report/v3/R3.WRITING/ReportRichEditor';
import { ImageAnchorComponent } from '@components/report/v3/R3.WRITING/ImageAnchor';
import V4SmartSnippet from '../editor/V4SmartSnippet';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
}

const SECTION_TABS = [
  { key: 'all', label: '综合视图' },
  { key: 'findings', label: '所见' },
  { key: 'impression', label: '诊断' },
  { key: 'recommendation', label: '建议' },
];

const V4CenterEditor: React.FC<Props> = ({ reportState }) => {
  const { activeSection, setSection, updateDocument, context, reportId } = reportState;
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFormat = useCallback((cmd: string) => {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  }, []);

  const handleSnippetInsert = useCallback((text: string) => {
    updateDocument({ ...context.document, html: context.document.html + text, plainText: context.document.plainText + text });
  }, [updateDocument, context.document]);

  const formatButtons = [
    { cmd: 'bold', icon: <Bold className="v4-icon v4-icon--sm" />, tooltip: '粗体 (Ctrl+B)' },
    { cmd: 'italic', icon: <Italic className="v4-icon v4-icon--sm" />, tooltip: '斜体 (Ctrl+I)' },
    { cmd: 'underline', icon: <Underline className="v4-icon v4-icon--sm" />, tooltip: '下划线 (Ctrl+U)' },
    { cmd: 'insertOrderedList', icon: <ListOrdered className="v4-icon v4-icon--sm" />, tooltip: '有序列表' },
    { cmd: 'insertUnorderedList', icon: <List className="v4-icon v4-icon--sm" />, tooltip: '无序列表' },
  ];

  return (
    <div className="v4-center-editor">
      <div className="v4-editor-toolbar">
        <Tabs
          activeKey={activeSection}
          onChange={(k) => setSection(k as typeof activeSection)}
          items={SECTION_TABS.map((t) => ({
            key: t.key,
            label: <span className="v4-section-tab">{t.label}</span>,
          }))}
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
                  onMouseDown={(e) => { e.preventDefault(); handleFormat(btn.cmd); }}
                />
              </Tooltip>
            ))}
            <div className="v4-editor-divider" />
            <V4SmartSnippet onInsert={handleSnippetInsert} />
          </Space>
        </div>
      </div>

      <div className="v4-editor-scroll">
        <div className="v4-editor-content">
          <ReportRichEditor
            reportId={reportId}
            initialHtml={context.document.html}
            initialPlainText={context.document.plainText}
            onChange={(doc) => updateDocument(doc)}
          />
        </div>

        <div className="v4-editor-anchors">
          <div className="v4-editor-section-label">
            <ImageIcon className="v4-icon v4-icon--sm" />
            <span>关键图像锚定</span>
          </div>
          <ImageAnchorComponent reportId={reportId} />
        </div>
      </div>
    </div>
  );
};

export default V4CenterEditor;
