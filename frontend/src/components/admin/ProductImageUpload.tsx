"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ProductImage } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/components/admin/LoadingIndicator";

interface ProductImageUploadProps {
  productId: string;
}

export default function ProductImageUpload({
  productId,
}: ProductImageUploadProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrimary, setIsPrimary] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", productId, "images"],
    queryFn: async () => {
      const response = await adminApi.getProductImages(productId);
      return (response.results || []) as ProductImage[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await adminApi.uploadProductImage(productId, file, {
        is_primary: isPrimary,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId, "images"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId],
      });
      setSelectedFile(null);
      setIsPrimary(false);
      setUploading(false);
    },
    onError: () => {
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await adminApi.deleteProductImage(productId, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId, "images"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId],
      });
    },
  });

  const updatePrimaryMutation = useMutation({
    mutationFn: async ({ imageId, isPrimary }: { imageId: string; isPrimary: boolean }) => {
      await adminApi.updateProductImage(productId, imageId, { is_primary: isPrimary });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId, "images"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", productId],
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    uploadMutation.mutate(selectedFile);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    deleteMutation.mutate(imageId);
  };

  const handleSetPrimary = async (imageId: string) => {
    updatePrimaryMutation.mutate({ imageId, isPrimary: true });
  };

  if (isLoading) {
    return <LoadingIndicator text="Loading images..." />;
  }

  const images = data || [];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Image</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is-primary" className="ml-2 text-sm text-gray-700">
              Set as primary image
            </label>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Product Images ({images.length})
        </h3>
        {images.length === 0 ? (
          <p className="text-sm text-gray-500">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="border border-gray-200 rounded-lg p-2 relative"
              >
                {image.url && (
                  <div className="relative w-full aspect-square mb-2">
                    <Image
                      src={image.url}
                      alt={image.alt_text || "Product image"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                {image.is_primary && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
                <div className="space-y-2">
                  {!image.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={updatePrimaryMutation.isPending}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

