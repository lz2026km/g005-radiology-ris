/**
 * G005 放射RIS系统 v3.0.3.31 - XState 状态机索引
 * 7 大状态机:
 *   - reportMachine        报告 20 态(双阶段审核 + CoSign 双签 + 升级/整改/补充)
 *   - examMachine          检查 14 态
 *   - orderMachine         订单 6 态
 *   - criticalValueMachine 危急值 7 态
 *   - deviceMachine        设备 5 态
 *   - collaborationMachine 协同编辑 5 态(详见下方说明 - 当前保持 dormant)
 *   - claimsMachine (RCM)  索赔 9 态
 *
 * ─────────────────────────────────────────────────────────────────────
 * 协同编辑状态机 (collaborationMachine) - 暂时保持 dormant
 * ─────────────────────────────────────────────────────────────────────
 * collaborationMachine 的 5 个状态(disconnected / connecting /
 * connected / syncing / error)描述的是**传输层连接**,而
 * CollaborationPage 中"评论/批注"等业务状态属于**内容协作层**,
 * 二者语义不同:
 *
 *   - 连接层:WebRTC / Yjs provider / presence channel
 *     (由 `src/components/collab/CollaborativeReportEditor.tsx` 的
 *     Yjs/y-webrtc 适配器直接管理)
 *   - 内容层:评论线程、@提及、批注锁定等
 *     (暂时由 redux-free local state 处理)
 *
 * 因此在 v3.0.3 阶段 collaborationMachine 仅作为**契约层类型**导出,
 * 供传输层在重构时引用,但不强行接入业务组件,以避免把传输层状态
 * 和内容层状态混在同一个 actor 里。
 *
 * 计划在 v3.1.0 (Phase T4-W1) 把连接层独立为
 * `useCollaborationTransport()` hook,届时再将本机接入。
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
