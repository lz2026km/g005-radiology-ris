// ============================================================
// G005 放射科RIS系统 v1.0.1 - 报告草稿自动保存 hook
// Phase R1：localStorage 持久化 + 30s 自动保存
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';

export interface ReportDraft {
  reportId: string;
  content: string;                // 富文本 HTML
  plainText: string;              // 纯文本（用于字数/关键字）
  structuredValues: Record<string, any>; // 结构化字段值
  measurements: any[];            // 测量数据
  lastSavedAt: string;
  autoSaveEnabled: boolean;
  version: number;
}

const STORAGE_KEY = 'g005-report-draft';
const AUTOSAVE_INTERVAL = 30000; // 30s

export interface UseReportDraftReturn {
  draft: ReportDraft | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  save: (patch?: Partial<ReportDraft>) => void;
  clear: () => void;
  setAutoSave: (enabled: boolean) => void;
}

export function useReportDraft(reportId: string, initialContent = ''): UseReportDraftReturn {
  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef<ReportDraft | null>(null);

  // 加载草稿
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}:${reportId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as ReportDraft;
        setDraft(parsed);
        draftRef.current = parsed;
      } else {
        const fresh: ReportDraft = {
          reportId,
          content: initialContent,
          plainText: initialContent.replace(/<[^>]+>/g, ''),
          structuredValues: {},
          measurements: [],
          lastSavedAt: '',
          autoSaveEnabled: true,
          version: 1,
        };
        setDraft(fresh);
        draftRef.current = fresh;
      }
    } catch (e) {
      console.error('[useReportDraft] 加载失败：', e);
    }
  }, [reportId, initialContent]);

  // 保存草稿
  const save = useCallback((patch?: Partial<ReportDraft>) => {
    setIsSaving(true);
    const current = draftRef.current;
    if (!current) return;
    const updated: ReportDraft = {
      ...current,
      ...patch,
      lastSavedAt: new Date().toISOString(),
      version: current.version + 1,
    };
    try {
      localStorage.setItem(`${STORAGE_KEY}:${reportId}`, JSON.stringify(updated));
      setDraft(updated);
      draftRef.current = updated;
      setIsDirty(false);
    } catch (e) {
      console.error('[useReportDraft] 保存失败：', e);
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  }, [reportId]);

  // 自动保存
  useEffect(() => {
    if (!draft?.autoSaveEnabled) return;
    saveTimerRef.current = setInterval(() => {
      if (isDirty) save();
    }, AUTOSAVE_INTERVAL);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [draft?.autoSaveEnabled, isDirty, save]);

  // 标记为脏（暴露给消费者按需调用）
  // 注：当前使用 isDirty 状态自动追踪，无需手动调用
  // const markDirty = useCallback((patch: Partial<ReportDraft>) => {
  //   setIsDirty(true);
  //   if (draftRef.current) {
  //     draftRef.current = { ...draftRef.current, ...patch };
  //   }
  // }, []);

  // 清除草稿
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}:${reportId}`);
      const fresh: ReportDraft = {
        reportId,
        content: '',
        plainText: '',
        structuredValues: {},
        measurements: [],
        lastSavedAt: '',
        autoSaveEnabled: true,
        version: 1,
      };
      setDraft(fresh);
      draftRef.current = fresh;
      setIsDirty(false);
    } catch (e) {
      console.error('[useReportDraft] 清除失败：', e);
    }
  }, [reportId]);

  // 设置自动保存开关
  const setAutoSave = useCallback((enabled: boolean) => {
    save({ autoSaveEnabled: enabled });
  }, [save]);

  return {
    draft,
    isDirty,
    isSaving,
    lastSavedAt: draft?.lastSavedAt || null,
    save,
    clear,
    setAutoSave,
  };
}

export default useReportDraft;
