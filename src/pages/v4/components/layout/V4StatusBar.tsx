import React from 'react';
import { Tag, Space } from 'antd';
import { BookOpen } from 'lucide-react';
import type { V4ReportCombined, V4ReportActions } from '../../hooks/useV4ReportState';

interface Props {
  reportState: V4ReportCombined & V4ReportActions;
}

const V4StatusBar: React.FC<Props> = ({ reportState }) => {
  const { context } = reportState;
  const { document } = context;

  return (
    <div className="v4-statusbar">
      <Space size="small" className="v4-statusbar-left">
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>字数 {document.wordCount}</Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>字符 {document.charCount}</Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>段落 {document.paragraphCount}</Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>阅读 {Math.max(1, Math.round(document.wordCount / 200))} 分钟</Tag>
      </Space>
      <Space size="small" className="v4-statusbar-right">
        <BookOpen className="v4-icon v4-icon--sm" />
        <span className="v4-statusbar-text">{context.template?.name || 'RECIST 1.1'}</span>
        <span className="v4-statusbar-separator">|</span>
        <span className="v4-statusbar-text">{context.modality} - {context.bodyPart}</span>
      </Space>
    </div>
  );
};

export default V4StatusBar;
