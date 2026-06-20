import React from "react";
import { Drawer, Tag, Space } from "antd";
import { History } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  open: boolean;
  onClose: () => void;
  reportState: V4ReportState & V4ReportActions;
  inline?: boolean;
}

const V4HistoryCompare: React.FC<Props> = ({
  open,
  onClose,
  reportState,
  inline,
}) => {
  const { priorReports } = reportState;

  const content = (
    <div className="v4-history-compare">
      {priorReports.length > 0 ? (
        priorReports.map((p) => (
          <div key={p.id} className="v4-history-compare-item">
            <div className="v4-history-compare-header">
              <Tag color="cyan">{p.reportId}</Tag>
              <span className="v4-history-compare-date">
                {new Date(p.studyDate).toLocaleDateString()}
              </span>
            </div>
            <div className="v4-history-compare-body">
              <div className="v4-history-compare-section">
                <div className="v4-history-compare-section-title">既往所见</div>
                <div className="v4-history-compare-text">{p.findings}</div>
              </div>
              {p.impression && (
                <div className="v4-history-compare-section">
                  <div className="v4-history-compare-section-title">
                    既往诊断
                  </div>
                  <div className="v4-history-compare-text">{p.impression}</div>
                </div>
              )}
              {p.comparisonDelta && (
                <div className="v4-history-compare-delta">
                  <Tag color="orange">{p.comparisonDelta.summary}</Tag>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="v4-empty-text">无历史报告</div>
      )}
    </div>
  );

  if (inline) {
    return <div className="v4-history-compare-inline">{content}</div>;
  }

  return (
    <Drawer
      title={
        <Space>
          <History className="v4-icon v4-icon--sm" />
          历史报告对比
        </Space>
      }
      open={open}
      onClose={onClose}
      width={480}
    >
      {content}
    </Drawer>
  );
};

export default V4HistoryCompare;
