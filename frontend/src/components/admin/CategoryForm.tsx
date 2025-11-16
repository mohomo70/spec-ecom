"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import ConflictWarning from "@/components/admin/ConflictWarning";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parent_category: z.string().uuid().optional().nullable(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: any;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  categoryId?: string;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  categoryId,
}: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [conflictError, setConflictError] = useState<any>(null);
  
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const response = await adminApi.getCategories();
      return response;
    },
  });

  const categories = categoriesData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          parent_category: category.parent_category || null,
          display_order: category.display_order || 0,
          is_active: category.is_active !== undefined ? category.is_active : true,
        }
      : {
          display_order: 0,
          is_active: true,
        },
  });

  const parentCategory = watch("parent_category");
  const categoryName = watch("name");

  useEffect(() => {
    if (!category && categoryName) {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [categoryName, category, setValue]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    setConflictError(null);
    try {
      if (category && category.updated_at) {
        (data as any).updated_at = category.updated_at;
      }
      await onSubmit(data);
    } catch (error: any) {
      if (error?.conflict || error?.response?.data?.conflict) {
        setConflictError(error.response?.data || error);
      } else {
        throw error;
      }
    }
  };

  const handleRetry = async () => {
    if (categoryId) {
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories", categoryId] });
      const { data } = await queryClient.fetchQuery({
        queryKey: ["admin", "categories", categoryId],
        queryFn: async () => {
          const response = await adminApi.getCategory(categoryId);
          return response.data;
        },
      });
      if (data) {
        reset({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          parent_category: data.parent_category || null,
          display_order: data.display_order || 0,
          is_active: data.is_active !== undefined ? data.is_active : true,
        });
        setConflictError(null);
      }
    }
  };

  const handleForceUpdate = async () => {
    setConflictError(null);
    const formData = watch();
    if (category) {
      (formData as any).updated_at = null;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {conflictError && (
        <ConflictWarning
          message={conflictError.message || "This record has been modified by another user."}
          currentUpdatedAt={conflictError.current_updated_at}
          onRetry={handleRetry}
          onForceUpdate={handleForceUpdate}
        />
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category Name *
          </label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            type="text"
            {...register("slug")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          <select
            {...register("parent_category")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">None (Top-level category)</option>
            {categories
              .filter((cat: any) => !category || cat.id !== category.id)
              .map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Display Order
          </label>
          <input
            type="number"
            {...register("display_order", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("is_active")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}

