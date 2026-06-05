// ============================================================
// G005 放射RIS系统 v2.1.0 - DeepSeek LLM 客户端
// Phase R11 W8: 流式响应 + 视觉 + 提示模板
// ============================================================

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string | ContentPart[];
  name?: string;
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
}

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;          // default https://api.deepseek.com/v1
  model?: string;            // default deepseek-chat
  visionModel?: string;      // default deepseek-vl-7b
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  timeoutMs?: number;
}

export interface CompletionRequest {
  messages: Message[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  user?: string;
}

export interface CompletionChoice {
  index: number;
  message: Message;
  finish_reason: 'stop' | 'length' | 'content_filter' | 'function_call' | 'tool_calls' | null;
}

export interface CompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage: CompletionUsage;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: { role?: Role; content?: string };
    finish_reason: string | null;
  }>;
}

export class DeepSeekError extends Error {
  constructor(public status: number, public body: string, message?: string) {
    super(message ?? `DeepSeek API error ${status}: ${body}`);
  }
}

const DEFAULT_BASE = 'https://api.deepseek.com/v1';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_VISION = 'deepseek-vl-7b';

export class DeepSeekClient {
  private config: Required<DeepSeekConfig>;

  constructor(config: DeepSeekConfig) {
    this.config = {
      baseUrl: DEFAULT_BASE,
      model: DEFAULT_MODEL,
      visionModel: DEFAULT_VISION,
      maxTokens: 2048,
      temperature: 0.3,
      stream: true,
      timeoutMs: 60_000,
      ...config,
    };
    if (!this.config.apiKey) {
      throw new Error('DeepSeekClient: apiKey required');
    }
  }

  private get url() {
    return `${this.config.baseUrl}/chat/completions`;
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  // 非流式补全
  async completion(req: CompletionRequest): Promise<CompletionResponse> {
    const body = {
      model: req.model ?? this.config.model,
      messages: req.messages,
      max_tokens: req.max_tokens ?? this.config.maxTokens,
      temperature: req.temperature ?? this.config.temperature,
      top_p: req.top_p,
      stream: false,
      stop: req.stop,
      presence_penalty: req.presence_penalty,
      frequency_penalty: req.frequency_penalty,
      user: req.user,
    };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.config.timeoutMs);
    try {
      const res = await fetch(this.url, { method: 'POST', headers: this.headers(), body: JSON.stringify(body), signal: ctrl.signal });
      if (!res.ok) {
        const text = await res.text();
        throw new DeepSeekError(res.status, text);
      }
      return await res.json() as CompletionResponse;
    } finally {
      clearTimeout(timer);
    }
  }

  // 流式补全 (SSE)
  async *stream(req: CompletionRequest): AsyncGenerator<StreamChunk, void, void> {
    const body = {
      model: req.model ?? this.config.model,
      messages: req.messages,
      max_tokens: req.max_tokens ?? this.config.maxTokens,
      temperature: req.temperature ?? this.config.temperature,
      top_p: req.top_p,
      stream: true,
      stop: req.stop,
      presence_penalty: req.presence_penalty,
      frequency_penalty: req.frequency_penalty,
      user: req.user,
    };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.config.timeoutMs);
    try {
      const res = await fetch(this.url, { method: 'POST', headers: this.headers(), body: JSON.stringify(body), signal: ctrl.signal });
      if (!res.ok) {
        const text = await res.text();
        throw new DeepSeekError(res.status, text);
      }
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      // 解析 SSE: "data: {...}\n\n" 或 "data: [DONE]"
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trimEnd();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') return;
            try {
              yield JSON.parse(data) as StreamChunk;
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } finally {
      clearTimeout(timer);
    }
  }

  // 视觉补全（多模态）
  async vision(opts: {
    text: string;
    images: Array<{ url: string; detail?: 'low' | 'high' | 'auto' }>;
    systemPrompt?: string;
    user?: string;
  }): Promise<CompletionResponse> {
    const userContent: ContentPart[] = [{ type: 'text', text: opts.text }];
    opts.images.forEach(img => userContent.push({ type: 'image_url', image_url: { url: img.url, detail: img.detail ?? 'auto' } }));
    const messages: Message[] = [];
    if (opts.systemPrompt) messages.push({ role: 'system', content: opts.systemPrompt });
    messages.push({ role: 'user', content: userContent });
    return this.completion({ messages, model: this.config.visionModel, user: opts.user });
  }

  // 便利方法
  async chat(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: Message[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    const r = await this.completion({ messages });
    return r.choices[0]?.message.content?.toString() ?? '';
  }
}

// 工厂：从 import.meta.env 读取
export function createDeepSeekFromEnv(): DeepSeekClient {
  // Vite 注入 import.meta.env
  const env = (typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env : undefined) ?? {};
  const apiKey = env.VITE_DEEPSEEK_API_KEY ?? '';
  const baseUrl = env.VITE_DEEPSEEK_BASE_URL;
  const model = env.VITE_DEEPSEEK_MODEL;
  const visionModel = env.VITE_DEEPSEEK_VISION_MODEL;
  const stream = env.VITE_DEEPSEEK_STREAM !== 'false';
  const maxTokens = env.VITE_DEEPSEEK_MAX_TOKENS ? parseInt(env.VITE_DEEPSEEK_MAX_TOKENS) : undefined;
  const temperature = env.VITE_DEEPSEEK_TEMPERATURE ? parseFloat(env.VITE_DEEPSEEK_TEMPERATURE) : undefined;
  return new DeepSeekClient({ apiKey, baseUrl, model, visionModel, stream, maxTokens, temperature });
}
