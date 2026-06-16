import type { SearchQuery, SearchResult } from './engine';

export const queryService = {
  async parseQuery(raw: string): Promise<SearchQuery> {
    const query: SearchQuery = { text: raw, page: 1, pageSize: 20, fuzzy: true, highlight: true };
    const typeMatch = raw.match(/type:(\w+)/);
    if (typeMatch) {
      query.types = [typeMatch[1] as any];
      query.text = query.text.replace(typeMatch[0], '').trim();
    }
    const filterMatch = raw.match(/(\w+):"([^"]+)"/g);
    if (filterMatch) {
      query.filters = {};
      for (const f of filterMatch) {
        const [key, val] = f.split(':');
        query.filters[key] = val.replace(/"/g, '');
      }
      query.text = filterMatch.reduce((t, f) => t.replace(f, ''), query.text).trim();
    }
    return query;
  },

  async execute(query: SearchQuery): Promise<SearchResult> {
    const { searchEngine } = await import('./engine');
    return searchEngine.search(query);
  },

  async suggest(prefix: string, limit: number = 5): Promise<string[]> {
    const { searchEngine } = await import('./engine');
    const result = await searchEngine.search({ text: prefix, pageSize: limit });
    const suggestions = new Set<string>();
    for (const doc of result.documents) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().startsWith(prefix.toLowerCase())) {
          suggestions.add(tag);
        }
      }
      if (suggestions.size >= limit) break;
    }
    return Array.from(suggestions);
  },

  async multiIndexSearch(query: SearchQuery): Promise<SearchResult> {
    const { searchEngine } = await import('./engine');
    return searchEngine.search({ ...query, types: ['patient', 'exam', 'report'] });
  },
};
