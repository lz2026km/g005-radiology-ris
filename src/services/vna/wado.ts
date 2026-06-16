import type { DicomInstance } from './types';

export interface WadoRsResponse {
  contentType: string;
  body: ArrayBuffer;
}

const MIME_TYPES: Record<string, string> = {
  '1.2.840.10008.1.2.4.50': 'image/jpeg',
  '1.2.840.10008.1.2.4.51': 'image/jpeg',
  '1.2.840.10008.1.2.4.57': 'image/jpeg',
  '1.2.840.10008.1.2.4.70': 'image/jpeg',
  '1.2.840.10008.1.2.4.80': 'image/jpeg',
  '1.2.840.10008.1.2.4.81': 'image/jpeg',
  '1.2.840.10008.1.2.4.90': 'image/jp2',
  '1.2.840.10008.1.2.4.91': 'image/jp2',
  '1.2.840.10008.1.2.4.92': 'image/jpx',
  '1.2.840.10008.1.2.4.93': 'image/jpx',
};

export async function wadoRsRetrieveInstance(studyUid: string, seriesUid: string, instanceUid: string): Promise<WadoRsResponse | null> {
  const { vnaStore } = await import('./store');
  const instances = await vnaStore.getInstances(studyUid, seriesUid);
  const instance = instances.find(i => i.sopInstanceUid === instanceUid);
  if (!instance || !instance.pixelData) return null;

  const contentType = MIME_TYPES[instance.transferSyntaxUid] || 'application/octet-stream';
  return { contentType, body: instance.pixelData.buffer as ArrayBuffer };
}

export async function wadoRsRetrieveFrames(studyUid: string, seriesUid: string, instanceUid: string, frameNumbers: number[]): Promise<WadoRsResponse | null> {
  const { vnaStore } = await import('./store');
  const instances = await vnaStore.getInstances(studyUid, seriesUid);
  const instance = instances.find(i => i.sopInstanceUid === instanceUid);
  if (!instance) return null;
  return { contentType: 'application/octet-stream', body: new ArrayBuffer(0) };
}

export async function wadoRsMetadata(studyUid: string, seriesUid?: string, instanceUid?: string): Promise<Record<string, unknown>> {
  const { vnaStore } = await import('./store');
  const data = await vnaStore.getStudyData(studyUid);
  if (!data) return {};
  if (instanceUid && seriesUid) {
    const instances = await vnaStore.getInstances(studyUid, seriesUid);
    const inst = instances.find(i => i.sopInstanceUid === instanceUid);
    return inst as unknown as Record<string, unknown> || {};
  }
  if (seriesUid) {
    const series = await vnaStore.getSeries(studyUid, seriesUid);
    return series as unknown as Record<string, unknown> || {};
  }
  return data.study as unknown as Record<string, unknown>;
}

export async function wadoUriRetrieve(studyUid: string, seriesUid: string, instanceUid: string, contentType?: string): Promise<WadoRsResponse | null> {
  return wadoRsRetrieveInstance(studyUid, seriesUid, instanceUid);
}
