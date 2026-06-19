/**
 * G005 RIS v3.0.7 - 便签服务 (Sticky Note Service)
 *
 *  - 添加 / 更新 / 删除便签
 *  - 锚定到 studyInstanceUID / frameIndex
 *  - 拖拽坐标 / 大小持久化
 *  - 通过 WebSocket 广播变更
 */

import type { CollabStickyNote, CollabNoteColor } from '../../types/collab';
import { webSocketCollabService } from './WebSocketCollabService';

const notes = new Map<string, CollabStickyNote>();
let seedLoaded = false;

const generateId = (): string => `sn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedFromMock = (): void => {
  if (seedLoaded) return;
  seedLoaded = true;
  try {
    const mod = require('../../data/collabMock') as { COLLAB_STICKY_NOTES?: CollabStickyNote[] };
    mod.COLLAB_STICKY_NOTES?.forEach((n) => notes.set(n.id, { ...n }));
  } catch {
    /* swallow */
  }
};

export interface StickyNoteInput {
  reportId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  title?: string;
  content: string;
  color?: CollabNoteColor;
  studyInstanceUID?: string;
  frameIndex?: number;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface StickyNoteUpdate {
  title?: string;
  content?: string;
  color?: CollabNoteColor;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  pinned?: boolean;
  frameIndex?: number;
}

export interface StickyNoteService {
  add(input: StickyNoteInput): CollabStickyNote;
  update(noteId: string, patch: StickyNoteUpdate): CollabStickyNote | null;
  remove(noteId: string, userId?: string): boolean;
  move(noteId: string, position: { x: number; y: number }): CollabStickyNote | null;
  resize(noteId: string, size: { width: number; height: number }): CollabStickyNote | null;
  togglePin(noteId: string): CollabStickyNote | null;
  get(noteId: string): CollabStickyNote | null;
  list(filter?: { reportId?: string; authorId?: string; frameIndex?: number }): CollabStickyNote[];
  subscribe(handler: (notes: CollabStickyNote[]) => void): () => void;
}

const listeners = new Set<(notes: CollabStickyNote[]) => void>();

const notify = (): void => {
  const snap = Array.from(notes.values());
  listeners.forEach((l) => { try { l(snap); } catch { /* swallow */ } });
};

const defaultPalette: CollabNoteColor[] = ['yellow', 'pink', 'green', 'blue', 'purple', 'orange'];

export const stickyNoteService: StickyNoteService = {
  add(input) {
    seedFromMock();
    const now = new Date().toISOString();
    const note: CollabStickyNote = {
      id: generateId(),
      reportId: input.reportId,
      authorId: input.authorId,
      authorName: input.authorName,
      authorColor: input.authorColor,
      title: input.title,
      content: input.content,
      color: input.color ?? defaultPalette[Math.floor(Math.random() * defaultPalette.length)] ?? 'yellow',
      studyInstanceUID: input.studyInstanceUID,
      frameIndex: input.frameIndex,
      position: input.position,
      width: input.width ?? 200,
      height: input.height ?? 100,
      zIndex: 10 + notes.size,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    notes.set(note.id, note);
    webSocketCollabService.broadcast({
      type: 'note-add',
      userId: input.authorId,
      userName: input.authorName,
      payload: { note },
    });
    notify();
    return note;
  },

  update(noteId, patch) {
    seedFromMock();
    const n = notes.get(noteId);
    if (!n) return null;
    Object.assign(n, patch);
    n.updatedAt = new Date().toISOString();
    notes.set(noteId, n);
    webSocketCollabService.broadcast({
      type: 'note-update',
      userId: n.authorId,
      userName: n.authorName,
      payload: { note: n, patch },
    });
    notify();
    return n;
  },

  remove(noteId, userId) {
    seedFromMock();
    const n = notes.get(noteId);
    if (!n) return false;
    notes.delete(noteId);
    webSocketCollabService.broadcast({
      type: 'note-remove',
      userId: userId ?? n.authorId,
      userName: n.authorName,
      payload: { noteId, reportId: n.reportId },
    });
    notify();
    return true;
  },

  move(noteId, position) {
    const n = notes.get(noteId);
    if (!n) return null;
    n.position = position;
    n.updatedAt = new Date().toISOString();
    notes.set(noteId, n);
    webSocketCollabService.broadcast({
      type: 'note-update',
      userId: n.authorId,
      payload: { noteId, position },
    });
    notify();
    return n;
  },

  resize(noteId, size) {
    const n = notes.get(noteId);
    if (!n) return null;
    n.width = size.width;
    n.height = size.height;
    n.updatedAt = new Date().toISOString();
    notes.set(noteId, n);
    webSocketCollabService.broadcast({
      type: 'note-update',
      userId: n.authorId,
      payload: { noteId, size },
    });
    notify();
    return n;
  },

  togglePin(noteId) {
    const n = notes.get(noteId);
    if (!n) return null;
    n.pinned = !n.pinned;
    if (n.pinned) n.zIndex = 999;
    else n.zIndex = 10;
    n.updatedAt = new Date().toISOString();
    notes.set(noteId, n);
    notify();
    return n;
  },

  get(noteId) {
    seedFromMock();
    return notes.get(noteId) ?? null;
  },

  list(filter) {
    seedFromMock();
    let list = Array.from(notes.values());
    if (filter?.reportId) list = list.filter((n) => n.reportId === filter.reportId);
    if (filter?.authorId) list = list.filter((n) => n.authorId === filter.authorId);
    if (filter?.frameIndex !== undefined) list = list.filter((n) => n.frameIndex === filter.frameIndex);
    return list.sort((a, b) => b.zIndex - a.zIndex);
  },

  subscribe(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
  },
};

export default stickyNoteService;
