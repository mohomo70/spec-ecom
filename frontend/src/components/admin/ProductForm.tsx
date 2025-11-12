"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductDetail, Category } from "@/lib/api/admin";
import { apiClient } from "@/lib/api";

const productSchema = z.object({
  species_name: z.string().min(1, "Species name is required"),
  scientific_name: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stock_quantity: z.number().int().min(0, "Stock quantity must be 0 or greater"),
  is_available: z.boolean().default(true),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
  min_tank_size_gallons: z.number().int().min(1, "Minimum tank size is required"),
  ph_range_min: z.number().min(0).max(14).optional().nullable(),
  ph_range_max: z.number().min(0).max(14).optional().nullable(),
  temperature_range_min: z.number().int().optional().nullable(),
  temperature_range_max: z.number().int().optional().nullable(),
  max_size_inches: z.number().optional().nullable(),
  lifespan_years: z.number().int().optional().nullable(),
  diet_type: z.enum(["herbivore", "carnivore", "omnivore"]).optional().nullable(),
  compatibility_notes: z.string().optional(),
  care_instructions: z.string().min(1, "Care instructions are required"),
  seo_title: z.string().max(60).optional(),
  seo_description: z.string().max(160).optional(),
  category_ids: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.ph_range_min !== null && data.ph_range_max !== null) {
    return data.ph_range_min <= data.ph_range_max;
  }
  return true;
}, {
  message: "pH range min must be less than or equal to max",
  path: ["ph_range_max"],
}).refine((data) => {
  if (data.temperature_range_min !== null && data.temperature_range_max !== null) {
    return data.temperature_range_min <= data.temperature_range_max;
  }
  return true;
}, {
  message: "Temperature range min must be less than or equal to max",
  path: ["temperature_range_max"],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductDetail;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = (categoriesData as any)?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          species_name: product.species_name,
          scientific_name: product.scientific_name || "",
          description: product.description,
          price: parseFloat(product.price),
          stock_quantity: product.stock_quantity,
          is_available: product.is_available,
          difficulty_level: product.difficulty_level,
          min_tank_size_gallons: product.min_tank_size_gallons,
          ph_range_min: product.ph_range_min || null,
          ph_range_max: product.ph_range_max || null,
          temperature_range_min: product.temperature_range_min || null,
          temperature_range_max: product.temperature_range_max || null,
          max_size_inches: product.max_size_inches || null,
          lifespan_years: product.lifespan_years || null,
          diet_type: product.diet_type || null,
          compatibility_notes: product.compatibility_notes || "",
          care_instructions: product.care_instructions,
          seo_title: product.seo_title || "",
          seo_description: product.seo_description || "",
          category_ids: product.categories?.map((c) => c.id) || [],
        }
      : {
          is_available: true,
          difficulty_level: "beginner",
          category_ids: [],
        },
  });

  const selectedCategories = watch("category_ids") || [];

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategories;
    if (current.includes(categoryId)) {
      setValue("category_ids", current.filter((id) => id !== categoryId));
    } else {
      setValue("category_ids", [...current, categoryId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Species Name *
          </label>
          <input
            type="text"
            {...register("species_name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.species_name && (
            <p className="mt-1 text-sm text-red-600">{errors.species_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Scientific Name
          </label>
          <input
            type="text"
            {...register("scientific_name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price ($) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity *
          </label>
          <input
            type="number"
            {...register("stock_quantity", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Difficulty Level *
          </label>
          <select
            {...register("difficulty_level")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Tank Size (Gallons) *
          </label>
          <input
            type="number"
            {...register("min_tank_size_gallons", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.min_tank_size_gallons && (
            <p className="mt-1 text-sm text-red-600">{errors.min_tank_size_gallons.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            pH Range Min
          </label>
          <input
            type="number"
            step="0.1"
            {...register("ph_range_min", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.ph_range_min && (
            <p className="mt-1 text-sm text-red-600">{errors.ph_range_min.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            pH Range Max
          </label>
          <input
            type="number"
            step="0.1"
            {...register("ph_range_max", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.ph_range_max && (
            <p className="mt-1 text-sm text-red-600">{errors.ph_range_max.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Temperature Range Min (°F)
          </label>
          <input
            type="number"
            {...register("temperature_range_min", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Temperature Range Max (°F)
          </label>
          <input
            type="number"
            {...register("temperature_range_max", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Size (inches)
          </label>
          <input
            type="number"
            step="0.1"
            {...register("max_size_inches", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lifespan (years)
          </label>
          <input
            type="number"
            {...register("lifespan_years", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diet Type
          </label>
          <select
            {...register("diet_type")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select diet type</option>
            <option value="herbivore">Herbivore</option>
            <option value="carnivore">Carnivore</option>
            <option value="omnivore">Omnivore</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Compatibility Notes
          </label>
          <textarea
            {...register("compatibility_notes")}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Care Instructions *
          </label>
          <textarea
            {...register("care_instructions")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.care_instructions && (
            <p className="mt-1 text-sm text-red-600">{errors.care_instructions.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <label key={cat.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SEO Title (max 60 chars)
          </label>
          <input
            type="text"
            maxLength={60}
            {...register("seo_title")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            SEO Description (max 160 chars)
          </label>
          <textarea
            maxLength={160}
            {...register("seo_description")}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("is_available")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Available for purchase</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

