"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { articleApi } from "@/lib/api";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { useAuthStore } from "@/lib/stores/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [error, setError] = useState<string>("");

  // Redirect if not admin
  if (user && user.role !== "admin") {
    router.push("/");
    return null;
  }

  const createMutation = useMutation({
    mutationFn: (data: ArticleFormData) => articleApi.createArticle(data),
    onSuccess: () => {
      router.push("/articles/admin");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create article. Please try again.";
      setError(errorMessage);
    },
  });

  const handleSubmit = async (data: ArticleFormData) => {
    setError("");
    await createMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push("/articles/admin");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Article</h1>
        <p className="text-muted-foreground">Fill out the form below to create a new article.</p>
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

      <ArticleForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

