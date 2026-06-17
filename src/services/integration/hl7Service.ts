export interface HL7Message {
  type: string;
  version: string;
  segments: any[];
}

export function parseHL7(msg: string): HL7Message {
  const segments = msg.split('\r').filter(Boolean).map(s => s.split('|'));
  const msh = segments[0] || [];
  return {
    type: msh[8] || '',
    version: msh[11] || '2.5',
    segments,
  };
}

function buildMSH(type: string): string {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  return `MSH|^~\\&|RIS|G005|RECEIVER|FACILITY|${ts}||${type}|${Date.now()}|P|2.5`;
}

export function generateADT(type: 'A01' | 'A02' | 'A03' | 'A04' | 'A05', patient: any): string {
  const msh = buildMSH(`ADT^${type}`);
  const pid = `PID|1||${patient.id || ''}^^^HOSPITAL^MR||${patient.name || ''}||${patient.birthDate || ''}|${patient.sex || 'O'}|||${patient.address || ''}|||${patient.phone || ''}`;
  return [msh, pid, 'PV1||O'].join('\r');
}

export function generateORM(order: any): string {
  const msh = buildMSH('ORM^O01');
  const pid = `PID|1||${order.patientId || ''}^^^HOSPITAL^MR||${order.patientName || ''}`;
  const orc = `ORC|NW|${order.orderId || ''}`;
  const obr = `OBR|1|${order.orderId || ''}||${order.procedureCode || ''}^${order.procedureName || ''}|||${order.scheduledDate || ''}`;
  return [msh, pid, orc, obr].join('\r');
}

export function generateORU(report: any): string {
  const msh = buildMSH('ORU^R01');
  const pid = `PID|1||${report.patientId || ''}^^^HOSPITAL^MR||${report.patientName || ''}`;
  const obr = `OBR|1|${report.accessionNumber || ''}||${report.procedureCode || ''}|||${report.date || ''}`;
  const obx = `OBX|1|TX|FINDING||${report.finding || ''}`;
  return [msh, pid, obr, obx].join('\r');
}

export async function sendMLLP(host: string, port: number, msg: string): Promise<string> {
  // TODO v3.0.4: 实现真实 MLLP socket (TCP framing <VT>/<FS>/<CR>)
  await new Promise(r => setTimeout(r, 200));
  const msh = msg.split('\r')[0] || '';
  const type = msh.split('|')[8] || 'UNKNOWN';
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  return `MSH|^~\\&|RECEIVER|FACILITY|RIS|G005|${ts}||ACK^${type}|${Date.now()}|P|2.5\rMSA|AA|${Date.now()}`;
}
