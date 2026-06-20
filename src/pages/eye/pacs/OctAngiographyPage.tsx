import React from "react";
import { Card, Row, Col, Tag, Space, Statistic, Progress } from "antd";
import { Eye, Activity, Target, Droplets } from "lucide-react";
import EyeLateralityBadge from "@/components/eye/EyeLateralityBadge";
import AiDiagnosisCard from "@/components/eye/AiDiagnosisCard";
import {
  MOCK_EYE_STUDIES,
  MOCK_EYE_MEASUREMENTS,
  MODALITY_LABELS,
} from "@/data/eyePacsMock";
import { MOCK_AI_DIAGNOSES } from "@/data/eyeAiMock";

const OctAngiographyPage: React.FC = () => {
  const study = MOCK_EYE_STUDIES.find(
    (s) => s.modality === "oct_a" && s.patientId === "p-1003",
  )!;
  const measurements = MOCK_EYE_MEASUREMENTS.filter(
    (m) => m.studyId === study?.id,
  );
  const aiDiag = MOCK_AI_DIAGNOSES.filter((d) => d.studyId === study?.id);
  return (
    <div
      style={{
        padding: 16,
        background: "#f8fafc",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <Row gutter={12}>
        <Col span={16}>
          <Card
            size="small"
            title={
              <Space>
                <Activity size={16} />
                <span>OCT-A 血管成像</span>
                <EyeLateralityBadge eyeSide="OD" />
                <Tag color="cyan">Optovue RTVue XR AngioVue</Tag>
              </Space>
            }
          >
            <Row gutter={8}>
              {[
                "浅层毛细血管丛",
                "深层毛细血管丛",
                "外层视网膜",
                "脉络膜毛细血管",
              ].map((layer, i) => (
                <Col span={6} key={i}>
                  <div
                    style={{
                      background: "#0f172a",
                      height: 200,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: 11,
                      flexDirection: "column",
                    }}
                  >
                    <Droplets size={24} />
                    <span style={{ marginTop: 4 }}>{layer}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 4,
                      color: "#94a3b8",
                    }}
                  >
                    {layer}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
          <Card size="small" title="OCTA 定量分析" style={{ marginTop: 8 }}>
            <Row gutter={16}>
              {measurements.slice(0, 6).map((m) => (
                <Col span={8} key={m.id}>
                  <Statistic
                    title={m.type}
                    value={m.value}
                    suffix={m.unit}
                    valueStyle={{
                      fontSize: 18,
                      color:
                        m.interpretation === "abnormal" ? "#ef4444" : "#0f172a",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Card>
          <Card size="small" title="CNV 分析" style={{ marginTop: 8 }}>
            <div
              style={{
                background: "#0f172a",
                height: 240,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                flexDirection: "column",
              }}
            >
              <Target size={36} />
              <span>CNV 彩色血流叠加图 (面积 1.85mm², 血流面积 1.22mm²)</span>
              <div
                style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11 }}
              >
                <span>
                  <Tag color="red">CNV 区域</Tag> 面积 1.85mm²
                </span>
                <span>
                  <Tag color="green">血流区域</Tag> 面积 1.22mm²
                </span>
                <span>
                  <Tag color="orange">滋养血管</Tag> 可见
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title={`患者 ${study?.patientName}`}>
            <div style={{ fontSize: 12, lineHeight: 2 }}>
              诊断: <Tag color="orange">湿性AMD</Tag>
              <br />
              检查类型: {MODALITY_LABELS[study?.modality || "oct_a"] || "OCT-A"}
              <br />
              日期: {study ? new Date(study.studyDate).toLocaleString() : "-"}
            </div>
          </Card>
          {aiDiag.map((d) => (
            <AiDiagnosisCard key={d.id} diagnosis={d} />
          ))}
        </Col>
      </Row>
    </div>
  );
};
export default OctAngiographyPage;
