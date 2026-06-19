/**
 * G005 RIS v3.0.7 - 即时聊天服务 (Chat)
 *
 *  - 房间 / 私聊 (recipientId)
 *  - @ 提及 / 引用
 *  - 反应 emoji
 *  - 撤回 / 编辑
 *  - 已读状态(可选)
 */

import type {
  ChatMessage,
  ChatRoom,
  ChatMessageType,
  ChatReaction,
} from '../../types/collab';

const MAX_PER_ROOM = 500;

interface RoomState {
  room: ChatRoom;
  messages: ChatMessage[];
  /** 已读游标 (per user) */
  cursors: Map<string, string>; // userId → last read message id
}

const rooms = new Map<string, RoomState>();
let seedLoaded = false;

const generateId = (): string => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const ensureRoom = (roomId: string): RoomState => {
  let r = rooms.get(roomId);
  if (!r) {
    r = {
      room: {
        id: roomId,
        name: roomId,
        participants: [],
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        pinned: false,
        muted: false,
      },
      messages: [],
      cursors: new Map(),
    };
    rooms.set(roomId, r);
  }
  return r;
};

const seedFromMock = (): void => {
  if (seedLoaded) return;
  seedLoaded = true;
  try {
    const mod = require('../../data/collabMock') as {
      COLLAB_CHAT_ROOMS?: ChatRoom[];
      COLLAB_CHAT_MESSAGES?: ChatMessage[];
    };
    mod.COLLAB_CHAT_ROOMS?.forEach((rm) => {
      const r = ensureRoom(rm.id);
      r.room = { ...rm };
    });
    mod.COLLAB_CHAT_MESSAGES?.forEach((m) => {
      const r = ensureRoom(m.roomId);
      r.messages.push({ ...m, reactions: m.reactions ?? [] });
    });
  } catch {
    /* swallow */
  }
};

export interface SendMessageInput {
  roomId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  type?: ChatMessageType;
  mentions?: string[];
  recipientId?: string;
  replyToId?: string;
}

export interface ChatService {
  send(input: SendMessageInput): ChatMessage;
  edit(messageId: string, content: string): ChatMessage | null;
  recall(messageId: string): boolean;
  react(messageId: string, emoji: string, userId: string, op: 'add' | 'remove'): ChatMessage | null;
  list(roomId: string, opts?: { limit?: number; before?: string }): ChatMessage[];
  rooms(): ChatRoom[];
  createRoom(room: Partial<ChatRoom> & { id: string }): ChatRoom;
  joinRoom(roomId: string, userId: string): ChatRoom | null;
  leaveRoom(roomId: string, userId: string): ChatRoom | null;
  markRead(roomId: string, userId: string): number;
  unreadCount(roomId: string, userId: string): number;
  subscribe(handler: (rooms: ChatRoom[]) => void): () => void;
}

const listeners = new Set<(rooms: ChatRoom[]) => void>();

const notify = (): void => {
  const snap = Array.from(rooms.values()).map((r) => r.room);
  listeners.forEach((l) => { try { l(snap); } catch { /* swallow */ } });
};

export const chatService: ChatService = {
  send(input) {
    seedFromMock();
    const r = ensureRoom(input.roomId);
    if (!r.room.participants.includes(input.authorId)) {
      r.room.participants.push(input.authorId);
    }
    const msg: ChatMessage = {
      id: generateId(),
      roomId: input.roomId,
      authorId: input.authorId,
      authorName: input.authorName,
      authorColor: input.authorColor,
      type: input.type ?? 'text',
      content: input.content,
      mentions: input.mentions ?? [],
      recipientId: input.recipientId,
      replyToId: input.replyToId,
      reactions: [],
      createdAt: new Date().toISOString(),
      recalled: false,
    };
    r.messages.push(msg);
    if (r.messages.length > MAX_PER_ROOM) r.messages.splice(0, r.messages.length - MAX_PER_ROOM);
    r.room.lastMessageAt = msg.createdAt;
    // 增加未读(每个非发送者)
    r.room.participants.forEach((uid) => {
      if (uid !== input.authorId) {
        r.cursors.set(uid, r.cursors.get(uid) ?? '');
      }
    });
    notify();
    return msg;
  },

  edit(messageId, content) {
    seedFromMock();
    for (const r of rooms.values()) {
      const m = r.messages.find((x) => x.id === messageId);
      if (m) {
        if (m.recalled) return null;
        m.content = content;
        m.editedAt = new Date().toISOString();
        return m;
      }
    }
    return null;
  },

  recall(messageId) {
    seedFromMock();
    for (const r of rooms.values()) {
      const m = r.messages.find((x) => x.id === messageId);
      if (m) {
        m.recalled = true;
        m.content = '[消息已撤回]';
        return true;
      }
    }
    return false;
  },

  react(messageId, emoji, userId, op) {
    seedFromMock();
    for (const r of rooms.values()) {
      const m = r.messages.find((x) => x.id === messageId);
      if (!m) continue;
      let react = m.reactions.find((x) => x.emoji === emoji);
      if (op === 'add') {
        if (!react) {
          react = { emoji, userIds: [] } satisfies ChatReaction;
          m.reactions.push(react);
        }
        if (!react.userIds.includes(userId)) react.userIds.push(userId);
      } else {
        if (react) {
          react.userIds = react.userIds.filter((u) => u !== userId);
          if (react.userIds.length === 0) {
            m.reactions = m.reactions.filter((x) => x.emoji !== emoji);
          }
        }
      }
      return m;
    }
    return null;
  },

  list(roomId, opts) {
    seedFromMock();
    const r = rooms.get(roomId);
    if (!r) return [];
    let msgs = r.messages.slice();
    if (opts?.before) msgs = msgs.filter((m) => m.createdAt < opts.before!);
    if (opts?.limit) msgs = msgs.slice(-opts.limit);
    return msgs;
  },

  rooms() {
    seedFromMock();
    return Array.from(rooms.values()).map((r) => r.room);
  },

  createRoom(room) {
    const r = ensureRoom(room.id);
    r.room = {
      id: room.id,
      name: room.name ?? room.id,
      reportId: room.reportId,
      participants: room.participants ?? [],
      lastMessageAt: room.lastMessageAt ?? new Date().toISOString(),
      unreadCount: room.unreadCount ?? 0,
      pinned: room.pinned ?? false,
      muted: room.muted ?? false,
    };
    notify();
    return r.room;
  },

  joinRoom(roomId, userId) {
    seedFromMock();
    const r = ensureRoom(roomId);
    if (!r.room.participants.includes(userId)) {
      r.room.participants.push(userId);
    }
    notify();
    return r.room;
  },

  leaveRoom(roomId, userId) {
    seedFromMock();
    const r = rooms.get(roomId);
    if (!r) return null;
    r.room.participants = r.room.participants.filter((p) => p !== userId);
    notify();
    return r.room;
  },

  markRead(roomId, userId) {
    seedFromMock();
    const r = rooms.get(roomId);
    if (!r) return 0;
    const last = r.messages[r.messages.length - 1];
    if (!last) return 0;
    const prev = r.cursors.get(userId) ?? '';
    r.cursors.set(userId, last.id);
    r.room.unreadCount = r.room.participants.filter((p) => p !== userId).length > 0 ? 0 : 0;
    notify();
    void prev;
    return 0;
  },

  unreadCount(roomId, userId) {
    seedFromMock();
    const r = rooms.get(roomId);
    if (!r) return 0;
    const cursor = r.cursors.get(userId);
    if (!cursor) return r.messages.length;
    const idx = r.messages.findIndex((m) => m.id === cursor);
    if (idx < 0) return r.messages.length;
    return Math.max(0, r.messages.length - 1 - idx);
  },

  subscribe(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
  },
};

export default chatService;
