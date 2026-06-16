export interface HL7Message {
  raw: string;
  segments: Record<string, HL7Segment>;
  segmentOrder: string[];
}

export interface HL7Segment {
  name: string;
  fields: string[];
  fieldMap: Record<string, string>;
}

const FIELD_SEP = '|';
const COMP_SEP = '^';
const REP_SEP = '~';
const ESC_CHAR = '\\';
const SUBCOMP_SEP = '&';

export function parseHL7(raw: string): HL7Message {
  const normalized = raw.replace(/\r?\n/g, '\r').replace(/\r$/, '');
  const segmentStrings = normalized.split('\r').filter(s => s.trim());

  if (segmentStrings.length === 0) throw new Error('Empty HL7 message');

  const segments: Record<string, HL7Segment> = {};
  const segmentOrder: string[] = [];

  for (const segStr of segmentStrings) {
    const fields = segStr.split(FIELD_SEP);
    const segName = fields[0]?.trim() ?? '';
    if (!segName) continue;

    const fieldMap: Record<string, string> = {};
    fields.forEach((f, i) => { if (i > 0) fieldMap[String(i)] = f; });

    const segment: HL7Segment = { name: segName, fields, fieldMap };

    if (segName === 'MSH') {
      segment.fieldMap['messageType'] = (fields[8]?.split(COMP_SEP)[0] ?? '');
      segment.fieldMap['triggerEvent'] = (fields[8]?.split(COMP_SEP)[1] ?? '');
      segment.fieldMap['messageControlId'] = fields[9] ?? '';
      segment.fieldMap['sendingFacility'] = fields[3] ?? '';
      segment.fieldMap['sendingApp'] = fields[2] ?? '';
      segment.fieldMap['receivingApp'] = fields[4] ?? '';
      segment.fieldMap['receivingFacility'] = fields[5] ?? '';
      segment.fieldMap['dateTime'] = fields[6] ?? '';
      segment.fieldMap['version'] = fields[11] ?? '';
    }

    const existing = segments[segName];
    if (existing) {
      const idx = segmentOrder.filter(s => s.startsWith(segName)).length + 1;
      const key = `${segName}_${idx}`;
      segments[key] = segment;
      segmentOrder.push(key);
    } else {
      segments[segName] = segment;
      segmentOrder.push(segName);
    }
  }

  return { raw, segments, segmentOrder };
}
