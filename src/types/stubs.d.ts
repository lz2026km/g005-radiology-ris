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

// Cornerstone3D 缺包 stub（vendor bundle, 生产动态加载）
declare module '@cornerstonejs/core' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const RenderingEngine: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Enums: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const eventTarget: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const imageLoader: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const metaData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const cache: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export class Types {
    static IImage: any;
    static IGeometry: any;
  }
}

declare module '@cornerstonejs/dicom-image-loader' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dicomImageLoader: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const wadouri: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const wadors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const cornerstone: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default dicomImageLoader;
}

declare module '@cornerstonejs/tools' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ToolGroupManager: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const WindowLevelTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const PanTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ZoomTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const LengthTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const AngleTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const EllipticalROITool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ArrowAnnotateTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const StackScrollTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TrackballRotateTool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Enums: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const addTool: any;
}

declare module 'dicom-parser' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dicomParser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const parseDicom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default dicomParser;
}

declare module 'comlink' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comlink: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const wrap: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const expose: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const proxy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const transfer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default comlink;
}

declare module 'zod' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const z: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ZodType<T = any> = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ZodSchema<T = any> = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export namespace z {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type infer<T> = any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type output<T> = any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type input<T> = any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type ZodSchema<T = any> = any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type ZodType<T = any> = any;
  }
}

declare module 'dompurify' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dompurify: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default dompurify;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const sanitize: any;
}

declare namespace DOMPurify {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Config = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type HookEvent = any;
}
