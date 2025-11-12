"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
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
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["article-categories"],
    queryFn: async () => {
      try {
        const response = await articleApi.getCategories();
        console.log('categoriesData', response);
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'results' in response) {
          return Array.isArray(response.results) ? response.results : [];
        }
        return [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: articlesData, isLoading, error } = useQuery<{
    results?: Article[];
    next?: string;
    previous?: string;
  }>({
    queryKey: ["articles", selectedCategory],
    queryFn: async () => {
      const params: { category?: string } = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      return await articleApi.getArticles(params);
    },
  });

  const articles = articlesData?.results || (Array.isArray(articlesData) ? articlesData : []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("category", value);
    } else {
      url.searchParams.delete("category");
    }
    window.history.pushState({}, "", url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Error loading articles</div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Error loading categories: {String(categoriesError)}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Articles</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background min-w-[200px]"
          >
            <option value="">All Categories</option>
            {categoriesLoading ? (
              <option disabled>Loading categories...</option>
            ) : categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0 ? (
              categoriesData.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
      </div>

      <ArticleList articles={articles} />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}

