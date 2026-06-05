// ============================================================
// G005 放射RIS系统 v2.1.0 - DICOM-SR 导出器
// Phase R10 W3: TID 1500 (测量) + TID 2000 (文本) + TID 1501 (测量组)
// 兼容 dcmjs（如可用）回退到纯 JSON
// ============================================================

import type { ImageAnchor, ImageMeasurement } from '../types/imageAnchor';

export interface DicomSrExportOptions {
  reportId: string;
  patientId?: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID?: string;
  reportText: string;
  anchors: ImageAnchor[];
  conceptCodeScheme: 'DCM' | 'SRT' | 'RADLEX' | 'LN';
  observerName?: string;
  observerLoginName?: string;
  deviceSerialNumber?: string;
  softwareVersion?: string;
}

// DCM 代码（与 DICOM PS 3.16 对齐）
const DCM_CODES = {
  // TID 1500 root
  imagingMeasurementReport: '126000',
  // TID 2000 root
  imagingReport: '18760-5',
  // 容器
  measurementGroup: '125007',
  measurements: '125006',
  // 文本容器
  textElement: '112039',
  // 测量类型
  length: '410668003',         // SRT
  area: '42798000',            // SRT
  volume: '118565006',         // SRT
  angle: '24587007',           // SRT
  // 关系
  hasProperties: '111532',
  hasObservationContext: '112039',
  inferredFrom: '111234',
  hasConceptMod: '121139',
  // 值类型
  valueTypeContainer: 'CONTAINER',
  valueTypeNumeric: 'NUM',
  valueTypeText: 'TEXT',
  valueTypeCode: 'CODE',
  valueTypeImage: 'IMAGE',
  valueTypeScoord: 'SCOORD',
};

export interface DicomSrContentItem {
  relationshipType: 'CONTAINS' | 'HAS PROPERTIES' | 'HAS OBS CONTEXT' | 'INFERRED FROM' | 'HAS CONCEPT MOD' | 'SELECTED FROM';
  valueType: 'CONTAINER' | 'NUM' | 'TEXT' | 'CODE' | 'IMAGE' | 'SCOORD' | 'COMPOSITE' | 'WAVEFORM' | 'UIDREF' | 'PNAME' | 'DATE' | 'TIME' | 'DATETIME' | 'PName';
  conceptNameCodeSequence?: { codeValue: string; codeMeaning: string; codingSchemeDesignator: string };
  conceptCodeSequence?: { codeValue: string; codeMeaning: string; codingSchemeDesignator: string };
  textValue?: string;
  numericValue?: { value: number; unitCode: { codeValue: string; codeMeaning: string; codingSchemeDesignator: string } };
  graphicData?: number[];       // SCOORD 图形: x,y pairs
  graphicType?: 'POINT' | 'POLYLINE' | 'CIRCLE' | 'ELLIPSE' | 'MULTIPOINT';
  referencedImageSequence?: Array<{ referencedSOPClassUID: string; referencedSOPInstanceUID: string }>;
  contentSequence?: DicomSrContentItem[];
}

export interface DicomSrDocument {
  // DICOM SR 头
  sopClassUID: '1.2.840.10008.5.1.4.1.1.88.11';  // Basic Text SR (TID 2000)
  // 备选: 1.2.840.10008.5.1.4.1.1.88.22 (Enhanced SR, 包含测量 TID 1500)
  sopClassUIDMeasurement: '1.2.840.10008.5.1.4.1.1.88.22';
  sopInstanceUID: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  instanceNumber: number;
  conceptNameCodeSequence: { codeValue: string; codeMeaning: string; codingSchemeDesignator: string };
  completionFlag: 'COMPLETE' | 'PARTIAL';
  verificationFlag: 'UNVERIFIED' | 'VERIFIED';
  contentSequence: DicomSrContentItem[];
  // 元数据
  observerContext: {
    observerType: 'PSN' | 'DEV';
    personName?: string;
    loginName?: string;
    deviceSerialNumber?: string;
  };
  softwareVersion: string;
  generatedAt: string;
  // 报告侧
  reportId: string;
  patientId?: string;
}

function unitCode(unit: ImageMeasurement['unit']): { codeValue: string; codeMeaning: string; codingSchemeDesignator: string } {
  switch (unit) {
    case 'mm':  return { codeValue: 'mm', codeMeaning: 'millimeter', codingSchemeDesignator: 'UCUM' };
    case 'mm2': return { codeValue: 'mm2', codeMeaning: 'square millimeter', codingSchemeDesignator: 'UCUM' };
    case 'mm3': return { codeValue: 'mm3', codeMeaning: 'cubic millimeter', codingSchemeDesignator: 'UCUM' };
    case 'deg': return { codeValue: 'deg', codeMeaning: 'degree', codingSchemeDesignator: 'UCUM' };
    case 'HU':  return { codeValue: '[hnsf]', codeMeaning: 'Hounsfield unit', codingSchemeDesignator: 'UCUM' };
    case 'px':  return { codeValue: 'px', codeMeaning: 'pixel', codingSchemeDesignator: 'UCUM' };
  }
}

function measurementConcept(type: ImageMeasurement['type']): { codeValue: string; codeMeaning: string; codingSchemeDesignator: string } {
  switch (type) {
    case 'length':  return { codeValue: DCM_CODES.length,  codeMeaning: 'Length', codingSchemeDesignator: 'SRT' };
    case 'area':    return { codeValue: DCM_CODES.area,    codeMeaning: 'Area',   codingSchemeDesignator: 'SRT' };
    case 'volume':  return { codeValue: DCM_CODES.volume,  codeMeaning: 'Volume', codingSchemeDesignator: 'SRT' };
    case 'angle':   return { codeValue: DCM_CODES.angle,   codeMeaning: 'Angle',  codingSchemeDesignator: 'SRT' };
    case 'cobb':    return { codeValue: 'CobbAngle', codeMeaning: 'Cobb Angle', codingSchemeDesignator: 'DCM' };
    case 'ellipse': return { codeValue: 'EllipseROI', codeMeaning: 'Elliptical Region of Interest', codingSchemeDesignator: 'DCM' };
    case 'circular':return { codeValue: 'CircularROI', codeMeaning: 'Circular Region of Interest', codingSchemeDesignator: 'DCM' };
    case 'bidirectional': return { codeValue: 'BidirectionalMeasurement', codeMeaning: 'Bidirectional measurement', codingSchemeDesignator: 'DCM' };
    case 'hu':      return { codeValue: 'HUValue', codeMeaning: 'Hounsfield Unit Value', codingSchemeDesignator: 'DCM' };
  }
}

function genDicomUID(prefix = '1.2.826.0.1.3680043.10.'): string {
  return prefix + Date.now().toString(36) + '.' + Math.random().toString(36).slice(2, 12);
}

// 构造 TID 1500 (测量) 内容
function buildMeasurementGroup(anchor: ImageAnchor, conceptScheme: string): DicomSrContentItem {
  const m = anchor.measurement;
  const groupItem: DicomSrContentItem = {
    relationshipType: 'CONTAINS',
    valueType: 'CONTAINER',
    conceptNameCodeSequence: { codeValue: DCM_CODES.measurementGroup, codeMeaning: 'Measurement Group', codingSchemeDesignator: 'DCM' },
    referencedImageSequence: anchor.frame.sopInstanceUID
      ? [{ referencedSOPClassUID: '1.2.840.10008.5.1.4.1.1.2', referencedSOPInstanceUID: anchor.frame.sopInstanceUID }]
      : undefined,
    contentSequence: [],
  };

  if (m) {
    // 测量 NUM 项
    const numItem: DicomSrContentItem = {
      relationshipType: 'CONTAINS',
      valueType: 'NUM',
      conceptNameCodeSequence: measurementConcept(m.type),
      numericValue: { value: m.value, unitCode: unitCode(m.unit) },
    };
    // 几何（图形）
    if (m.points.length > 0) {
      const graphicData: number[] = [];
      m.points.forEach(p => { graphicData.push(p.x, p.y); });
      numItem.graphicData = graphicData;
      numItem.graphicType = m.points.length === 1 ? 'POINT' : (m.type === 'ellipse' ? 'ELLIPSE' : 'POLYLINE');
    }
    // 双径
    if (m.secondaryValue !== undefined && m.secondaryUnit) {
      numItem.contentSequence = [{
        relationshipType: 'HAS PROPERTIES',
        valueType: 'NUM',
        conceptNameCodeSequence: { codeValue: 'SecondaryValue', codeMeaning: 'Secondary measurement', codingSchemeDesignator: 'DCM' },
        numericValue: { value: m.secondaryValue, unitCode: unitCode(m.secondaryUnit as ImageMeasurement['unit']) },
      }];
    }
    groupItem.contentSequence!.push(numItem);
  }

  // 类别标记
  if (anchor.label || anchor.category !== 'finding') {
    groupItem.contentSequence!.push({
      relationshipType: 'HAS PROPERTIES',
      valueType: 'TEXT',
      conceptNameCodeSequence: { codeValue: 'Label', codeMeaning: 'Label', codingSchemeDesignator: 'DCM' },
      textValue: anchor.label ?? anchor.category,
    });
  }
  if (anchor.isCritical) {
    groupItem.contentSequence!.push({
      relationshipType: 'HAS PROPERTIES',
      valueType: 'CODE',
      conceptNameCodeSequence: { codeValue: 'CriticalFinding', codeMeaning: 'Critical Finding', codingSchemeDesignator: 'DCM' },
      conceptCodeSequence: { codeValue: 'R-00345', codeMeaning: 'Critical', codingSchemeDesignator: 'SRT' },
    });
  }
  if (anchor.isAIDetected) {
    groupItem.contentSequence!.push({
      relationshipType: 'HAS PROPERTIES',
      valueType: 'CODE',
      conceptNameCodeSequence: { codeValue: 'AIDetected', codeMeaning: 'AI Detected', codingSchemeDesignator: 'DCM' },
      conceptCodeSequence: { codeValue: 'AI-001', codeMeaning: 'AI-Assisted Detection', codingSchemeDesignator: 'DCM' },
    });
  }

  return groupItem;
}

// 构造 TID 2000 (文本) 内容
function buildTextSection(opts: DicomSrExportOptions, anchor: ImageAnchor): DicomSrContentItem {
  const r = anchor.textRange;
  const snippet = r ? opts.reportText.slice(r.start, r.end) : (anchor.label ?? '');
  return {
    relationshipType: 'CONTAINS',
    valueType: 'TEXT',
    conceptNameCodeSequence: { codeValue: 'ImagingObservation', codeMeaning: 'Imaging Observation', codingSchemeDesignator: 'DCM' },
    textValue: snippet,
    referencedImageSequence: anchor.frame.sopInstanceUID
      ? [{ referencedSOPClassUID: '1.2.840.10008.5.1.4.1.1.2', referencedSOPInstanceUID: anchor.frame.sopInstanceUID }]
      : undefined,
  };
}

export function exportToDicomSr(opts: DicomSrExportOptions): DicomSrDocument {
  const anchors = opts.anchors;
  const hasMeasurements = anchors.some(a => a.measurement);
  const sopClass = hasMeasurements ? '1.2.840.10008.5.1.4.1.1.88.22' : '1.2.840.10008.5.1.4.1.1.88.11';
  const rootConcept = hasMeasurements
    ? { codeValue: DCM_CODES.imagingMeasurementReport, codeMeaning: 'Imaging Measurement Report', codingSchemeDesignator: 'DCM' }
    : { codeValue: DCM_CODES.imagingReport, codeMeaning: 'Imaging Report', codingSchemeDesignator: 'LOINC' };

  // 内容序列
  const contentSequence: DicomSrContentItem[] = [];

  // 报告总文本
  contentSequence.push({
    relationshipType: 'CONTAINS',
    valueType: 'TEXT',
    conceptNameCodeSequence: { codeValue: 'ReportText', codeMeaning: 'Report Text', codingSchemeDesignator: 'DCM' },
    textValue: opts.reportText,
  });

  // 每个 anchor
  for (const a of anchors) {
    if (a.measurement) {
      contentSequence.push(buildMeasurementGroup(a, opts.conceptCodeScheme));
    } else if (a.textRange || a.label) {
      contentSequence.push(buildTextSection(opts, a));
    }
  }

  // 观察者上下文
  const observerContext: DicomSrDocument['observerContext'] = {
    observerType: opts.observerName ? 'PSN' : 'DEV',
    personName: opts.observerName,
    loginName: opts.observerLoginName,
    deviceSerialNumber: opts.deviceSerialNumber,
  };

  const doc: DicomSrDocument = {
    sopClassUID: sopClass as DicomSrDocument['sopClassUID'],
    sopClassUIDMeasurement: '1.2.840.10008.5.1.4.1.1.88.22',
    sopInstanceUID: genDicomUID(),
    studyInstanceUID: opts.studyInstanceUID,
    seriesInstanceUID: opts.seriesInstanceUID,
    instanceNumber: 1,
    conceptNameCodeSequence: rootConcept,
    completionFlag: 'COMPLETE',
    verificationFlag: 'UNVERIFIED',
    contentSequence,
    observerContext,
    softwareVersion: opts.softwareVersion ?? 'G005-RIS v2.1.0',
    generatedAt: new Date().toISOString(),
    reportId: opts.reportId,
    patientId: opts.patientId,
  };
  void DCM_CODES;  // 静态引用
  return doc;
}

// 尝试调用 dcmjs（如果已装）；否则返回纯 JSON
export async function exportToDicomSrBuffer(doc: DicomSrDocument): Promise<Uint8Array> {
  try {
    const mod = await import('dcmjs');
    const dcmjs = (mod as { default?: unknown }).default ?? mod;
    const anyLib = dcmjs as unknown as { sr?: { toBuffer?: (d: unknown) => Promise<Uint8Array | ArrayBuffer> } };
    if (anyLib.sr?.toBuffer) {
      const buf = await anyLib.sr.toBuffer(doc);
      return buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
    }
  } catch {
    // 降级
  }
  // 纯 JSON 降级
  return new TextEncoder().encode(JSON.stringify(doc, null, 2));
}

export function isDicomSrJson(buf: Uint8Array): boolean {
  if (buf.length < 1) return false;
  // JSON 降级文件以 { 开头
  return buf[0] === 0x7B;
}

export function downloadDicomSr(doc: DicomSrDocument, filename?: string) {
  void exportToDicomSrBuffer(doc).then(buf => {
    const blob = new Blob([buf], { type: isDicomSrJson(buf) ? 'application/json' : 'application/dicom' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `${doc.reportId}-SR.dcm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });
}
