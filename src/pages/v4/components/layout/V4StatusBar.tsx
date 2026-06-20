import React from "react";
import { Tag, Space } from "antd";
import { BookOpen } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4StatusBar: React.FC<Props> = ({ reportState }) => {
  const { report } = reportState;
  const { content } = report;

  return (
    <div className="v4-statusbar">
      <Space size="small" className="v4-statusbar-left">
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>
          字数 {content.wordCount}
        </Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>
          字符 {content.charCount}
        </Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>
          段落 {content.paragraphCount}
        </Tag>
        <Tag className="v4-statusbar-tag" style={{ margin: 0 }}>
          阅读 {Math.max(1, Math.round(content.wordCount / 200))} 分钟
        </Tag>
      </Space>
      <Space size="small" className="v4-statusbar-right">
        <BookOpen className="v4-icon v4-icon--sm" />
        <span className="v4-statusbar-text">{report.templateId}</span>
        <span className="v4-statusbar-separator">|</span>
        <span className="v4-statusbar-text">v{report.version}</span>
      </Space>
    </div>
  );
};

export default V4StatusBar;
