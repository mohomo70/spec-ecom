"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.getProduct(productId),
    enabled: !!productId,
  });

  if (isLoading) {
    return (
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
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const typedProduct = product as Product;

  return (
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
  );
}