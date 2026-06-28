// [v3.0.6.8-83] 眼科 API client (统一封装)
// 对标: Topcon Synergy + Medisoft mediSIGHT + Zeiss FORUM + Heidelberg Eye Suite
import { api } from './client';

const EYE_API = '/api/v1/eye';

export interface EyeStudy {
  id: string;
  patientId: string;
  patientName: string;
  modality: 'OCT' | 'Fundus' | 'FA' | 'ICG' | 'SlitLamp' | 'VisualField' | 'Biometry';
  eye: 'OD' | 'OS' | 'OU';
  acquisitionDate: string;
  deviceModel: string;
  status: 'acquired' | 'reviewed' | 'reported' | 'archived';
  indications?: string;
}

export interface EyeAiDiagnosis {
  id: string;
  studyId: string;
  modelName: string;
  diagnosis: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: string;
  confirmed: boolean;
}

export interface IolConstant {
  model: string;
  aConst: number;
  pACD: number;
  surgeonFactor: number;
  haigisA: number;
  haigisB: number;
}

export interface IolCalculationResult {
  formula: 'SRK-T' | 'BarrettUniversalII' | 'Holladay2' | 'HofferQ' | 'HillRBF' | 'Kane';
  targetRefraction: number;
  predictedPower: number;
  predictedRefraction: number;
  astigmatism: number;
  axis: number;
}

export interface SubspecialtyExam {
  id: string;
  subspecialty: 'strabismus' | 'neuro' | 'oncology' | 'cornea' | 'cataract' | 'refractive' | 'contact-lens' | 'low-vision';
  patientId: string;
  diagnosis: string;
  examDate: string;
  findings: Record<string, any>;
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([_, v]) => v !== undefined && v !== '');
  if (filtered.length === 0) return '';
  return '?' + new URLSearchParams(filtered as [string, string][]).toString();
}

export const eyeApi = {
  // ===== Studies / PACS =====
  getStudies: (params?: Record<string, any>) => api.get(`${EYE_API}/studies${buildQuery(params)}`),
  getStudy: (id: string) => api.get(`${EYE_API}/studies/${id}`),
  getSeries: (studyId: string) => api.get(`${EYE_API}/studies/${studyId}/series`),
  getInstance: (studyId: string, instanceId: string) => api.get(`${EYE_API}/studies/${studyId}/instances/${instanceId}`),
  getDicomPaths: (studyId: string) => api.get(`${EYE_API}/studies/${studyId}/dicom-paths`),
  getAnnotations: (studyId: string) => api.get(`${EYE_API}/studies/${studyId}/annotations`),
  createAnnotation: (studyId: string, data: any) => api.post(`${EYE_API}/studies/${studyId}/annotations`, data),
  deleteAnnotation: (studyId: string, id: string) => api.delete(`${EYE_API}/studies/${studyId}/annotations/${id}`),
  getMosaic: (studyIds: string[]) => api.post(`${EYE_API}/studies/mosaic`, { studyIds }),
  getComparison: (studyIds: string[]) => api.post(`${EYE_API}/studies/comparison`, { studyIds }),
  getKeyImages: (studyId: string) => api.get(`${EYE_API}/studies/${studyId}/key-images`),

  // ===== RIS =====
  getAppointments: (params?: Record<string, any>) => api.get(`${EYE_API}/ris/appointments${buildQuery(params)}`),
  createAppointment: (data: any) => api.post(`${EYE_API}/ris/appointments`, data),
  updateAppointment: (id: string, data: any) => api.put(`${EYE_API}/ris/appointments/${id}`, data),
  cancelAppointment: (id: string) => api.delete(`${EYE_API}/ris/appointments/${id}`),
  getSurgeries: (params?: Record<string, any>) => api.get(`${EYE_API}/ris/surgeries${buildQuery(params)}`),
  scheduleSurgery: (data: any) => api.post(`${EYE_API}/ris/surgeries`, data),
  getReferrals: (params?: Record<string, any>) => api.get(`${EYE_API}/ris/referrals${buildQuery(params)}`),
  createReferral: (data: any) => api.post(`${EYE_API}/ris/referrals`, data),
  getFollowups: (patientId: string) => api.get(`${EYE_API}/ris/followups/${patientId}`),

  // ===== EMR =====
  getEmr: (patientId: string) => api.get(`${EYE_API}/emr/${patientId}`),
  updateEmr: (patientId: string, data: any) => api.put(`${EYE_API}/emr/${patientId}`, data),
  getEmrHistory: (patientId: string) => api.get(`${EYE_API}/emr/${patientId}/history`),
  getOcularExam: (patientId: string) => api.get(`${EYE_API}/emr/${patientId}/ocular-exam`),
  updateOcularExam: (patientId: string, data: any) => api.put(`${EYE_API}/emr/${patientId}/ocular-exam`, data),
  getPreop: (patientId: string) => api.get(`${EYE_API}/emr/${patientId}/preop`),
  getAnesthesia: (surgeryId: string) => api.get(`${EYE_API}/emr/anesthesia/${surgeryId}`),

  // ===== AI =====
  listModels: () => api.get(`${EYE_API}/ai/models`),
  runInference: (studyId: string, modelId: string) => api.post(`${EYE_API}/ai/inference`, { studyId, modelId }),
  getDiagnoses: (studyId: string) => api.get(`${EYE_API}/ai/diagnoses/${studyId}`),
  submitFeedback: (diagnosisId: string, feedback: { accepted: boolean; comment?: string }) =>
    api.post(`${EYE_API}/ai/feedback/${diagnosisId}`, feedback),
  getHeatmap: (studyId: string) => api.get(`${EYE_API}/ai/heatmap/${studyId}`),
  getRocCurve: (modelId: string) => api.get(`${EYE_API}/ai/roc/${modelId}`),

  // ===== IOL Calculator =====
  getIolConstants: (model: string) => api.get(`${EYE_API}/iol/constant/${model}`),
  calculateIol: (data: {
    model: string;
    formula: string;
    axialLength: number;
    k1: number;
    k2: number;
    acd?: number;
    targetRefraction?: number;
  }) => api.post(`${EYE_API}/iol/calculate`, data),

  // ===== Reports =====
  getReports: (params?: Record<string, any>) => api.get(`${EYE_API}/reports${buildQuery(params)}`),
  getReport: (id: string) => api.get(`${EYE_API}/reports/${id}`),
  createReport: (data: any) => api.post(`${EYE_API}/reports`, data),
  updateReport: (id: string, data: any) => api.put(`${EYE_API}/reports/${id}`, data),
  signReport: (id: string, signature: string) => api.post(`${EYE_API}/reports/${id}/sign`, { signature }),
  printReport: (id: string) => api.post(`${EYE_API}/reports/${id}/print`),
  getTemplates: () => api.get(`${EYE_API}/reports/templates`),
  aiAssistReport: (studyId: string, prompt: string) => api.post(`${EYE_API}/reports/ai-assist`, { studyId, prompt }),

  // ===== KPI =====
  getKpis: (params?: Record<string, any>) => api.get(`${EYE_API}/kpis${buildQuery(params)}`),
  getKpiTrends: (metric: string, period: string) => api.get(`${EYE_API}/kpis/trends?metric=${metric}&period=${period}`),
  getDoctorPerformance: (doctorId?: string) => api.get(`${EYE_API}/kpis/doctors${doctorId ? `/${doctorId}` : ''}`),

  // ===== Subspecialty =====
  getSubspecialtyRecords: (sub: string, params?: Record<string, any>) =>
    api.get(`${EYE_API}/subspecialty/${sub}/records${buildQuery(params)}`),
  getSubspecialtyRecord: (sub: string, id: string) =>
    api.get(`${EYE_API}/subspecialty/${sub}/records/${id}`),
  createSubspecialtyRecord: (sub: string, data: any) =>
    api.post(`${EYE_API}/subspecialty/${sub}/records`, data),

  // ===== Patient Journey =====
  getJourney: (patientId: string) => api.get(`${EYE_API}/journey/${patientId}`),
  getEducation: (patientId: string) => api.get(`${EYE_API}/journey/${patientId}/education`),
  getInsurance: (patientId: string) => api.get(`${EYE_API}/journey/${patientId}/insurance`),
  getJourneyNotifications: (patientId: string) => api.get(`${EYE_API}/journey/${patientId}/notifications`),
};

export default eyeApi;