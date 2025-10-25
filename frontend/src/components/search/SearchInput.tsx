"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search fish...",
  suggestions = []
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          onFocus={() => value && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none first:rounded-t-md last:rounded-b-md"
            >
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}