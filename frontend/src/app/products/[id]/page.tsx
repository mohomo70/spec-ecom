"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  species_name: string;
  scientific_name?: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  difficulty_level: string;
  min_tank_size_gallons: number;
  ph_range_min?: number;
  ph_range_max?: number;
  temperature_range_min?: number;
  temperature_range_max?: number;
  max_size_inches?: number;
  lifespan_years?: number;
  diet_type?: string;
  compatibility_notes: string;
  care_instructions: string;
  image_url?: string;
  additional_images: string[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  
  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";

  const handleSearch = () => {
    if (headerSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.getProduct(productId),
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
            <div className="relative w-full max-w-md mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <div className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg"></div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
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
            <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
              <nav className="flex items-center justify-center gap-12 md:gap-16 w-full px-6 md:px-10">
                <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
                  <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
                  <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
            <div className="relative w-full max-w-md mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <div className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg"></div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
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
            <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
              <nav className="flex items-center justify-center gap-12 md:gap-16 w-full px-6 md:px-10">
                <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
                  <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
                  <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const typedProduct = product as Product;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
        </div>
        <div className="relative container mx-auto px-4 pt-6 pb-4 md:h-[172px] md:flex md:items-end md:justify-center">
          <div className="flex items-start justify-between mb-4 md:absolute md:top-6 md:left-4 md:right-4 md:mb-0">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Hello {userName},
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Let's Explore Our Freshwater Fish Collection
              </p>
            </div>
            {user ? (
              <Link href="/profile" className="flex-shrink-0 ml-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                  {user.first_name ? (
                    <span className="text-white font-semibold text-base md:text-lg">
                      {user.first_name[0].toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="flex-shrink-0 ml-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
          <div className="relative w-full max-w-md mx-auto md:mb-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 z-10" />
            <input
              type="text"
              placeholder="Search For Fish"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 text-sm md:text-base"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {typedProduct.image_url ? (
              <img
                src={typedProduct.image_url}
                alt={typedProduct.species_name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-gray-400 text-lg">No Image Available</div>
            )}
          </div>
          {typedProduct.additional_images?.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {typedProduct.additional_images.map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded">
                  <img
                    src={image}
                    alt={`${typedProduct.species_name} ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{typedProduct.species_name}</h1>
            {typedProduct.scientific_name && (
              <p className="text-xl text-muted-foreground italic mb-4">
                {typedProduct.scientific_name}
              </p>
            )}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                ${typedProduct.price}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                typedProduct.is_available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {typedProduct.is_available ? 'Available' : 'Out of Stock'}
              </span>
            </div>
            <p className="text-muted-foreground mb-6">{typedProduct.description}</p>
          </div>

          {/* Categories */}
          {typedProduct.categories?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {typedProduct.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Care Information */}
          <Card>
            <CardHeader>
              <CardTitle>Care Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Difficulty:</span>
                  <span className="ml-2 capitalize">{typedProduct.difficulty_level}</span>
                </div>
                <div>
                  <span className="font-medium">Min Tank Size:</span>
                  <span className="ml-2">{typedProduct.min_tank_size_gallons} gallons</span>
                </div>
                {typedProduct.ph_range_min && typedProduct.ph_range_max && (
                  <div>
                    <span className="font-medium">pH Range:</span>
                    <span className="ml-2">{typedProduct.ph_range_min} - {typedProduct.ph_range_max}</span>
                  </div>
                )}
                {typedProduct.temperature_range_min && typedProduct.temperature_range_max && (
                  <div>
                    <span className="font-medium">Temperature:</span>
                    <span className="ml-2">{typedProduct.temperature_range_min}°F - {typedProduct.temperature_range_max}°F</span>
                  </div>
                )}
                {typedProduct.max_size_inches && (
                  <div>
                    <span className="font-medium">Max Size:</span>
                    <span className="ml-2">{typedProduct.max_size_inches} inches</span>
                  </div>
                )}
                {typedProduct.lifespan_years && (
                  <div>
                    <span className="font-medium">Lifespan:</span>
                    <span className="ml-2">{typedProduct.lifespan_years} years</span>
                  </div>
                )}
                {typedProduct.diet_type && (
                  <div>
                    <span className="font-medium">Diet:</span>
                    <span className="ml-2 capitalize">{typedProduct.diet_type}</span>
                  </div>
                )}
              </div>

              {typedProduct.compatibility_notes && (
                <div>
                  <h4 className="font-medium mb-2">Compatibility Notes</h4>
                  <p className="text-sm text-muted-foreground">{typedProduct.compatibility_notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Care Instructions</h4>
                <p className="text-sm text-muted-foreground">{typedProduct.care_instructions}</p>
              </div>
            </CardContent>
          </Card>

          {/* Add to Cart */}
          <div className="flex gap-4">
            <Button
              size="lg"
              disabled={!typedProduct.is_available}
              className="flex-1"
            >
              Add to Cart - ${typedProduct.price}
            </Button>
            <Link href="/products">
              <Button variant="outline" size="lg">
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
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
          <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
            <nav className="flex items-center justify-center gap-12 md:gap-16 w-full px-6 md:px-10">
              <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}