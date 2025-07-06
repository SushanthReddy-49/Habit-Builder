import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debouncedSearch, fadeInElement, fadeOutElement } from '../../utils/jquery-utils';

const SearchBox = ({ onSearch, placeholder = "Search tasks...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Set up debounced search using jQuery
    debouncedSearch('#search-input', (value) => {
      setSearchTerm(value);
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
  }, [onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    // Use jQuery to clear the input and trigger animation
    $('#search-input').val('').focus();
    fadeInElement('#search-input', 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          id="search-input"
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
            isFocused ? 'ring-2 ring-primary-500' : ''
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Search suggestions (can be enhanced with jQuery) */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2 text-sm text-gray-500">
            Searching for: "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox; 