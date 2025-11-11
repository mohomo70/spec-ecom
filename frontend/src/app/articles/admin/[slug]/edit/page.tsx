"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { articleApi } from "@/lib/api";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

type ArticleFormData = {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  featured_image_alt_text?: string;
  category_id: string;
  status: "draft" | "published";
  meta_title?: string;
  meta_description?: string;
};

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [error, setError] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Redirect if not admin
  if (user && user.role !== "admin") {
    router.push("/");
    return null;
  }

  const { data: article, isLoading, error: fetchError } = useQuery({
    queryKey: ["article", slug, "admin"],
    queryFn: () => articleApi.getArticle(slug),
    enabled: !!slug,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ArticleFormData) => articleApi.updateArticle(slug, data),
    onSuccess: () => {
      router.push("/articles/admin");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update article. Please try again.";
      setError(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => articleApi.deleteArticle(slug),
    onSuccess: () => {
      router.push("/articles/admin");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete article. Please try again.";
      setError(errorMessage);
    },
  });

  const handleSubmit = async (data: ArticleFormData) => {
    setError("");
    await updateMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push("/articles/admin");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      setError("");
      await deleteMutation.mutateAsync();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading article...</div>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Article not found</div>
      </div>
    );
  }

  const initialData: ArticleFormData = {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || "",
    featured_image_url: article.featured_image_url || "",
    featured_image_alt_text: article.featured_image_alt_text || "",
    category_id: article.category.id,
    status: article.status as "draft" | "published",
    meta_title: article.meta_title || "",
    meta_description: article.meta_description || "",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
          <p className="text-muted-foreground">Update article details and content.</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {deleteMutation.isPending ? "Deleting..." : "Delete Article"}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <ArticleForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

