"use client";

import { use, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { articleApi } from "@/lib/api";

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">Article not found</div>
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
    <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/articles/category/${article.category.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {article.category.name}
          </Link>
        </div>

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <span>By {article.author.first_name || article.author.email}</span>
        {article.published_at && <span>•</span>}
        {article.published_at && <span>{formatDate(article.published_at)}</span>}
      </div>

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
  );
}

