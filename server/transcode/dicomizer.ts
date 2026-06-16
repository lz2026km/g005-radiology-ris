export const dicomizer = {
  async convertToDicom(inputPath: string, metadata: Record<string, string>): Promise<Buffer> {
    return Buffer.from(`DICOM-converted from ${inputPath}`);
  },

  async convertFromDicom(dicomPath: string, outputFormat: 'jpg' | 'png' | 'pdf'): Promise<Buffer> {
    return Buffer.from(`Converted ${dicomPath} to ${outputFormat}`);
  },

  async createDicomdir(filePaths: string[], outputPath: string): Promise<boolean> {
    return true;
  },
};
