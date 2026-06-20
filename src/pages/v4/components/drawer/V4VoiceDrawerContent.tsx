import React, { useState } from "react";
import { Card, Button, Select, Space, Tag, Divider, message } from "antd";
import { Mic, Square } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const VOICE_LANGS = [
  { value: "zh-CN", label: "中文" },
  { value: "en-US", label: "English" },
];

const VOICE_SECTIONS = [
  { value: "findings", label: "所见" },
  { value: "impression", label: "诊断" },
  { value: "recommendation", label: "建议" },
  { value: "full", label: "全文" },
];

const V4VoiceDrawerContent: React.FC<Props> = ({ reportState }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lang, setLang] = useState("zh-CN");
  const [section, setSection] = useState("findings");
  const [transcript, setTranscript] = useState("");

  const setInterimText = (_t: string) => {}; // placeholder for future use

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setInterimText("");
      if (transcript) {
        message.success("语音已转文字");
      }
    } else {
      setIsRecording(true);
      setTranscript("");
      message.info("语音录制中... (模拟)");
      setTimeout(() => {
        setTranscript(
          "右肺上叶可见磨玻璃结节，大小约 15×12 毫米，边界尚清，无分叶及毛刺征。",
        );
        setIsRecording(false);
        message.success("语音识别完成");
      }, 2000);
    }
  };

  const handleApply = () => {
    if (transcript) {
      reportState.updateContent({ findings: transcript });
      message.success("已应用到编辑器");
    }
  };

  return (
    <div className="v4-voice-drawer">
      <Card size="small" className="v4-voice-config">
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          <div className="v4-voice-config-row">
            <span className="v4-voice-config-label">语言</span>
            <Select
              value={lang}
              onChange={setLang}
              options={VOICE_LANGS}
              size="small"
              style={{ width: 120 }}
            />
          </div>
          <div className="v4-voice-config-row">
            <span className="v4-voice-config-label">段落</span>
            <Select
              value={section}
              onChange={setSection}
              options={VOICE_SECTIONS}
              size="small"
              style={{ width: 140 }}
            />
          </div>
          <Button
            type={isRecording ? "primary" : "default"}
            danger={isRecording}
            block
            icon={
              isRecording ? (
                <Square className="v4-icon v4-icon--sm" />
              ) : (
                <Mic className="v4-icon v4-icon--sm" />
              )
            }
            onClick={toggleRecording}
          >
            {isRecording ? "停止录音" : "开始录音"}
          </Button>
        </Space>
      </Card>

      <Divider className="v4-voice-divider" />

      {isRecording && (
        <div className="v4-voice-recording">
          <div className="v4-voice-wave">
            <span className="v4-voice-wave-bar" />
            <span className="v4-voice-wave-bar" />
            <span className="v4-voice-wave-bar" />
            <span className="v4-voice-wave-bar" />
            <span className="v4-voice-wave-bar" />
          </div>
          <span className="v4-voice-status">正在录音...</span>
        </div>
      )}

      {transcript && (
        <div className="v4-voice-transcript">
          <div className="v4-voice-transcript-header">
            <Tag color="blue">识别结果</Tag>
            <Button size="small" type="primary" onClick={handleApply}>
              应用到编辑器
            </Button>
          </div>
          <div className="v4-voice-transcript-text">{transcript}</div>
        </div>
      )}

      {!isRecording && !transcript && (
        <div className="v4-voice-empty">
          <Mic className="v4-icon v4-icon--lg" />
          <p>点击开始录音进行语音输入</p>
        </div>
      )}
    </div>
  );
};

export default V4VoiceDrawerContent;
