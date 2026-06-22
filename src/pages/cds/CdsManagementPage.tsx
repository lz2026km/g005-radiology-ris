import { useState, useMemo, useEffect } from "react";
import {
  FileCheck,
  AlertTriangle,
  Activity,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  Shield,
  Pill,
  FlaskConical,
  Route,
  BrainCircuit,
  X,
  Save,
} from "lucide-react";
import type { CdsRuleSummary, CdsAuditEntry } from "../../services/cds";

type RuleTab = "appropriateness" | "pathway" | "contrast" | "drug";

const TAB_CONFIG: { key: RuleTab; label: string; icon: typeof Shield }[] = [
  { key: "appropriateness", label: "适宜性规则", icon: BrainCircuit },
  { key: "pathway", label: "临床路径", icon: Route },
  { key: "contrast", label: "造影剂协议", icon: FlaskConical },
  { key: "drug", label: "药物交互", icon: Pill },
];

const MOCK_RULES: CdsRuleSummary[] = [
  {
    type: "appropriateness",
    id: "ar-001",
    name: "头痛CT/MRI适宜性",
    isActive: true,
    version: "1.0",
    updatedTime: "2025-06-01T00:00:00Z",
    usageCount: 128,
  },
  {
    type: "appropriateness",
    id: "ar-002",
    name: "胸痛检查适宜性",
    isActive: true,
    version: "2.0",
    updatedTime: "2025-05-15T00:00:00Z",
    usageCount: 95,
  },
  {
    type: "appropriateness",
    id: "ar-003",
    name: "腰痛DR适宜性",
    isActive: true,
    version: "1.1",
    updatedTime: "2025-04-10T00:00:00Z",
    usageCount: 203,
  },
  {
    type: "pathway",
    id: "pw-001",
    name: "肺结节评估路径",
    isActive: true,
    version: "1.0",
    updatedTime: "2025-06-01T00:00:00Z",
    usageCount: 47,
  },
  {
    type: "pathway",
    id: "pw-002",
    name: "缺血性脑卒中路径",
    isActive: true,
    version: "1.0",
    updatedTime: "2025-05-15T00:00:00Z",
    usageCount: 32,
  },
  {
    type: "contrast",
    id: "cp-001",
    name: "碘海醇注射协议",
    isActive: true,
    version: "2.1",
    updatedTime: "2025-04-20T00:00:00Z",
    usageCount: 512,
  },
  {
    type: "contrast",
    id: "cp-002",
    name: "碘克沙醇注射协议",
    isActive: true,
    version: "1.3",
    updatedTime: "2025-03-10T00:00:00Z",
    usageCount: 178,
  },
  {
    type: "drug",
    id: "di-001",
    name: "二甲双胍-造影剂交互",
    isActive: true,
    version: "1.0",
    updatedTime: "2025-02-01T00:00:00Z",
    usageCount: 67,
  },
];

const MOCK_AUDIT: CdsAuditEntry[] = [
  {
    id: "ca-001",
    ruleId: "ar-001",
    ruleType: "appropriateness",
    action: "updated",
    performedBy: "dr-admin",
    performedAt: "2025-06-01T10:00:00Z",
    details: "更新头痛规则为v1.0",
  },
  {
    id: "ca-002",
    ruleId: "pw-001",
    ruleType: "pathway",
    action: "activated",
    performedBy: "dr-admin",
    performedAt: "2025-05-20T08:30:00Z",
    details: "激活肺结节路径",
  },
];

const TYPE_COLORS: Record<CdsRuleSummary["type"], string> = {
  appropriateness: "#3b82f6",
  pathway: "#22c55e",
  contrast: "#f59e0b",
  drug: "#ef4444",
};

const TYPE_LABELS: Record<CdsRuleSummary["type"], string> = {
  appropriateness: "适宜性",
  pathway: "路径",
  contrast: "造影剂",
  drug: "药物",
};

export default function CdsManagementPage() {
  const [rules, setRules] = useState<CdsRuleSummary[]>(MOCK_RULES);
  const [activeTab, setActiveTab] = useState<RuleTab>("appropriateness");
  const [searchText, setSearchText] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({
    name: "",
    description: "",
    version: "1.0",
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(
      () => setToast((t0) => ({ ...t0, show: false })),
      2000,
    );
    return () => clearTimeout(t);
  }, [toast.show]);

  const handleCreateRule = () => {
    if (!newRuleForm.name.trim()) {
      setToast({ show: true, message: "规则名称不能为空", type: "error" });
      return;
    }
    const newRule: CdsRuleSummary = {
      type: activeTab,
      id: `cds-${Date.now()}`,
      name: newRuleForm.name.trim(),
      isActive: true,
      version: newRuleForm.version || "1.0",
      updatedTime: new Date().toISOString(),
      usageCount: 0,
    };
    setRules((prev) => [newRule, ...prev]);
    setShowNewRuleModal(false);
    setNewRuleForm({ name: "", description: "", version: "1.0" });
    setToast({
      show: true,
      message: `规则「${newRule.name}」已创建`,
      type: "success",
    });
  };

  const filteredRules = useMemo(() => {
    let items = rules.filter((r) => r.type === activeTab);
    if (!showInactive) items = items.filter((r) => r.isActive);
    if (searchText) {
      const q = searchText.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeTab, searchText, showInactive]);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#f0f6fc",
        fontSize: 14,
        fontFamily: '"Segoe UI",sans-serif',
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#1e40af,#1e3a8a)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Sliders size={24} />
          <span style={{ fontSize: 20, fontWeight: 600 }}>CDS 规则管理</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAudit(!showAudit)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.3)",
              background: showAudit
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <Eye size={14} />
            审计日志
          </button>
          <button
            onClick={() => setShowNewRuleModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <Plus size={14} />
            新建规则
          </button>
        </div>
      </div>

      {showAudit && (
        <div
          style={{
            margin: "16px 24px 0",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
              color: "#f0f6fc",
            }}
          >
            审计日志
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_AUDIT.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  background: "#0d1117",
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    background: `${TYPE_COLORS[entry.ruleType]}20`,
                    color: TYPE_COLORS[entry.ruleType],
                  }}
                >
                  {TYPE_LABELS[entry.ruleType]}
                </span>
                <span style={{ fontSize: 13, flex: 1 }}>{entry.details}</span>
                <span style={{ fontSize: 12, color: "#6e7681" }}>
                  {entry.performedBy}
                </span>
                <span style={{ fontSize: 12, color: "#6e7681" }}>
                  {new Date(entry.performedAt).toLocaleString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: activeTab === tab.key ? "#1e40af" : "#21262d",
                  color: activeTab === tab.key ? "#fff" : "#8b949e",
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 10,
                  color: "#6e7681",
                }}
              />
              <input
                type="text"
                placeholder="搜索规则名称/ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  padding: "8px 12px 8px 34px",
                  borderRadius: 6,
                  border: "1px solid #30363d",
                  background: "#161b22",
                  color: "#f0f6fc",
                  fontSize: 13,
                  width: 240,
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={() => setShowInactive(!showInactive)}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: showInactive ? "#f59e0b20" : "#21262d",
                color: showInactive ? "#f59e0b" : "#8b949e",
              }}
            >
              {showInactive ? (
                <ToggleRight size={14} />
              ) : (
                <ToggleLeft size={14} />
              )}
              显示已停用
            </button>
          </div>
          <span style={{ fontSize: 13, color: "#6e7681" }}>
            共 {filteredRules.length} 条
          </span>
        </div>

        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 100px 80px 100px 100px",
              gap: 8,
              padding: "12px 16px",
              borderBottom: "1px solid #21262d",
              background: "#0d1117",
              color: "#8b949e",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span></span>
            <span>规则名称</span>
            <span>版本</span>
            <span>状态</span>
            <span>使用次数</span>
            <span>更新日期</span>
          </div>
          {filteredRules.map((rule, idx) => (
            <div key={rule.id}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr 100px 80px 100px 100px",
                  gap: 8,
                  padding: "12px 16px",
                  borderBottom: "1px solid #21262d",
                  alignItems: "center",
                  background: idx % 2 === 0 ? "#0d1117" : "#161b22",
                  cursor: "pointer",
                }}
                onClick={() => toggleExpand(rule.id)}
              >
                <span style={{ color: "#6e7681" }}>
                  {expandedId === rule.id ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: TYPE_COLORS[rule.type],
                      display: "inline-block",
                    }}
                  ></span>
                  <span style={{ fontSize: 13 }}>{rule.name}</span>
                  <span style={{ fontSize: 11, color: "#6e7681" }}>
                    ({rule.id})
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#8b949e" }}>
                  v{rule.version}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {rule.isActive ? (
                    <>
                      <ToggleRight size={12} style={{ color: "#22c55e" }} />
                      <span style={{ color: "#22c55e" }}>启用</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={12} style={{ color: "#ef4444" }} />
                      <span style={{ color: "#ef4444" }}>停用</span>
                    </>
                  )}
                </span>
                <span style={{ fontSize: 12, color: "#8b949e" }}>
                  {rule.usageCount}
                </span>
                <span style={{ fontSize: 12, color: "#6e7681" }}>
                  {new Date(rule.updatedTime).toLocaleDateString("zh-CN")}
                </span>
              </div>
              {expandedId === rule.id && (
                <div
                  style={{
                    padding: "12px 16px 12px 48px",
                    background: "#0d1117",
                    borderBottom: "1px solid #21262d",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      border: "1px solid #30363d",
                      background: "transparent",
                      color: "#8b949e",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Edit3 size={12} />
                    编辑
                  </button>
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 4,
                      border: "1px solid #30363d",
                      background: "transparent",
                      color: rule.isActive ? "#ef4444" : "#22c55e",
                      cursor: "pointer",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {rule.isActive ? (
                      <ToggleLeft size={12} />
                    ) : (
                      <ToggleRight size={12} />
                    )}
                    {rule.isActive ? "停用" : "启用"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNewRuleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNewRuleModal(false)}
        >
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 24,
              width: 480,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0f6fc",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Shield size={18} style={{ color: "#3b82f6" }} /> 新建{" "}
                {TAB_CONFIG.find((t) => t.key === activeTab)?.label}
              </div>
              <button
                onClick={() => setShowNewRuleModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#6e7681",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#8b949e",
                    marginBottom: 4,
                  }}
                >
                  规则名称 *
                </label>
                <input
                  value={newRuleForm.name}
                  onChange={(e) =>
                    setNewRuleForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="输入规则名称"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    background: "#0d1117",
                    color: "#f0f6fc",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#8b949e",
                    marginBottom: 4,
                  }}
                >
                  版本号
                </label>
                <input
                  value={newRuleForm.version}
                  onChange={(e) =>
                    setNewRuleForm((f) => ({ ...f, version: e.target.value }))
                  }
                  placeholder="1.0"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    background: "#0d1117",
                    color: "#f0f6fc",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#8b949e",
                    marginBottom: 4,
                  }}
                >
                  描述
                </label>
                <textarea
                  value={newRuleForm.description}
                  onChange={(e) =>
                    setNewRuleForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="规则描述(可选)"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    background: "#0d1117",
                    color: "#f0f6fc",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowNewRuleModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #30363d",
                  background: "transparent",
                  color: "#8b949e",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreateRule}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#1e40af",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Save size={14} /> 创建规则
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success" ? "#059669" : "#dc2626",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1100,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
