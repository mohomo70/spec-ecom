"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    difficulty: string;
    minPrice: number;
    maxPrice: number;
    minTankSize: number;
    phMin: number;
    phMax: number;
    tempMin: number;
    tempMax: number;
    dietType: string;
    maxSize: number;
  };
  onFiltersChange: (filters: any) => void;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  categories
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      difficulty: '',
      minPrice: 0,
      maxPrice: 50,
      minTankSize: 0,
      phMin: 0,
      phMax: 14,
      tempMin: 0,
      tempMax: 100,
      dietType: '',
      maxSize: 50,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Overlay for mobile */}
      <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-background border-l shadow-lg lg:relative lg:w-80 lg:h-auto lg:shadow-none lg:border-l-0 lg:border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] lg:max-h-none">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Category</label>
            <select
              value={localFilters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Difficulty Level</label>
            <select
              value={localFilters.difficulty}
              onChange={(e) => updateFilter('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">Any Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Price Range: ${localFilters.minPrice} - ${localFilters.maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={localFilters.minPrice}
              onChange={(e) => updateFilter('minPrice', parseInt(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={localFilters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          {/* Tank Size */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Minimum Tank Size: {localFilters.minTankSize} gallons
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localFilters.minTankSize}
              onChange={(e) => updateFilter('minTankSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* pH Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              pH Range: {localFilters.phMin} - {localFilters.phMax}
            </label>
            <input
              type="range"
              min="0"
              max="14"
              step="0.1"
              value={localFilters.phMin}
              onChange={(e) => updateFilter('phMin', parseFloat(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="14"
              step="0.1"
              value={localFilters.phMax}
              onChange={(e) => updateFilter('phMax', parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          {/* Temperature Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Temperature: {localFilters.tempMin}°F - {localFilters.tempMax}°F
            </label>
            <input
              type="range"
              min="60"
              max="100"
              step="1"
              value={localFilters.tempMin}
              onChange={(e) => updateFilter('tempMin', parseInt(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="60"
              max="100"
              step="1"
              value={localFilters.tempMax}
              onChange={(e) => updateFilter('tempMax', parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          {/* Diet Type */}
          <div>
            <label className="text-sm font-medium mb-3 block">Diet Type</label>
            <select
              value={localFilters.dietType}
              onChange={(e) => updateFilter('dietType', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">Any Diet</option>
              <option value="herbivore">Herbivore</option>
              <option value="carnivore">Carnivore</option>
              <option value="omnivore">Omnivore</option>
            </select>
          </div>

          {/* Max Size */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Maximum Size: {localFilters.maxSize} inches
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={localFilters.maxSize}
              onChange={(e) => updateFilter('maxSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Clear Filters */}
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}