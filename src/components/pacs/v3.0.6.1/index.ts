/**
 * G005 放射RIS系统 v3.0.6.1 - 顶层聚合 (PACS 4 厂商 + AI + 跨域)
 */
export * from './B1'
export * from './B2'
export * from './B3'
export * from './B7'

export { AIDashboard } from './AI/AIDashboard'
export { AlgorithmRegistry, type AIAlgorithm } from './AI/AlgorithmRegistry'
export { InferenceMonitor, type InferenceRecord } from './AI/InferenceMonitor'
export { ModelCard, type ModelCardProps } from './AI/ModelCard'
export { ExplainabilityPanel, type ExplainabilityPanelProps } from './AI/ExplainabilityPanel'
export { FederatedLearning, type FederatedNode } from './AI/FederatedLearning'

export { WorkflowDesigner, type WorkflowDef } from './WORKFLOW/WorkflowDesigner'
export { TaskChain, type TaskNode, type TaskChainProps, type TaskType } from './WORKFLOW/TaskChain'

export { StandardReport, type StandardReportProps } from './STANDARD/StandardReport'
export { TermMapper, type TermMapperProps, type MappingTerm } from './STANDARD/TermMapper'

export { ComponentLibrary, type ComponentLibraryProps } from './UI/ComponentLibrary'

export { PerformanceMonitor, type PerformanceMonitorProps } from './PERF/PerformanceMonitor'

export { SecurityAudit, type SecurityAuditProps, type AuditLog } from './SECURITY/SecurityAudit'

export const V3061_VERSION = 'v3.0.6.1'
export const V3061_BUILD = '20240618'