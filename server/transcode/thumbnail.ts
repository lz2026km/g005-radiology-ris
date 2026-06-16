export const thumbnailGenerator = {
  async generateThumbnail(pixelData: Uint8Array, maxSize: number = 256): Promise<Buffer> {
    return Buffer.from(pixelData.slice(0, Math.min(pixelData.length, maxSize * maxSize * 3)));
  },

  async generateStudyThumbnails(studyUid: string): Promise<string[]> {
    return [`thumbnails/${studyUid}/series-1/instance-1.jpg`];
  },

  async getThumbnailUrl(studyUid: string, seriesUid: string, instanceUid: string): Promise<string> {
    return `/api/v1/thumbnails/${studyUid}/${seriesUid}/${instanceUid}.jpg`;
  },

  async batchGenerate(studyUids: string[]): Promise<number> {
    return studyUids.length;
  },
};
