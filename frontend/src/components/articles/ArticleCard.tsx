"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleCardProps {
  article: {
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
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {article.featured_image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={article.featured_image_url}
              alt={article.featured_image_alt_text || article.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{article.category.name}</span>
            {article.published_at && (
              <span className="text-xs text-muted-foreground">
                {formatDate(article.published_at)}
              </span>
            )}
          </div>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
          <div className="mt-4 text-sm text-muted-foreground">
            By {article.author.first_name || article.author.email}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

