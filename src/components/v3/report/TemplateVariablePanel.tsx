import React, { useState, useCallback } from "react";

interface VariableInfo {
  name: string;
  path: string;
  description: string;
  type: string;
}

const VARIABLE_GROUPS: Record<
  string,
  { label: string; variables: VariableInfo[] }
> = {
  patient: {
    label: "患者信息",
    variables: [
      {
        name: "patient.name",
        path: "patient.name",
        description: "患者姓名",
        type: "string",
      },
      {
        name: "patient.age",
        path: "patient.age",
        description: "患者年龄",
        type: "number",
      },
      {
        name: "patient.gender",
        path: "patient.gender",
        description: "患者性别",
        type: "string",
      },
      {
        name: "patient.id",
        path: "patient.id",
        description: "患者ID",
        type: "string",
      },
      {
        name: "patient.weight",
        path: "patient.weight",
        description: "体重(kg)",
        type: "number",
      },
      {
        name: "patient.height",
        path: "patient.height",
        description: "身高(cm)",
        type: "number",
      },
      {
        name: "patient.birthDate",
        path: "patient.birthDate",
        description: "出生日期",
        type: "string",
      },
      {
        name: "patient.phone",
        path: "patient.phone",
        description: "联系电话",
        type: "string",
      },
    ],
  },
  exam: {
    label: "检查信息",
    variables: [
      {
        name: "exam.modality",
        path: "exam.modality",
        description: "检查模态(CT/MR/XR...)",
        type: "string",
      },
      {
        name: "exam.bodyPart",
        path: "exam.bodyPart",
        description: "检查部位编码",
        type: "string",
      },
      {
        name: "exam.date",
        path: "exam.date",
        description: "检查日期",
        type: "string",
      },
      {
        name: "exam.time",
        path: "exam.time",
        description: "检查时间",
        type: "string",
      },
      {
        name: "exam.accession",
        path: "exam.accession",
        description: "检查号",
        type: "string",
      },
      {
        name: "exam.studyId",
        path: "exam.studyId",
        description: "Study UID",
        type: "string",
      },
      {
        name: "exam.device",
        path: "exam.device",
        description: "设备名称",
        type: "string",
      },
      {
        name: "exam.room",
        path: "exam.room",
        description: "检查房间",
        type: "string",
      },
      {
        name: "exam.operator",
        path: "exam.operator",
        description: "技师姓名",
        type: "string",
      },
    ],
  },
  report: {
    label: "报告信息",
    variables: [
      {
        name: "report.id",
        path: "report.id",
        description: "报告编号",
        type: "string",
      },
      {
        name: "report.doctorName",
        path: "report.doctorName",
        description: "报告医师",
        type: "string",
      },
      {
        name: "report.reviewerName",
        path: "report.reviewerName",
        description: "审核医师",
        type: "string",
      },
      {
        name: "report.qualityScore",
        path: "report.qualityScore",
        description: "质量评分",
        type: "number",
      },
      {
        name: "report.createdAt",
        path: "report.createdAt",
        description: "创建时间",
        type: "string",
      },
      {
        name: "report.signedAt",
        path: "report.signedAt",
        description: "签发时间",
        type: "string",
      },
      {
        name: "report.status",
        path: "report.status",
        description: "报告状态",
        type: "string",
      },
      {
        name: "report.department",
        path: "report.department",
        description: "科室名称",
        type: "string",
      },
    ],
  },
  measurements: {
    label: "测量数据",
    variables: [
      {
        name: "measurement.count",
        path: "measurement.count",
        description: "测量总数",
        type: "number",
      },
      {
        name: "measurement.sum",
        path: "measurement.sum",
        description: "测量总和",
        type: "number",
      },
      {
        name: "measurement.avg",
        path: "measurement.avg",
        description: "测量平均值",
        type: "number",
      },
      {
        name: "measurement.max",
        path: "measurement.max",
        description: "测量最大值",
        type: "number",
      },
      {
        name: "measurement.min",
        path: "measurement.min",
        description: "测量最小值",
        type: "number",
      },
      {
        name: "measurement.median",
        path: "measurement.median",
        description: "测量中位数",
        type: "number",
      },
    ],
  },
  computed: {
    label: "计算衍生",
    variables: [
      { name: "bmi", path: "bmi", description: "BMI指数", type: "number" },
      {
        name: "ageInYears",
        path: "ageInYears",
        description: "实足年龄(岁)",
        type: "number",
      },
      {
        name: "bmiCategory",
        path: "bmiCategory",
        description: "BMI分类(偏瘦/正常/超重/肥胖)",
        type: "string",
      },
      {
        name: "isAdult",
        path: "isAdult",
        description: "是否成年(>=18岁)",
        type: "boolean",
      },
      {
        name: "bmiWarning",
        path: "bmiWarning",
        description: "BMI预警信息",
        type: "string",
      },
      {
        name: "modalityLabel",
        path: "modalityLabel",
        description: "模态中文名称",
        type: "string",
      },
    ],
  },
};

interface TemplateVariablePanelProps {
  onInsert?: (variablePath: string) => void;
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const VariableItem: React.FC<{
  info: VariableInfo;
  onCopy: (path: string) => void;
}> = ({ info, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(info.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [info.path, onCopy]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 8px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 13,
        transition: "background 0.15s",
      }}
      onMouseEnter={() => undefined}
      onMouseLeave={() => undefined}
      onClick={handleCopy}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            color: "#1a1a2e",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          {"{{" + info.path + "}}"}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
          {info.description}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
      >
        <span
          style={{
            fontSize: 12,
            padding: "1px 5px",
            borderRadius: 3,
            background: "#e8e8e8",
            color: "#666",
          }}
        >
          {info.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          style={{
            border: "none",
            background: copied ? "#52c41a" : "#f0f0f0",
            color: copied ? "#fff" : "#555",
            cursor: "pointer",
            borderRadius: 3,
            padding: "2px 8px",
            fontSize: 12,
            transition: "all 0.2s",
          }}
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
    </div>
  );
};

const TemplateVariablePanel: React.FC<TemplateVariablePanelProps> = ({
  onInsert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      Object.keys(VARIABLE_GROUPS).forEach((key) => {
        initial[key] = true;
      });
      return initial;
    },
  );
  const [searchText, setSearchText] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastText, setToastText] = useState("");

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = useCallback(
    async (path: string) => {
      const macro = "{{" + path + "}}";
      if (onInsert) {
        onInsert(path);
        return;
      }
      const ok = await copyToClipboard(macro);
      setToastText(ok ? `已复制 ${macro}` : "复制失败");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    },
    [onInsert],
  );

  const filteredGroups = searchText.trim()
    ? Object.entries(VARIABLE_GROUPS).reduce(
        (acc, [key, group]) => {
          const filtered = group.variables.filter(
            (v) =>
              v.name.toLowerCase().includes(searchText.toLowerCase()) ||
              v.description.toLowerCase().includes(searchText.toLowerCase()),
          );
          if (filtered.length) {
            acc[key] = { ...group, variables: filtered };
          }
          return acc;
        },
        {} as Record<string, { label: string; variables: VariableInfo[] }>,
      )
    : VARIABLE_GROUPS;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 12px",
          border: "1px solid #d9d9d9",
          borderRadius: 4,
          background: isOpen ? "#e6f7ff" : "#fff",
          color: isOpen ? "#1890ff" : "#555",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          transition: "all 0.2s",
          userSelect: "none",
        }}
      >
        <span>{isOpen ? "▼" : "▶"}</span>
        <span>模板变量</span>
        <span style={{ fontSize: 12, color: "#999" }}>
          (
          {Object.values(VARIABLE_GROUPS).reduce(
            (s, g) => s + g.variables.length,
            0,
          )}
          )
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            width: 380,
            maxHeight: 480,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            zIndex: 1050,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}
          >
            <input
              type="text"
              placeholder="搜索变量..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            {Object.entries(filteredGroups).map(([key, group]) => (
              <div key={key}>
                <div
                  onClick={() => toggleGroup(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "7px 12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#333",
                    background: "#fafafa",
                    borderBottom: "1px solid #f0f0f0",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {expandedGroups[key] ? "▼" : "▶"}
                  </span>
                  <span>{group.label}</span>
                  <span style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>
                    ({group.variables.length})
                  </span>
                </div>
                {expandedGroups[key] && (
                  <div style={{ padding: "2px 0" }}>
                    {group.variables.map((v) => (
                      <VariableItem key={v.name} info={v} onCopy={handleCopy} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {Object.keys(filteredGroups).length === 0 && (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                未找到匹配的变量
              </div>
            )}
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderTop: "1px solid #f0f0f0",
              fontSize: 12,
              color: "#aaa",
              textAlign: "center",
            }}
          >
            点击变量或「复制」按钮复制到剪贴板
          </div>
        </div>
      )}

      {toastVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.78)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: 6,
            fontSize: 13,
            zIndex: 9999,
            pointerEvents: "none",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toastText}
        </div>
      )}
    </div>
  );
};

export default TemplateVariablePanel;
