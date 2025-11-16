"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category?: {
    id: string;
    name: string;
  };
  author?: {
    id: string;
    email: string;
  };
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface ArticleTableProps {
  articles: Article[];
  onDelete?: (id: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
}

export default function ArticleTable({
  articles,
  onDelete,
  onSelectionChange,
  selectedIds = [],
}: ArticleTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    setLocalSelectedIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    const handleClearSelection = () => {
      setLocalSelectedIds([]);
      onSelectionChange?.([]);
    };
    window.addEventListener("clearBulkSelection", handleClearSelection);
    return () => window.removeEventListener("clearBulkSelection", handleClearSelection);
  }, [onSelectionChange]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? articles.map((a) => a.id) : [];
    setLocalSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelection = checked
      ? [...localSelectedIds, id]
      : localSelectedIds.filter((selectedId) => selectedId !== id);
    setLocalSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    setDeletingId(id);
    try {
      onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "published"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onSelectionChange && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={articles.length > 0 && localSelectedIds.length === articles.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Published
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.id} className={localSelectedIds.includes(article.id) ? "bg-blue-50" : ""}>
              {onSelectionChange && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={localSelectedIds.includes(article.id)}
                    onChange={(e) => handleSelectOne(article.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {article.title}
                </div>
                <div className="text-sm text-gray-500">{article.slug}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    article.status
                  )}`}
                >
                  {article.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {article.category?.name || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {article.author?.email || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString()
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(article.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link href={`/admin/articles/${article.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                  >
                    {deletingId === article.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
