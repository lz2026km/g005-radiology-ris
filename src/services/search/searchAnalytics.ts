export interface SearchAnalyticsEvent {
  query: string;
  resultCount: number;
  tookMs: number;
  filtersUsed?: Record<string, string[]>;
  timestamp: string;
}

const events: SearchAnalyticsEvent[] = [];

export const searchAnalytics = {
  track(event: Omit<SearchAnalyticsEvent, 'timestamp'>): void {
    events.push({ ...event, timestamp: new Date().toISOString() });
    if (events.length > 10000) events.shift();
  },

  getStats(): { totalSearches: number; avgResults: number; avgTimeMs: number; topQueries: Array<{ query: string; count: number }> } {
    if (events.length === 0) return { totalSearches: 0, avgResults: 0, avgTimeMs: 0, topQueries: [] };
    const totalSearches = events.length;
    const avgResults = events.reduce((s, e) => s + e.resultCount, 0) / totalSearches;
    const avgTimeMs = events.reduce((s, e) => s + e.tookMs, 0) / totalSearches;
    const queryCounts = new Map<string, number>();
    for (const e of events) {
      queryCounts.set(e.query, (queryCounts.get(e.query) || 0) + 1);
    }
    const topQueries = Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
    return { totalSearches, avgResults, avgTimeMs, topQueries };
  },

  clear(): void {
    events.length = 0;
  },
};
