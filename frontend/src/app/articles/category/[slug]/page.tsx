"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
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
  description?: string;
}

export default function CategoryArticlesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["article-category", slug],
    queryFn: () => articleApi.getCategory(slug),
    enabled: !!slug,
  });

  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useQuery<{
    results?: Article[];
    next?: string;
    previous?: string;
  }>({
    queryKey: ["articles", "category", category?.id],
    queryFn: async () => {
      if (!category) return { results: [] };
      return await articleApi.getArticles({ category: category.id });
    },
    enabled: !!category && !!slug,
  });

  const articles = articlesData?.results || (Array.isArray(articlesData) ? articlesData : []);

  if (categoryLoading || articlesLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Loading...</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading articles...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Category Not Found</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Category not found</div>
        </div>
      </div>
    );
  }

  if (articlesError) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Error loading articles: {String(articlesError)}</div>
        </div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
          {category.description && (
            <p className="text-white/80 text-sm md:text-base mt-2">{category.description}</p>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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

