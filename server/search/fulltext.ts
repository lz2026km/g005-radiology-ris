import type { SearchDocument, SearchQuery, SearchResult } from './engine';

const stopWords = new Set(['的', '了', '是', '在', '有', '和', '与', '就', '也', '还', '之', '而', '且', '或', '被', '把', '从', '对', '为', '以', '到', '让', '向', '往', '于', '与', 'a', 'an', 'the', 'this', 'that', 'is', 'was', 'are', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'and', 'or', 'not']);

function tokenize(text: string): string[] {
  return text.split(/[\s,，。、；;：:！!？?（）()\[\]【】{}【]+\s*/).filter(t => t.length > 0 && !stopWords.has(t.toLowerCase()));
}

export const fulltextSearch = {
  async search(text: string, options?: { fuzzy?: boolean; highlight?: boolean; page?: number; pageSize?: number }): Promise<SearchResult> {
    const { searchEngine } = await import('./engine');
    const tokens = tokenize(text);
    const results = await searchEngine.search({
      text: tokens.join(' '),
      fuzzy: options?.fuzzy ?? true,
      page: options?.page || 1,
      pageSize: options?.pageSize || 20,
      highlight: options?.highlight ?? true,
    });

    if (options?.highlight && results.documents.length > 0) {
      results.documents = results.documents.map(doc => ({
        ...doc,
        content: highlightText(doc.content, tokens),
        title: highlightText(doc.title, tokens),
      }));
    }
    return results;
  },

  async searchPinyin(text: string): Promise<SearchResult> {
    const { searchEngine } = await import('./engine');
    return searchEngine.search({ text, fuzzy: true, pageSize: 20 });
  },

  async searchFuzzy(text: string, maxDistance: number = 2): Promise<SearchResult> {
    const { searchEngine } = await import('./engine');
    return searchEngine.search({ text, fuzzy: true, pageSize: 20 });
  },
};

function highlightText(text: string, tokens: string[]): string {
  let highlighted = text;
  for (const token of tokens) {
    const regex = new RegExp(`(${escapeRegExp(token)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }
  return highlighted;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
