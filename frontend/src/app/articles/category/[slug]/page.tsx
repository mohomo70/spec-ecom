"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { articleApi } from "@/lib/api";
import { ArticleList } from "@/components/articles/ArticleList";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  featured_image_alt_text?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    first_name: string;
    email: string;
  };
  published_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoryArticlesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["article-category", slug],
    queryFn: () => articleApi.getCategory(slug),
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery<{
    results?: Article[];
    next?: string;
    previous?: string;
  }>({
    queryKey: ["articles", "category", slug],
    queryFn: async () => {
      const categories = await articleApi.getCategories();
      const category = Array.isArray(categories)
        ? categories.find((c: Category) => c.slug === slug)
        : null;
      if (!category) return { results: [] };
      return await articleApi.getArticles({ category: category.id });
    },
    enabled: !!slug,
  });

  const articles = articlesData?.results || (Array.isArray(articlesData) ? articlesData : []);

  if (categoryLoading || articlesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Category not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      <ArticleList articles={articles} />
    </div>
  );
}

