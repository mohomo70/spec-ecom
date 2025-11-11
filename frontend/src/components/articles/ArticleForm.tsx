"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { articleApi } from "@/lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
  featured_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured_image_alt_text: z.string().max(200, "Alt text must be less than 200 characters").optional(),
  category_id: z.string().uuid("Please select a category"),
  status: z.enum(["draft", "published"]),
  meta_title: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  meta_description: z.string().max(160, "Meta description must be less than 160 characters").optional(),
}).refine((data) => {
  if (data.featured_image_url && !data.featured_image_alt_text) {
    return false;
  }
  return true;
}, {
  message: "Alt text is required when a featured image is provided",
  path: ["featured_image_alt_text"],
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData> & { id?: string };
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel?: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ArticleForm({ initialData, onSubmit, onCancel }: ArticleFormProps) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ["article-categories"],
    queryFn: async () => {
      const response = await articleApi.getCategories();
      return Array.isArray(response) ? response : [];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featured_image_url: initialData?.featured_image_url || "",
      featured_image_alt_text: initialData?.featured_image_alt_text || "",
      category_id: initialData?.category_id || "",
      status: initialData?.status || "draft",
      meta_title: initialData?.meta_title || "",
      meta_description: initialData?.meta_description || "",
    },
  });

  const content = watch("content");
  const featuredImageUrl = watch("featured_image_url");

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await articleApi.createCategory({
        name: newCategoryName,
        description: newCategoryDescription || undefined,
      });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowNewCategory(false);
      refetchCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category. Please try again.");
    }
  };

  const handleFormSubmit = async (data: ArticleFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              {...register("title")}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              aria-required="true"
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content *
            </label>
            <div
              role="textbox"
              aria-required="true"
              aria-invalid={errors.content ? "true" : "false"}
              aria-describedby={errors.content ? "content-error" : undefined}
            >
              <RichTextEditor
                content={content || ""}
                onChange={(html) => setValue("content", html)}
              />
            </div>
            {errors.content && (
              <p id="content-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt (optional)
            </label>
            <textarea
              id="excerpt"
              {...register("excerpt")}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="Leave empty to auto-generate from content"
              aria-invalid={errors.excerpt ? "true" : "false"}
              aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
            />
            {errors.excerpt && (
              <p id="excerpt-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="featured_image_url" className="block text-sm font-medium mb-2">
              Featured Image URL (optional)
            </label>
            <input
              id="featured_image_url"
              type="url"
              {...register("featured_image_url")}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="https://example.com/image.jpg"
              aria-invalid={errors.featured_image_url ? "true" : "false"}
              aria-describedby={errors.featured_image_url ? "featured_image_url-error" : undefined}
            />
            {errors.featured_image_url && (
              <p id="featured_image_url-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.featured_image_url.message}
              </p>
            )}
          </div>

          {featuredImageUrl && (
            <div>
              <label htmlFor="featured_image_alt_text" className="block text-sm font-medium mb-2">
                Featured Image Alt Text *
              </label>
              <input
                id="featured_image_alt_text"
                {...register("featured_image_alt_text")}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="Describe the image for accessibility"
                aria-required="true"
                aria-invalid={errors.featured_image_alt_text ? "true" : "false"}
                aria-describedby={errors.featured_image_alt_text ? "featured_image_alt_text-error" : undefined}
              />
              {errors.featured_image_alt_text && (
                <p id="featured_image_alt_text-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.featured_image_alt_text.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium mb-2">
              Category *
            </label>
            <div className="space-y-2">
              <select
                id="category_id"
                {...register("category_id")}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                aria-required="true"
                aria-invalid={errors.category_id ? "true" : "false"}
                aria-describedby={errors.category_id ? "category_id-error" : undefined}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p id="category_id-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.category_id.message}
                </p>
              )}

              {!showNewCategory ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCategory(true)}
                >
                  + Create New Category
                </Button>
              ) : (
                <div className="border border-border rounded-md p-4 space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Category description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status *
            </label>
            <select
              id="status"
              {...register("status")}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              aria-required="true"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium mb-2">
              Meta Title (optional)
            </label>
            <input
              id="meta_title"
              {...register("meta_title")}
              maxLength={60}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="Leave empty to use article title"
              aria-invalid={errors.meta_title ? "true" : "false"}
              aria-describedby={errors.meta_title ? "meta_title-error" : undefined}
            />
            {errors.meta_title && (
              <p id="meta_title-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.meta_title.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 50-60 characters
            </p>
          </div>

          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium mb-2">
              Meta Description (optional)
            </label>
            <textarea
              id="meta_description"
              {...register("meta_description")}
              maxLength={160}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="Leave empty to auto-generate from content"
              aria-invalid={errors.meta_description ? "true" : "false"}
              aria-describedby={errors.meta_description ? "meta_description-error" : undefined}
            />
            {errors.meta_description && (
              <p id="meta_description-error" className="text-sm text-destructive mt-1" role="alert">
                {errors.meta_description.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 150-160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Article" : "Create Article"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

