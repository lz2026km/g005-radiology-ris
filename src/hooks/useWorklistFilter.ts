/**
 * useWorklistFilter Hook - 工作列表筛选状态管理
 * G005 Radiology RIS System
 */
import { useReducer, useCallback } from 'react';
import type { ModalityType, PatientType, Priority, ExamStatus } from '../types';

// ============= 类型定义 =============
interface WorklistFilterState {
  search: string;
  dateStart: string;
  dateEnd: string;
  modalities: ModalityType[];
  patientTypes: PatientType[];
  priorities: Priority[];
  statuses: ExamStatus[];
  doctorId: string;
}

type WorklistFilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_DATE_RANGE'; payload: { dateStart?: string; dateEnd?: string } }
  | { type: 'SET_MODALITIES'; payload: ModalityType[] }
  | { type: 'TOGGLE_MODALITY'; payload: ModalityType }
  | { type: 'SET_PATIENT_TYPES'; payload: PatientType[] }
  | { type: 'TOGGLE_PATIENT_TYPE'; payload: PatientType }
  | { type: 'SET_PRIORITIES'; payload: Priority[] }
  | { type: 'TOGGLE_PRIORITY'; payload: Priority }
  | { type: 'SET_STATUSES'; payload: ExamStatus[] }
  | { type: 'TOGGLE_STATUS'; payload: ExamStatus }
  | { type: 'SET_DOCTOR'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialFilterState: WorklistFilterState = {
  search: '',
  dateStart: '',
  dateEnd: '',
  modalities: [],
  patientTypes: [],
  priorities: [],
  statuses: [],
  doctorId: '',
};

function filterReducer(
  state: WorklistFilterState,
  action: WorklistFilterAction
): WorklistFilterState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateStart: action.payload.dateStart ?? state.dateStart,
        dateEnd: action.payload.dateEnd ?? state.dateEnd,
      };
    
    case 'SET_MODALITIES':
      return { ...state, modalities: action.payload };
    
    case 'TOGGLE_MODALITY':
      return {
        ...state,
        modalities: state.modalities.includes(action.payload)
          ? state.modalities.filter(m => m !== action.payload)
          : [...state.modalities, action.payload],
      };
    
    case 'SET_PATIENT_TYPES':
      return { ...state, patientTypes: action.payload };
    
    case 'TOGGLE_PATIENT_TYPE':
      return {
        ...state,
        patientTypes: state.patientTypes.includes(action.payload)
          ? state.patientTypes.filter(p => p !== action.payload)
          : [...state.patientTypes, action.payload],
      };
    
    case 'SET_PRIORITIES':
      return { ...state, priorities: action.payload };
    
    case 'TOGGLE_PRIORITY':
      return {
        ...state,
        priorities: state.priorities.includes(action.payload)
          ? state.priorities.filter(p => p !== action.payload)
          : [...state.priorities, action.payload],
      };
    
    case 'SET_STATUSES':
      return { ...state, statuses: action.payload };
    
    case 'TOGGLE_STATUS':
      return {
        ...state,
        statuses: state.statuses.includes(action.payload)
          ? state.statuses.filter(s => s !== action.payload)
          : [...state.statuses, action.payload],
      };
    
    case 'SET_DOCTOR':
      return { ...state, doctorId: action.payload };
    
    case 'RESET_FILTERS':
      return initialFilterState;
    
    default:
      return state;
  }
}

// ============= Hook =============
interface UseWorklistFilterReturn {
  filters: WorklistFilterState;
  setSearch: (search: string) => void;
  setDateRange: (dateStart?: string, dateEnd?: string) => void;
  toggleModality: (modality: ModalityType) => void;
  togglePatientType: (type: PatientType) => void;
  togglePriority: (priority: Priority) => void;
  toggleStatus: (status: ExamStatus) => void;
  setDoctor: (doctorId: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useWorklistFilter(): UseWorklistFilterReturn {
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

  const setSearch = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, []);

  const setDateRange = useCallback((dateStart?: string, dateEnd?: string) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: { dateStart, dateEnd } });
  }, []);

  const toggleModality = useCallback((modality: ModalityType) => {
    dispatch({ type: 'TOGGLE_MODALITY', payload: modality });
  }, []);

  const togglePatientType = useCallback((type: PatientType) => {
    dispatch({ type: 'TOGGLE_PATIENT_TYPE', payload: type });
  }, []);

  const togglePriority = useCallback((priority: Priority) => {
    dispatch({ type: 'TOGGLE_PRIORITY', payload: priority });
  }, []);

  const toggleStatus = useCallback((status: ExamStatus) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: status });
  }, []);

  const setDoctor = useCallback((doctorId: string) => {
    dispatch({ type: 'SET_DOCTOR', payload: doctorId });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const hasActiveFilters = !(
    filters.search === '' &&
    filters.dateStart === '' &&
    filters.dateEnd === '' &&
    filters.modalities.length === 0 &&
    filters.patientTypes.length === 0 &&
    filters.priorities.length === 0 &&
    filters.statuses.length === 0 &&
    filters.doctorId === ''
  );

  return {
    filters,
    setSearch,
    setDateRange,
    toggleModality,
    togglePatientType,
    togglePriority,
    toggleStatus,
    setDoctor,
    resetFilters,
    hasActiveFilters,
  };
}

export default useWorklistFilter;