"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi, ProductDetail } from "@/lib/api/admin";
import ProductForm from "@/components/admin/ProductForm";
import ProductImageUpload from "@/components/admin/ProductImageUpload";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products", id],
    queryFn: async () => {
      const response = await adminApi.getProduct(id);
      return response.data as ProductDetail;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await adminApi.updateProduct(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading product..." />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading product. Please try again.</p>
        <Link href="/admin/products">
          <Button variant="outline" className="mt-4">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-2 text-sm text-gray-600">{data.species_name}</p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      {updateMutation.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to update product. Please try again."}
          </p>
        </div>
      )}

      <ProductForm
        product={data}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateMutation.isPending}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
        <ProductImageUpload productId={id} />
      </div>
    </div>
  );
}

