import type { HL7Message } from './parser.js';

export function buildACK(original: HL7Message | null, ackCode: 'AA' | 'AE' | 'AR' = 'AA', errorMessage?: string): string {
  const now = new Date();
  const dt = now.toISOString().replace(/[-:]/g, '').slice(0, 14);
  const controlId = `ACK-${now.getTime().toString(36)}`;
  const sendingApp = original?.segments.MSH?.fieldMap['sendingApp'] ?? 'G005_RIS';
  const sendingFacility = original?.segments.MSH?.fieldMap['sendingFacility'] ?? 'G005';
  const receivingApp = original?.segments.MSH?.fieldMap['receivingApp'] ?? 'EXTERNAL';
  const receivingFacility = original?.segments.MSH?.fieldMap['receivingFacility'] ?? 'EXTERNAL';

  const lines: string[] = [];
  lines.push(`MSH|^~\\&|G005_RIS|G005|${receivingApp}|${receivingFacility}|${dt}||ACK|${controlId}|P|2.5`);
  lines.push(`MSA|${ackCode}|${original?.segments.MSH?.fieldMap['messageControlId'] ?? ''}${errorMessage ? `|${errorMessage}` : ''}`);
  if (errorMessage) lines.push(`ERR|^^^${errorMessage}`);
  return lines.join('\r') + '\r';
}

export function buildMessage(segments: string[][]): string {
  return segments.map(seg => seg.join('|')).join('\r') + '\r';
}
