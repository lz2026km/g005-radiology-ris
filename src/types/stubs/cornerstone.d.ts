/**
 * Cornerstone3D stubs - vendor bundle, dynamically loaded in production.
 *
 * The @cornerstonejs/* packages ship type definitions but are loaded at runtime
 * via a vendor bundle. To keep build-time imports light, we re-declare the
 * surface used by the app as `unknown` so callers must narrow before use.
 */

declare module '@cornerstonejs/core' {
  const RenderingEngine: unknown;
  const Enums: Record<string, unknown>;
  const eventTarget: unknown;
  const imageLoader: unknown;
  const metaData: unknown;
  const cache: unknown;

  class Types {
    static IImage: unknown;
    static IGeometry: unknown;
  }

  export {
    RenderingEngine,
    Enums,
    eventTarget,
    imageLoader,
    metaData,
    cache,
    Types,
  };
}

declare module '@cornerstonejs/dicom-image-loader' {
  const dicomImageLoader: Record<string, unknown>;
  const wadouri: unknown;
  const wadors: unknown;
  const cornerstone: unknown;

  export { dicomImageLoader as default, wadouri, wadors, cornerstone };
}

declare module '@cornerstonejs/tools' {
  const ToolGroupManager: unknown;
  const WindowLevelTool: unknown;
  const PanTool: unknown;
  const ZoomTool: unknown;
  const LengthTool: unknown;
  const AngleTool: unknown;
  const EllipticalROITool: unknown;
  const ArrowAnnotateTool: unknown;
  const StackScrollTool: unknown;
  const TrackballRotateTool: unknown;
  const Enums: Record<string, unknown>;
  const addTool: unknown;

  export {
    ToolGroupManager,
    WindowLevelTool,
    PanTool,
    ZoomTool,
    LengthTool,
    AngleTool,
    EllipticalROITool,
    ArrowAnnotateTool,
    StackScrollTool,
    TrackballRotateTool,
    Enums,
    addTool,
  };
}
