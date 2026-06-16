export interface Facet {
  field: string;
  label: string;
  values: Array<{ value: string; count: number; selected?: boolean }>;
}

export interface FacetedSearchResult {
  documents: Record<string, unknown>[];
  facets: Facet[];
  total: number;
  page: number;
  pageSize: number;
}

export const facetedSearch = {
  async search(query: { text?: string; facets?: Record<string, string[]>; page?: number; pageSize?: number }): Promise<FacetedSearchResult> {
    return { documents: [], facets: [], total: 0, page: query.page || 1, pageSize: query.pageSize || 20 };
  },

  async getFacets(indexType: string): Promise<Facet[]> {
    const commonFacets: Facet[] = [
      { field: 'modality', label: 'Modality', values: ['CT', 'MR', 'DR', 'DSA', 'US'].map(v => ({ value: v, count: 0 })) },
      { field: 'status', label: 'Status', values: ['active', 'completed', 'pending'].map(v => ({ value: v, count: 0 })) },
      { field: 'bodyPart', label: 'Body Part', values: ['Head', 'Chest', 'Abdomen', 'Spine'].map(v => ({ value: v, count: 0 })) },
      { field: 'priority', label: 'Priority', values: ['Routine', 'Urgent', 'Critical'].map(v => ({ value: v, count: 0 })) },
    ];
    return commonFacets;
  },

  async applyFacetFilter(facets: Record<string, string[]>, documents: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    let filtered = [...documents];
    for (const [field, values] of Object.entries(facets)) {
      if (values.length > 0) {
        filtered = filtered.filter(d => values.includes(String(d[field])));
      }
    }
    return filtered;
  },
};
