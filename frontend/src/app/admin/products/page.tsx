"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, Product } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/admin/ProductTable";
import Pagination from "@/components/admin/Pagination";
import SearchFilter from "@/components/admin/SearchFilter";
import BulkActions from "@/components/admin/BulkActions";
import SuccessMessage from "@/components/admin/SuccessMessage";
import ErrorMessage from "@/components/admin/ErrorMessage";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    is_available: undefined as boolean | undefined,
    difficulty_level: "",
    diet_type: "",
    product_type: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products", page, search, filters],
    queryFn: async () => {
      const params: any = { page, search };
      if (filters.is_available !== undefined) params.is_available = filters.is_available;
      if (filters.difficulty_level) params.difficulty_level = filters.difficulty_level;
      if (filters.diet_type) params.diet_type = filters.diet_type;
      if (filters.product_type) params.product_type = filters.product_type;
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
      setSuccessMessage("Product deleted successfully!");
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await adminApi.bulkDelete("products", ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setSuccessMessage(`${selectedIds.length} products deleted successfully!`);
      setSelectedIds([]);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, statusField, statusValue }: { ids: string[]; statusField: string; statusValue: any }) => {
      await adminApi.bulkStatusChange("products", ids, statusField, statusValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setSuccessMessage(`Status updated for ${selectedIds.length} products!`);
      setSelectedIds([]);
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading products..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage fish products and inventory
            </p>
          </div>
        </div>
        <ErrorMessage
          message="Error loading products. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin", "products"] })}
        />
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
            Manage catalog products and inventory
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search products..."
        filters={[
          {
            label: "Status",
            name: "is_available",
            value: filters.is_available === undefined ? "" : String(filters.is_available),
            onChange: (value) => {
              setFilters({
                ...filters,
                is_available: value === "" ? undefined : value === "true",
              });
              setPage(1);
            },
            options: [
              { value: "true", label: "Available" },
              { value: "false", label: "Unavailable" },
            ],
          },
          {
            label: "Difficulty",
            name: "difficulty_level",
            value: filters.difficulty_level,
            onChange: (value) => {
              setFilters({ ...filters, difficulty_level: value });
              setPage(1);
            },
            options: [
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ],
          },
          {
            label: "Diet Type",
            name: "diet_type",
            value: filters.diet_type,
            onChange: (value) => {
              setFilters({ ...filters, diet_type: value });
              setPage(1);
            },
            options: [
              { value: "herbivore", label: "Herbivore" },
              { value: "carnivore", label: "Carnivore" },
              { value: "omnivore", label: "Omnivore" },
            ],
          },
          {
            label: "Product Type",
            name: "product_type",
            value: filters.product_type,
            onChange: (value) => {
              setFilters({ ...filters, product_type: value });
              setPage(1);
            },
            options: [
              { value: "", label: "All Types" },
              { value: "fish", label: "Fish" },
              { value: "plant", label: "Plants" },
              { value: "accessory", label: "Accessories" },
            ],
          },
        ]}
      />

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {deleteMutation.isError && (
        <ErrorMessage
          message={
            deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Failed to delete product. Please try again."
          }
          onRetry={() => deleteMutation.reset()}
          onDismiss={() => deleteMutation.reset()}
        />
      )}

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Get started by creating a new product."
          actionLabel="Create Product"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <BulkActions
            selectedIds={selectedIds}
            onBulkDelete={async (ids) => await bulkDeleteMutation.mutateAsync(ids)}
            onBulkStatusChange={async (ids, statusField, statusValue) =>
              await bulkStatusMutation.mutateAsync({ ids, statusField, statusValue })
            }
            statusOptions={[
              { value: true, label: "Available" },
              { value: false, label: "Unavailable" },
            ]}
            statusField="is_available"
            entityName="products"
          />
          <ProductTable
            products={products}
            onDelete={(id) => deleteMutation.mutate(id)}
            onSelectionChange={setSelectedIds}
            selectedIds={selectedIds}
          />
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages}
            hasNext={!!data?.next}
            hasPrevious={!!data?.previous}
            onPageChange={setPage}
            totalCount={data?.count}
            pageSize={20}
          />
        </>
      )}
    </div>
  );
}

