export type SearchIndexType = 'patient' | 'exam' | 'report' | 'study' | 'all';

export interface SearchDocument {
  id: string;
  type: SearchIndexType;
  title: string;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  documents: SearchDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tookMs: number;
  suggestions?: string[];
}

export interface SearchQuery {
  text: string;
  types?: SearchIndexType[];
  filters?: Record<string, string | string[]>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  highlight?: boolean;
  fuzzy?: boolean;
}

const documents: Map<string, SearchDocument> = new Map();

export const searchEngine = {
  async index(doc: SearchDocument): Promise<void> {
    documents.set(doc.id, doc);
  },

  async bulkIndex(docs: SearchDocument[]): Promise<number> {
    let count = 0;
    for (const doc of docs) {
      documents.set(doc.id, doc);
      count++;
    }
    return count;
  },

  async search(query: SearchQuery): Promise<SearchResult> {
    const start = Date.now();
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const text = query.text.toLowerCase();

    let results = Array.from(documents.values());

    if (query.types && query.types.length > 0 && !query.types.includes('all')) {
      results = results.filter(d => query.types!.includes(d.type));
    }

    if (text) {
      results = results.filter(d =>
        d.title.toLowerCase().includes(text) ||
        d.content.toLowerCase().includes(text) ||
        d.tags.some(t => t.toLowerCase().includes(text))
      );

      results.forEach(d => {
        let score = 0;
        if (d.title.toLowerCase().includes(text)) score += 10;
        if (d.content.toLowerCase().includes(text)) score += 3;
        d.tags.forEach(t => { if (t.toLowerCase().includes(text)) score += 5; });
        d.score = score;
      });
      results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        results = results.filter(d => {
          const meta = d.metadata[key];
          if (!meta) return false;
          if (Array.isArray(value)) return value.includes(String(meta));
          return String(meta) === value;
        });
      }
    }

    if (query.sortBy) {
      results.sort((a, b) => {
        const aVal = a.metadata[query.sortBy!] || a[query.sortBy as keyof SearchDocument] || '';
        const bVal = b.metadata[query.sortBy!] || b[query.sortBy as keyof SearchDocument] || '';
        const cmp = String(aVal).localeCompare(String(bVal));
        return query.sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    const total = results.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paged = results.slice(offset, offset + pageSize);

    return {
      documents: paged, total, page, pageSize, totalPages,
      tookMs: Date.now() - start,
    };
  },

  async delete(id: string): Promise<boolean> {
    return documents.delete(id);
  },

  async clear(): Promise<void> {
    documents.clear();
  },

  async rebuild(): Promise<number> {
    documents.clear();
    return 0;
  },

  async getStats(): Promise<{ totalDocuments: number; byType: Record<string, number> }> {
    const byType: Record<string, number> = {};
    for (const doc of documents.values()) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    }
    return { totalDocuments: documents.size, byType };
  },
};
