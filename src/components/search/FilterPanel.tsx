import React from 'react';
import type { SearchFilters, ContentType } from '../../types/search.types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  availableFilters: {
    languages: string[];
    categories: string[];
    difficulties: string[];
    regions: string[];
    types: ContentType[];
  };
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availableFilters,
}) => {
  const handleFilterChange = (
    filterType: keyof SearchFilters,
    value: string | string[]
  ) => {
    onFilterChange({
      ...filters,
      [filterType]: value,
    });
  };

  return (
    <div className="filter-panel" role="complementary">
      <div className="filter-section">
        <h3>Languages</h3>
        <select
          multiple
          value={filters.languages}
          onChange={(e) =>
            handleFilterChange(
              'languages',
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {availableFilters.languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>Categories</h3>
        <select
          multiple
          value={filters.categories}
          onChange={(e) =>
            handleFilterChange(
              'categories',
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {availableFilters.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>Difficulty</h3>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="">Any</option>
          {availableFilters.difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>

      <button
        className="clear-filters"
        onClick={() =>
          onFilterChange({
            languages: [],
            categories: [],
            difficulty: undefined,
            regions: [],
            types: [],
          })
        }
      >
        Clear All Filters
      </button>
    </div>
  );
};