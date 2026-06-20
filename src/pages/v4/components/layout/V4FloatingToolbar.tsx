import React from "react";
import { Button, Tooltip } from "antd";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  Link,
  Quote,
  Sparkles,
  Mic,
  Languages,
  Copy,
  Paintbrush,
} from "lucide-react";

interface Props {
  position: { x: number; y: number } | null;
  visible: boolean;
  selectedText: string;
  onHide: () => void;
  onFormat: (cmd: string) => void;
  onToggleDrawer: (key: string) => void;
}

const V4FloatingToolbar: React.FC<Props> = ({
  position,
  visible,
  selectedText,
  onHide,
  onFormat,
  onToggleDrawer,
}) => {
  if (!visible || !position) return null;

  return (
    <div
      className="v4-floating-toolbar"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
      role="toolbar"
      aria-label="浮动格式工具栏"
    >
      <div className="v4-floating-toolbar-inner">
        <Tooltip title="粗体">
          <Button
            type="text"
            size="small"
            icon={<Bold className="v4-icon v4-icon--xs" />}
            onMouseDown={() => onFormat("bold")}
          />
        </Tooltip>
        <Tooltip title="斜体">
          <Button
            type="text"
            size="small"
            icon={<Italic className="v4-icon v4-icon--xs" />}
            onMouseDown={() => onFormat("italic")}
          />
        </Tooltip>
        <Tooltip title="下划线">
          <Button
            type="text"
            size="small"
            icon={<Underline className="v4-icon v4-icon--xs" />}
            onMouseDown={() => onFormat("underline")}
          />
        </Tooltip>
        <div className="v4-floating-divider" />
        <Tooltip title="高亮">
          <Button
            type="text"
            size="small"
            icon={<Highlighter className="v4-icon v4-icon--xs" />}
          />
        </Tooltip>
        <Tooltip title="链接">
          <Button
            type="text"
            size="small"
            icon={<Link className="v4-icon v4-icon--xs" />}
          />
        </Tooltip>
        <Tooltip title="引用">
          <Button
            type="text"
            size="small"
            icon={<Quote className="v4-icon v4-icon--xs" />}
          />
        </Tooltip>
        <div className="v4-floating-divider" />
        <Tooltip title="AI 重写">
          <Button
            type="text"
            size="small"
            icon={<Sparkles className="v4-icon v4-icon--xs v4-icon--purple" />}
            onClick={() => {
              onToggleDrawer("ai");
              onHide();
            }}
          />
        </Tooltip>
        <Tooltip title="语音输入">
          <Button
            type="text"
            size="small"
            icon={<Mic className="v4-icon v4-icon--xs" />}
            onClick={() => {
              onToggleDrawer("voice");
              onHide();
            }}
          />
        </Tooltip>
        <Tooltip title="翻译">
          <Button
            type="text"
            size="small"
            icon={<Languages className="v4-icon v4-icon--xs" />}
          />
        </Tooltip>
        <div className="v4-floating-divider" />
        <Tooltip title="复制">
          <Button
            type="text"
            size="small"
            icon={<Copy className="v4-icon v4-icon--xs" />}
            onMouseDown={() => {
              navigator.clipboard.writeText(selectedText);
              onHide();
            }}
          />
        </Tooltip>
        <Tooltip title="格式刷">
          <Button
            type="text"
            size="small"
            icon={<Paintbrush className="v4-icon v4-icon--xs" />}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default V4FloatingToolbar;
