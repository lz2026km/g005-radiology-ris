/**
 * Miscellaneous library stubs.
 *
 * jspdf and dompurify do not ship TypeScript types and have no @types/*
 * packages installed. comlink, zod and qrcode all ship types, so they are not
 * declared here.
 */

declare module 'jspdf' {
  class jsPDF {
    constructor(options?: Record<string, unknown>);
    addImage(...args: unknown[]): jsPDF;
    addPage(...args: unknown[]): jsPDF;
    setFontSize(size: number): jsPDF;
    setFont(font: string, style?: string): jsPDF;
    text(text: string | string[], x: number, y: number, options?: Record<string, unknown>): jsPDF;
    save(filename: string): jsPDF;
    output(type?: string, options?: Record<string, unknown>): string | Blob;
    internal: Record<string, unknown>;
  }

  export { jsPDF };
}

declare module 'dompurify' {
  interface DompurifyInstance {
    (dirty: string, config?: unknown): string;
    sanitize(dirty: string, config?: unknown): string;
    setConfig(config: unknown): void;
    addHook(hookName: string, callback: (...args: unknown[]) => unknown): void;
    removeHook(hookName: string): void;
    removeAllHooks(): void;
  }
  const dompurify: DompurifyInstance;
  const sanitize: (dirty: string, config?: unknown) => string;

  export default dompurify;
  export { sanitize };
}

declare namespace DOMPurify {
  type Config = Record<string, unknown>;
  type HookEvent = {
    beforeSanitizeElements: { node: Element; };
    uponSanitizeElement: { node: Element; data: { tagName: string; allowedTags: Record<string, boolean>; }; };
    afterSanitizeElements: { target: Element; };
    beforeSanitizeAttributes: { attrName: string; attrValue: string; keepAttr: boolean; };
    uponSanitizeAttribute: { attrName: string; attrValue: string; keepAttr: boolean; };
    afterSanitizeAttributes: { body: Element; };
    beforeSanitizeShadowDOM: { shadowRoot: ShadowRoot | null; };
    uponSanitizeShadowNode: { node: Node; };
    afterSanitizeShadowDOM: { shadowRoot: ShadowRoot; };
    afterSanitizeShadowNode: { node: Node; };
    beforeSanitizeText: { textNode: Text; };
    uponSanitizeTextNode: { textNode: Text; };
    afterSanitizeText: { textNode: Text; };
  };
}
