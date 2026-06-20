import React, { useState } from "react";
import { Drawer, List, Tag, Space, Input, message } from "antd";
import { FileText, Search, Star, Check } from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

interface Props {
  open: boolean;
  onClose: () => void;
  reportState: V4ReportState & V4ReportActions;
}

const ALL_TEMPLATES = [
  { id: "recist", label: "RECIST 1.1", category: "疗效评估", popular: true },
  { id: "bi-rads", label: "BI-RADS", category: "乳腺", popular: true },
  { id: "pi-rads", label: "PI-RADS", category: "前列腺", popular: true },
  { id: "lung-rads", label: "Lung-RADS", category: "肺部", popular: true },
  { id: "cad-rads", label: "CAD-RADS", category: "冠脉", popular: true },
  { id: "li-rads", label: "LI-RADS", category: "肝脏", popular: true },
  { id: "ti-rads", label: "TI-RADS", category: "甲状腺", popular: true },
  { id: "c-rads", label: "C-RADS", category: "结肠", popular: false },
  { id: "o-rads", label: "O-RADS", category: "卵巢", popular: false },
  { id: "tnm", label: "TNM", category: "肿瘤分期", popular: true },
  { id: "custom", label: "自定义模板", category: "通用", popular: false },
];

const V4TemplatesDrawer: React.FC<Props> = ({ open, onClose, reportState }) => {
  const [search, setSearch] = useState("");
  const filtered = search
    ? ALL_TEMPLATES.filter(
        (t) =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.category.includes(search),
      )
    : ALL_TEMPLATES;

  const handleSelect = (id: string) => {
    reportState.updateStructured({ templateId: id });
    message.success(
      `已切换至 ${ALL_TEMPLATES.find((t) => t.id === id)?.label}`,
    );
    onClose();
  };

  return (
    <Drawer
      title={
        <Space>
          <FileText className="v4-icon v4-icon--sm" />
          选择结构化模板
        </Space>
      }
      open={open}
      onClose={onClose}
      width={320}
    >
      <Input
        prefix={<Search className="v4-icon v4-icon--xs" />}
        placeholder="搜索模板..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="v4-templates-search"
      />
      <List
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item
            className={`v4-template-item ${reportState.report.templateId === item.id ? "v4-template-item--active" : ""}`}
            onClick={() => handleSelect(item.id)}
            actions={[
              reportState.report.templateId === item.id && (
                <Tag color="blue">
                  <Check className="v4-icon v4-icon--xs" />
                </Tag>
              ),
            ].filter(Boolean)}
          >
            <List.Item.Meta
              title={
                <Space>
                  {item.popular && (
                    <Star className="v4-icon v4-icon--xs v4-icon--amber" />
                  )}
                  <span>{item.label}</span>
                </Space>
              }
              description={<Tag>{item.category}</Tag>}
            />
          </List.Item>
        )}
        locale={{ emptyText: "无匹配模板" }}
      />
    </Drawer>
  );
};

export default V4TemplatesDrawer;
