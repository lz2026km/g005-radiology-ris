/**
 * G005 RIS v3.0.6.6 - 阿里云短信 Provider 适配 (Mock)
 * 仅作接口契约示例,真实请求经后端代理发起
 */

import type { SmsPayload, SendResult, SmsStatus } from '../../../types/notification';
import type { ISmsGateway } from '../SmsGateway';

interface AliyunSmsConfig {
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  templateCode?: string;
  endpoint?: string;
}

export class AliyunSmsProvider implements ISmsGateway {
  readonly providerId = 'sms-aliyun';
  private cfg: AliyunSmsConfig;
  private log: Array<{ id: string; phone: string; status: SmsStatus['status']; at: string }> = [];

  constructor(cfg: Partial<AliyunSmsConfig> = {}) {
    this.cfg = {
      accessKeyId: cfg.accessKeyId ?? 'ALIYUN_KEY',
      accessKeySecret: cfg.accessKeySecret ?? '***',
      signName: cfg.signName ?? '【G005 RIS】',
      templateCode: cfg.templateCode,
      endpoint: cfg.endpoint ?? 'https://dysmsapi.aliyuncs.com',
    };
  }

  async send(payload: SmsPayload): Promise<SendResult> {
    if (!payload.templateId && !payload.content) {
      return {
        success: false,
        errorCode: 'INVALID_PAYLOAD',
        errorMessage: '缺少 templateId 或 content',
        timestamp: new Date().toISOString(),
      };
    }
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
    const ok = Math.random() > 0.03;
    const providerMessageId = `${this.providerId}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const phone = payload.recipients[0]?.phone ?? '';
    this.log.push({ id: providerMessageId, phone, status: ok ? 'delivered' : 'failed', at: new Date().toISOString() });
    if (!ok) {
      return {
        success: false,
        providerMessageId,
        errorCode: 'ALIYUN_THROTTLED',
        errorMessage: '阿里云限流(模拟)',
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      providerMessageId,
      cost: 0.045,
      durationMs: 180,
      timestamp: new Date().toISOString(),
      raw: {
        RequestId: 'mock-' + Date.now(),
        Code: 'OK',
        Message: 'OK',
        BizId: providerMessageId,
      },
    };
  }

  async sendBatch(payload: SmsPayload): Promise<SendResult[]> {
    const results: SendResult[] = [];
    for (const r of payload.recipients) {
      results.push(await this.send({ ...payload, recipients: [r] }));
    }
    return results;
  }

  async queryStatus(providerMessageId: string): Promise<SmsStatus> {
    await new Promise((r) => setTimeout(r, 60));
    const entry = this.log.find((e) => e.id === providerMessageId);
    if (!entry) {
      return { providerMessageId, phone: '', status: 'failed', failureReason: 'NOT_FOUND' };
    }
    return {
      providerMessageId,
      phone: entry.phone,
      status: entry.status,
      deliveredAt: entry.at,
      cost: 0.045,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 50));
    return { healthy: true, latencyMs: Date.now() - start };
  }

  getConfig(): AliyunSmsConfig {
    return this.cfg;
  }
}