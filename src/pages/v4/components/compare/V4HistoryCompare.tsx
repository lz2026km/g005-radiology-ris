import React from 'react';
import { Drawer, Tag, Space } from 'antd';
import { History } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  priorReports: Array<{
    id: string;
    reportId: string;
    studyDate: string;
    findings: string;
    comparisonDelta?: { summary: string };
  }>;
}

const V4HistoryCompare: React.FC<Props> = ({ open, onClose, priorReports }) => {
  return (
    <Drawer
      title={<Space><History className="v4-icon v4-icon--sm" />历史报告对比</Space>}
      open={open}
      onClose={onClose}
      width={480}
    >
      {priorReports.length > 0 ? (
        priorReports.map((p) => (
          <div key={p.id} className="v4-history-compare-item">
            <div className="v4-history-compare-header">
              <Tag color="cyan">{p.reportId}</Tag>
              <span className="v4-history-compare-date">{new Date(p.studyDate).toLocaleDateString()}</span>
            </div>
            <div className="v4-history-compare-body">
              <div className="v4-history-compare-text">{p.findings}</div>
              {p.comparisonDelta && <Tag color="orange" style={{ marginTop: 8 }}>{p.comparisonDelta.summary}</Tag>}
            </div>
          </div>
        ))
      ) : (
        <div className="v4-empty-text">无历史报告</div>
      )}
    </Drawer>
  );
};

export default V4HistoryCompare;
