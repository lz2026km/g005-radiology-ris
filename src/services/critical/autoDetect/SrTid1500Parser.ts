/**
 * G005 RIS v3.0.6.6 - DICOM SR TID 1500 测量值解析
 * 解析 PACS 上报的 DICOM Structured Report (TID 1500 "Measurable")
 * 提取测量值/单位/参考范围,与危急值规则比对触发
 */

export interface DicomSrMeasurement {
  /** DICOM 路径 */
  path: string;
  /** ConceptCode (e.g. "1234-5" 为 LOINC) */
  conceptCode: string;
  conceptName: string;
  /** 数值与单位 */
  value: number;
  unit: string;
  /** 参考范围 */
  refLow?: number;
  refHigh?: number;
  /** 数据类型 */
  type: 'numeric' | 'text' | 'code' | 'image';
  /** 是否异常 */
  abnormal?: 'low' | 'high' | 'normal';
  /** 测量方法(SRT 词) */
  method?: string;
  /** 时间戳 */
  observedAt?: string;
}

export interface DicomSrDocument {
  sopInstanceUid: string;
  studyInstanceUid: string;
  seriesInstanceUid: string;
  conceptNameCode: string;     // e.g. "1500" TID 标识
  /** 测量项 */
  measurements: DicomSrMeasurement[];
  /** 关联检查/患者 */
  patientId: string;
  modality?: string;
  bodyPart?: string;
  receivedAt: string;
}

/** TID 1500 Measurable 标准结构 */
export interface TID1500Payload {
  document: DicomSrDocument;
}

/** 危急值规则侧匹配项 */
export interface CriticalRuleMatch {
  ruleCode: string;
  ruleName: string;
  measurementPath: string;
  observed: number;
  threshold: number;
  unit: string;
  severity: 'critical' | 'urgent' | 'warning' | 'info';
  message: string;
}

/** 解析器接口 */
export interface ISrTid1500Parser {
  parse(jsonOrXml: unknown, ctx?: { studyInstanceUid?: string; patientId?: string }): DicomSrDocument;
  matchRules(doc: DicomSrDocument, rules: Array<{ code: string; name: string; path: string; threshold: number; operator: '>' | '<' | '>=' | '<=' | '=='; severity: CriticalRuleMatch['severity'] }>): CriticalRuleMatch[];
}

const defaultCodes: Record<string, string> = {
  '1234-5': '心率',
  '2345-7': '血糖',
  '718-7': '血红蛋白',
  '785-6': '红细胞平均血红蛋白浓度',
  '787-2': '红细胞平均体积',
  '786-4': '红细胞平均血红蛋白',
  '3024-7': '凝血酶原时间',
  '3026-2': '部分凝血活酶时间',
};

class SrTid1500ParserImpl implements ISrTid1500Parser {
  parse(input: unknown, ctx: { studyInstanceUid?: string; patientId?: string } = {}): DicomSrDocument {
    if (input && typeof input === 'object' && 'measurements' in (input as Record<string, unknown>)) {
      return this.fromJson(input as Record<string, unknown>, ctx);
    }
    if (typeof input === 'string') {
      return this.fromXml(input, ctx);
    }
    return this.fromJson(input as Record<string, unknown>, ctx);
  }

  private fromJson(input: Record<string, unknown>, ctx: { studyInstanceUid?: string; patientId?: string }): DicomSrDocument {
    const measurements = Array.isArray(input.measurements)
      ? (input.measurements as DicomSrMeasurement[])
      : [];
    return {
      sopInstanceUid: (input.sopInstanceUid as string) ?? 'mock-sop-' + Date.now(),
      studyInstanceUid: (input.studyInstanceUid as string) ?? ctx.studyInstanceUid ?? 'mock-study-' + Date.now(),
      seriesInstanceUid: (input.seriesInstanceUid as string) ?? 'mock-series-' + Date.now(),
      conceptNameCode: (input.conceptNameCode as string) ?? '1500',
      measurements: measurements.map((m) => this.normalizeMeasurement(m)),
      patientId: (input.patientId as string) ?? ctx.patientId ?? 'P-MOCK',
      modality: input.modality as string | undefined,
      bodyPart: input.bodyPart as string | undefined,
      receivedAt: new Date().toISOString(),
    };
  }

  private fromXml(xml: string, ctx: { studyInstanceUid?: string; patientId?: string }): DicomSrDocument {
    // 极简 XML 解析:仅提取 <Measurement> 块
    const measurements: DicomSrMeasurement[] = [];
    const re = /<Measurement\b[^>]*>([\s\S]*?)<\/Measurement>/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(xml)) !== null) {
      const block = match[1] ?? '';
      const code = this.extract(block, 'CodeValue') ?? '';
      const name = this.extract(block, 'CodeMeaning') ?? defaultCodes[code] ?? code;
      const value = parseFloat(this.extract(block, 'NumericValue') ?? '0');
      const unit = this.extract(block, 'Unit') ?? '';
      const refLow = parseFloat(this.extract(block, 'RefLow') ?? 'NaN');
      const refHigh = parseFloat(this.extract(block, 'RefHigh') ?? 'NaN');
      const path = this.extract(block, 'Path') ?? name;
      measurements.push(this.normalizeMeasurement({
        path,
        conceptCode: code,
        conceptName: name,
        value,
        unit,
        refLow: isNaN(refLow) ? undefined : refLow,
        refHigh: isNaN(refHigh) ? undefined : refHigh,
        type: 'numeric',
      }));
    }
    return {
      sopInstanceUid: 'mock-sop-' + Date.now(),
      studyInstanceUid: ctx.studyInstanceUid ?? 'mock-study-' + Date.now(),
      seriesInstanceUid: 'mock-series-' + Date.now(),
      conceptNameCode: '1500',
      measurements,
      patientId: ctx.patientId ?? 'P-MOCK',
      receivedAt: new Date().toISOString(),
    };
  }

  private extract(block: string, tag: string): string | null {
    const m = new RegExp(`<${tag}>([^<]+)</${tag}>`).exec(block);
    return m?.[1]?.trim() ?? null;
  }

  private normalizeMeasurement(m: Partial<DicomSrMeasurement>): DicomSrMeasurement {
    const refLow = m.refLow;
    const refHigh = m.refHigh;
    let abnormal: DicomSrMeasurement['abnormal'];
    if (typeof refLow === 'number' && typeof m.value === 'number' && m.value < refLow) abnormal = 'low';
    if (typeof refHigh === 'number' && typeof m.value === 'number' && m.value > refHigh) abnormal = 'high';
    if (refLow !== undefined && refHigh !== undefined && m.value !== undefined && m.value >= refLow && m.value <= refHigh) abnormal = 'normal';
    return {
      path: m.path ?? m.conceptName ?? 'unknown',
      conceptCode: m.conceptCode ?? '',
      conceptName: m.conceptName ?? '',
      value: m.value ?? 0,
      unit: m.unit ?? '',
      refLow,
      refHigh,
      type: m.type ?? 'numeric',
      abnormal,
      method: m.method,
      observedAt: m.observedAt ?? new Date().toISOString(),
    };
  }

  matchRules(
    doc: DicomSrDocument,
    rules: Array<{ code: string; name: string; path: string; threshold: number; operator: '>' | '<' | '>=' | '<=' | '=='; severity: CriticalRuleMatch['severity'] }>,
  ): CriticalRuleMatch[] {
    const out: CriticalRuleMatch[] = [];
    for (const r of rules) {
      const m = doc.measurements.find((x) => x.path === r.path || x.conceptCode === r.path || x.conceptName === r.path);
      if (!m) continue;
      let hit = false;
      switch (r.operator) {
        case '>': hit = m.value > r.threshold; break;
        case '<': hit = m.value < r.threshold; break;
        case '>=': hit = m.value >= r.threshold; break;
        case '<=': hit = m.value <= r.threshold; break;
        case '==': hit = m.value === r.threshold; break;
      }
      if (hit) {
        out.push({
          ruleCode: r.code,
          ruleName: r.name,
          measurementPath: m.path,
          observed: m.value,
          threshold: r.threshold,
          unit: m.unit,
          severity: r.severity,
          message: `${m.conceptName}=${m.value}${m.unit} ${r.operator} ${r.threshold}${m.unit}`,
        });
      }
    }
    return out;
  }
}

export const srTid1500Parser: ISrTid1500Parser = new SrTid1500ParserImpl();