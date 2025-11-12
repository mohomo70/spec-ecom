"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/search/SearchInput";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { Filter, X, Search } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";

interface Product {
  id: string;
  species_name: string;
  scientific_name?: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  difficulty_level: string;
  image_url?: string; // Legacy field
  primary_image_url?: string; // New uploaded primary image
  images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
    display_order: number;
    alt_text?: string;
  }>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  
  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";

  // Initialize state from URL parameters
  const [search, setSearch] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    minPrice: parseFloat(searchParams.get('min_price') || '0'),
    maxPrice: parseFloat(searchParams.get('max_price') || '50'),
    minTankSize: parseInt(searchParams.get('min_tank_size') || '0'),
    phMin: parseFloat(searchParams.get('ph_min') || '0'),
    phMax: parseFloat(searchParams.get('ph_max') || '14'),
    tempMin: parseInt(searchParams.get('temp_min') || '60'),
    tempMax: parseInt(searchParams.get('temp_max') || '90'),
    dietType: searchParams.get('diet_type') || '',
    maxSize: parseInt(searchParams.get('max_size') || '50'),
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.minPrice > 0) params.set('min_price', filters.minPrice.toString());
    if (filters.maxPrice < 50) params.set('max_price', filters.maxPrice.toString());
    if (filters.minTankSize > 0) params.set('min_tank_size', filters.minTankSize.toString());
    if (filters.phMin > 0) params.set('ph_min', filters.phMin.toString());
    if (filters.phMax < 14) params.set('ph_max', filters.phMax.toString());
    if (filters.tempMin > 60) params.set('temp_min', filters.tempMin.toString());
    if (filters.tempMax < 90) params.set('temp_max', filters.tempMax.toString());
    if (filters.dietType) params.set('diet_type', filters.dietType);
    if (filters.maxSize < 50) params.set('max_size', filters.maxSize.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';

    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [search, filters, router]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, filters],
    queryFn: () => {
      const queryParams: Record<string, string> = {};

      if (search) queryParams.search = search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.difficulty) queryParams.difficulty = filters.difficulty;
      if (filters.minPrice > 0) queryParams.min_price = filters.minPrice.toString();
      if (filters.maxPrice < 50) queryParams.max_price = filters.maxPrice.toString();
      if (filters.minTankSize > 0) queryParams.min_tank_size = filters.minTankSize.toString();
      if (filters.phMin > 0) queryParams.ph_min = filters.phMin.toString();
      if (filters.phMax < 14) queryParams.ph_max = filters.phMax.toString();
      if (filters.tempMin > 60) queryParams.temp_min = filters.tempMin.toString();
      if (filters.tempMax < 90) queryParams.temp_max = filters.tempMax.toString();
      if (filters.dietType) queryParams.diet_type = filters.dietType;
      if (filters.maxSize < 50) queryParams.max_size = filters.maxSize.toString();

      return apiClient.getProducts(queryParams);
    },
  });

  const products = (productsData as any)?.results || [];

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = (categoriesData as any)?.results || [];

  // Generate search suggestions from product names
  const searchSuggestions = products.map((product: any) => product.species_name);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full"></div>
        </div>
        <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
          <div className="relative w-full max-w-md mb-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search For Fish"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(headerSearchQuery);
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pb-32">
      {/* Filter Sidebar - Mobile Overlay */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categories}
      />

      {/* Header */}
      <div className="mb-8">

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search fish species..."
              suggestions={searchSuggestions}
            />
          </div> */}

          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={(e) => handleFiltersChange({ ...filters, category: e.target.value })}
              className="px-4 py-2 border rounded-md min-w-[150px]"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map((category: any) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button> */}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {/* {(search || Object.values(filters).some(v => v !== '' && v !== 0 && v !== 50 && v !== 14 && v !== 90)) && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Active Filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                handleFiltersChange({
                  category: '',
                  difficulty: '',
                  minPrice: 0,
                  maxPrice: 50,
                  minTankSize: 0,
                  phMin: 0,
                  phMax: 14,
                  tempMin: 60,
                  tempMax: 90,
                  dietType: '',
                  maxSize: 50,
                });
              }}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                Search: {search}
                <button
                  onClick={() => setSearch('')}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Category: {categories.find((c: any) => c.slug === filters.category)?.name}
              </span>
            )}
            {filters.difficulty && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Difficulty: {filters.difficulty}
              </span>
            )}
            {(filters.minPrice > 0 || filters.maxPrice < 50) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Price: ${filters.minPrice} - ${filters.maxPrice}
              </span>
            )}
          </div>
        </div>
      )} */}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products.map((product: Product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                {(() => {
                  // Priority: primary_image_url > first image from images array > legacy image_url
                  const primaryImage = product.primary_image_url || 
                                       product.images?.find(img => img.is_primary)?.url ||
                                       product.images?.[0]?.url ||
                                       product.image_url;
                  
                  return primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.images?.find(img => img.is_primary)?.alt_text || 
                           product.images?.[0]?.alt_text || 
                           product.species_name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  );
                })()}
              </div>
              <CardTitle className="text-lg">
                {search ? (
                  <span dangerouslySetInnerHTML={{
                    __html: product.species_name.replace(
                      new RegExp(`(${search})`, 'gi'),
                      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                    )
                  }} />
                ) : (
                  product.species_name
                )}
              </CardTitle>
              {product.scientific_name && (
                <CardDescription className="italic">
                  {search ? (
                    <span dangerouslySetInnerHTML={{
                      __html: product.scientific_name.replace(
                        new RegExp(`(${search})`, 'gi'),
                        '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
                      )
                    }} />
                  ) : (
                    product.scientific_name
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-primary">
                  ${product.price}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  product.is_available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.is_available ? 'Available' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex gap-2">
                <Link href={`/products/${product.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  disabled={!product.is_available}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Array.isArray(products) && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative w-full mx-auto h-[115px]">
          <svg 
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0px -5px 22px rgba(0, 0, 0, 0.08))' }}
            viewBox="0 0 376 115"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 30 L 0 115 L 376 115 L 376 30 A 35 35 0 0 0 341 0 L 35 0 A 35 35 0 0 0 0 30 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-10">
            <nav className="flex items-center justify-center gap-16 w-full px-10">
              <Link href="/" className="flex flex-col items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
              </Link>
            </nav>
          </div>
        </div>
     
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full"></div>
          </div>
          <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
            <div className="relative w-full max-w-md mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <div className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg"></div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <footer className="fixed bottom-0 left-0 right-0 z-50">
          <div className="relative w-full mx-auto h-[115px]">
            <svg 
              className="absolute inset-0 w-full h-full"
              style={{ filter: 'drop-shadow(0px -5px 22px rgba(0, 0, 0, 0.08))' }}
              viewBox="0 0 376 115"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 30 L 0 115 L 376 115 L 376 30 A 35 35 0 0 0 341 0 L 35 0 A 35 35 0 0 0 0 30 Z"
                fill="#FFFFFF"
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-4 z-10">
              <nav className="flex items-center justify-center gap-16 w-full px-10">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
                </div>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}