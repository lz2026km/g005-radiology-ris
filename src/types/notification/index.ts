/**
 * G005 RIS v3.0.6.6 - 通知提供商类型定义
 * 危急值多渠道通知基础设施(短信/语音/IVR/广播)
 */

/** 通用发送结果 */
export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  cost?: number;             // 元
  durationMs?: number;
  timestamp: string;
  raw?: unknown;             // 原始回执
}

/** 短信渠道基础字段 */
export interface SmsRecipient {
  phone: string;             // E.164 或国内 11 位
  name?: string;
  userId?: string;
  role?: string;
}

export interface SmsPayload {
  recipients: SmsRecipient[];
  templateId: string;
  templateParams?: Record<string, string | number>;
  content?: string;          // 自由文本(无模板时)
  signature?: string;        // 签名/落款
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SmsStatus {
  providerMessageId: string;
  phone: string;
  status: 'queued' | 'sending' | 'delivered' | 'failed' | 'undelivered' | 'expired';
  deliveredAt?: string;
  failureReason?: string;
  cost?: number;
}

/** 语音/电话基础字段 */
export interface VoiceRecipient {
  phone: string;
  name?: string;
  userId?: string;
  voice?: 'male' | 'female';
  language?: 'zh-CN' | 'en-US';
}

export interface VoicePayload {
  recipients: VoiceRecipient[];
  /** TTS 文本或 IVR 入口 */
  text?: string;
  ivrMenuId?: string;
  /** 重复呼叫策略 */
  retryStrategy?: {
    maxAttempts: number;
    intervalMinutes: number;
  };
  /** 期望的按键确认 (例如 '1' = 确认, '5' = 升级) */
  expectedDtmfs?: string[];
  /** 超时 */
  timeoutSec?: number;
  metadata?: Record<string, unknown>;
}

export interface VoiceStatus {
  providerCallId: string;
  phone: string;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'dtmf-collected';
  answeredAt?: string;
  endedAt?: string;
  durationSec?: number;
  recordingUrl?: string;
  dtmfDigits?: string[];
  cost?: number;
}

/** IVR/TTS 菜单项 */
export interface IVRMenuItem {
  digit: string;             // '1' '2' ...
  label: string;             // '确认接收'
  action: 'acknowledge' | 'escalate' | 'repeat' | 'transfer' | 'hangup' | 'callback';
  nextMenuId?: string;
}

export interface IVRMenu {
  id: string;
  name: string;
  greeting: string;          // TTS 文案
  items: IVRMenuItem[];
  timeoutSec?: number;
  maxRetries?: number;
  fallbackAction?: 'transfer' | 'hangup' | 'callback';
}

/** 通知提供商能力 */
export interface NotificationProviderCapabilities {
  sms?: boolean;
  voice?: boolean;
  ivr?: boolean;
  international?: boolean;
  unicode?: boolean;
  /** 每分钟限流 */
  rateLimitPerMin?: number;
  /** 覆盖区域 */
  regions?: string[];
}

/** 通用提供商配置 */
export interface NotificationProviderConfig {
  id: string;
  name: string;
  displayName: string;
  kind: 'sms' | 'voice' | 'ivr';
  vendor: string;            // aliyun / twilio / tencent / lvpai / emqx
  enabled: boolean;
  /** 端点 */
  endpoint?: string;
  /** 凭据(只存引用名,真实凭据由后端管理) */
  credentialRef?: string;
  /** 模板/签名 */
  signature?: string;
  /** 优先级:数值小者优先 */
  priority?: number;
  /** 能力声明 */
  capabilities: NotificationProviderCapabilities;
  /** 单价(元/条,语音元/分钟) */
  pricing?: {
    smsDomestic?: number;
    smsInternational?: number;
    voicePerMin?: number;
  };
  /** 健康度 */
  health?: 'healthy' | 'degraded' | 'offline';
  /** 备注 */
  notes?: string;
}

/** 升级链节点 */
export interface EscalationChainNode {
  level: number;
  role: 'attending' | 'associateChief' | 'chief' | 'director' | 'medicalAffairs';
  roleLabel: string;
  triggerAfterMinutes: number;
  channels: ('sms' | 'voice' | 'inApp' | 'email' | 'wechat')[];
  messageTemplate: string;
  enabled: boolean;
}

/** 升级链 */
export interface EscalationChain {
  id: string;
  name: string;
  criticalLevel: 'critical' | 'urgent' | 'warning' | 'info';
  nodes: EscalationChainNode[];
  enabled: boolean;
}

/** 通知任务审计 */
export interface NotificationAuditEntry {
  id: string;
  criticalId?: string;
  providerId: string;
  channel: 'sms' | 'voice' | 'ivr';
  recipient: string;
  payload: unknown;
  result: SendResult;
  createdAt: string;
}