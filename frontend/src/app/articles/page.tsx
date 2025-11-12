"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { articleApi } from "@/lib/api";
import { ArticleList } from "@/components/articles/ArticleList";
import { Fish } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-32">
      <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
        </div>
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Articles</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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

      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative w-full mx-auto h-[115px]">
          <svg 
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0px -5px 22px rgba(0, 0, 0, 0.08))' }}
            viewBox="0 0 376 115"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 30 L 0 115 L 376 115 L 376 30 A 35 35 0 0 0 341 0 L 35 0 A 35 35 0 0 0 0 30 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
            <nav className="flex items-center justify-center gap-12 md:gap-20 w-full px-6 md:px-10">
              <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
              </Link>
              <Link href="/products" className="hidden md:flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <Fish className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PRODUCTS</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
              </Link>
            </nav>
          </div>
        </div>
      </footer>
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

