/**
 * useReportDraft Hook - 报告草稿状态管理
 * G005 Radiology RIS System
 */
import { useReducer, useCallback } from 'react';
import type { ReportStatus } from '../types';

// ============= 类型定义 =============
interface ReportDraftState {
  findings: string;
  diagnosis: string;
  impression: string;
  recommendations: string;
  criticalFinding: boolean;
  criticalFindingDetails: string;
  templateId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
}

type ReportDraftAction =
  | { type: 'SET_FINDINGS'; payload: string }
  | { type: 'SET_DIAGNOSIS'; payload: string }
  | { type: 'SET_IMPRESSION'; payload: string }
  | { type: 'SET_RECOMMENDATIONS'; payload: string }
  | { type: 'SET_CRITICAL_FINDING'; payload: { enabled: boolean; details?: string } }
  | { type: 'APPLY_TEMPLATE'; payload: { templateId: string; content: string } }
  | { type: 'MARK_SAVED'; payload: Date }
  | { type: 'RESET_DRAFT' };

const initialDraftState: ReportDraftState = {
  findings: '',
  diagnosis: '',
  impression: '',
  recommendations: '',
  criticalFinding: false,
  criticalFindingDetails: '',
  templateId: null,
  isDirty: false,
  lastSaved: null,
};

function draftReducer(
  state: ReportDraftState,
  action: ReportDraftAction
): ReportDraftState {
  switch (action.type) {
    case 'SET_FINDINGS':
      return { ...state, findings: action.payload, isDirty: true };
    
    case 'SET_DIAGNOSIS':
      return { ...state, diagnosis: action.payload, isDirty: true };
    
    case 'SET_IMPRESSION':
      return { ...state, impression: action.payload, isDirty: true };
    
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, isDirty: true };
    
    case 'SET_CRITICAL_FINDING':
      return {
        ...state,
        criticalFinding: action.payload.enabled,
        criticalFindingDetails: action.payload.details ?? state.criticalFindingDetails,
        isDirty: true,
      };
    
    case 'APPLY_TEMPLATE':
      return {
        ...state,
        templateId: action.payload.templateId,
        findings: action.payload.content,
        isDirty: true,
      };
    
    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSaved: action.payload };
    
    case 'RESET_DRAFT':
      return initialDraftState;
    
    default:
      return state;
  }
}

// ============= Hook =============
interface UseReportDraftReturn {
  draft: ReportDraftState;
  setFindings: (text: string) => void;
  setDiagnosis: (text: string) => void;
  setImpression: (text: string) => void;
  setRecommendations: (text: string) => void;
  setCriticalFinding: (enabled: boolean, details?: string) => void;
  applyTemplate: (templateId: string, content: string) => void;
  markSaved: () => void;
  resetDraft: () => void;
  isComplete: boolean;
  completenessScore: number;
}

export function useReportDraft(): UseReportDraftReturn {
  const [draft, dispatch] = useReducer(draftReducer, initialDraftState);

  const setFindings = useCallback((text: string) => {
    dispatch({ type: 'SET_FINDINGS', payload: text });
  }, []);

  const setDiagnosis = useCallback((text: string) => {
    dispatch({ type: 'SET_DIAGNOSIS', payload: text });
  }, []);

  const setImpression = useCallback((text: string) => {
    dispatch({ type: 'SET_IMPRESSION', payload: text });
  }, []);

  const setRecommendations = useCallback((text: string) => {
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: text });
  }, []);

  const setCriticalFinding = useCallback((enabled: boolean, details?: string) => {
    dispatch({ type: 'SET_CRITICAL_FINDING', payload: { enabled, details } });
  }, []);

  const applyTemplate = useCallback((templateId: string, content: string) => {
    dispatch({ type: 'APPLY_TEMPLATE', payload: { templateId, content } });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED', payload: new Date() });
  }, []);

  const resetDraft = useCallback(() => {
    dispatch({ type: 'RESET_DRAFT' });
  }, []);

  // 计算完整度
  const isComplete = !!(
    draft.findings.trim().length > 0 &&
    (draft.diagnosis.trim().length > 0 || draft.impression.trim().length > 0)
  );

  const completenessScore = (() => {
    let score = 0;
    if (draft.findings.trim()) score += 25;
    if (draft.diagnosis.trim()) score += 25;
    if (draft.impression.trim()) score += 25;
    if (draft.recommendations.trim()) score += 25;
    return score;
  })();

  return {
    draft,
    setFindings,
    setDiagnosis,
    setImpression,
    setRecommendations,
    setCriticalFinding,
    applyTemplate,
    markSaved,
    resetDraft,
    isComplete,
    completenessScore,
  };
}

export default useReportDraft;