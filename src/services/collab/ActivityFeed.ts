/**
 * G005 RIS v3.0.7 - 活动流 (Activity Feed)
 *
 *  - 全局环形缓冲 (容量 500)
 *  - 类型过滤 / 用户过滤 / 报告过滤
 *  - 订阅变更
 */

import type { CollabActivity, CollabActivityType } from '../../types/collab';

const MAX_ITEMS = 500;
const activities: CollabActivity[] = [];
let seedLoaded = false;

const generateId = (): string => `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedFromMock = (): void => {
  if (seedLoaded) return;
  seedLoaded = true;
  try {
    const mod = require('../../data/collabMock') as { COLLAB_ACTIVITIES?: CollabActivity[] };
    mod.COLLAB_ACTIVITIES?.forEach((a) => activities.push({ ...a }));
    activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    /* swallow */
  }
};

export interface ActivityInput {
  reportId: string;
  userId: string;
  userName: string;
  userColor: string;
  type: CollabActivityType;
  detail: string;
  refId?: string;
  meta?: Record<string, unknown>;
}

export interface ActivityFeedQuery {
  reportId?: string;
  userId?: string;
  type?: CollabActivityType | CollabActivityType[];
  since?: string;
  limit?: number;
}

export interface ActivityFeed {
  log(input: ActivityInput): CollabActivity;
  query(filter: ActivityFeedQuery): CollabActivity[];
  recent(limit?: number): CollabActivity[];
  count(filter?: ActivityFeedQuery): number;
  clear(): void;
  subscribe(handler: (items: CollabActivity[]) => void): () => void;
}

const listeners = new Set<(items: CollabActivity[]) => void>();

const notify = (): void => {
  const snap = activities.slice();
  listeners.forEach((l) => { try { l(snap); } catch { /* swallow */ } });
};

export const activityFeed: ActivityFeed = {
  log(input) {
    seedFromMock();
    const item: CollabActivity = {
      id: generateId(),
      reportId: input.reportId,
      userId: input.userId,
      userName: input.userName,
      userColor: input.userColor,
      type: input.type,
      detail: input.detail,
      refId: input.refId,
      timestamp: new Date().toISOString(),
      meta: input.meta,
    };
    activities.unshift(item);
    if (activities.length > MAX_ITEMS) activities.length = MAX_ITEMS;
    notify();
    return item;
  },

  query(filter) {
    seedFromMock();
    let list = activities.slice();
    if (filter.reportId) list = list.filter((a) => a.reportId === filter.reportId);
    if (filter.userId) list = list.filter((a) => a.userId === filter.userId);
    if (filter.type) {
      const allowed = Array.isArray(filter.type) ? filter.type : [filter.type];
      list = list.filter((a) => allowed.includes(a.type));
    }
    if (filter.since) list = list.filter((a) => a.timestamp >= filter.since!);
    if (filter.limit) list = list.slice(0, filter.limit);
    return list;
  },

  recent(limit = 50) {
    seedFromMock();
    return activities.slice(0, limit);
  },

  count(filter = {}) {
    return activityFeed.query({ ...filter, limit: undefined }).length;
  },

  clear() {
    activities.length = 0;
    notify();
  },

  subscribe(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
  },
};

export default activityFeed;
