export type { SearchResultItem, SearchResponse, SearchFacet, SavedSearch, RecentSearch } from './types';
export { searchClient } from './client';
export { savedSearchService } from './savedSearch';
export { recentSearchService } from './recentSearch';
export { searchAnalytics } from './searchAnalytics';
export type { SearchAnalyticsEvent } from './searchAnalytics';
export { buildFilterString, parseFilterString, isFilterActive, countActiveFilters } from './filterBuilder';
export type { FilterCondition, FilterGroup } from './filterBuilder';
