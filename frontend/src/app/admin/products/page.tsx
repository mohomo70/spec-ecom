"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, Product } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/admin/ProductTable";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    is_available: undefined as boolean | undefined,
    difficulty_level: "",
    diet_type: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products", page, search, filters],
    queryFn: async () => {
      const params: any = { page, search };
      if (filters.is_available !== undefined) params.is_available = filters.is_available;
      if (filters.difficulty_level) params.difficulty_level = filters.difficulty_level;
      if (filters.diet_type) params.diet_type = filters.diet_type;
      const response = await adminApi.getProducts(params);
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading products..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading products. Please try again.</p>
      </div>
    );
  }

  const products = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage fish products and inventory
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <select
          value={filters.is_available === undefined ? "" : String(filters.is_available)}
          onChange={(e) => {
            setFilters({
              ...filters,
              is_available: e.target.value === "" ? undefined : e.target.value === "true",
            });
            setPage(1);
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <select
          value={filters.difficulty_level}
          onChange={(e) => {
            setFilters({ ...filters, difficulty_level: e.target.value });
            setPage(1);
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={filters.diet_type}
          onChange={(e) => {
            setFilters({ ...filters, diet_type: e.target.value });
            setPage(1);
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Diet Types</option>
          <option value="herbivore">Herbivore</option>
          <option value="carnivore">Carnivore</option>
          <option value="omnivore">Omnivore</option>
        </select>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Get started by creating a new product."
          actionLabel="Create Product"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <ProductTable
            products={products}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {products.length} of {data?.count || 0} products
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={!data?.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!data?.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

