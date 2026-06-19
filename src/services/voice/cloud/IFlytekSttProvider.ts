/**
 * G005 放射RIS系统 v3.0.6.5 - 讯飞 STT 适配器 (mock)
 * 20 升级点:模拟科大讯飞语音听写服务(中文优势)
 */

import type {
  ICloudSttProvider,
  SttLanguage,
  SttAudioConfig,
  SttRecognitionResult,
  SttProviderStatus,
  SttEngineState,
} from '../../../types/voice';

const IFLYTEK_LANGS: SttLanguage[] = ['zh-CN', 'zh-TW', 'en-US'];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  return 'ifly-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 9999).toString(36);
}

const IFLYTEK_PHRASES: Record<SttLanguage, string[]> = {
  'zh-CN': [
    '胸部 CT 平扫加增强,',
    '两侧胸廓对称,',
    '所见两侧支气管通畅,',
    '右肺下叶背段见片状磨玻璃影,',
    '边界欠清,范围约 12 毫米乘 8 毫米。',
  ],
  'en-US': [
    'CT plain and enhanced scan of the chest,',
    'bilateral thoracic cage is symmetric,',
    'a patchy ground-glass opacity is noted,',
    'in the posterior basal segment of right lower lobe.',
  ],
  'ja-JP': ['胸部CT検査を実施、', '異常所見を認めず。'],
  'ko-KR': ['흉부 CT 스캔 시행,', '이상 소견 없음.'],
  'zh-TW': [
    '胸部電腦斷層平掃及增強,',
    '右肺下葉背側發現片狀毛玻璃樣陰影,',
    '範圍約 12 毫米乘 8 毫米。',
  ],
};

export class IFlytekSttProvider implements ICloudSttProvider {
  readonly id = 'iflytek' as const;
  readonly displayName = '科大讯飞语音听写';
  readonly supportedLanguages = IFLYTEK_LANGS;
  private state: SttEngineState = 'idle';
  private activeSessions = new Set<string>();
  private sessionMeta = new Map<string, { lang: SttLanguage; startedAt: number; audioConfig: SttAudioConfig }>();
  private appId = '';
  private apiKey = '';
  private apiSecret = '';
  private quotaUsed = 0;
  private quotaTotal = 10000;
  private lastLatencyMs = 0;

  async initialize(config: Record<string, string>): Promise<void> {
    this.appId = config.appId ?? '';
    this.apiKey = config.apiKey ?? '';
    this.apiSecret = config.apiSecret ?? '';
    this.quotaTotal = Number(config.quotaTotal) || 10000;
    this.state = 'idle';
  }

  async startSession(req: { lang: SttLanguage; audioConfig: SttAudioConfig }): Promise<string> {
    if (!IFLYTEK_LANGS.includes(req.lang)) {
      throw new Error(`IFlytek STT: language ${req.lang} not supported`);
    }
    this.state = 'listening';
    const sessionId = newId();
    this.activeSessions.add(sessionId);
    this.sessionMeta.set(sessionId, { lang: req.lang, startedAt: Date.now(), audioConfig: req.audioConfig });
    return sessionId;
  }

  async sendAudio(_sessionId: string, _audio: ArrayBuffer | Blob): Promise<void> {
    const start = Date.now();
    await delay(30 + Math.random() * 60);
    this.lastLatencyMs = Date.now() - start;
  }

  async stopSession(sessionId: string): Promise<SttRecognitionResult> {
    const meta = this.sessionMeta.get(sessionId);
    if (!meta) throw new Error(`IFlytek STT: session ${sessionId} not found`);
    await delay(80);
    const phrases = IFLYTEK_PHRASES[meta.lang] ?? IFLYTEK_PHRASES['zh-CN'];
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
      provider: 'iflytek',
      audioMs: Date.now() - meta.startedAt,
      recognitionMs: this.lastLatencyMs,
      alternatives: [{ text, confidence: 0.95 + Math.random() * 0.04 }],
    };
  }

  async getStatus(): Promise<SttProviderStatus> {
    return {
      provider: 'iflytek',
      state: this.state,
      latencyMs: this.lastLatencyMs,
      activeSessions: this.activeSessions.size,
      quotaUsed: this.quotaUsed,
      quotaTotal: this.quotaTotal,
    };
  }

  async cancelAllSessions(): Promise<void> {
    this.activeSessions.clear();
    this.sessionMeta.clear();
    this.state = 'idle';
  }
}
