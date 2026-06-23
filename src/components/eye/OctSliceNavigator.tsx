import React, { useState } from "react";
import { Slider, Card, Tag, Space } from "antd";
import { Image } from "lucide-react";
import { MOCK_OCT_BSCAN_SERIES } from "../../data/eyeOctSlidesMock";

const OctSliceNavigator: React.FC<{ seriesId?: string }> = ({ seriesId }) => {
  const series =
    MOCK_OCT_BSCAN_SERIES.find((s) => s.id === seriesId) ||
    MOCK_OCT_BSCAN_SERIES[0];
  const [slice, setSlice] = useState(Math.floor(series.totalSlices / 2));
  const s = series.slices[slice];
  return (
    <Card
      size="small"
      title={
        <Space>
          <Image size={14} />
          <span>
            B-scan #{slice + 1}/{series.totalSlices}
          </span>
          <Tag>{series.scanPattern}</Tag>
        </Space>
      }
    >
      <div
        style={{
          background: "#0f172a",
          height: 180,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: 12,
        }}
      >
        OCT B-scan #{slice + 1}
      </div>
      <Slider
        min={0}
        max={series.totalSlices - 1}
        value={slice}
        onChange={setSlice}
        style={{ margin: "8px 0 0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        <span>信号强度: {s?.qualityScore || 0}/100</span>
        <span>
          分割:{" "}
          {s?.segmentationValid ? (
            <Tag color="green" style={{ fontSize: 12 }}>
              OK
            </Tag>
          ) : (
            <Tag color="red" style={{ fontSize: 12 }}>
              FAIL
            </Tag>
          )}
        </span>
      </div>
    </Card>
  );
};
export default OctSliceNavigator;
