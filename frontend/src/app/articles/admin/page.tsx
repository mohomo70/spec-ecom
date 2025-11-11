"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { articleApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "draft" | "published";
  published_at: string;
  created_at: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Redirect if not admin
  if (user && user.role !== "admin") {
    router.push("/");
    return null;
  }

  const { data: articlesData, isLoading, error: queryError } = useQuery<{
    results?: Article[];
    next?: string;
    previous?: string;
  }>({
    queryKey: ["admin-articles"],
    queryFn: () => articleApi.getAdminArticles(),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => articleApi.deleteArticle(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setDeletingSlug(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete article. Please try again.";
      setError(errorMessage);
      setDeletingSlug(null);
    },
  });

  const articles = articlesData?.results || (Array.isArray(articlesData) ? articlesData : []);

  const handleDelete = (slug: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setError("");
      setDeletingSlug(slug);
      deleteMutation.mutate(slug);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading articles...</div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Error loading articles</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Article Management</h1>
          <p className="text-muted-foreground">Manage all articles including drafts and published content.</p>
        </div>
        <Link href="/articles/admin/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </Link>
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

      {articles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No articles found.</p>
              <Link href="/articles/admin/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Article
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{article.title}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          article.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {article.status}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>Category: {article.category.name}</span>
                      {article.published_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Published: {formatDate(article.published_at)}</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span>Created: {formatDate(article.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/articles/admin/${article.slug}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(article.slug, article.title)}
                      disabled={deletingSlug === article.slug}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingSlug === article.slug ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

