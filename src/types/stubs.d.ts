/**
 * Third-party library type stubs.
 *
 * Declarations have been split into per-library files under ./stubs/.
 * The individual files are picked up automatically by the tsconfig `include`
 * (src/**) once they live inside this directory.
 *
 * Layout:
 *   - ./stubs/cornerstone.d.ts  - @cornerstonejs/core, dicom-image-loader, tools
 *   - ./stubs/dcmjs.d.ts        - dcmjs
 *   - ./stubs/dicom-parser.d.ts - dicom-parser
 *   - ./stubs/antd.d.ts         - antd (ships its own types, no stub)
 *   - ./stubs/three.d.ts        - three (ships types + @types/three, no stub)
 *   - ./stubs/yjs.d.ts          - yjs (ships its own types, no stub)
 *   - ./stubs/misc.d.ts         - jspdf, dompurify
 *
 * comlink, zod and qrcode ship their own type definitions and are not stubbed.
 */
export {};
