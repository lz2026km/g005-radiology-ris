export interface KosManifestEntry {
  studyInstanceUid: string;
  seriesInstanceUid: string;
  sopInstanceUid: string;
  instanceNumber: number;
  description?: string;
  significance: 'key' | 'representative' | 'all';
}

export const kosManifest = {
  async createManifest(entries: KosManifestEntry[]): Promise<Buffer> {
    return Buffer.from(JSON.stringify(entries));
  },

  async parseManifest(kosData: Buffer): Promise<KosManifestEntry[]> {
    return JSON.parse(kosData.toString());
  },

  async generateStudyManifest(studyUid: string): Promise<KosManifestEntry[]> {
    return [];
  },
};
