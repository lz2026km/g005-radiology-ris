export interface Channel {
  id: string;
  name: string;
  sourceType: 'hl7' | 'fhir' | 'dicom' | 'http' | 'internal';
  destinationType: 'hl7' | 'fhir' | 'dicom' | 'http' | 'internal' | 'log';
  transform?: string;
  filter?: string;
  status: 'stopped' | 'started' | 'error';
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const channels: Channel[] = [];

let nextId = 1;

export function getChannels(): Channel[] {
  return [...channels];
}

export function addChannel(data: Partial<Channel>): Channel {
  const now = new Date().toISOString();
  const channel: Channel = {
    id: `ch-${nextId++}`,
    name: data.name ?? `Channel ${nextId - 1}`,
    sourceType: data.sourceType ?? 'internal',
    destinationType: data.destinationType ?? 'log',
    status: 'stopped',
    config: data.config ?? {},
    createdAt: now,
    updatedAt: now
  };
  channels.push(channel);
  return channel;
}

export function updateChannel(id: string, data: Partial<Channel>): Channel | undefined {
  const idx = channels.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  channels[idx] = { ...channels[idx], ...data, id, updatedAt: new Date().toISOString() };
  return channels[idx];
}

export function removeChannel(id: string): Channel | undefined {
  const idx = channels.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  const removed = channels[idx];
  channels.splice(idx, 1);
  return removed;
}

export function startChannel(id: string): Channel | undefined {
  return updateChannel(id, { status: 'started' });
}

export function stopChannel(id: string): Channel | undefined {
  return updateChannel(id, { status: 'stopped' });
}
