import { useState, useCallback } from 'react';
import type {
  SearchState,
  SearchFilters,
  SearchSuggestion,
  SearchResult,
} from '../types/search.types';

const initialState: SearchState = {
  query: '',
  filters: {
    languages: [],
    categories: [],
    regions: [],
    types: [],
  },
  results: [],
  loading: false,
  page: 1,
  totalPages: 0,
};

export const useSearch = () => {
  const [state, setState] = useState<SearchState>(initialState);

  const search = useCallback(async (
    query: string,
    filters: SearchFilters,
    page: number = 1
  ) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters, page }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        results: data.items,
        totalPages: data.totalPages,
        loading: false,
        error: undefined,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, []);

  const fetchSuggestions = useCallback(async (
    query: string
  ): Promise<SearchSuggestion[]> => {
    if (query.length < 2) return [];

    try {
      const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }, []);

  return {
    ...state,
    search,
    fetchSuggestions,
    setFilters: (filters: SearchFilters) =>
      setState((prev) => ({ ...prev, filters })),
    setPage: (page: number) => setState((prev) => ({ ...prev, page })),
    reset: () => setState(initialState),
  };
};