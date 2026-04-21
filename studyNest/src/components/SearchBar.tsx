'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  type: 'lecture_hall' | 'study_area';
  building?: string | null;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
      setIsOpen(data.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchResults(value);
    }, 300);
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    setResults([]);

    // Navigate to the appropriate page
    if (result.type === 'lecture_hall') {
      router.push(`/student/halls?search=${encodeURIComponent(result.name)}`);
    } else {
      router.push(`/study-areas?search=${encodeURIComponent(result.name)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        setQuery(query);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedElement = document.getElementById(`result-${selectedIndex}`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for lecture halls, study areas..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && isOpen && setIsOpen(true)}
          className="themed-input w-full rounded-lg px-4 py-3 pl-12 pr-4 transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="themed-surface absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg"
        >
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              id={`result-${index}`}
              className={`px-4 py-3 cursor-pointer transition ${
                selectedIndex === index ? 'bg-[var(--accent-bg)]' : 'hover:bg-[var(--surface-card-muted)]'
              }`}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Icon */}
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'lecture_hall'
                        ? 'bg-[var(--accent-bg)]'
                        : 'bg-emerald-500/12'
                    }`}
                  >
                    {result.type === 'lecture_hall' ? (
                      <svg
                        className="h-4 w-4 text-[var(--accent-text)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-[var(--text-main)]">
                      {result.name}
                    </p>
                    {result.building && (
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {result.building}
                      </p>
                    )}
                  </div>
                </div>

                {/* Type Badge */}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    result.type === 'lecture_hall'
                      ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                      : 'bg-emerald-500/12 text-emerald-600'
                  }`}
                >
                  {result.type === 'lecture_hall' ? 'Lecture Hall' : 'Study Area'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="themed-surface absolute left-0 right-0 top-full z-50 mt-2 rounded-lg px-4 py-8 text-center">
          <svg
            className="mx-auto mb-2 h-8 w-8 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <p className="font-medium text-[var(--text-soft)]">
            No matching lecture halls or study areas found
          </p>
        </div>
      )}
    </div>
  );
}
