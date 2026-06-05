// ============================================================
// 第三方库 stub - 缺少 @types 的库
// ============================================================

declare module 'dcmjs' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dcmjs: any;
  export default dcmjs;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const DICOMMicroscopyViewer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const log: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const parseDicom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const formatDicom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const readDicom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const writeDicom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const denaturalizeDataset: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const naturalizeDataset: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const constants: any;
}

declare module 'jspdf' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const jsPDF: any;
}

declare module 'qrcode' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrcode: any;
  export default qrcode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toDataURL: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toCanvas: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const toString: any;
}
