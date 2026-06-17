/**
 * dcmjs stub - the package does not ship TypeScript types and there is no
 * @types/dcmjs on npm. The app only consumes the runtime values below; callers
 * narrow at the use site.
 */

declare module 'dcmjs' {
  const dcmjs: Record<string, unknown>;
  const DICOMMicroscopyViewer: unknown;
  const log: Record<string, unknown>;
  const parseDicom: (...args: unknown[]) => unknown;
  const formatDicom: (...args: unknown[]) => unknown;
  const readDicom: (...args: unknown[]) => unknown;
  const writeDicom: (...args: unknown[]) => unknown;
  const denaturalizeDataset: (...args: unknown[]) => unknown;
  const naturalizeDataset: (...args: unknown[]) => unknown;
  // dcmjs.data.DicomMessage and dcmjs.constants.Tag are accessed heavily at
  // runtime (e.g. dcmjs.constants.Tag.PatientName). Indexed access falls back
  // to `any` because the shape is not expressible without @types/dcmjs.
  const data: Record<string, any>;
  const constants: Record<string, any>;

  export default dcmjs;
  export {
    DICOMMicroscopyViewer,
    log,
    parseDicom,
    formatDicom,
    readDicom,
    writeDicom,
    denaturalizeDataset,
    naturalizeDataset,
    data,
    constants,
  };
}
