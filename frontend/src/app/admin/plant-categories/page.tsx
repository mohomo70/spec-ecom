"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi, PlantCategory } from "@/lib/api/admin";
import LoadingIndicator from "@/components/admin/LoadingIndicator";
import SuccessMessage from "@/components/admin/SuccessMessage";
import ErrorMessage from "@/components/admin/ErrorMessage";
import { Button } from "@/components/ui/button";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function PlantCategoriesPage() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    description: "",
    display_order: 0,
    is_active: true,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "plant-categories"],
    queryFn: () => adminApi.getPlantCategories(),
  });

  const categories: PlantCategory[] = data?.results || [];

  const createMutation = useMutation({
    mutationFn: () => adminApi.createPlantCategory(formState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plant-categories"] });
      setSuccessMessage("Plant category created!");
      setFormState({ name: "", slug: "", description: "", display_order: 0, is_active: true });
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to create plant category.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePlantCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plant-categories"] });
      setSuccessMessage("Category deleted");
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err?.message || "Unable to delete category");
    },
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !prev.slug
        ? { slug: slugify(value as string) }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    await createMutation.mutateAsync();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plant category?")) return;
    setErrorMessage(null);
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading plant categories..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load plant categories."
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin", "plant-categories"] })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plant Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage carpeting, sword, stem, and other plant groupings.
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      {successMessage && (
        <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      )}
      {errorMessage && (
        <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900">Create New Plant Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              type="text"
              value={formState.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              value={formState.display_order}
              onChange={(e) => handleInputChange("display_order", Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formState.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : "Create Category"}
        </Button>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
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
                Display Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500 line-clamp-2">{category.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.products_count ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.is_active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No plant categories yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
