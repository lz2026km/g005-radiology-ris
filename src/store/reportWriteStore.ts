import { create } from 'zustand';
import type { RadiologyReport, Measurement } from '../types';

interface PanelState {
  leftWidth: number;
  rightWidth: number;
  showLeft: boolean;
  showRight: boolean;
  layoutPreset: 'full' | 'compact' | 'focus';
}

interface EditorState {
  content: string;
  plainText: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
}

interface RightPanelState {
  activeTab: string;
}

interface ReportWriteStore {
  // Report data
  report: RadiologyReport | null;
  structuredFields: Record<string, string | number | string[]>;
  measurements: Measurement[];
  
  // Panels
  panel: PanelState;
  
  // Editor
  editor: EditorState;
  
  // Right panel
  rightPanel: RightPanelState;
  
  // Actions - Report
  setReport: (report: RadiologyReport) => void;
  updateReport: (partial: Partial<RadiologyReport>) => void;
  
  // Actions - Editor content
  setContent: (html: string, text: string) => void;
  markSaving: () => void;
  markSaved: (timestamp: string) => void;
  markDirty: () => void;
  setAutoSave: (enabled: boolean) => void;
  
  // Actions - Structured fields
  setStructuredField: (key: string, value: string | number | string[]) => void;
  clearStructuredFields: () => void;
  batchFillStructuredFields: (values: Record<string, string | number | string[]>) => void;
  
  // Actions - Measurements
  addMeasurement: (m: Measurement) => void;
  removeMeasurement: (id: string) => void;
  updateMeasurement: (id: string, partial: Partial<Measurement>) => void;
  clearMeasurements: () => void;
  
  // Actions - Panels
  setLeftWidth: (w: number) => void;
  setRightWidth: (w: number) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLayoutPreset: (preset: 'full' | 'compact' | 'focus') => void;
  
  // Actions - Right panel
  setRightTab: (tab: string) => void;
  
  // Actions - Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: (reportId: string) => void;
  clearLocalStorage: (reportId: string) => void;
}

const STORAGE_PREFIX = 'g005_report_write_';
const SAVE_DEBOUNCE_MS = 5000;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useReportWriteStore = create<ReportWriteStore>((set, get) => ({
  report: null,
  structuredFields: {},
  measurements: [],
  
  panel: {
    leftWidth: 240,
    rightWidth: 320,
    showLeft: true,
    showRight: true,
    layoutPreset: 'full',
  },
  
  editor: {
    content: '',
    plainText: '',
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    autoSaveEnabled: true,
    autoSaveInterval: 30,
  },
  
  rightPanel: {
    activeTab: 'templates',
  },
  
  setReport: (report) => set({ report }),
  updateReport: (partial) => set((s) => ({ report: s.report ? { ...s.report, ...partial } : null })),
  
  setContent: (html, text) => set((s) => ({ editor: { ...s.editor, content: html, plainText: text, isDirty: true } })),
  markSaving: () => set((s) => ({ editor: { ...s.editor, isSaving: true } })),
  markSaved: (timestamp) => set((s) => ({ editor: { ...s.editor, isSaving: false, isDirty: false, lastSavedAt: timestamp } })),
  markDirty: () => set((s) => ({ editor: { ...s.editor, isDirty: true } })),
  setAutoSave: (enabled) => set((s) => ({ editor: { ...s.editor, autoSaveEnabled: enabled } })),
  
  setStructuredField: (key, value) => set((s) => ({ structuredFields: { ...s.structuredFields, [key]: value } })),
  clearStructuredFields: () => set({ structuredFields: {} }),
  batchFillStructuredFields: (values) => set((s) => ({ structuredFields: { ...s.structuredFields, ...values } })),
  
  addMeasurement: (m) => set((s) => ({ measurements: [...s.measurements, m] })),
  removeMeasurement: (id) => set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),
  updateMeasurement: (id, partial) => set((s) => ({
    measurements: s.measurements.map((m) => (m.id === id ? { ...m, ...partial } : m)),
  })),
  clearMeasurements: () => set({ measurements: [] }),
  
  setLeftWidth: (w) => set((s) => ({ panel: { ...s.panel, leftWidth: w } })),
  setRightWidth: (w) => set((s) => ({ panel: { ...s.panel, rightWidth: w } })),
  toggleLeft: () => set((s) => ({ panel: { ...s.panel, showLeft: !s.panel.showLeft } })),
  toggleRight: () => set((s) => ({ panel: { ...s.panel, showRight: !s.panel.showRight } })),
  setLayoutPreset: (preset) => set((s) => ({ panel: { ...s.panel, layoutPreset: preset } })),
  
  setRightTab: (tab) => set(() => ({ rightPanel: { activeTab: tab } })),
  
  saveToLocalStorage: () => {
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      const s = get();
      const data = { editor: s.editor, structuredFields: s.structuredFields, measurements: s.measurements, panel: s.panel };
      if (s.report?.id) {
        localStorage.setItem(`${STORAGE_PREFIX}${s.report.id}`, JSON.stringify(data));
      }
    }, SAVE_DEBOUNCE_MS);
  },
  
  loadFromLocalStorage: (reportId) => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${reportId}`);
      if (raw) {
        const data = JSON.parse(raw);
        set((s) => ({ editor: { ...s.editor, ...data.editor }, structuredFields: data.structuredFields || {}, measurements: data.measurements || [], panel: { ...s.panel, ...data.panel } }));
      }
    } catch { /* ignore */ }
  },
  
  clearLocalStorage: (reportId) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${reportId}`);
  },
}));
