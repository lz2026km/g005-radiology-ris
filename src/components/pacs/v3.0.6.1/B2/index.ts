/**
 * G005 放射RIS系统 v3.0.6.1 - B2 Siemens syngo 对标组件统一导出
 * SRField 重命名为 SiemensSRField 以避免与 B1 冲突
 */
export { VolumeRenderer, type VolumeRendererProps, type VRPreset } from './VIS3D/VolumeRenderer'
export { MIPPanel, type MIPPanelProps } from './VIS3D/MIPPanel'
export { MPRView, type MPRViewProps } from './VIS3D/MPRView'
export { VRTools, type VRToolsProps } from './VIS3D/VRTools'
export { ThreeDControls, type ThreeDControlsProps } from './VIS3D/ThreeDControls'

export { AIRadChest, type AIRadChestProps } from './AIRAD/AIRadChest'
export { DetectionList, type DetectionListProps, type ChestFinding, type ChestFindingType } from './AIRAD/DetectionList'
export { NoduleView, type NoduleViewProps } from './AIRAD/NoduleView'
export { AIRadStats, type AIRadStatsProps } from './AIRAD/AIRadStats'

export { CADPneumo, type CADPneumoProps } from './CAD/CADPneumo'
export { CADMammo, type CADMammoProps } from './CAD/CADMammo'
export { DetectionCard, type DetectionCardProps, type CADDetection, type CADSeverity } from './CAD/DetectionCard'

export { CardiacAnalysis, type CardiacAnalysisProps, type CardiacAnalysisData } from './CARDIO/CardiacAnalysis'
export { EjectionFraction, type EjectionFractionProps } from './CARDIO/EjectionFraction'
export { WallMotion, type WallMotionProps } from './CARDIO/WallMotion'

export { SRTemplate, type SRTemplateProps } from './SR/SRTemplate'
export { SRField as SiemensSRField, type SRFieldProps, type SRFieldConfig, type SRFieldDataType } from './SR/SRField'

export { ProtocolManager, type ProtocolManagerProps } from './WORKFLOW/ProtocolManager'
export { ScanProtocol, type ScanProtocolProps, type ScanProtocolConfig } from './WORKFLOW/ScanProtocol'