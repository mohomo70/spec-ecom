"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/admin";
import { articleApi } from "@/lib/api";
import ConflictWarning from "@/components/admin/ConflictWarning";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
  category: z.string().uuid("Please select a category"),
  status: z.enum(["draft", "published"]),
  meta_title: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  meta_description: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  featured_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured_image_alt_text: z.string().max(200, "Alt text must be less than 200 characters").optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: any;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  articleId?: string;
}

export default function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isLoading = false,
  articleId,
}: ArticleFormProps) {
  const queryClient = useQueryClient();
  const [conflictError, setConflictError] = useState<any>(null);
  
  const { data: categoriesData } = useQuery({
    queryKey: ["article-categories"],
    queryFn: async () => {
      const response = await articleApi.getCategories();
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'results' in response) {
        return Array.isArray(response.results) ? response.results : [];
      }
      return [];
    },
  });

  const categories = categoriesData || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt || "",
          category: article.category?.id || "",
          status: article.status || "draft",
          meta_title: article.meta_title || "",
          meta_description: article.meta_description || "",
          featured_image_url: article.featured_image_url || "",
          featured_image_alt_text: article.featured_image_alt_text || "",
        }
      : {
          status: "draft",
        },
  });

  const title = watch("title");
  const status = watch("status");

  useEffect(() => {
    if (!article && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [title, article, setValue]);

  const handleFormSubmit = async (data: ArticleFormData) => {
    setConflictError(null);
    try {
      if (article && article.updated_at) {
        (data as any).updated_at = article.updated_at;
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
    if (articleId) {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles", articleId] });
      const { data } = await queryClient.fetchQuery({
        queryKey: ["admin", "articles", articleId],
        queryFn: async () => {
          const response = await adminApi.getArticle(articleId);
          return response.data;
        },
      });
      if (data) {
        reset({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || "",
          category: data.category?.id || "",
          status: data.status || "draft",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          featured_image_url: data.featured_image_url || "",
          featured_image_alt_text: data.featured_image_alt_text || "",
        });
        setConflictError(null);
      }
    }
  };

  const handleForceUpdate = async () => {
    setConflictError(null);
    const formData = watch();
    if (article) {
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
            Title *
          </label>
          <input
            type="text"
            {...register("title")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            {...register("category")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <select
              {...register("status")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            {status === "published" && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Will be published immediately
              </span>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Excerpt
          </label>
          <textarea
            {...register("excerpt")}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Brief summary of the article"
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            {...register("content")}
            rows={12}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Featured Image URL
          </label>
          <input
            type="url"
            {...register("featured_image_url")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          {errors.featured_image_url && (
            <p className="mt-1 text-sm text-red-600">{errors.featured_image_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Featured Image Alt Text
          </label>
          <input
            type="text"
            {...register("featured_image_alt_text")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Description of the image"
          />
          {errors.featured_image_alt_text && (
            <p className="mt-1 text-sm text-red-600">{errors.featured_image_alt_text.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SEO Title (max 60 chars)
          </label>
          <input
            type="text"
            maxLength={60}
            {...register("meta_title")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SEO Description (max 160 chars)
          </label>
          <textarea
            maxLength={160}
            {...register("meta_description")}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : article ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}

