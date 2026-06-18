/**
 * G005 放射RIS系统 v3.0.6.1 - B1 GE Centricity 对标组件统一导出
 */
export { AITriage, type AITriageProps } from './AITriage/AITriage'
export { TriageCard, type TriageCardProps, type TriageItem } from './AITriage/TriageCard'
export { TriageQueue, type TriageQueueProps } from './AITriage/TriageQueue'
export { TriageStats, type TriageStatsProps, type TriageCategory } from './AITriage/TriageStats'
export { PriorityBadge, type PriorityBadgeProps, type Priority } from './AITriage/PriorityBadge'

export { SmartWorklist, type SmartWorklistProps, type SmartWorklistItem } from './SmartWorklist/Worklist'
export { ScoreCalculator, computeScore, type ScoreBreakdown } from './SmartWorklist/ScoreCalculator'
export { PriorityEngine } from './SmartWorklist/PriorityEngine'
export { FilterPanel, type FilterPanelProps, type WorklistFilter } from './SmartWorklist/FilterPanel'
export { WorklistHeader, type WorklistHeaderProps, type WorklistHeaderStats } from './SmartWorklist/WorklistHeader'

export { CriticalFlow, type CriticalFlowProps, type CriticalFlowItem } from './Critical/CriticalFlow'
export { CriticalTimeline, type CriticalTimelineProps } from './Critical/CriticalTimeline'
export { CriticalAlert, type CriticalAlertProps } from './Critical/CriticalAlert'
export { AcknowledgeModal, type AcknowledgeModalProps } from './Critical/AcknowledgeModal'
export { EscalationRules, type EscalationRulesProps, type EscalationRule } from './Critical/EscalationRules'

export { DoseTracker, type DoseTrackerProps, type DoseRecord } from './Dose/DoseTracker'
export { DoseChart, type DoseChartProps } from './Dose/DoseChart'
export { DoseAlert, type DoseAlertProps } from './Dose/DoseAlert'
export { CumulativeReport, type CumulativeReportProps } from './Dose/CumulativeReport'
export { ProtocolSelector, type ProtocolSelectorProps } from './Dose/ProtocolSelector'

export { StructuredReport, type StructuredReportProps } from './SR/StructuredReport'
export { TemplatePicker, type TemplatePickerProps, type SRTemplateMeta, type SRFieldMeta } from './SR/TemplatePicker'
export { FieldEditor, type FieldEditorProps, type SRField, type SRFieldValue } from './SR/FieldEditor'
export { SRPreview, type SRPreviewProps } from './SR/SRPreview'

export { TeachingFiles, type TeachingCase } from './Teach/TeachingFiles'
export { CaseLibrary, type CaseLibraryProps } from './Teach/CaseLibrary'
export { CaseEditor, type CaseEditorProps } from './Teach/CaseEditor'
export { AnnotationTool, type AnnotationToolProps, type AnnotationItem, type AnnotationToolType } from './Teach/AnnotationTool'

export { MammoCAD, type MammoCADProps } from './Mammo/MammoCAD'
export { MammoOverlay, type MammoOverlayProps, type MammoLesionMark, type MammoLesionType } from './Mammo/MammoOverlay'