"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { adminApi, ProductDetail, Category, PlantCategory } from "@/lib/api/admin";
import { apiClient } from "@/lib/api";
import ConflictWarning from "@/components/admin/ConflictWarning";
import Link from "next/link";

const productSchema = z.object({
  species_name: z.string().min(1, "Species name is required"),
  scientific_name: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stock_quantity: z.number().int().min(0, "Stock quantity must be 0 or greater"),
  is_available: z.boolean().default(true),
  hero_eligible: z.boolean().default(false),
  product_type: z.enum(["fish", "plant", "accessory"]).default("fish"),
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
  botanical_name: z.string().optional(),
  plant_category_id: z.string().uuid().optional().nullable(),
  plant_light_requirements: z.string().optional(),
  plant_growth_rate: z.enum(["slow", "medium", "fast"]).optional().nullable(),
  plant_substrate_preference: z.string().optional(),
  plant_co2_requirement: z.enum(["none", "optional", "recommended"]).optional().nullable(),
  plant_difficulty: z.string().optional(),
  plant_care_notes: z.string().optional(),
  plant_max_height_cm: z.number().int().optional().nullable(),
  plant_spread_cm: z.number().int().optional().nullable(),
  plant_compatible_fauna_text: z.string().optional(),
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
}).superRefine((data, ctx) => {
  if (data.product_type === "plant") {
    if (!data.botanical_name || !data.botanical_name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Botanical name is required for plant products",
        path: ["botanical_name"],
      });
    }
    if (!data.plant_category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a plant category",
        path: ["plant_category_id"],
      });
    }
  }
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductDetail;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  productId?: string;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  productId,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const [conflictError, setConflictError] = useState<any>(null);
  
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.getCategories(),
  });

  const categories = (categoriesData as any)?.results || [];

  const { data: plantCategoriesResponse } = useQuery({
    queryKey: ["admin", "plant-categories"],
    queryFn: () => adminApi.getPlantCategories({ is_active: true }),
  });

  const plantCategories: PlantCategory[] =
    (plantCategoriesResponse?.results ||
      (plantCategoriesResponse?.data
        ? Array.isArray(plantCategoriesResponse.data)
          ? plantCategoriesResponse.data
          : [plantCategoriesResponse.data]
        : [])) as PlantCategory[];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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
          hero_eligible: product.hero_eligible ?? false,
          product_type: product.product_type || "fish",
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
          botanical_name: product.botanical_name || "",
          plant_category_id: product.plant_category?.id || null,
          plant_light_requirements: product.plant_light_requirements || "",
          plant_growth_rate: product.plant_growth_rate || null,
          plant_substrate_preference: product.plant_substrate_preference || "",
          plant_co2_requirement: product.plant_co2_requirement || null,
          plant_difficulty: product.plant_difficulty || "",
          plant_care_notes: product.plant_care_notes || "",
          plant_max_height_cm: product.plant_max_height_cm ?? null,
          plant_spread_cm: product.plant_spread_cm ?? null,
          plant_compatible_fauna_text: product.plant_compatible_fauna?.join("\n") || "",
        }
      : {
          is_available: true,
          hero_eligible: false,
          product_type: "fish",
          difficulty_level: "beginner",
          category_ids: [],
          plant_light_requirements: "",
          plant_growth_rate: null,
          plant_substrate_preference: "",
          plant_co2_requirement: null,
          plant_difficulty: "",
          plant_care_notes: "",
          plant_max_height_cm: null,
          plant_spread_cm: null,
          plant_compatible_fauna_text: "",
        },
  });

  const selectedCategories = watch("category_ids") || [];
  const productType = watch("product_type");
  const isPlant = productType === "plant";

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategories;
    if (current.includes(categoryId)) {
      setValue("category_ids", current.filter((id) => id !== categoryId));
    } else {
      setValue("category_ids", [...current, categoryId]);
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setConflictError(null);
    try {
      const payload: any = { ...data };
      if (product && product.updated_at) {
        payload.updated_at = product.updated_at;
      }
      if (payload.plant_compatible_fauna_text !== undefined) {
        payload.plant_compatible_fauna = payload.plant_compatible_fauna_text
          ? payload.plant_compatible_fauna_text
              .split(/[\n,]/)
              .map((entry: string) => entry.trim())
              .filter(Boolean)
          : [];
        delete payload.plant_compatible_fauna_text;
      }
      if (!payload.plant_category_id) {
        payload.plant_category_id = null;
      }
      await onSubmit(payload);
    } catch (error: any) {
      if (error?.conflict || error?.response?.data?.conflict) {
        setConflictError(error.response?.data || error);
      } else {
        throw error;
      }
    }
  };

  const handleRetry = async () => {
    if (productId) {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products", productId] });
      const { data } = await queryClient.fetchQuery({
        queryKey: ["admin", "products", productId],
        queryFn: async () => {
          const response = await adminApi.getProduct(productId);
          return response.data;
        },
      });
      if (data) {
        reset({
          species_name: data.species_name,
          scientific_name: data.scientific_name || "",
          description: data.description,
          price: parseFloat(data.price),
          stock_quantity: data.stock_quantity,
          is_available: data.is_available,
          hero_eligible: data.hero_eligible ?? false,
          product_type: data.product_type || "fish",
          difficulty_level: data.difficulty_level,
          min_tank_size_gallons: data.min_tank_size_gallons,
          ph_range_min: data.ph_range_min || null,
          ph_range_max: data.ph_range_max || null,
          temperature_range_min: data.temperature_range_min || null,
          temperature_range_max: data.temperature_range_max || null,
          max_size_inches: data.max_size_inches || null,
          lifespan_years: data.lifespan_years || null,
          diet_type: data.diet_type || null,
          compatibility_notes: data.compatibility_notes || "",
          care_instructions: data.care_instructions,
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          category_ids: data.categories?.map((c: any) => c.id) || [],
          botanical_name: data.botanical_name || "",
          plant_category_id: data.plant_category?.id || null,
          plant_light_requirements: data.plant_light_requirements || "",
          plant_growth_rate: data.plant_growth_rate || null,
          plant_substrate_preference: data.plant_substrate_preference || "",
          plant_co2_requirement: data.plant_co2_requirement || null,
          plant_difficulty: data.plant_difficulty || "",
          plant_care_notes: data.plant_care_notes || "",
          plant_max_height_cm: data.plant_max_height_cm ?? null,
          plant_spread_cm: data.plant_spread_cm ?? null,
          plant_compatible_fauna_text: data.plant_compatible_fauna?.join("\n") || "",
        });
        setConflictError(null);
      }
    }
  };

  const handleForceUpdate = async () => {
    setConflictError(null);
    const formData = watch();
    if (product) {
      (formData as any).updated_at = null;
    }
    await handleFormSubmit(formData as ProductFormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {conflictError && (
        <ConflictWarning
          message={conflictError.message || "This record has been modified by another user."}
          currentUpdatedAt={conflictError.current_updated_at}
          onRetry={handleRetry}
          onForceUpdate={handleForceUpdate}
        />
      )}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Type *
          </label>
          <select
            {...register("product_type")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="fish">Fish</option>
            <option value="plant">Plant</option>
            <option value="accessory">Accessory</option>
          </select>
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

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("hero_eligible")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Eligible for homepage hero / quick-link promotion</span>
          </label>
        </div>
      </div>

      {isPlant && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plant Attributes</h3>
              <p className="text-sm text-gray-600">
                Provide horticultural data used on plant detail pages.
              </p>
            </div>
            <Link href="/admin/plant-categories" className="text-sm text-blue-600 hover:underline">
              Manage plant categories
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Botanical Name *
              </label>
              <input
                type="text"
                {...register("botanical_name")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.botanical_name && (
                <p className="mt-1 text-sm text-red-600">{errors.botanical_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plant Category *
              </label>
              <select
                {...register("plant_category_id")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a plant category</option>
                {plantCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.plant_category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.plant_category_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Light Requirements
              </label>
              <input
                type="text"
                {...register("plant_light_requirements")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Low, Medium, High"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Growth Rate
              </label>
              <select
                {...register("plant_growth_rate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select growth rate</option>
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Substrate Preference
              </label>
              <input
                type="text"
                {...register("plant_substrate_preference")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Sand, Aquasoil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CO₂ Requirement
              </label>
              <select
                {...register("plant_co2_requirement")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select requirement</option>
                <option value="none">None</option>
                <option value="optional">Optional</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Care Difficulty
              </label>
              <input
                type="text"
                {...register("plant_difficulty")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Easy, Moderate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Height (cm)
              </label>
              <input
                type="number"
                {...register("plant_max_height_cm", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Spread (cm)
              </label>
              <input
                type="number"
                {...register("plant_spread_cm", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Compatible Fauna
            </label>
            <textarea
              {...register("plant_compatible_fauna_text")}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="List compatible fish separated by commas or new lines"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plant Care Notes
            </label>
            <textarea
              {...register("plant_care_notes")}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

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

