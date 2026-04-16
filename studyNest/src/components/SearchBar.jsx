'use client'

import { Search, X } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = "Search...", maxLength = 50 }) {
  const handleClear = () => {
    onChange('')
  }

  const handleChange = (e) => {
    const text = e.target.value
    if (text.length <= maxLength) {
      onChange(text)
    }
  }

  return (
    <div className="w-full md:w-1/2 mx-auto"> {/* ✅ width reduced + centered */}
      <div className="relative">
        
        {/* Search Icon - Top Left Corner */}
        <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
        
        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
        />
        
        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Character Length Counter */}
      {value && (
        <div className="mt-2 flex items-center justify-between">
          <div></div>
          <span className={`text-xs font-medium transition-colors ${
            value.length > maxLength * 0.8 
              ? 'text-orange-600' 
              : 'text-gray-500'
          }`}>
            {value.length}/{maxLength} characters
          </span>
        </div>
      )}
    </div>
  )
}