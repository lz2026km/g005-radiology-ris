/**
 * G005 放射RIS系统 v3.0.6.5 - Azure STT 适配器 (mock)
 * 20 升级点:模拟 Azure Speech to Text 服务
 */

import type {
  ICloudSttProvider,
  SttLanguage,
  SttAudioConfig,
  SttRecognitionResult,
  SttProviderStatus,
  SttEngineState,
} from '../../../types/voice';

const AZURE_LANGS: SttLanguage[] = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'zh-TW'];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  return 'az-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 9999).toString(36);
}

const MOCK_PHRASES: Record<SttLanguage, string[]> = {
  'zh-CN': [
    '胸部 CT 平扫,',
    '双侧胸廓对称,',
    '双肺纹理清晰,',
    '右肺上叶见一结节影,',
    '边界清晰,大小约 8 毫米。',
  ],
  'en-US': [
    'CT scan of the chest,',
    'bilateral lung fields are clear,',
    'a small nodule is seen in the right upper lobe,',
    'measuring approximately 8 millimeters.',
  ],
  'ja-JP': [
    '胸部CT検査、',
    '両側肺野に異常なし、',
    '右肺上葉に小結節を認める。',
  ],
  'ko-KR': [
    '흉부 CT 검사,',
    '양측 폐야에 이상 없음,',
    '우상엽에 작은 결절 관찰됨.',
  ],
  'zh-TW': [
    '胸部電腦斷層掃描,',
    '雙側肺野清晰,',
    '右肺上葉發現一小結節。',
  ],
};

export class AzureSttProvider implements ICloudSttProvider {
  readonly id = 'azure' as const;
  readonly displayName = 'Azure Cognitive Services Speech';
  readonly supportedLanguages = AZURE_LANGS;
  private state: SttEngineState = 'idle';
  private activeSessions = new Set<string>();
  private sessionMeta = new Map<string, { lang: SttLanguage; startedAt: number; bytes: number; audioConfig: SttAudioConfig }>();
  private apiKey = '';
  private region = 'eastasia';
  private quotaUsed = 0;
  private quotaTotal = 5000;
  private lastLatencyMs = 0;
  private lastError: { at: string; message: string } | null = null;

  async initialize(config: Record<string, string>): Promise<void> {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.region) this.region = config.region;
    if (config.quotaTotal) this.quotaTotal = Number(config.quotaTotal) || 5000;
    this.state = 'idle';
  }

  async startSession(req: { lang: SttLanguage; audioConfig: SttAudioConfig }): Promise<string> {
    if (!this.apiKey) {
      // mock 模式不需要真实 apiKey
      this.lastError = { at: new Date().toISOString(), message: 'Azure API key not configured (running in mock mode)' };
    }
    if (!AZURE_LANGS.includes(req.lang)) {
      throw new Error(`Azure STT: language ${req.lang} not supported`);
    }
    this.state = 'listening';
    const sessionId = newId();
    this.activeSessions.add(sessionId);
    this.sessionMeta.set(sessionId, { lang: req.lang, startedAt: Date.now(), bytes: 0, audioConfig: req.audioConfig });
    return sessionId;
  }

  async sendAudio(sessionId: string, _audio: ArrayBuffer | Blob): Promise<void> {
    const meta = this.sessionMeta.get(sessionId);
    if (!meta) throw new Error(`Azure STT: session ${sessionId} not found`);
    const start = Date.now();
    await delay(40 + Math.random() * 80);
    const bytes = _audio instanceof Blob ? _audio.size : _audio.byteLength;
    meta.bytes += bytes;
    this.lastLatencyMs = Date.now() - start;
  }

  async stopSession(sessionId: string): Promise<SttRecognitionResult> {
    const meta = this.sessionMeta.get(sessionId);
    if (!meta) throw new Error(`Azure STT: session ${sessionId} not found`);
    await delay(120);
    const phrases = MOCK_PHRASES[meta.lang] ?? MOCK_PHRASES['zh-CN'];
    const text = phrases.join(' ');
    this.activeSessions.delete(sessionId);
    this.sessionMeta.delete(sessionId);
    this.quotaUsed += 1;
    if (this.activeSessions.size === 0) this.state = 'idle';
    return {
      sessionId,
      isFinal: true,
      text,
      language: meta.lang,
      provider: 'azure',
      audioMs: meta.startedAt > 0 ? Date.now() - meta.startedAt : 0,
      recognitionMs: this.lastLatencyMs,
      alternatives: [{ text, confidence: 0.92 + Math.random() * 0.06 }],
    };
  }

  async getStatus(): Promise<SttProviderStatus> {
    return {
      provider: 'azure',
      state: this.state,
      latencyMs: this.lastLatencyMs,
      activeSessions: this.activeSessions.size,
      quotaUsed: this.quotaUsed,
      quotaTotal: this.quotaTotal,
      ...(this.lastError ? { lastErrorAt: this.lastError.at, lastErrorMessage: this.lastError.message } : {}),
    };
  }

  async cancelAllSessions(): Promise<void> {
    this.activeSessions.clear();
    this.sessionMeta.clear();
    this.state = 'idle';
  }
}
