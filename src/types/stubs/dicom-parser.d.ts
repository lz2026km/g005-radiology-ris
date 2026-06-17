/**
 * dicom-parser stub - the package does not ship TypeScript types and there is
 * no @types/dicom-parser on npm. The app only consumes parseDicom / the default
 * export; callers narrow the result.
 */

declare module 'dicom-parser' {
  const dicomParser: Record<string, unknown>;
  const parseDicom: (buffer: ArrayBuffer | Uint8Array) => Record<string, unknown>;

  export { parseDicom };
  export default dicomParser;
}
