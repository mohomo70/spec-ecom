"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_category?: string;
  parent_name?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

interface CategoryTreeProps {
  categories: Category[];
  onDelete?: (id: string) => void;
  onReorder?: (id: string, newOrder: number) => void;
}

function CategoryNode({
  category,
  allCategories,
  level = 0,
  onDelete,
  onReorder,
}: {
  category: Category;
  allCategories: Category[];
  level?: number;
  onDelete?: (id: string) => void;
  onReorder?: (id: string, newOrder: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const subcategories = allCategories.filter(
    (cat) => cat.parent_category === category.id
  );

  return (
    <div className="ml-4">
      <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
        <div className="flex items-center space-x-2 flex-1">
          {subcategories.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{category.name}</span>
              {category.product_count !== undefined && (
                <span className="text-xs text-gray-500">
                  ({category.product_count} products)
                </span>
              )}
              {!category.is_active && (
                <span className="text-xs text-red-600">(Inactive)</span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-500">{category.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onReorder && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(category.id, category.display_order - 1)}
                disabled={category.display_order <= 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(category.id, category.display_order + 1)}
              >
                ↓
              </Button>
            </div>
          )}
          <Link href={`/admin/categories/${category.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this category?")) {
                  onDelete(category.id);
                }
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      {isExpanded && subcategories.length > 0 && (
        <div className="ml-4 border-l-2 border-gray-200">
          {subcategories.map((subcat) => (
            <CategoryNode
              key={subcat.id}
              category={subcat}
              allCategories={allCategories}
              level={level + 1}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({
  categories,
  onDelete,
  onReorder,
}: CategoryTreeProps) {
  const rootCategories = categories.filter((cat) => !cat.parent_category);

  if (rootCategories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No categories found
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {rootCategories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            allCategories={categories}
            onDelete={onDelete}
            onReorder={onReorder}
          />
        ))}
      </div>
    </div>
  );
}

