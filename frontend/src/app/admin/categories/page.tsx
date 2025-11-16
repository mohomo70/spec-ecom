"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import CategoryTree from "@/components/admin/CategoryTree";
import Pagination from "@/components/admin/Pagination";
import SearchFilter from "@/components/admin/SearchFilter";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "categories", page, search],
    queryFn: async () => {
      const response = await adminApi.getCategories({ page, search });
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading categories. Please try again.</p>
      </div>
    );
  }

  const categories = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>Create Category</Button>
        </Link>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search categories..."
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Get started by creating a new category."
          actionLabel="Create Category"
          actionHref="/admin/categories/new"
        />
      ) : (
        <>
          <CategoryTree
            categories={categories}
            onDelete={(id) => deleteMutation.mutate(id)}
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

