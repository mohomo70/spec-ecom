"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import ArticleForm from "@/components/admin/ArticleForm";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "articles", id],
    queryFn: async () => {
      const response = await adminApi.getArticle(id);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await adminApi.updateArticle(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
  });

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push("/admin/articles");
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading article..." />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading article. Please try again.</p>
        <Link href="/admin/articles">
          <Button variant="outline" className="mt-4">
            Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="mt-2 text-sm text-gray-600">{data.title}</p>
        </div>
        <Link href="/admin/articles">
          <Button variant="outline">Back to Articles</Button>
        </Link>
      </div>

      {updateMutation.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to update article. Please try again."}
          </p>
        </div>
      )}

      <ArticleForm
        article={data}
        articleId={id}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}

