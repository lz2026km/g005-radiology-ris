/**
 * G005 放射RIS系统 v3.0.6.5 - DeepSeek STT 适配器 (mock)
 * 15 升级点:基于 LLM 的医学语音识别(可纠错)
 */

import type {
  ICloudSttProvider,
  SttLanguage,
  SttAudioConfig,
  SttRecognitionResult,
  SttProviderStatus,
  SttEngineState,
} from '../../../types/voice';

const DS_LANGS: SttLanguage[] = ['zh-CN', 'en-US'];

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function newId(): string {
  return 'ds-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 9999).toString(36);
}

const DS_PHRASES: Record<SttLanguage, string> = {
  'zh-CN': '胸部 CT 平扫加增强,双侧胸廓对称,所见两侧支气管通畅,右肺下叶背段见片状磨玻璃影,边界欠清,范围约 12 毫米乘 8 毫米,余肺野未见明显异常密度灶,双侧胸腔未见积液,心影大小、形态正常,纵隔居中,纵隔内未见肿大淋巴结。',
  'en-US': 'CT plain and enhanced scan of the chest shows bilateral symmetric thoracic cage, clear bilateral lung fields, with a patchy ground-glass opacity in the posterior basal segment of the right lower lobe, measuring approximately 12mm by 8mm, ill-defined margins. No other abnormal density is seen. No pleural effusion. Heart size and shape are normal.',
  'ja-JP': '胸部CT検査を実施、両側肺野に異常陰影を認めず。',
  'ko-KR': '흉부 CT 스캔 시행, 이상 소견 관찰되지 않음.',
  'zh-TW': '胸部電腦斷層平掃及增強,雙側肺野清晰,未見明顯異常密度灶。',
};

export class DeepSeekSttProvider implements ICloudSttProvider {
  readonly id = 'deepseek' as const;
  readonly displayName = 'DeepSeek 医学语音识别';
  readonly supportedLanguages = DS_LANGS;
  private state: SttEngineState = 'idle';
  private activeSessions = new Set<string>();
  private sessionMeta = new Map<string, { lang: SttLanguage; startedAt: number; audioConfig: SttAudioConfig }>();
  private apiKey = '';
  private model = 'deepseek-chat';
  private quotaUsed = 0;
  private quotaTotal = 2000;
  private lastLatencyMs = 0;

  async initialize(config: Record<string, string>): Promise<void> {
    this.apiKey = config.apiKey ?? '';
    this.model = config.model ?? 'deepseek-chat';
    this.quotaTotal = Number(config.quotaTotal) || 2000;
    this.state = 'idle';
  }

  async startSession(req: { lang: SttLanguage; audioConfig: SttAudioConfig }): Promise<string> {
    if (!DS_LANGS.includes(req.lang)) {
      throw new Error(`DeepSeek STT: language ${req.lang} not supported`);
    }
    this.state = 'listening';
    const sessionId = newId();
    this.activeSessions.add(sessionId);
    this.sessionMeta.set(sessionId, { lang: req.lang, startedAt: Date.now(), audioConfig: req.audioConfig });
    return sessionId;
  }

  async sendAudio(_sessionId: string, _audio: ArrayBuffer | Blob): Promise<void> {
    const start = Date.now();
    await delay(80 + Math.random() * 120);
    this.lastLatencyMs = Date.now() - start;
  }

  async stopSession(sessionId: string): Promise<SttRecognitionResult> {
    const meta = this.sessionMeta.get(sessionId);
    if (!meta) throw new Error(`DeepSeek STT: session ${sessionId} not found`);
    await delay(150);
    const text = DS_PHRASES[meta.lang] ?? DS_PHRASES['zh-CN'];
    this.activeSessions.delete(sessionId);
    this.sessionMeta.delete(sessionId);
    this.quotaUsed += 1;
    if (this.activeSessions.size === 0) this.state = 'idle';
    return {
      sessionId,
      isFinal: true,
      text,
      language: meta.lang,
      provider: 'deepseek',
      audioMs: Date.now() - meta.startedAt,
      recognitionMs: this.lastLatencyMs,
      alternatives: [
        { text, confidence: 0.97 + Math.random() * 0.02 },
        { text: text.replace('背段', '基底段'), confidence: 0.83 + Math.random() * 0.05 },
      ],
    };
  }

  async getStatus(): Promise<SttProviderStatus> {
    return {
      provider: 'deepseek',
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
