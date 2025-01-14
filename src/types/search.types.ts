export interface SearchFilters {
  languages: string[];
  categories: string[];
  difficulty?: string;
  regions: string[];
  types: ContentType[];
}

export enum ContentType {
  IDIOM = 'idiom',
  PROVERB = 'proverb',
  SLANG = 'slang',
  UNTRANSLATABLE = 'untranslatable',
  RIDDLE = 'riddle',
  WISDOM = 'wisdom',
  MYTH = 'myth',
  FALSE_FRIEND = 'false_friend'
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  difficulty?: string;
  region?: string;
  type: ContentType;
  tags: string[];
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  loading: boolean;
  error?: string;
  page: number;
  totalPages: number;
}

export interface SearchSuggestion {
  text: string;
  type: ContentType;
  highlight: string;
}