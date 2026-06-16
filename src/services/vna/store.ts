import type { DicomStudy, DicomSeries, DicomInstance, VnaStoreRequest, VnaQueryParams, VnaQueryResult } from './types';

const STORE_PREFIX = 'vna:store:';

function vnaKey(studyUid: string, seriesUid?: string, instanceUid?: string): string {
  const parts = [STORE_PREFIX, studyUid];
  if (seriesUid) parts.push(seriesUid);
  if (instanceUid) parts.push(instanceUid);
  return parts.join(':');
}

export const vnaStore = {
  async store(request: VnaStoreRequest): Promise<{ success: boolean; studyId: string; errors?: string[] }> {
    const { study, series, instances } = request;
    const key = vnaKey(study.studyInstanceUid);
    try {
      const existing = localStorage.getItem(key);
      const data = existing ? JSON.parse(existing) : { study, series: {} as Record<string, { series: DicomSeries; instances: DicomInstance[] }> };
      if (!data.series[series.seriesInstanceUid]) {
        data.series[series.seriesInstanceUid] = { series, instances: [] };
      }
      data.series[series.seriesInstanceUid].instances.push(...instances);
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true, studyId: study.studyInstanceUid };
    } catch (err) {
      return { success: false, studyId: study.studyInstanceUid, errors: [(err as Error).message] };
    }
  },

  async query(params: VnaQueryParams): Promise<VnaQueryResult> {
    const results: DicomStudy[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORE_PREFIX)) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const study: DicomStudy = data.study;
        if (params.patientId && study.patientId !== params.patientId) continue;
        if (params.patientName && !study.patientName.toLowerCase().includes(params.patientName.toLowerCase())) continue;
        if (params.modality && !study.modalitiesInStudy?.includes(params.modality)) continue;
        if (params.studyDateFrom && study.studyDate && study.studyDate < params.studyDateFrom) continue;
        if (params.studyDateTo && study.studyDate && study.studyDate > params.studyDateTo) continue;
        results.push(study);
      } catch { continue; }
    }
    const total = results.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    return { studies: results.slice(offset, offset + limit), total, limit, offset };
  },

  async getStudy(studyInstanceUid: string): Promise<DicomStudy | null> {
    const key = vnaKey(studyInstanceUid);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw).study; } catch { return null; }
  },

  async getSeries(studyInstanceUid: string, seriesInstanceUid: string): Promise<DicomSeries | null> {
    const data = await this.getStudyData(studyInstanceUid);
    if (!data?.series[seriesInstanceUid]) return null;
    return data.series[seriesInstanceUid].series;
  },

  async getInstances(studyInstanceUid: string, seriesInstanceUid: string): Promise<DicomInstance[]> {
    const data = await this.getStudyData(studyInstanceUid);
    if (!data?.series[seriesInstanceUid]) return [];
    return data.series[seriesInstanceUid].instances;
  },

  async getStudyData(studyInstanceUid: string): Promise<{ study: DicomStudy; series: Record<string, { series: DicomSeries; instances: DicomInstance[] }> } | null> {
    const raw = localStorage.getItem(vnaKey(studyInstanceUid));
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  async deleteStudy(studyInstanceUid: string): Promise<boolean> {
    const key = vnaKey(studyInstanceUid);
    if (!localStorage.getItem(key)) return false;
    localStorage.removeItem(key);
    return true;
  },

  async healthCheck(): Promise<{ ok: boolean; studyCount: number }> {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORE_PREFIX)) count++;
    }
    return { ok: true, studyCount: count };
  },
};
