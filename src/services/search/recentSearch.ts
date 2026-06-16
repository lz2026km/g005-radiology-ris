import type { RecentSearch } from './types';

const STORAGE_KEY = 'g005:recent-searches';
const MAX_ITEMS = 50;

function load(): RecentSearch[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function save(searches: RecentSearch[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_ITEMS)));
}

export const recentSearchService = {
  list(): RecentSearch[] {
    return load();
  },

  add(query: string, resultCount?: number): RecentSearch {
    const searches = load();
    const existing = searches.findIndex(s => s.query === query);
    if (existing >= 0) searches.splice(existing, 1);
    const search: RecentSearch = {
      id: `rs-${Date.now()}`,
      query,
      resultCount,
      searchedAt: new Date().toISOString(),
    };
    searches.unshift(search);
    save(searches);
    return search;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  remove(id: string): boolean {
    const searches = load();
    const idx = searches.findIndex(s => s.id === id);
    if (idx < 0) return false;
    searches.splice(idx, 1);
    save(searches);
    return true;
  },
};
