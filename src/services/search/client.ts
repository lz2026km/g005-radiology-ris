import { api } from '../api/client';
import type { SearchResponse, SearchResultItem } from './types';

export const searchClient = {
  async search(query: string, options?: { type?: string; page?: number; pageSize?: number; filters?: Record<string, string[]> }): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    if (options?.type) params.set('type', options.type);
    if (options?.page) params.set('page', String(options.page));
    if (options?.pageSize) params.set('pageSize', String(options.pageSize));
    const res = await api.get<SearchResponse>(`/search?${params.toString()}`);
    return res.success ? res.data : { results: [], total: 0, page: 1, pageSize: 20, totalPages: 0, tookMs: 0 };
  },

  async suggest(prefix: string): Promise<string[]> {
    const res = await api.get<string[]>(`/search/suggest?q=${encodeURIComponent(prefix)}`);
    return res.success ? res.data : [];
  },

  async getById(id: string, type: string): Promise<SearchResultItem | null> {
    const res = await api.get<SearchResultItem>(`/search/${type}/${id}`);
    return res.success ? res.data : null;
  },

  async exportCsv(query: string): Promise<Blob> {
    const res = await fetch(`/api/v1/search/export?q=${encodeURIComponent(query)}`, { headers: { Accept: 'text/csv' } });
    return res.blob();
  },
};
