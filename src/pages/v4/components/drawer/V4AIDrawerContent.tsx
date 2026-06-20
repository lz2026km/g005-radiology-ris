import React, { useState } from "react";
import { Card, Button, Select, Space, Tag, Divider, message } from "antd";
import { Sparkles, Check, X, RefreshCw } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const AI_STYLES = [
  { value: "concise", label: "简洁" },
  { value: "detailed", label: "详细" },
  { value: "structured", label: "结构化" },
];

const AI_SECTIONS = [
  { value: "findings", label: "所见" },
  { value: "impression", label: "诊断" },
  { value: "recommendation", label: "建议" },
  { value: "full", label: "全文" },
];

const MOCK_RESPONSES: Record<string, string | undefined> = {
  findings:
    "双肺纹理清晰，肺野透光度正常。右肺上叶可见磨玻璃结节，大小约 15×12mm，边界尚清。纵隔未见肿大淋巴结。心脏大小形态正常。胸膜无增厚。",
  impression: "右肺上叶磨玻璃结节，Lung-RADS 3 类，建议短期随访。",
  recommendation:
    "建议 3 个月后复查胸部 HRCT，观察结节变化。如增大或密度增高，建议 PET-CT 进一步评估。",
  full: "所见：双肺纹理清晰。右肺上叶磨玻璃结节 15×12mm。\n\n诊断：右肺上叶磨玻璃结节，Lung-RADS 3 类。\n\n建议：3 个月后复查 HRCT。",
};

const V4AIDrawerContent: React.FC<Props> = ({ reportState }) => {
  const [section, setSection] = useState("findings");
  const [style, setStyle] = useState("concise");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [streamText, setStreamText] = useState("");
  const [accepted, setAccepted] = useState(false);

  const generate = async () => {
    setGenerating(true);
    setAccepted(false);
    setOutput("");
    setStreamText("");

    const response = MOCK_RESPONSES["full"] || "";
    const words = response.split("");

    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 15));
      setStreamText((prev) => prev + words[i]);
    }

    setOutput(response || "");
    setGenerating(false);
  };

  const handleAccept = () => {
    reportState.updateContent({ findings: output });
    setAccepted(true);
    message.success("AI 内容已应用到编辑器");
  };

  const handleReject = () => {
    setOutput("");
    setStreamText("");
    message.info("已拒绝 AI 建议");
  };

  return (
    <div className="v4-ai-drawer">
      <Card size="small" className="v4-ai-config">
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          <div className="v4-ai-config-row">
            <span className="v4-ai-config-label">生成段落</span>
            <Select
              value={section}
              onChange={setSection}
              options={AI_SECTIONS}
              size="small"
              style={{ width: 140 }}
            />
          </div>
          <div className="v4-ai-config-row">
            <span className="v4-ai-config-label">风格</span>
            <Select
              value={style}
              onChange={setStyle}
              options={AI_STYLES}
              size="small"
              style={{ width: 140 }}
            />
          </div>
          <Button
            type="primary"
            block
            icon={
              generating ? (
                <RefreshCw className="v4-icon v4-icon--sm" />
              ) : (
                <Sparkles className="v4-icon v4-icon--sm" />
              )
            }
            onClick={generate}
            loading={generating}
          >
            {generating ? "生成中..." : "生成 AI 草稿"}
          </Button>
        </Space>
      </Card>

      <Divider className="v4-ai-divider" />

      {(streamText || output) && (
        <div className="v4-ai-output">
          <div className="v4-ai-output-header">
            <Tag color="purple">AI 建议</Tag>
            {!accepted && output && (
              <Space size={4}>
                <Button
                  size="small"
                  type="primary"
                  icon={<Check className="v4-icon v4-icon--xs" />}
                  onClick={handleAccept}
                >
                  接受
                </Button>
                <Button
                  size="small"
                  icon={<X className="v4-icon v4-icon--xs" />}
                  onClick={handleReject}
                >
                  拒绝
                </Button>
              </Space>
            )}
            {accepted && <Tag color="success">已应用</Tag>}
          </div>
          <div className="v4-ai-stream">{streamText || output}</div>
        </div>
      )}

      {!streamText && !output && !generating && (
        <div className="v4-ai-empty">
          <Sparkles className="v4-icon v4-icon--lg" />
          <p>点击上方按钮生成 AI 草稿建议</p>
        </div>
      )}
    </div>
  );
};

export default V4AIDrawerContent;
