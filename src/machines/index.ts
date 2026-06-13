/**
 * G005 放射RIS系统 v3.0.2.10 - XState 状态机索引
 * 7 大状态机:
 *   - reportMachine        报告 17 态(双阶段审核 + CoSign)
 *   - examMachine          检查 12 态
 *   - orderMachine         订单 6 态
 *   - criticalValueMachine 危急值 7 态
 *   - deviceMachine        设备 5 态
 *   - collaborationMachine 协同编辑 5 态
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
  examMachine,
  EXAM_STATE_LABEL,
  EXAM_STATE_GROUPS,
  type ExamStateName,
  type ExamContext,
  type ExamEvent,
  type ExamStateEvent,
  type ExamMachine,
} from './examMachine';

export {
  orderMachine,
  ORDER_STATE_LABEL,
  type OrderStateName,
  type OrderContext,
  type OrderEvent,
  type OrderStateEvent,
  type OrderMachine,
} from './orderMachine';

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
