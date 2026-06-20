import React from "react";
import { Select, Space, Tag } from "antd";
import { FileText } from "lucide-react";
import { MOCK_REPORT_TEMPLATES } from "../../data/eyeReportTemplatesMock";

const ReportTemplateSelector: React.FC<{
  value?: string;
  onChange?: (v: string) => void;
}> = ({ value, onChange }) => (
  <Space>
    <FileText size={16} color="#1677ff" />
    <Select
      value={value || undefined}
      onChange={onChange}
      placeholder="选择报告模板"
      style={{ width: 280 }}
      allowClear
      options={MOCK_REPORT_TEMPLATES.map((t) => ({
        value: t.id,
        label: t.name,
      }))}
    />
    {value && (
      <Tag color="blue">
        {MOCK_REPORT_TEMPLATES.find((t) => t.id === value)?.modality || "-"}
      </Tag>
    )}
  </Space>
);
export default ReportTemplateSelector;
