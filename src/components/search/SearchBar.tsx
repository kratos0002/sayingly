import React, { useState, useCallback, useRef } from 'react';
import { debounce } from '../../utils/debounce';
import { useSearch } from '../../hooks/useSearch';
import type { SearchSuggestion } from '../../types/search.types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search across languages and cultures...',
  autoFocus = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchSuggestions } = useSearch();

  const debouncedFetch = useCallback(
    debounce(async (value: string) => {
      if (value.length >= 2) {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    debouncedFetch(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(query);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="search-input"
          aria-label="Search input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <button type="submit" className="search-button" aria-label="Submit search">
          Search
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="suggestions-list" role="listbox">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.text}
              role="option"
              className="suggestion-item"
              onClick={() => {
                setQuery(suggestion.text);
                onSearch(suggestion.text);
                setSuggestions([]);
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: suggestion.highlight }} />
              <span className="suggestion-type">{suggestion.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};