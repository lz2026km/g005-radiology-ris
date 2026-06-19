/**
 * G005 RIS v3.0.6.6 - 危急值群体广播
 * 用于科室内/全院/多病区的大规模通报
 */

import type { SendResult, SmsPayload, VoicePayload } from '../../types/notification';
import { defaultSmsRouter } from '../notification/SmsGateway';
import { defaultVoiceRouter } from '../notification/VoiceGateway';

export interface BroadcastInput {
  criticalId?: string;
  title: string;
  message: string;
  /** 群组 */
  scope:
    | { kind: 'department'; department: string }
    | { kind: 'hospital' }
    | { kind: 'role'; roles: Array<'attending' | 'associateChief' | 'chief' | 'director' | 'medicalAffairs'> }
    | { kind: 'phones'; phones: string[] };
  channels: Array<'sms' | 'voice' | 'inApp' | 'email' | 'wechat'>;
  /** 是否同时走 IVR */
  withIvr?: boolean;
  ivrMenuId?: string;
}

export interface BroadcastResult {
  broadcastId: string;
  startedAt: string;
  totalRecipients: number;
  perChannel: Record<string, SendResult[]>;
  durationMs: number;
}

export interface IBroadcaster {
  broadcast(input: BroadcastInput): Promise<BroadcastResult>;
  /** 预览将触达的收件人(数量/通道) */
  preview(input: BroadcastInput): { phones: string[]; channels: string[] };
}

class BroadcasterImpl implements IBroadcaster {
  async broadcast(input: BroadcastInput): Promise<BroadcastResult> {
    const start = Date.now();
    const { phones, channels } = this.preview(input);
    const result: BroadcastResult = {
      broadcastId: 'brd-' + Date.now() + '-' + Math.floor(Math.random() * 1e4),
      startedAt: new Date(start).toISOString(),
      totalRecipients: phones.length,
      perChannel: {},
      durationMs: 0,
    };
    for (const ch of channels) {
      const list: SendResult[] = [];
      if (ch === 'sms') {
        const payload: SmsPayload = {
          recipients: phones.map((p) => ({ phone: p })),
          templateId: 'broadcast-v1',
          content: input.message,
          signature: '【G005 RIS】',
          priority: 'urgent',
          metadata: { broadcastId: result.broadcastId, criticalId: input.criticalId },
        };
        const smsResults = await defaultSmsRouter.dispatch(payload, { prefer: 'priority' });
        list.push(...smsResults);
      } else if (ch === 'voice') {
        const voiceGateway = defaultVoiceRouter.getGateways()[0];
        if (voiceGateway) {
          for (const p of phones) {
            const payload: VoicePayload = {
              recipients: [{ phone: p }],
              text: input.title + ',' + input.message,
              ivrMenuId: input.withIvr ? input.ivrMenuId ?? 'ivr-cv-broadcast-v1' : undefined,
            };
            const r = await voiceGateway.call(payload);
            list.push(r);
          }
        }
      }
      // 其他通道(inApp/email/wechat)暂以占位返回
      if (ch === 'inApp' || ch === 'email' || ch === 'wechat') {
        phones.forEach((p) => {
          list.push({
            success: true,
            providerMessageId: `mock-${ch}-${p}-${Date.now()}`,
            timestamp: new Date().toISOString(),
          });
        });
      }
      result.perChannel[ch] = list;
    }
    result.durationMs = Date.now() - start;
    return result;
  }

  preview(input: BroadcastInput): { phones: string[]; channels: string[] } {
    let phones: string[] = [];
    switch (input.scope.kind) {
      case 'phones':
        phones = input.scope.phones;
        break;
      case 'department':
        phones = this.mockPhonesForDept(input.scope.department, 8);
        break;
      case 'hospital':
        phones = this.mockPhonesForDept('hospital', 24);
        break;
      case 'role':
        phones = this.mockPhonesForRoles(input.scope.roles, 4);
        break;
    }
    return { phones, channels: input.channels };
  }

  private mockPhonesForDept(dept: string, n: number): string[] {
    return Array.from({ length: n }, (_, i) =>
      `139000${(dept.length * 100 + i).toString().padStart(5, '0').slice(0, 4)}${(dept.length * 100 + i).toString().padStart(4, '0')}`,
    );
  }

  private mockPhonesForRoles(roles: string[], n: number): string[] {
    return roles.flatMap((r, idx) =>
      Array.from({ length: n }, (_, i) => `139${String(idx).padStart(2, '0')}${String(i).padStart(5, '0')}`),
    );
  }
}

export const broadcaster: IBroadcaster = new BroadcasterImpl();