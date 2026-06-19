/**
 * G005 RIS v3.0.7 - 屏幕共享服务 (Mock WebRTC Signal)
 *
 *  NOTE:
 *  生产环境应替换为真实 WebRTC 实现 (RTCPeerConnection + 信令服务器)。
 *  本服务模拟信令交换流程: offer → answer → ICE candidates,
 *  保证上层 UI (ScreenShare.tsx) 可独立运行与单元测试。
 *
 *  - start(roomId, presenter)   主持人开启屏幕共享
 *  - stop(sessionId)            停止
 *  - joinAsViewer(sessionId, viewer)  观众加入
 *  - leaveViewer(sessionId, viewerId) 观众离开
 *  - getActive(roomId)          获取当前活跃 session
 *  - simulateOffer/Answer/Ice  模拟信令交换
 */

import type { ScreenShareSession, CollabRoomId } from '../../types/collab';
import { webSocketCollabService } from './WebSocketCollabService';

const sessions = new Map<string, ScreenShareSession>();
let seedLoaded = false;

const generateId = (): string => `ss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedFromMock = (): void => {
  if (seedLoaded) return;
  seedLoaded = true;
  try {
    const mod = require('../../data/collabMock') as { COLLAB_SCREEN_SHARES?: ScreenShareSession[] };
    mod.COLLAB_SCREEN_SHARES?.forEach((s) => sessions.set(s.id, { ...s }));
  } catch {
    /* swallow */
  }
};

const mockSdp = (role: 'offer' | 'answer'): string => {
  const body = `${role === 'offer' ? 'offer' : 'answer'}:v=0\no=- ${Date.now()} 1 IN IP4 127.0.0.1\ns=-\nt=0 0\nm=video 9 UDP/TLS/RTP/SAVPF 96\n`;
  return btoa(body).slice(0, 96);
};

const mockCandidates = () => [
  { candidate: 'candidate:1 1 udp 2122260223 192.168.1.100 50000 typ host', sdpMid: '0', sdpMLineIndex: 0 },
  { candidate: 'candidate:2 1 udp 2122260222 10.0.0.1 50001 typ host', sdpMid: '0', sdpMLineIndex: 0 },
];

export interface StartOptions {
  presenterId: string;
  presenterName: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
  recording?: boolean;
}

export interface ScreenShareService {
  start(roomId: CollabRoomId, opts: StartOptions): ScreenShareSession;
  stop(sessionId: string): boolean;
  joinAsViewer(sessionId: string, viewer: { userId: string; userName: string }): ScreenShareSession | null;
  leaveViewer(sessionId: string, userId: string): ScreenShareSession | null;
  pause(sessionId: string): ScreenShareSession | null;
  resume(sessionId: string): ScreenShareSession | null;
  toggleRecording(sessionId: string): ScreenShareSession | null;
  getActive(roomId: CollabRoomId): ScreenShareSession | null;
  get(sessionId: string): ScreenShareSession | null;
  list(): ScreenShareSession[];
  /** 模拟 offer/answer/ice (用于演示) */
  simulateOffer(sessionId: string): string;
  simulateAnswer(sessionId: string, sdp: string): ScreenShareSession | null;
  simulateIce(sessionId: string): ScreenShareSession | null;
  subscribe(handler: (sessions: ScreenShareSession[]) => void): () => void;
}

const listeners = new Set<(sessions: ScreenShareSession[]) => void>();

const notify = (): void => {
  const snap = Array.from(sessions.values());
  listeners.forEach((l) => { try { l(snap); } catch { /* swallow */ } });
};

export const screenShareService: ScreenShareService = {
  start(roomId, opts) {
    seedFromMock();
    const id = generateId();
    const session: ScreenShareSession = {
      id,
      roomId,
      presenterId: opts.presenterId,
      presenterName: opts.presenterName,
      state: 'requesting',
      hasAudio: opts.hasAudio ?? true,
      hasVideo: opts.hasVideo ?? true,
      streamMockUrl: `/mock/screen-share-${id}.webm`,
      startedAt: new Date().toISOString(),
      viewers: [],
      recording: opts.recording ?? false,
    };
    sessions.set(id, session);
    // 模拟异步建立: requesting → sharing
    setTimeout(() => {
      const s = sessions.get(id);
      if (!s) return;
      s.state = 'sharing';
      s.signaling = {
        sdpType: 'offer',
        sdp: mockSdp('offer'),
        candidates: mockCandidates(),
      };
      sessions.set(id, s);
      webSocketCollabService.broadcast({
        type: 'screen-share-start',
        userId: opts.presenterId,
        userName: opts.presenterName,
        payload: { session: s },
      });
      notify();
    }, 250);
    return session;
  },

  stop(sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return false;
    s.state = 'stopped';
    s.endedAt = new Date().toISOString();
    sessions.set(sessionId, s);
    webSocketCollabService.broadcast({
      type: 'screen-share-stop',
      userId: s.presenterId,
      userName: s.presenterName,
      payload: { sessionId },
    });
    notify();
    return true;
  },

  joinAsViewer(sessionId, viewer) {
    const s = sessions.get(sessionId);
    if (!s || s.state !== 'sharing') return null;
    if (!s.viewers.some((v) => v.userId === viewer.userId)) {
      s.viewers.push({ ...viewer, joinedAt: new Date().toISOString() });
      sessions.set(sessionId, s);
      notify();
    }
    return s;
  },

  leaveViewer(sessionId, userId) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    s.viewers = s.viewers.filter((v) => v.userId !== userId);
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  pause(sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    s.state = 'paused';
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  resume(sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    s.state = 'sharing';
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  toggleRecording(sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    s.recording = !s.recording;
    if (s.recording) s.recordingUrl = `/mock/recording-${sessionId}.webm`;
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  getActive(roomId) {
    seedFromMock();
    const list = Array.from(sessions.values()).filter((s) => s.roomId === roomId && (s.state === 'sharing' || s.state === 'paused'));
    return list[0] ?? null;
  },

  get(sessionId) {
    seedFromMock();
    return sessions.get(sessionId) ?? null;
  },

  list() {
    seedFromMock();
    return Array.from(sessions.values());
  },

  simulateOffer(sessionId) {
    const sdp = mockSdp('offer');
    const s = sessions.get(sessionId);
    if (s) {
      s.signaling = { sdpType: 'offer', sdp, candidates: mockCandidates() };
      sessions.set(sessionId, s);
      notify();
    }
    return sdp;
  },

  simulateAnswer(sessionId, sdp) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    s.signaling = { sdpType: 'answer', sdp, candidates: mockCandidates() };
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  simulateIce(sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return null;
    if (s.signaling) s.signaling.candidates = mockCandidates();
    sessions.set(sessionId, s);
    notify();
    return s;
  },

  subscribe(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
  },
};

export default screenShareService;
