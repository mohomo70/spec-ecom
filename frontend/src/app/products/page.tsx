"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { useAuthStore } from "@/lib/stores/auth";
import { apiClient, CatalogProduct, CatalogProductType } from "@/lib/api";
import { useCatalogProducts, usePlantCategories } from "@/lib/api/products";
import { buildProductListJsonLd, buildProductListingMeta } from "@/lib/seo";

const DEFAULT_FILTERS = {
  category: "",
  difficulty: "",
  minPrice: 0,
  maxPrice: 50,
  minTankSize: 0,
  phMin: 0,
  phMax: 14,
  tempMin: 60,
  tempMax: 90,
  dietType: "",
  maxSize: 50,
};

type CategorySummary = { id: string; name: string; slug: string };

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const defaultSearch = searchParams.get("search") || "";
  const defaultCategory = searchParams.get("category") || "";
  const defaultType = (searchParams.get("product_type") as CatalogProductType) || "fish";

  const [search, setSearch] = useState(defaultSearch);
  const [headerSearchQuery, setHeaderSearchQuery] = useState(defaultSearch);
  const [productType, setProductType] = useState<CatalogProductType>(defaultType);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    category: defaultCategory,
    difficulty: searchParams.get("difficulty") || "",
    minPrice: parseFloat(searchParams.get("min_price") || "0"),
    maxPrice: parseFloat(searchParams.get("max_price") || "50"),
    minTankSize: parseInt(searchParams.get("min_tank_size") || "0"),
    phMin: parseFloat(searchParams.get("ph_min") || "0"),
    phMax: parseFloat(searchParams.get("ph_max") || "14"),
    tempMin: parseInt(searchParams.get("temp_min") || "60"),
    tempMax: parseInt(searchParams.get("temp_max") || "90"),
    dietType: searchParams.get("diet_type") || "",
    maxSize: parseInt(searchParams.get("max_size") || "50"),
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: fishCategoriesData } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const fishCategories: CategorySummary[] = useMemo(() => {
    const results = (fishCategoriesData as any)?.results;
    return Array.isArray(results) ? results : [];
  }, [fishCategoriesData]);

  const { data: plantCategoriesData } = usePlantCategories();
  const plantCategories = plantCategoriesData ?? [];
  const activeCategories = productType === "plant" ? plantCategories : fishCategories;

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.category) params.set("category", filters.category);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    if (filters.minPrice > 0) params.set("min_price", filters.minPrice.toString());
    if (filters.maxPrice < 50) params.set("max_price", filters.maxPrice.toString());
    if (filters.minTankSize > 0) params.set("min_tank_size", filters.minTankSize.toString());
    if (filters.phMin > 0) params.set("ph_min", filters.phMin.toString());
    if (filters.phMax < 14) params.set("ph_max", filters.phMax.toString());
    if (filters.tempMin > 60) params.set("temp_min", filters.tempMin.toString());
    if (filters.tempMax < 90) params.set("temp_max", filters.tempMax.toString());
    if (filters.dietType) params.set("diet_type", filters.dietType);
    if (filters.maxSize < 50) params.set("max_size", filters.maxSize.toString());
    if (productType !== "fish") params.set("product_type", productType);

    const query = params.toString();
    const newUrl = query ? `/products?${query}` : "/products";
    if (typeof window !== "undefined" && `${window.location.pathname}${window.location.search}` !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, productType, router, search]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filters.category) params.category = filters.category;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.minPrice > 0) params.min_price = filters.minPrice.toString();
    if (filters.maxPrice < 50) params.max_price = filters.maxPrice.toString();
    if (filters.minTankSize > 0) params.min_tank_size = filters.minTankSize.toString();
    if (filters.phMin > 0) params.ph_min = filters.phMin.toString();
    if (filters.phMax < 14) params.ph_max = filters.phMax.toString();
    if (filters.tempMin > 60) params.temp_min = filters.tempMin.toString();
    if (filters.tempMax < 90) params.temp_max = filters.tempMax.toString();
    if (filters.dietType) params.diet_type = filters.dietType;
    if (filters.maxSize < 50) params.max_size = filters.maxSize.toString();
    params.product_type = productType;
    return params;
  }, [filters, productType, search]);

  const { data: productsResponse, isLoading } = useCatalogProducts(queryParams);
  const products = productsResponse?.results ?? [];

  const handleFiltersChange = (nextFilters: typeof filters) => {
    setFilters(nextFilters);
  };

  const resetCategory = () => {
    setFilters({ ...filters, category: "" });
  };

  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";
  const handleHeaderSearch = () => setSearch(headerSearchQuery);

  const seoMeta = buildProductListingMeta(productType);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const listJsonLd = buildProductListJsonLd(products, productType, origin);

  const renderProductCard = (product: CatalogProduct) => {
    const primaryImage =
      product.primary_image_url ||
      product.images?.find((img) => img.is_primary)?.url ||
      product.images?.[0]?.url;

    const isPlant = product.product_type === "plant";
    const isPlantOutOfStock = isPlant && (product.stock_quantity ?? 0) <= 0;

    return (
      <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid="catalog-card">
        <CardHeader>
          <div className="aspect-video bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.species_name}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            ) : (
              <div className="text-gray-400 text-sm">No image</div>
            )}
          </div>
          <CardTitle className="text-lg" data-testid="catalog-card-title">
            {product.species_name}
          </CardTitle>
          {product.scientific_name && (
            <CardDescription className="italic">{product.scientific_name}</CardDescription>
          )}
          {isPlant && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-800">
              {product.botanical_name && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium">
                  {product.botanical_name}
                </span>
              )}
              {product.plant_light_requirements && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 capitalize">
                  {product.plant_light_requirements} light
                </span>
              )}
              {product.plant_growth_rate && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 capitalize">
                  {product.plant_growth_rate} growth
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">${product.price}</span>
            <span
              className={`text-sm px-2 py-1 rounded ${
                product.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {product.is_available ? "Available" : "Out of Stock"}
            </span>
          </div>
          {product.plant_category && (
            <div className="text-xs text-muted-foreground">
              Category: <span className="font-medium">{product.plant_category.name}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link href={`/products/${product.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            {isPlantOutOfStock ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Currently propagating. View details for care tips while stock refills.
              </div>
            ) : (
              <Button className="w-full" disabled={!product.is_available}>
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block" />
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block" />
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block" />
          </div>
          <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
            <div className="relative w-full max-w-md mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <div className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
      </Head>
      <div className="min-h-screen bg-background">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full" />
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full" />
          </div>
          <div className="relative container mx-auto px-4 pt-6 pb-4 md:h-[172px] md:flex md:items-end md:justify-center">
            <div className="flex items-start justify-between mb-4 md:absolute md:top-6 md:left-4 md:right-4 md:mb-0">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Hello {userName}, explore our {productType === "plant" ? "Aquarium Plants" : "Freshwater Fish"}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  Toggle between fish and plants anytime—filters stay in sync.
                </p>
              </div>
            </div>
            <div className="relative w-full max-w-md mx-auto md:mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 z-10" />
              <input
                type="text"
                placeholder="Search catalog"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleHeaderSearch();
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 text-sm md:text-base"
              />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pb-32 space-y-8">
          <FilterSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={activeCategories}
          />

          <div className="flex flex-wrap gap-3 items-center">
            {(["fish", "plant"] as CatalogProductType[]).map((type) => (
              <Button
                key={type}
                variant={productType === type ? "default" : "outline"}
                onClick={() => {
                  setProductType(type);
                  setFilters((prev) => ({ ...prev, category: "" }));
                }}
                aria-pressed={productType === type}
              >
                {type === "fish" ? "Fish" : "Plants"}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)} className="ml-auto">
              Advanced Filters
            </Button>
          </div>

          {productType === "plant" && (
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">New to Aquarium Plants?</CardTitle>
                <CardDescription>
                  Start with carpeting, sword, or stem categories—our Plants quick link mirrors these filters so
                  navigation stays familiar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/#plants-quick-link">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Jump to Plants Quick Link</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetCategory}
              className={`px-3 py-1 rounded-full text-sm border ${
                !filters.category ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"
              }`}
            >
              All Categories
            </button>
            {activeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilters({ ...filters, category: category.slug })}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  filters.category === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => renderProductCard(product))}
          </div>

          {!products.length && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products match your current filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return <ProductsContent />;
}

