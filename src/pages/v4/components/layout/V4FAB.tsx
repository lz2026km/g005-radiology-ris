import React from "react";
import { Button, Tooltip, Badge } from "antd";
import { Save, Send } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4FAB: React.FC<Props> = ({ reportState }) => {
  const { report, submitting, submitReport, saveDraft, isDirty } = reportState;

  return (
    <div className="v4-fab-container">
      {isDirty && (
        <Tooltip title="保存草稿 (F2)" placement="left">
          <Badge dot color="#faad14">
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={<Save className="v4-icon" />}
              onClick={saveDraft}
              className="v4-fab-btn"
            />
          </Badge>
        </Tooltip>
      )}
      {!isDirty && (
        <Tooltip title="保存草稿 (F2)" placement="left">
          <Button
            type="default"
            shape="circle"
            size="large"
            icon={<Save className="v4-icon" />}
            className="v4-fab-btn"
          />
        </Tooltip>
      )}
      <Tooltip
        title={report.status === "submitted" ? "已提交" : "提交审核 (F3)"}
        placement="left"
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<Send className="v4-icon" />}
          onClick={submitReport}
          loading={submitting}
          disabled={report.status === "submitted"}
          className="v4-fab-btn v4-fab-btn--primary"
        />
      </Tooltip>
    </div>
  );
};

export default V4FAB;
