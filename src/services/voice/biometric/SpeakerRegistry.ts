/**
 * G005 放射RIS系统 v3.0.6.5 - 说话人注册表
 * 20 升级点:档案管理 / 持久化 / 事件回调 / 激活控制
 */

import { MOCK_SPEAKER_PROFILES } from '../../../data/voice/speakerProfiles';
import type { SpeakerProfile, SpeakerMatchResult, SpeakerRegistryEvent } from '../../../types/voice';
import { speakerId } from './SpeakerId';

const STORAGE_KEY = 'g005-voice-speaker-registry';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

type RegistryListener = (event: SpeakerRegistryEvent, payload: { profile?: SpeakerProfile; match?: SpeakerMatchResult }) => void;

export class SpeakerRegistry {
  private profiles: Map<string, SpeakerProfile> = new Map();
  private listeners: Set<RegistryListener> = new Set<RegistryListener>();

  constructor(initial: SpeakerProfile[] = MOCK_SPEAKER_PROFILES) {
    const persisted = readJson<SpeakerProfile[]>(STORAGE_KEY, []);
    const merged = [...initial, ...persisted];
    merged.forEach((p) => this.profiles.set(p.userId, p));
  }

  // ---------- 公共 API ----------

  list(): SpeakerProfile[] {
    return Array.from(this.profiles.values());
  }

  listActive(): SpeakerProfile[] {
    return this.list().filter((p) => p.active);
  }

  get(userId: string): SpeakerProfile | undefined {
    return this.profiles.get(userId);
  }

  upsert(profile: SpeakerProfile): SpeakerProfile {
    this.profiles.set(profile.userId, profile);
    this.persist();
    this.emit('enrolled', { profile });
    return profile;
  }

  remove(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;
    this.profiles.delete(userId);
    this.persist();
    this.emit('removed', { profile });
    return true;
  }

  setActive(userId: string, active: boolean): SpeakerProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;
    profile.active = active;
    this.profiles.set(userId, profile);
    this.persist();
    this.emit('updated', { profile });
    return profile;
  }

  async verifyAndEmit(userId: string, audio: ArrayBuffer): Promise<SpeakerMatchResult> {
    const result = await speakerId.verify(userId, audio);
    if (result.matched && result.userId) {
      const profile = this.profiles.get(result.userId);
      if (profile) {
        profile.totalVerifications += 1;
        profile.lastVerifiedAt = new Date().toISOString();
        const total = profile.totalVerifications;
        profile.successRate = total === 0 ? 0 : (profile.successRate * (total - 1) + 1) / total;
        this.persist();
        this.emit('matched', { profile, match: result });
      }
    } else {
      this.emit('rejected', { match: result });
    }
    return result;
  }

  on(listener: RegistryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  export(): SpeakerProfile[] {
    return this.list();
  }

  import(profiles: SpeakerProfile[], merge = false): { added: number; updated: number } {
    let added = 0;
    let updated = 0;
    profiles.forEach((p) => {
      if (this.profiles.has(p.userId)) {
        if (!merge) {
          this.profiles.set(p.userId, p);
          updated++;
        }
      } else {
        this.profiles.set(p.userId, p);
        added++;
      }
    });
    this.persist();
    return { added, updated };
  }

  getStats(): { total: number; active: number; totalVerifications: number; avgSuccessRate: number } {
    const all = this.list();
    const totalVerifications = all.reduce((a, b) => a + b.totalVerifications, 0);
    const active = all.filter((p) => p.active).length;
    const avgSuccessRate = all.length === 0 ? 0 : all.reduce((a, b) => a + b.successRate, 0) / all.length;
    return { total: all.length, active, totalVerifications, avgSuccessRate };
  }

  // ---------- 内部 ----------

  private persist(): void {
    writeJson(STORAGE_KEY, this.list());
  }

  private emit(event: SpeakerRegistryEvent, payload: { profile?: SpeakerProfile; match?: SpeakerMatchResult }): void {
    this.listeners.forEach((l) => l(event, payload));
  }
}

export const speakerRegistry = new SpeakerRegistry();
