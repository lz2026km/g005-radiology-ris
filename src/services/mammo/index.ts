// Module 6: Mammography & Women's Imaging
export {
  createMammogramExam, recordMammoAcquisition, calculateAcquisitionQuality,
  advanceMammoWorkflow, classifyBreastDensity,
  DEFAULT_MAMMO_WORKFLOW_CONFIG,
  type MammogramExam, type MammoAcquisition, type MammoWorkflowConfig,
  type MammoViewPosition, type MammoLaterality, type MammoAcquisitionType,
  type BreastDensity, type MammoWorkflowStep,
} from './mammoWorkflow'

export {
  createBUSLesion, calculateBiRadsFromLesions, summarizeBUSFindings,
  calculateElasticityScore,
  type BUSExam, type BUSLesion, type BUSFindingSummary,
  type BUSBiRadsCategory, type BUSLesionShape, type BUSLesionMargin,
  type BUSLesionEchoPattern, type BUSView,
} from './breastUltrasound'

export {
  createBreastMRIExam, classifyKineticCurve, calculateAdcValue,
  assessBackgroundParenchymalEnhancement, calculatePerfusionMetrics,
  type BreastMRIExam, type MRILesion, type MRIPerfusionMetrics,
  type MRIBiRadsCategory, type MRIKineticCurve, type MRILesionType,
  type MRIBackgroundParenchymal,
} from './breastMri'

export {
  assessRiskLevel, generateScreeningSchedule, calculateScreeningMetrics,
  comparePriorScreens, estimateGailRisk,
  type ScreeningPatient, type ScreeningSession, type ScreeningDashboard,
  type ScreeningSchedule, type RiskLevel, type ScreeningModality,
  type ScreeningOutcome, type BRCAStatus,
} from './breastCancerScreening'

export {
  createBiopsyProcedure, determineMolecularSubtype, calculateNottinghamGrade,
  assessMarginStatus, generateBiopsyReport,
  type BiopsyProcedure, type PathologyResult, type BiopsyReport,
  type BiopsyModality, type BiopsyTechnique, type PathologicalDiagnosis,
  type HistologicalType, type MarkerClipType,
} from './breastBiopsy'

export {
  createPostOpRecord, scheduleFollowUpVisit, getRecommendedSchedule,
  assessPostOpVisit, buildFollowUpTimeline, calculateSurvivalMetrics,
  type PostOpRecord, type FollowUpVisit, type FollowUpTimeline,
  type SurgeryType, type FollowUpModality, type PostOpStatus,
  type ComplicationType,
} from './postOpFollowUp'
