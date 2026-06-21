// ============================================================
// G005 放射RIS系统 v3.0.6.5 - DICOM SR 导出对话框
// Phase R11 W5: TID 1500 / 1501 选择 / De-ID 预设 / 下载
// 20 升级点:模板选择 / De-ID / 导出 / 进度
// ============================================================

import React, { useState } from 'react';
import {
  Check, FileDown, FileText, ListOrdered, Loader2, Shield,
} from "lucide-react";
import type { TrackedLesion, DeIdentifyConfig } from '../../types/measurement';
import type { DicomSrDocument } from '../../types/R3/R3.INTEGRATION';
import { generateTid1500, generateTid1501, defaultDeIdConfig, deIdentifyDataset } from '../../services/integration/dicomSrService';
import type { ProcedureLogEntry } from '../../services/measurement/export/DicomSrTid1501';

interface Props {
  lesions: TrackedLesion[];
  procedureLog?: ProcedureLogEntry[];
  studyInstanceUID?: string;
  patientId?: string;
  patientName?: string;
  patientBirthDate?: string;
  onExported?: (sr: DicomSrDocument) => void;
  onClose?: () => void;
}

const PRESET_LABEL: Record<DeIdentifyConfig['preset'], string> = {
  basic: 'Basic (PS3.15 E.1.1)',
  clean: 'Clean (E.1.2)',
  full: 'Full (E.1.3)',
  research: 'Research',
  custom: 'Custom',
};

export default function SrExportDialog(props: Props) {
  const {
    lesions,
    procedureLog = [],
    studyInstanceUID,
    patientId,
    patientName,
    patientBirthDate,
    onExported,
    onClose,
  } = props;

  const [template, setTemplate] = useState<'TID1500' | 'TID1501'>('TID1500');
  const [preset, setPreset] = useState<DeIdentifyConfig['preset']>(defaultDeIdConfig.preset);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DicomSrDocument | null>(null);
  const [deIdEnabled, setDeIdEnabled] = useState(true);

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      let sr: DicomSrDocument;
      if (template === 'TID1500') {
        sr = await generateTid1500({
          lesions,
          patientId,
          patientName,
          patientBirthDate,
          deIdentifyConfig: deIdEnabled ? { ...defaultDeIdConfig, preset } : undefined,
        });
      } else {
        sr = await generateTid1501({
          studyInstanceUID: studyInstanceUID ?? 'unknown-study',
          entries: procedureLog,
          patientId,
          patientName,
        });
        if (deIdEnabled) {
          sr.dataElements = deIdentifyDataset(sr.dataElements, { ...defaultDeIdConfig, preset });
        }
      }
      setResult(sr);
      onExported?.(sr);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    const blob = new Blob([text], { type: 'application/dicom+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.templateId}-${result.sopInstanceUID.slice(-12)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-label="DICOM SR 导出"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          width: 520,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 20,
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileDown size={18} color="#2563eb" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>DICOM SR 导出</h3>
        </header>

        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
          将病灶测量数据导出为标准 DICOM SR 文档,可被 PACS / 科研平台接收。
        </p>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>
            <FileText size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            SR 模板
          </legend>
          <label style={radioRowStyle}>
            <input type="radio" checked={template === 'TID1500'} onChange={() => setTemplate('TID1500')} />
            <span>
              <strong>TID 1500</strong> · Imaging Measurement Report ({lesions.length} 个病灶 /{' '}
              {lesions.reduce((acc, l) => acc + l.snapshots.length, 0)} 次快照)
            </span>
          </label>
          <label style={radioRowStyle}>
            <input type="radio" checked={template === 'TID1501'} onChange={() => setTemplate('TID1501')} />
            <span>
              <strong>TID 1501</strong> · Procedure Log ({procedureLog.length} 条操作)
            </span>
          </label>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>
            <Shield size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            De-identification (PS 3.15)
          </legend>
          <label style={radioRowStyle}>
            <input type="checkbox" checked={deIdEnabled} onChange={(e) => setDeIdEnabled(e.target.checked)} />
            <span>导出前对 PHI 进行去标识化</span>
          </label>
          {deIdEnabled && (
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as DeIdentifyConfig['preset'])}
              style={selectStyle}
            >
              {(Object.keys(PRESET_LABEL) as Array<DeIdentifyConfig['preset']>).map((p) => (
                <option key={p} value={p}>{PRESET_LABEL[p]}</option>
              ))}
            </select>
          )}
        </fieldset>

        {result && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: 10,
              fontSize: 12,
              color: '#065f46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <Check size={13} /> 已生成 {result.templateId}
            </div>
            <ul style={{ margin: '6px 0 0', padding: '0 0 0 16px' }}>
              <li>SOP UID: {result.sopInstanceUID.slice(-20)}</li>
              <li>大小: {result.size} bytes</li>
              <li>验证: {result.validation.passed ? '通过' : '失败'} ({result.validation.errors.length} 错误 / {result.validation.warnings.length} 警告)</li>
              <li>引用图像: {result.referencedInstances.length} 个</li>
            </ul>
          </div>
        )}

        <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {onClose && (
            <button onClick={onClose} style={btnSecondaryStyle}>
              关闭
            </button>
          )}
          <button
            onClick={() => void run()}
            disabled={busy}
            style={{
              ...btnPrimaryStyle,
              opacity: busy ? 0.6 : 1,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? <Loader2 size={13} className="spin" /> : <ListOrdered size={13} />}
            生成 SR
          </button>
          <button
            onClick={download}
            disabled={!result}
            style={{
              ...btnDownloadStyle,
              opacity: result ? 1 : 0.5,
              cursor: result ? 'pointer' : 'not-allowed',
            }}
          >
            <FileDown size={13} /> 下载
          </button>
        </footer>
      </div>
    </div>
  );
}

const fieldsetStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 12px',
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};
const legendStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#374151', padding: '0 4px' };
const radioRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151' };
const selectStyle: React.CSSProperties = { fontSize: 12, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 6 };
const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontWeight: 600,
  color: '#fff',
  background: '#2563eb',
  border: '1px solid #1d4ed8',
  padding: '6px 12px',
  borderRadius: 6,
};
const btnDownloadStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  fontWeight: 600,
  color: '#fff',
  background: '#059669',
  border: '1px solid #047857',
  padding: '6px 12px',
  borderRadius: 6,
};
const btnSecondaryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  color: '#374151',
  background: '#fff',
  border: '1px solid #d1d5db',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
};
