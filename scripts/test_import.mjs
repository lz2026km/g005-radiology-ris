import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:5191/',
  pretendToBeVisual: true,
});

// Setup global
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
global.SVGElement = dom.window.SVGElement;
global.MessageChannel = class MessageChannel {
  constructor() {
    this.port1 = { postMessage: () => {}, close: () => {} };
    this.port2 = { postMessage: () => {}, close: () => {} };
  }
};

// Try to import the ReportWritePage module
console.log('Starting import test...');
try {
  const mod = await import('./src/pages/ReportWritePage.tsx');
  console.log('Module loaded:', Object.keys(mod));
} catch (e) {
  console.error('IMPORT ERROR:', e.message);
  console.error('Stack:', e.stack?.split('\n').slice(0, 20).join('\n'));
}