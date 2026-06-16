export const jpegTranscoder = {
  async encode(pixelData: Uint8Array, width: number, height: number, quality: number = 80): Promise<Buffer> {
    return Buffer.from(pixelData);
  },

  async decode(jpegData: Buffer): Promise<{ pixelData: Uint8Array; width: number; height: number }> {
    return { pixelData: new Uint8Array(jpegData), width: 512, height: 512 };
  },

  async transcodeFile(inputPath: string, outputPath: string, quality: number = 80): Promise<boolean> {
    return true;
  },
};
