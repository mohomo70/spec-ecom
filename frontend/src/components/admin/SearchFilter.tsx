"use client";

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: Array<{
    label: string;
    name: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
  placeholder?: string;
}

export default function SearchFilter({
  searchValue,
  onSearchChange,
  filters = [],
  placeholder = "Search...",
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      {filters.map((filter) => (
        <div key={filter.name} className="sm:w-auto">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

