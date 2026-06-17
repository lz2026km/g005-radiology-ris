export const EXAM_STATUS_MAPPING = {
  '已登记': 'registered',
  '待检查': 'scheduled',
  '检查中': 'inProgress',
  '待报告': 'pendingReport',
  '已报告': 'reported',
  '已发布': 'published',
  '已取消': 'cancelled',
} as const;

/** Worklist 轮询间隔(毫秒) — 15 秒 */
export const POLL_INTERVAL_MS = 15_000;
