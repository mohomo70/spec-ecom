"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import SuccessMessage from "@/components/admin/SuccessMessage";
import ErrorMessage from "@/components/admin/ErrorMessage";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  article_count: number;
  created_at: string;
}

export default function ArticleCategoryManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "article-categories", page, search],
    queryFn: async () => {
      const response = await adminApi.getArticleCategories({ page, search });
      return response;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await adminApi.createArticleCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "article-categories"] });
      setSuccessMessage("Article category created successfully!");
      setFormData({ name: "", slug: "", description: "" });
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await adminApi.updateArticleCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "article-categories"] });
      setSuccessMessage("Article category updated successfully!");
      setEditingId(null);
      setFormData({ name: "", slug: "", description: "" });
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteArticleCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "article-categories"] });
      setSuccessMessage("Article category deleted successfully!");
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const handleEdit = (category: ArticleCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading article categories..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Error loading article categories. Please try again."
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin", "article-categories"] })}
      />
    );
  }

  const categories = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Article Categories</h2>
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
        <ErrorMessage
          message={
            createMutation.error instanceof Error
              ? createMutation.error.message
              : updateMutation.error instanceof Error
              ? updateMutation.error.message
              : deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "An error occurred. Please try again."
          }
          onRetry={() => {
            createMutation.reset();
            updateMutation.reset();
            deleteMutation.reset();
          }}
          onDismiss={() => {
            createMutation.reset();
            updateMutation.reset();
            deleteMutation.reset();
          }}
        />
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (!editingId) {
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setFormData((prev) => ({ ...prev, slug }));
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "Update" : "Create"} Category
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Articles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category: ArticleCategory) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {category.description || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{category.article_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      disabled={editingId === category.id}
                    >
                      {editingId === category.id ? "Editing..." : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
                          )
                        ) {
                          deleteMutation.mutate(category.id);
                        }
                      }}
                      disabled={deleteMutation.isPending || category.article_count > 0}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

