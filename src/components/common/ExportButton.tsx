/**
 * G005 RIS v3.0.6.8-26 - ExportButton 组件
 *
 * 统一导出按钮（CSV / JSON / PDF），可配置导出格式
 */
import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileCode } from "lucide-react";

export type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

export interface ExportButtonProps {
  data: any[] | (() => any[]);
  filename?: string;
  formats?: ExportFormat[];
  label?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  ariaLabel?: string;
  onBeforeExport?: (data: any[]) => any[];
  onExport?: (format: ExportFormat, data: any[]) => void;
}

const FORMAT_META: Record<
  ExportFormat,
  { label: string; icon: React.ReactNode; mime: string; ext: string }
> = {
  csv: { label: "CSV", icon: <FileSpreadsheet size={14} />, mime: "text/csv;charset=utf-8", ext: ".csv" },
  json: { label: "JSON", icon: <FileCode size={14} />, mime: "application/json", ext: ".json" },
  xlsx: { label: "Excel", icon: <FileSpreadsheet size={14} />, mime: "application/vnd.ms-excel", ext: ".xlsx" },
  pdf: { label: "PDF", icon: <FileText size={14} />, mime: "application/pdf", ext: ".pdf" },
};

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows
    .map((r) =>
      keys
        .map((k) => {
          const v = r[k];
          if (v === null || v === undefined) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(","),
    )
    .join("\n");
  return "\uFEFF" + header + "\n" + body;
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function ExportButton({
  data,
  filename = "export",
  formats = ["csv", "json"],
  label = "导出",
  size = "middle",
  disabled,
  ariaLabel,
  onBeforeExport,
  onExport,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (fmt: ExportFormat) => {
    setOpen(false);
    let rows = typeof data === "function" ? data() : data;
    if (onBeforeExport) rows = onBeforeExport(rows);
    if (onExport) onExport(fmt, rows);
    if (fmt === "csv") {
      downloadBlob(new Blob([toCSV(rows)], { type: FORMAT_META.csv.mime }), filename + FORMAT_META.csv.ext);
    } else if (fmt === "json") {
      downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: FORMAT_META.json.mime }), filename + FORMAT_META.json.ext);
    } else {
      // xlsx / pdf 需要 xlsx 库或后端支持, 这里导出为 .txt 占位
      downloadBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "text/plain" }), filename + ".txt");
    }
  };

  const padding = size === "small" ? "4px 10px" : size === "large" ? "8px 18px" : "6px 14px";
  const fontSize = size === "small" ? 12 : size === "large" ? 14 : 13;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel || label}
        onClick={() => setOpen(!open)}
        style={{
          padding,
          fontSize,
          fontWeight: 600,
          background: "#fff",
          color: "#1e40af",
          border: "1px solid #cbd5e1",
          borderRadius: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Download size={14} />
        {label}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            padding: 4,
            minWidth: 140,
            zIndex: 200,
          }}
        >
          {formats.map((fmt) => {
            const meta = FORMAT_META[fmt];
            return (
              <button
                key={fmt}
                role="menuitem"
                onClick={() => handleExport(fmt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#1e293b",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {meta.icon}
                导出为 {meta.label}
              </button>
            );
          })}
        </div>
      )}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default ExportButton;