export interface IntegrationMessage {
  id: string;
  channelId?: string;
  source: string;
  payload: unknown;
  status: 'received' | 'processed' | 'failed' | 'routed';
  result?: unknown;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

const messages: IntegrationMessage[] = [];
const MAX_MESSAGES = 500;

let nextId = 1;

export function sendMessage(data: Partial<IntegrationMessage>): IntegrationMessage {
  const now = new Date().toISOString();
  const msg: IntegrationMessage = {
    id: `msg-${nextId++}`,
    source: data.source ?? 'unknown',
    payload: data.payload ?? {},
    status: 'processed',
    channelId: data.channelId,
    createdAt: now,
    processedAt: now
  };
  messages.unshift(msg);
  if (messages.length > MAX_MESSAGES) messages.length = MAX_MESSAGES;
  return msg;
}

export function getMessages(): IntegrationMessage[] {
  return [...messages];
}

export function getMessage(id: string): IntegrationMessage | undefined {
  return messages.find(m => m.id === id);
}

export function clearMessages(): void {
  messages.length = 0;
}
