// Module 7: Orthopedic & MSK Imaging (200 points)
export {
  measureCobbAngle, measureJointSpaceWidth, measureLimbAlignment,
  fitCircleToFemoralHead, generateMeasurementReport,
  type AngleMeasurement, type AngleMeasurementType,
  type LinearMeasurement, type LinearMeasurementType,
  type LimbAlignmentResult, type CircleFit,
  type MeasurementReport, type Point2D, type Point3D,
} from './measurements'

export {
  assessDisc, computeSpinalAlignment, classifyVertebraFracture, generateSpineReport,
  type DiscAssessment, type DiscLevel, type DiscDegenerationGrade,
  type SpinalCanalGrade, type VertebraLevel, type SpineFractureType,
  type AOSpineFractureSubtype, type SpinalAlignmentResult,
  type VertebraAssessment, type SpineAnalysisReport,
} from './spine'

export {
  gradeOsteoarthritis, assessCartilageRegion, assessMeniscus,
  assessLigament, analyzeJoint, generateJointReport,
  type JointType, type OsteoarthritisGrade, type KellgrenLawrenceGrade,
  type JointEffusion, type LabrumAssessment, type MeniscusAssessment,
  type LigamentAssessment, type CartilageAssessment, type JointAssessment,
  type JointAnalysisReport,
} from './joint'

export {
  assessFracture, assessDislocation, assessSoftTissueInjury,
  computeTraumaScore, generateTraumaAssessment,
  type BoneSegment, type FracturePattern, type FractureDisplacement,
  type AOClassificationCode, type FractureAssessment,
  type DislocationAssessment, type SoftTissueInjury,
  type TraumaAssessmentResult,
} from './trauma'

export {
  assessBoneTumor, assessTumorFollowUp, generateBoneTumorAnalysis,
  type TumorMatrix, type TumorMargin, type PeriostealReaction,
  type TumorLocation, type BoneTumorAssessment,
  type TumorFollowUp, type BoneTumorAnalysisResult,
} from './tumor'

export {
  interpretDxa, classifyOsteoporosis, calculateFrax,
  assessVertebralFracture, generateBmdReport,
  type BmdSite, type OsteoporosisCategory, type DxaMeasurement,
  type DxaResult, type FraxInput, type FraxResult,
  type VertebralFractureAssessmentResult, type BmdAnalysisReport,
} from './bmd'

export {
  assessAcl, assessRotatorCuff, mapCartilage,
  assessReturnToPlay, generateSportsInjuryAssessment,
  type TearPattern, type TearChronicity,
  type AclAssessment, type RotatorCuffAssessment,
  type CartilageMappingResult, type ReturnToPlayAssessment,
  type SportsInjuryAssessment,
} from './sports'
