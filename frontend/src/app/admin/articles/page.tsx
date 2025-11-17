"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import ArticleTable from "@/components/admin/ArticleTable";
import Pagination from "@/components/admin/Pagination";
import SearchFilter from "@/components/admin/SearchFilter";
import BulkActions from "@/components/admin/BulkActions";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import EmptyState from "@/components/admin/EmptyState";

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "articles", page, search, statusFilter],
    queryFn: async () => {
      const params: any = { page, search };
      if (statusFilter) params.status = statusFilter;
      const response = await adminApi.getArticles(params);
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await adminApi.bulkDelete("articles", ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      setSelectedIds([]);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, statusField, statusValue }: { ids: string[]; statusField: string; statusValue: any }) => {
      await adminApi.bulkStatusChange("articles", ids, statusField, statusValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      setSelectedIds([]);
    },
  });

  if (isLoading) {
    return <LoadingIndicator text="Loading articles..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading articles. Please try again.</p>
      </div>
    );
  }

  const articles = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage blog articles
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button>Create Article</Button>
        </Link>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search articles..."
        filters={[
          {
            label: "Status",
            name: "status",
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1);
            },
            options: [
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ],
          },
        ]}
      />

      {articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Get started by creating a new article."
          actionLabel="Create Article"
          actionHref="/admin/articles/new"
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
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
            statusField="status"
            entityName="articles"
          />
          <ArticleTable
            articles={articles}
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

