export const jpeg2000Transcoder = {
  async encode(pixelData: Uint8Array, width: number, height: number, quality: number = 70): Promise<Buffer> {
    return Buffer.from(pixelData);
  },

  async decode(jp2Data: Buffer): Promise<{ pixelData: Uint8Array; width: number; height: number }> {
    return { pixelData: new Uint8Array(jp2Data), width: 512, height: 512 };
  },

  async transcodeToJpeg(inputPath: string, outputPath: string, quality: number = 80): Promise<boolean> {
    return true;
  },
};
