"use client";

import { useState } from "react";
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
  image_url?: string;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search, selectedCategory],
    queryFn: () => apiClient.getProducts(
      Object.fromEntries(
        Object.entries({ search, category: selectedCategory }).filter(([, v]) => v)
      )
    ),
  });

  const products = (productsData as any)?.results || [];
  console.log(products);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = (categoriesData as any)?.results || [];

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Our Fish Collection</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search fish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products.map((product: Product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.species_name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>
              <CardTitle className="text-lg">{product.species_name}</CardTitle>
              {product.scientific_name && (
                <CardDescription className="italic">
                  {product.scientific_name}
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
  );
}