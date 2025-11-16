"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPageChange: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  totalCount,
  pageSize = 20,
}: PaginationProps) {
  const startItem = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalCount
    ? Math.min(currentPage * pageSize, totalCount)
    : 0;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalCount || 0}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevious}
              className="rounded-l-md"
            >
              Previous
            </Button>
            {totalPages &&
              Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, idx, arr) => (
                  <div key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => onPageChange(page)}
                      className="rounded-none"
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className="rounded-r-md"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}

