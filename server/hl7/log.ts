export interface LogEntry {
  id: string;
  timestamp: string;
  messageType: string;
  controlId: string;
  success: boolean;
  direction: 'inbound' | 'outbound';
  error?: string;
}

const messageLog: LogEntry[] = [];
const MAX_LOG = 500;

export function addLogEntry(entry: LogEntry): void {
  messageLog.unshift(entry);
  if (messageLog.length > MAX_LOG) messageLog.length = MAX_LOG;
}

export function getLog(): LogEntry[] {
  return [...messageLog];
}

export function clearLog(): void {
  messageLog.length = 0;
}
