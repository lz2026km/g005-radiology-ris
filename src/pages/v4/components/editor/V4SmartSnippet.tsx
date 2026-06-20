import React, { useState } from "react";
import { Popover, Input, Tag, Button, Tabs } from "antd";
import { Lightbulb, Search } from "lucide-react";
import { SNIPPETS_DATA } from "../../data/v4MockData";

interface Props {
  onInsert: (text: string) => void;
}

const V4SmartSnippet: React.FC<Props> = ({ onInsert }) => {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<
    "findings" | "impression" | "recommendation"
  >("findings");

  const snippets = SNIPPETS_DATA[section] || [];
  const filtered = search
    ? snippets.filter((s) => s.includes(search))
    : snippets;

  const handleInsert = (snippet: string) => {
    onInsert(snippet);
  };

  const content = (
    <div className="v4-snippet-popover">
      <Tabs
        activeKey={section}
        onChange={(k) => setSection(k as typeof section)}
        size="small"
        items={[
          { key: "findings", label: "所见" },
          { key: "impression", label: "诊断" },
          { key: "recommendation", label: "建议" },
        ]}
      />
      <Input
        prefix={<Search className="v4-icon v4-icon--xs" />}
        placeholder="搜索片段..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        className="v4-snippet-search"
      />
      <div className="v4-snippet-list">
        {filtered.length > 0 ? (
          filtered.map((snippet, idx) => (
            <div
              key={idx}
              className="v4-snippet-item"
              onClick={() => handleInsert(snippet)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInsert(snippet);
              }}
            >
              <div className="v4-snippet-text">{snippet}</div>
              {snippet.includes("{{") && (
                <Tag className="v4-snippet-has-vars" color="blue">
                  含变量
                </Tag>
              )}
            </div>
          ))
        ) : (
          <div className="v4-empty-text">无匹配片段</div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      overlayClassName="v4-snippet-popover-overlay"
    >
      <Button
        type="text"
        size="small"
        icon={<Lightbulb className="v4-icon v4-icon--sm v4-icon--amber" />}
      >
        智能片段
      </Button>
    </Popover>
  );
};

export default V4SmartSnippet;
