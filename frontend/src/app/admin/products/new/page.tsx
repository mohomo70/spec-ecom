"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import ProductForm from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await adminApi.createProduct(data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      if (data?.data?.id) {
        router.push(`/admin/products/${data.data.id}`);
      } else {
        router.push("/admin/products");
      }
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new fish product to the catalog
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      {createMutation.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "Failed to create product. Please try again."}
          </p>
        </div>
      )}

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

