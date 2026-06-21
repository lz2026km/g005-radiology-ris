import React from "react";
import { Select, Tag, Space } from "antd";
import { MOCK_GRADING_SCALES } from "../../data/eyeGradingScalesMock";

const GradingScalePicker: React.FC<{
  scaleId?: string;
  value?: string;
  onChange?: (v: string) => void;
}> = ({ scaleId, value, onChange }) => {
  const scale = MOCK_GRADING_SCALES.find((s) => s.id === scaleId);
  if (!scale) return <Tag color="default">请先选择模板</Tag>;
  return (
    <Space>
      <span style={{ fontSize: 11 }}>{scale.name}</span>
      <Select
        value={value || undefined}
        onChange={onChange}
        placeholder="选择分级"
        style={{ width: 200 }}
        options={scale.options.map((o) => ({
          value: o.grade,
          label: `${o.label} — ${o.description.substring(0, 30)}`,
        }))}
      />
    </Space>
  );
};
export default GradingScalePicker;
