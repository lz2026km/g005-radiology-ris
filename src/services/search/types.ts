export interface SearchResultItem {
  id: string;
  type: 'patient' | 'exam' | 'report' | 'study';
  title: string;
  subtitle?: string;
  description?: string;
  score?: number;
  matchedFields?: string[];
  highlights?: Record<string, string>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  tookMs: number;
  suggestions?: string[];
  facets?: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  label: string;
  values: Array<{ value: string; count: number; selected: boolean }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: Record<string, string[]>;
  type: 'patient' | 'exam' | 'report' | 'all';
  createdAt: string;
  updatedAt: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  resultCount?: number;
  searchedAt: string;
}
