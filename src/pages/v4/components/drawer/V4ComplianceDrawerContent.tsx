import React from "react";
import { Progress, Divider, Alert } from "antd";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useV4Compliance } from "../../hooks/useV4Compliance";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4ComplianceDrawerContent: React.FC<Props> = ({ reportState }) => {
  const { report } = reportState;
  const { score } = useV4Compliance(report.structured.checklist);

  const categories = [
    { label: "完整度", value: score.completeness, color: "#1677ff" },
    { label: "术语一致性", value: score.termConsistency, color: "#52c41a" },
    { label: "危急值标注", value: score.criticalValues, color: "#ff4d4f" },
    { label: "模板匹配", value: score.templateMatch, color: "#722ed1" },
  ];

  return (
    <div className="v4-compliance-drawer">
      <div className="v4-compliance-overall">
        <div className="v4-compliance-score-circle">
          <Progress
            type="circle"
            percent={score.overall}
            size={100}
            strokeColor={
              score.overall >= 80
                ? "#10b981"
                : score.overall >= 60
                  ? "#f59e0b"
                  : "#ff4d4f"
            }
            format={(p) => (
              <span className="v4-compliance-score-text">{p}</span>
            )}
          />
          <div className="v4-compliance-score-label">合规度</div>
        </div>
        {score.overall >= 80 && (
          <Alert
            type="success"
            message="合规检查通过"
            showIcon
            className="v4-compliance-alert"
          />
        )}
        {score.overall < 80 && score.overall >= 60 && (
          <Alert
            type="warning"
            message="部分项目需关注"
            showIcon
            className="v4-compliance-alert"
          />
        )}
        {score.overall < 60 && (
          <Alert
            type="error"
            message="合规检查未通过"
            showIcon
            className="v4-compliance-alert"
          />
        )}
      </div>

      <Divider className="v4-compliance-divider" />

      <div className="v4-compliance-categories">
        {categories.map((cat) => (
          <div key={cat.label} className="v4-compliance-category">
            <div className="v4-compliance-category-header">
              <span>{cat.label}</span>
              <span style={{ color: cat.color }}>{cat.value}%</span>
            </div>
            <Progress
              percent={cat.value}
              strokeColor={cat.color}
              size="small"
              showInfo={false}
            />
          </div>
        ))}
      </div>

      <Divider className="v4-compliance-divider" />

      <div className="v4-compliance-checklist">
        <div className="v4-compliance-checklist-title">检查清单</div>
        <div className="v4-compliance-checklist-items">
          {report.structured.checklist.map((item) => (
            <div key={item.id} className="v4-compliance-checklist-item">
              {item.passed ? (
                <CheckCircle2 className="v4-icon v4-icon--sm v4-icon--green" />
              ) : (
                <AlertCircle className="v4-icon v4-icon--sm v4-icon--amber" />
              )}
              <span
                className={
                  item.passed
                    ? "v4-compliance-check-passed"
                    : "v4-compliance-check-failed"
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default V4ComplianceDrawerContent;
