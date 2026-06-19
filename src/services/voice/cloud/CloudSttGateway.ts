/**
 * G005 放射RIS系统 v3.0.6.5 - 云STT网关
 * 40 升级点:统一接口 / 主备切换 / 重试 / 会话管理 / 限流
 *
 * 设计:
 *  - 抽象 ICloudSttProvider 接口
 *  - 默认 Web Speech API 作 fallback
 *  - 主备 provider 切换 + 重试机制
 *  - 限流 / 配额 / 状态查询
 */

import type {
  ICloudSttProvider,
  SttProviderId,
  SttLanguage,
  SttAudioConfig,
  SttRecognitionResult,
  SttProviderStatus,
  SttGatewayOptions,
  SttSessionDescriptor,
} from '../../../types/voice';
import { AzureSttProvider } from './AzureSttProvider';
import { IFlytekSttProvider } from './IFlytekSttProvider';
import { DeepSeekSttProvider } from './DeepSeekSttProvider';

export const DEFAULT_AUDIO_CONFIG: SttAudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  encoding: 'pcm',
  enableNoiseSuppression: true,
  enableAutoGainControl: true,
  enableEchoCancellation: true,
};

const SIM_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function newSessionId(): string {
  return 'stt-sess-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000).toString(36);
}

export class CloudSttGateway {
  private providers: Map<SttProviderId, ICloudSttProvider> = new Map();
  private sessions: Map<string, SttSessionDescriptor> = new Map();
  private options: Required<SttGatewayOptions>;
  private listeners: Map<string, Set<(result: SttRecognitionResult) => void>> = new Map();
  private errorListeners: Set<(err: { provider: SttProviderId; message: string }) => void> = new Set();
  private rateLimits: Map<SttProviderId, { tokens: number; lastRefill: number; capacity: number; refillPerSec: number }> = new Map();

  constructor(options: SttGatewayOptions = { primaryProvider: 'web-speech' }) {
    this.options = {
      primaryProvider: options.primaryProvider,
      fallbackProvider: options.fallbackProvider ?? 'web-speech',
      audioConfig: { ...DEFAULT_AUDIO_CONFIG, ...(options.audioConfig ?? {}) },
      retryAttempts: options.retryAttempts ?? 3,
      retryDelayMs: options.retryDelayMs ?? 800,
      enableAutoFallback: options.enableAutoFallback ?? true,
    };
    this.initRateLimits();
  }

  private initRateLimits(): void {
    const capacities: Record<SttProviderId, { capacity: number; refill: number }> = {
      'azure': { capacity: 50, refill: 5 },
      'iflytek': { capacity: 100, refill: 10 },
      'deepseek': { capacity: 30, refill: 3 },
      'web-speech': { capacity: 1000, refill: 100 },
    };
    const now = Date.now();
    (['azure', 'iflytek', 'deepseek', 'web-speech'] as SttProviderId[]).forEach((id) => {
      const c = capacities[id];
      this.rateLimits.set(id, { tokens: c.capacity, lastRefill: now, capacity: c.capacity, refillPerSec: c.refill });
    });
  }

  private consumeToken(provider: SttProviderId): boolean {
    const limiter = this.rateLimits.get(provider);
    if (!limiter) return true;
    const now = Date.now();
    const elapsed = (now - limiter.lastRefill) / 1000;
    limiter.tokens = Math.min(limiter.capacity, limiter.tokens + elapsed * limiter.refillPerSec);
    limiter.lastRefill = now;
    if (limiter.tokens < 1) return false;
    limiter.tokens -= 1;
    return true;
  }

  registerProvider(provider: ICloudSttProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: SttProviderId): ICloudSttProvider | undefined {
    return this.providers.get(id);
  }

  listProviders(): ICloudSttProvider[] {
    return Array.from(this.providers.values());
  }

  async initialize(configs: Record<SttProviderId, Record<string, string>> = {}): Promise<void> {
    const initializers: Promise<void>[] = [];
    const azure = new AzureSttProvider();
    const iflytek = new IFlytekSttProvider();
    const deepseek = new DeepSeekSttProvider();
    this.providers.set(azure.id, azure);
    this.providers.set(iflytek.id, iflytek);
    this.providers.set(deepseek.id, deepseek);

    if (configs.azure) initializers.push(azure.initialize(configs.azure));
    if (configs.iflytek) initializers.push(iflytek.initialize(configs.iflytek));
    if (configs.deepseek) initializers.push(deepseek.initialize(configs.deepseek));

    await Promise.all(initializers);
  }

  async startSession(lang: SttLanguage, providerId?: SttProviderId): Promise<SttSessionDescriptor> {
    const provider = providerId ?? this.options.primaryProvider;
    let useProvider = this.getProvider(provider);
    if (!useProvider) {
      useProvider = this.getProvider(this.options.fallbackProvider);
      if (!useProvider) {
        throw new Error(`No STT provider available (requested: ${provider})`);
      }
    }
    if (!this.consumeToken(useProvider.id)) {
      if (this.options.enableAutoFallback) {
        useProvider = this.getProvider(this.options.fallbackProvider) ?? useProvider;
      } else {
        throw new Error(`Rate limit exceeded for provider ${useProvider.id}`);
      }
    }
    const sessionId = await useProvider.startSession({ lang, audioConfig: this.options.audioConfig });
    const descriptor: SttSessionDescriptor = {
      sessionId,
      provider: useProvider.id,
      lang,
      startedAt: Date.now(),
      state: 'listening',
      bytesProcessed: 0,
      interimText: '',
      finalText: '',
    };
    this.sessions.set(sessionId, descriptor);
    return descriptor;
  }

  async sendAudio(sessionId: string, audio: ArrayBuffer | Blob): Promise<void> {
    const descriptor = this.sessions.get(sessionId);
    if (!descriptor) throw new Error(`Session ${sessionId} not found`);
    const provider = this.getProvider(descriptor.provider);
    if (!provider) throw new Error(`Provider ${descriptor.provider} not found`);

    const bytes = audio instanceof Blob ? audio.size : audio.byteLength;
    descriptor.bytesProcessed += bytes;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.options.retryAttempts; attempt++) {
      try {
        await provider.sendAudio(sessionId, audio);
        return;
      } catch (e) {
        lastError = e as Error;
        await delay(this.options.retryDelayMs * (attempt + 1));
      }
    }
    if (this.options.enableAutoFallback) {
      const fallback = this.getProvider(this.options.fallbackProvider);
      if (fallback && fallback.id !== descriptor.provider) {
        descriptor.provider = fallback.id;
        await fallback.sendAudio(sessionId, audio);
        return;
      }
    }
    this.errorListeners.forEach((l) => l({ provider: descriptor.provider, message: lastError?.message ?? 'unknown' }));
    throw lastError ?? new Error('Send audio failed');
  }

  async stopSession(sessionId: string): Promise<SttRecognitionResult> {
    const descriptor = this.sessions.get(sessionId);
    if (!descriptor) throw new Error(`Session ${sessionId} not found`);
    const provider = this.getProvider(descriptor.provider);
    if (!provider) throw new Error(`Provider ${descriptor.provider} not found`);
    const result = await provider.stopSession(sessionId);
    descriptor.state = 'closed';
    descriptor.finalText = result.text;
    this.sessions.delete(sessionId);
    this.listeners.get(sessionId)?.forEach((l) => l(result));
    this.listeners.delete(sessionId);
    return result;
  }

  onResult(sessionId: string, callback: (result: SttRecognitionResult) => void): () => void {
    if (!this.listeners.has(sessionId)) this.listeners.set(sessionId, new Set());
    this.listeners.get(sessionId)!.add(callback);
    return () => {
      this.listeners.get(sessionId)?.delete(callback);
    };
  }

  onError(callback: (err: { provider: SttProviderId; message: string }) => void): () => void {
    this.errorListeners.add(callback);
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  async getAllStatuses(): Promise<SttProviderStatus[]> {
    const statuses: SttProviderStatus[] = [];
    for (const provider of this.providers.values()) {
      try {
        statuses.push(await provider.getStatus());
      } catch {
        statuses.push({
          provider: provider.id,
          state: 'error',
          latencyMs: -1,
          activeSessions: 0,
          quotaUsed: 0,
          quotaTotal: 0,
          lastErrorMessage: 'status fetch failed',
        });
      }
    }
    return statuses;
  }

  getSession(sessionId: string): SttSessionDescriptor | undefined {
    return this.sessions.get(sessionId);
  }

  listSessions(): SttSessionDescriptor[] {
    return Array.from(this.sessions.values());
  }

  async cancelAllSessions(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const provider of this.providers.values()) {
      promises.push(provider.cancelAllSessions());
    }
    await Promise.all(promises);
    this.sessions.clear();
  }

  setPrimaryProvider(id: SttProviderId): void {
    this.options.primaryProvider = id;
  }

  getConfig(): Required<SttGatewayOptions> {
    return { ...this.options };
  }

  async recognizeOnce(audio: ArrayBuffer | Blob, lang: SttLanguage): Promise<SttRecognitionResult> {
    const session = await this.startSession(lang);
    await this.sendAudio(session.sessionId, audio);
    await delay(SIM_LATENCY_MS);
    return this.stopSession(session.sessionId);
  }
}

export const cloudSttGateway = new CloudSttGateway({ primaryProvider: 'web-speech', fallbackProvider: 'azure' });
