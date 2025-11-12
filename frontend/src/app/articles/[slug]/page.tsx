"use client";

import { use, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { articleApi } from "@/lib/api";
import { Fish } from "lucide-react";

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
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
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: article, isLoading, error } = useQuery<ArticleDetail>({
    queryKey: ["article", slug],
    queryFn: () => articleApi.getArticle(slug),
  });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const canonicalUrl = article ? `${baseUrl}/articles/${article.slug}` : "";
  const metaTitle = article ? (article.meta_title || article.title) : "";
  const metaDescription = article ? (article.meta_description || article.excerpt) : "";

  useEffect(() => {
    if (!article || typeof document === "undefined") return;

    document.title = metaTitle;
    
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute("content", content);
      } else {
        tag = document.createElement("meta");
        if (property) {
          tag.setAttribute("property", name);
        } else {
          tag.setAttribute("name", name);
        }
        tag.setAttribute("content", content);
        document.head.appendChild(tag);
      }
    };

    setMetaTag("description", metaDescription);
    
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute("href", canonicalUrl);
    } else {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }

    setMetaTag("og:title", metaTitle, true);
    setMetaTag("og:description", metaDescription, true);
    setMetaTag("og:type", "article", true);
    setMetaTag("og:url", canonicalUrl, true);
    if (article.featured_image_url) {
      setMetaTag("og:image", article.featured_image_url, true);
      if (article.featured_image_alt_text) {
        setMetaTag("og:image:alt", article.featured_image_alt_text, true);
      }
    }
    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", metaTitle, true);
    setMetaTag("twitter:description", metaDescription, true);
    if (article.featured_image_url) {
      setMetaTag("twitter:image", article.featured_image_url, true);
    }
  }, [article, metaTitle, metaDescription, canonicalUrl]);

  if (isLoading) {
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
          <div className="text-center">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Article Not Found</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Article not found</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
        </div>
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          <div className="mb-2">
            <Link
              href={`/articles/category/${article.category.slug}`}
              className="text-sm text-white/80 hover:text-white"
            >
              {article.category.name}
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{article.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
            <span>By {article.author.first_name || article.author.email}</span>
            {article.published_at && <span>•</span>}
            {article.published_at && <span>{formatDate(article.published_at)}</span>}
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {article.featured_image_url && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt_text || article.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              author: {
                "@type": "Person",
                name: article.author.first_name || article.author.email,
              },
              datePublished: article.published_at,
              dateModified: article.updated_at,
              image: article.featured_image_url,
              articleBody: article.content,
              articleSection: article.category.name,
            }),
          }}
        />
      </article>

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

