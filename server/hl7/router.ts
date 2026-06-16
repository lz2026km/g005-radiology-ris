import type { HL7Message } from './parser.js';

interface RouteResult {
  success: boolean;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  detail?: string;
}

export function routeMessage(msg: HL7Message): RouteResult {
  const msh = msg.segments.MSH;
  if (!msh) return { success: false, detail: 'Missing MSH segment' };

  const msgType = msh.fieldMap['messageType'] ?? '';
  const trigger = msh.fieldMap['triggerEvent'] ?? '';

  const key = `${msgType}^${trigger}`;

  switch (key) {
    case 'ADT^A01':
    case 'ADT^A04':
      return handleADT(msg, 'REGISTER');
    case 'ADT^A02':
      return handleADT(msg, 'TRANSFER');
    case 'ADT^A03':
      return handleADT(msg, 'DISCHARGE');
    case 'ADT^A08':
      return handleADT(msg, 'UPDATE');
    case 'ADT^A40':
      return handleMerge(msg);
    case 'ORM^O01':
      return handleORM(msg);
    case 'ORU^R01':
      return handleORU(msg);
    default:
      return { success: true, action: 'UNKNOWN', detail: `No handler for ${key}, message acknowledged` };
  }
}

function handleADT(msg: HL7Message, action: string): RouteResult {
  const pid = msg.segments.PID;
  const patientId = pid?.fieldMap['3'] ?? '';
  const patientName = pid?.fieldMap['5'] ?? '';
  return { success: true, action, resourceType: 'Patient', resourceId: patientId.split('^')[0], detail: `${action} patient ${patientName}` };
}

function handleMerge(_msg: HL7Message): RouteResult {
  return { success: true, action: 'MERGE', resourceType: 'Patient', detail: 'Patient merge processed' };
}

function handleORM(msg: HL7Message): RouteResult {
  const orc = msg.segments.ORC;
  const obr = msg.segments.OBR;
  const orderId = orc?.fieldMap['2'] ?? obr?.fieldMap['2'] ?? '';
  return { success: true, action: 'ORDER', resourceType: 'ServiceRequest', resourceId: orderId, detail: `Order ${orderId} processed` };
}

function handleORU(msg: HL7Message): RouteResult {
  const obx = msg.segments.OBX;
  const resultValue = obx?.fieldMap['5'] ?? '';
  return { success: true, action: 'RESULT', resourceType: 'Observation', detail: `Result value: ${resultValue}` };
}
