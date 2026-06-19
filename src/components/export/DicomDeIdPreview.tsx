/**
 * G005 放射RIS系统 v3.0.6.0 - DICOM 去标识化预览
 * Phase R7:预览脱敏前后对比
 */
import React, { useState, useMemo } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { DicomDeId, type DicomDataset } from '../../services/export/dicomDeId/DicomDeId';
import type { DicomDeIdOptions } from '../../types/export';

interface DicomDeIdPreviewProps {
  dataset?: DicomDataset;
  reportId?: string;
}

const DEFAULT_OPTIONS: DicomDeIdOptions = {
  removePatientName: true,
  removePatientId: true,
  removePatientBirthDate: true,
  removePatientAddress: true,
  removeInstitutionName: true,
  removeReferringPhysician: true,
  removeStudyDate: false,
  dateShiftDays: 0,
  hashPrivateTags: true,
  keepUIDs: true,
};

const SAMPLE_DATASET: DicomDataset = {
  '00100010': { vr: 'PN', Value: ['张^三'] },
  '00100020': { vr: 'LO', Value: ['PAT12345'] },
  '00100030': { vr: 'DA', Value: ['19850321'] },
  '00100040': { vr: 'CS', Value: ['M'] },
  '00101040': { vr: 'LO', Value: ['北京市朝阳区'] },
  '00080080': { vr: 'LO', Value: ['汉东省人民医院'] },
  '00080090': { vr: 'PN', Value: ['李^医生'] },
  '00080020': { vr: 'DA', Value: ['20250601'] },
  '0020000D': { vr: 'UI', Value: ['1.2.840.12345.6789'] },
  '00080018': { vr: 'UI', Value: ['1.2.840.9876.5432'] },
};

export const DicomDeIdPreview: React.FC<DicomDeIdPreviewProps> = ({ dataset = SAMPLE_DATASET }) => {
  const [options, setOptions] = useState<DicomDeIdOptions>(DEFAULT_OPTIONS);
  const [showOriginal, setShowOriginal] = useState(true);

  const deId = useMemo(() => new DicomDeId(), []);
  const result = useMemo(() => deId.process(dataset, options), [deId, dataset, options]);

  const toggleOption = (key: keyof DicomDeIdOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Shield size={16} color="#059669" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>DICOM 去标识化</span>
        <span style={{ fontSize: 10, background: '#d1fae5', color: '#059669', padding: '1px 6px', borderRadius: 3 }}>HIPAA</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {(['removePatientName', 'removePatientId', 'removePatientBirthDate', 'removePatientAddress', 'removeInstitutionName', 'removeReferringPhysician', 'removeStudyDate', 'hashPrivateTags'] as const).map(key => (
          <label key={key} style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={options[key]} onChange={() => toggleOption(key)} />
            {labelMap[key]}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 2 }}>日期偏移天数: {options.dateShiftDays}</label>
        <input type="range" min={0} max={365} value={options.dateShiftDays} onChange={e => setOptions(prev => ({ ...prev, dateShiftDays: +e.target.value }))} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button onClick={() => setShowOriginal(true)} style={showOriginal ? tabActive : tabInactive}><Eye size={12} /> 原始</button>
        <button onClick={() => setShowOriginal(false)} style={!showOriginal ? tabActive : tabInactive}><EyeOff size={12} /> 脱敏后</button>
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', maxHeight: 240, overflow: 'auto', fontSize: 11 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={thStyle}>Tag</th>
              <th style={thStyle}>VR</th>
              <th style={thStyle}>值</th>
              <th style={thStyle}>状态</th>
            </tr>
          </thead>
          <tbody>
            {(showOriginal ? Object.entries(dataset) : Object.entries(result.dataset)).map(([tag, elem]) => {
              const removed = !showOriginal && result.removedTags.includes(tagName(tag));
              const modified = !showOriginal && result.modifiedTags.includes(tagName(tag));
              return (
                <tr key={tag} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>{tag}</td>
                  <td style={tdStyle}>{elem.vr}</td>
                  <td style={tdStyle}>{String(elem.Value ?? '-').slice(0, 40)}</td>
                  <td style={tdStyle}>
                    {removed && <span style={{ color: '#dc2626' }}><AlertTriangle size={10} /> 已移除</span>}
                    {modified && <span style={{ color: '#d97706' }}>已修改</span>}
                    {!removed && !modified && <span style={{ color: '#16a34a' }}>保留</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
        <span>移除: <strong style={{ color: '#dc2626' }}>{result.stats.removed}</strong></span>
        <span>修改: <strong style={{ color: '#d97706' }}>{result.stats.modified}</strong></span>
        <span>保留: <strong style={{ color: '#16a34a' }}>{result.stats.kept}</strong></span>
      </div>
    </div>
  );
};

function tagName(tag: string): string {
  const map: Record<string, string> = {
    '00100010': 'PatientName', '00100020': 'PatientID', '00100030': 'PatientBirthDate',
    '00100040': 'PatientSex', '00101040': 'PatientAddress', '00080080': 'InstitutionName',
    '00080090': 'ReferringPhysician', '00080020': 'StudyDate', '0020000D': 'StudyInstanceUID',
    '00080018': 'SOPInstanceUID',
  };
  return map[tag] ?? tag;
}

const labelMap: Record<string, string> = {
  removePatientName: '移除患者姓名',
  removePatientId: '移除患者ID',
  removePatientBirthDate: '移除出生日期',
  removePatientAddress: '移除地址/性别',
  removeInstitutionName: '移除机构名称',
  removeReferringPhysician: '移除转诊医生',
  removeStudyDate: '移除检查日期',
  hashPrivateTags: '哈希私有标签',
};

const thStyle: React.CSSProperties = { padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#475569' };
const tdStyle: React.CSSProperties = { padding: '5px 8px', fontSize: 10, color: '#334155', fontFamily: 'monospace' };
const tabActive: React.CSSProperties = { padding: '5px 12px', border: '1px solid #059669', borderRadius: 4, background: '#d1fae5', color: '#059669', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 };
const tabInactive: React.CSSProperties = { padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', color: '#64748b', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 };
