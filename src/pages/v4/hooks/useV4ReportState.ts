import { useState, useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';
import { REPORT_WRITING_CONTEXT_MOCK, REPORT_DRAFTS_MOCK, KEYWORD_HIGHLIGHTS_MOCK, PRE_SUBMIT_SCORE_MOCK } from '@data/reportWritingMock';
import { getWritingContext, getPreSubmitScore, listDrafts, submitReport, autoSaveDocument } from '@services/writing/writingService';
import type { ReportWritingContext, PreSubmitScore, ReportDraft, KeywordHighlight, RichEditorDocument } from '@/types/R3/R3.WRITING';

export interface V4ReportCombined {
  reportId: string;
  context: ReportWritingContext;
  preScore: PreSubmitScore;
  drafts: ReportDraft[];
  keywords: KeywordHighlight[];
  activeSection: 'findings' | 'impression' | 'recommendation' | 'all';
  fullscreen: boolean;
  isDirty: boolean;
  submitting: boolean;
}

export interface V4ReportActions {
  setSection: (section: V4ReportCombined['activeSection']) => void;
  updateFields: (values: Record<string, unknown>) => void;
  updateDocument: (doc: RichEditorDocument) => void;
  saveDraft: () => Promise<void>;
  submitReportAction: () => Promise<void>;
  setFullscreen: (v: boolean) => void;
  toggleFullscreen: () => void;
  showSubmit: boolean;
  setShowSubmit: (v: boolean) => void;
}

export function useV4ReportState(reportId?: string): V4ReportCombined & V4ReportActions {
  const [state, setState] = useState<V4ReportCombined>({
    reportId: reportId || 'rpt-038',
    context: REPORT_WRITING_CONTEXT_MOCK,
    preScore: PRE_SUBMIT_SCORE_MOCK,
    drafts: REPORT_DRAFTS_MOCK,
    keywords: KEYWORD_HIGHLIGHTS_MOCK,
    activeSection: 'all',
    fullscreen: false,
    isDirty: false,
    submitting: false,
  });

  const [showSubmit, setShowSubmit] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const rid = reportId || 'rpt-038';
    Promise.all([
      getWritingContext(rid),
      getPreSubmitScore(rid),
      listDrafts(rid),
    ]).then(([ctx, score, drafts]) => {
      setState((s) => ({ ...s, context: ctx, preScore: score, drafts }));
    });
  }, [reportId]);

  const saveDraftFn = useCallback(async () => {
    await autoSaveDocument(state.reportId, state.context.document.html, state.context.document.plainText);
    setState((s) => ({ ...s, isDirty: false }));
  }, [state.reportId, state.context.document]);

  useEffect(() => {
    if (state.isDirty && !autoSaveTimer.current) {
      autoSaveTimer.current = setTimeout(() => {
        saveDraftFn();
        autoSaveTimer.current = undefined;
      }, 5000);
    }
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = undefined;
      }
    };
  }, [state.isDirty, saveDraftFn]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.isDirty]);

  const updateFields = useCallback((values: Record<string, unknown>) => {
    setState((s) => ({ ...s, context: { ...s.context, fields: values }, isDirty: true }));
  }, []);

  const updateDocument = useCallback((doc: RichEditorDocument) => {
    setState((s) => ({ ...s, context: { ...s.context, document: doc }, isDirty: true }));
  }, []);

  const setSection = useCallback((section: V4ReportCombined['activeSection']) => {
    setState((s) => ({ ...s, activeSection: section }));
  }, []);

  const saveDraft = useCallback(async () => {
    await saveDraftFn();
    message.success('草稿已保存');
  }, [saveDraftFn]);

  const submitReportAction = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true }));
    const r = await submitReport(state.reportId, {
      finalScore: state.preScore.score,
      structured: state.context.fields,
      html: state.context.document.html,
    });
    setState((s) => ({ ...s, submitting: false }));
    if (r.success) {
      message.success('报告已提交审核');
      setShowSubmit(false);
    }
  }, [state.reportId, state.preScore, state.context]);

  const setFullscreen = useCallback((v: boolean) => {
    setState((s) => ({ ...s, fullscreen: v }));
    if (v) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState((s) => {
      const next = !s.fullscreen;
      if (next) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
      return { ...s, fullscreen: next };
    });
  }, []);

  return {
    ...state,
    showSubmit,
    setShowSubmit,
    setSection,
    updateFields,
    updateDocument,
    saveDraft,
    submitReportAction,
    setFullscreen,
    toggleFullscreen,
  };
}
