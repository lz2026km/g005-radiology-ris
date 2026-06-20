import React, { useState } from "react";
import { Collapse, Tag, Badge, Button } from "antd";
import {
  StickyNote,
  FileText,
  History,
  Brain,
  ChevronRight,
  Plus,
} from "lucide-react";
import type {
  V4ReportState,
  V4ReportActions,
} from "../../hooks/useV4ReportState";

import V4TemplatesDrawer from "../drawer/V4TemplatesDrawer";
import V4HistoryCompare from "../compare/V4HistoryCompare";

interface Props {
  reportState: V4ReportState & V4ReportActions;
}

const V4LeftPanel: React.FC<Props> = ({ reportState }) => {
  const { report, priorReports, similarCases } = reportState;
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  const items = [
    {
      key: "clinical",
      label: (
        <div className="v4-collapse-header">
          <StickyNote className="v4-icon v4-icon--sm" />
          <span>临床信息</span>
        </div>
      ),
      children: (
        <div className="v4-clinical-grid">
          <div className="v4-clinical-item">
            <span className="v4-clinical-label">患者</span>
            <span className="v4-clinical-value">{report.patientName}</span>
          </div>
          <div className="v4-clinical-item">
            <span className="v4-clinical-label">性别 / 年龄</span>
            <span>男 / 58 岁</span>
          </div>
          <div className="v4-clinical-item">
            <span className="v4-clinical-label">检查号</span>
            <span className="v4-clinical-code">{report.patientId}</span>
          </div>
          <div className="v4-clinical-item">
            <span className="v4-clinical-label">临床诊断</span>
            <span>右肺占位性病变</span>
          </div>
          <div className="v4-clinical-full">
            <b>主诉:</b> 体检发现右肺结节 1 周
            <br />
            <b>现病史:</b> 患者 1 周前体检发现右肺上叶结节
            <br />
            <b>既往史:</b> 无肿瘤病史
          </div>
        </div>
      ),
    },
    {
      key: "structured",
      label: (
        <div className="v4-collapse-header">
          <FileText className="v4-icon v4-icon--sm v4-icon--blue" />
          <span>结构化字段</span>
          <Tag color="blue" className="v4-collapse-tag">
            RECIST 1.1
          </Tag>
        </div>
      ),
      children: (
        <div className="v4-structured-preview">
          {Object.entries(report.structured.fields)
            .slice(0, 5)
            .map(([k, v]) => (
              <div key={k} className="v4-field-row">
                <span className="v4-field-label">{k}</span>
                <span className="v4-field-value">
                  {String(v.value)}
                  {v.unit ? ` ${v.unit}` : ""}
                </span>
              </div>
            ))}
          <Button
            type="link"
            size="small"
            icon={<Plus className="v4-icon v4-icon--xs" />}
            onClick={() => setTemplateDrawerOpen(true)}
          >
            编辑字段
          </Button>
        </div>
      ),
    },
    {
      key: "history",
      label: (
        <div className="v4-collapse-header">
          <History className="v4-icon v4-icon--sm" />
          <span>历史报告</span>
          <Badge
            count={priorReports.length}
            size="small"
            className="v4-collapse-badge"
          />
        </div>
      ),
      children: (
        <div className="v4-history-list">
          {priorReports.map((p) => (
            <div
              key={p.id}
              className="v4-history-item"
              onClick={() => setHistoryDrawerOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setHistoryDrawerOpen(true);
              }}
            >
              <div className="v4-history-item-header">
                <Tag color="cyan" className="v4-history-tag">
                  {p.reportId}
                </Tag>
                <span className="v4-history-date">
                  {new Date(p.studyDate).toLocaleDateString()}
                </span>
                <ChevronRight className="v4-icon v4-icon--xs v4-icon--right" />
              </div>
              <div className="v4-history-findings">{p.findings}</div>
              {p.comparisonDelta && (
                <Tag color="orange" className="v4-history-delta">
                  {p.comparisonDelta.summary}
                </Tag>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "similar",
      label: (
        <div className="v4-collapse-header">
          <Brain className="v4-icon v4-icon--sm" />
          <span>相似病例</span>
          <Badge
            count={similarCases.length}
            size="small"
            className="v4-collapse-badge"
          />
        </div>
      ),
      children: (
        <div className="v4-similar-list">
          {similarCases.map((c) => (
            <div key={c.id} className="v4-similar-item">
              <div className="v4-similar-header">
                <Tag color="purple">{c.reportId}</Tag>
                <Tag color="blue">{(c.similarityScore * 100).toFixed(0)}%</Tag>
              </div>
              <div className="v4-similar-impression">{c.impression}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="v4-left-panel">
        <Collapse
          defaultActiveKey={["clinical", "structured"]}
          ghost
          expandIconPosition="end"
          items={items.map((item) => ({
            ...item,
            className: "v4-collapse-item",
          }))}
        />
      </div>
      <V4TemplatesDrawer
        open={templateDrawerOpen}
        onClose={() => setTemplateDrawerOpen(false)}
        reportState={reportState}
      />
      <V4HistoryCompare
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        reportState={reportState}
      />
    </>
  );
};

export default V4LeftPanel;
