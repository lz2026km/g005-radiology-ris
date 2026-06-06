/**
 * G005 放射RIS系统 v3.0.0 - XState 状态机索引
 * Phase T3-W6: XState 5 完整落地
 *
 * 4 大状态机:
 *   - reportMachine        报告 14 态
 *   - criticalValueMachine 危急值 5 节点
 *   - deviceMachine        设备 5 态
 *   - collaborationMachine 协同编辑 4 态
 */

export {
  reportMachine,
  REPORT_STATE_LABEL,
  REPORT_STATE_GROUPS,
  type ReportStateName,
  type ReportContext,
  type ReportEvent,
  type ReportStateEvent,
  type ReportMachine,
} from './reportMachine';

export {
  criticalValueMachine,
  CRITICAL_STATE_LABEL,
  type CriticalStateName,
  type CriticalContext,
  type CriticalEvent,
  type CriticalStateEvent,
  type CriticalMachine,
  type NotificationMethod,
} from './criticalValueMachine';

export {
  deviceMachine,
  DEVICE_STATE_LABEL,
  type DeviceStateName,
  type DeviceContext,
  type DeviceEvent,
  type DeviceStateEvent,
  type DeviceMachine,
} from './deviceMachine';

export {
  collaborationMachine,
  COLLABORATION_STATE_LABEL,
  type CollaborationStateName,
  type CollaborationContext,
  type CollaborationEvent,
  type CollaborationStateEvent,
  type CollaborationMachine,
} from './collaborationMachine';
