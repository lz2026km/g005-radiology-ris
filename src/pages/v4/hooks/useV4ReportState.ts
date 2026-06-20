import { useState, useCallback, useRef, useEffect } from "react";
import { message } from "antd";
import type {
  V4Report,
  V4ReportContent,
  V4StructuredData,
  V4Draft,
  V4PriorReport,
  V4SimilarCase,
  V4Collaborator,
} from "../types";
import {
  MOCK_REPORT,
  MOCK_PRIOR_REPORTS,
  MOCK_SIMILAR_CASES,
  MOCK_COLLABORATORS,
  MOCK_DRAFTS,
} from "../data/v4MockData";
import { v4Storage } from "../utils/v4Storage";

export interface V4ReportState {
  report: V4Report;
  priorReports: V4PriorReport[];
  similarCases: V4SimilarCase[];
  collaborators: V4Collaborator[];
  drafts: V4Draft[];
  activeSection: "findings" | "impression" | "recommendation" | "all";
  fullscreen: boolean;
  isDirty: boolean;
  autoSaveStatus: "idle" | "saving" | "saved";
  submitting: boolean;
}

export interface V4ReportActions {
  setSection: (section: V4ReportState["activeSection"]) => void;
  updateContent: (content: Partial<V4ReportContent>) => void;
  updateStructured: (structured: Partial<V4StructuredData>) => void;
  saveDraft: () => void;
  submitReport: () => Promise<void>;
  setFullscreen: (v: boolean) => void;
  toggleFullscreen: () => void;
  format: (cmd: string) => void;
}

export function useV4ReportState(
  reportId?: string,
): V4ReportState & V4ReportActions {
  const [state, setState] = useState<V4ReportState>(() => {
    const saved = v4Storage.getItem<V4ReportState["report"]>(
      `report-${reportId || "rpt-038"}`,
    );
    return {
      report: saved || { ...MOCK_REPORT, id: reportId || "rpt-038" },
      priorReports: MOCK_PRIOR_REPORTS,
      similarCases: MOCK_SIMILAR_CASES,
      collaborators: MOCK_COLLABORATORS,
      drafts: MOCK_DRAFTS,
      activeSection: "all",
      fullscreen: false,
      isDirty: false,
      autoSaveStatus: "idle",
      submitting: false,
    };
  });

  const autoSaveTimer = useRef<NodeJS.Timeout>();

  const saveDraft = useCallback(() => {
    const draft: V4Draft = {
      id: `draft-${Date.now()}`,
      content: state.report.content,
      structured: state.report.structured,
      timestamp: Date.now(),
      versionLabel: `v${state.drafts.length + 1}`,
      autoSaved: true,
    };
    setState((s) => ({
      ...s,
      drafts: [draft, ...s.drafts],
      isDirty: false,
      autoSaveStatus: "saved",
    }));
    v4Storage.setItem(`report-${state.report.id}`, state.report);
  }, [state.report, state.drafts.length]);

  useEffect(() => {
    if (state.isDirty && !autoSaveTimer.current) {
      autoSaveTimer.current = setTimeout(() => {
        setState((s) => ({ ...s, autoSaveStatus: "saving" }));
        setTimeout(() => {
          saveDraft();
          autoSaveTimer.current = undefined;
        }, 800);
      }, 5000);
    }
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = undefined;
      }
    };
  }, [state.isDirty, saveDraft]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.isDirty]);

  const updateContent = useCallback((content: Partial<V4ReportContent>) => {
    setState((s) => ({
      ...s,
      report: { ...s.report, content: { ...s.report.content, ...content } },
      isDirty: true,
      autoSaveStatus: "idle",
    }));
  }, []);

  const updateStructured = useCallback(
    (structured: Partial<V4StructuredData>) => {
      setState((s) => ({
        ...s,
        report: {
          ...s.report,
          structured: { ...s.report.structured, ...structured },
        },
        isDirty: true,
        autoSaveStatus: "idle",
      }));
    },
    [],
  );

  const setSection = useCallback((section: V4ReportState["activeSection"]) => {
    setState((s) => ({ ...s, activeSection: section }));
  }, []);

  const submitReport = useCallback(async () => {
    setState((s) => ({ ...s, submitting: true }));
    await new Promise((r) => setTimeout(r, 1500));
    message.success("报告已提交审核");
    setState((s) => ({
      ...s,
      submitting: false,
      report: { ...s.report, status: "submitted" },
      isDirty: false,
    }));
  }, []);

  const setFullscreen = useCallback((v: boolean) => {
    setState((s) => ({ ...s, fullscreen: v }));
    if (v) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState((s) => {
      const next = !s.fullscreen;
      if (next) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
      return { ...s, fullscreen: next };
    });
  }, []);

  const format = useCallback((cmd: string) => {
    document.execCommand(cmd, false);
  }, []);

  return {
    ...state,
    setSection,
    updateContent,
    updateStructured,
    saveDraft,
    submitReport,
    setFullscreen,
    toggleFullscreen,
    format,
  };
}
