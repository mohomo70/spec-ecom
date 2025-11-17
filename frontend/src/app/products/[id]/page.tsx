"use client";

import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { apiClient, CatalogProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth";
import { buildProductDetailJsonLd, buildProductDetailMeta } from "@/lib/seo";

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
  alt_text?: string;
  caption?: string;
}

type ProductDetail = CatalogProduct & {
  care_instructions: string;
  compatibility_notes?: string;
  additional_images: string[];
  images?: ProductImage[];
  categories: Array<{ id: string; name: string; slug: string }>;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient.getProduct(productId),
    enabled: !!productId,
  });

  const handleSearch = () => {
    if (headerSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const renderHeadPlaceholder = () => (
    <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
        <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
      </div>
      <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
        <div className="relative w-full max-w-md mb-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
          <div className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg" />
        </div>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        {renderHeadPlaceholder()}
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-32">
        {renderHeadPlaceholder()}
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const typedProduct = product as ProductDetail;
  const primaryImage =
    typedProduct.primary_image_url ||
    typedProduct.images?.find((img) => img.is_primary)?.url ||
    typedProduct.images?.[0]?.url;
  const galleryImages = typedProduct.images?.filter((img) => !img.is_primary) || typedProduct.additional_images || [];
  const isPlant = typedProduct.product_type === "plant";
  const isPlantOutOfStock = isPlant && (typedProduct.stock_quantity ?? 0) <= 0;
  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const detailMeta = buildProductDetailMeta(typedProduct);
  const productJsonLd = buildProductDetailJsonLd(typedProduct, origin);

  return (
    <>
      <Head>
        <title>{detailMeta.title}</title>
        <meta name="description" content={detailMeta.description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      </Head>
      <div className="min-h-screen bg-background pb-32">
        <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
          </div>
          <div className="relative container mx-auto px-4 pt-6 pb-4 md:h-[172px] md:flex md:items-end md:justify-center">
            <div className="flex items-start justify-between mb-4 md:absolute md:top-6 md:left-4 md:right-4 md:mb-0">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Hello {userName}</h1>
                <p className="text-white/80 text-sm md:text-base">
                  {typedProduct.product_type === "plant"
                    ? "Learn how to care for this aquarium plant before it reaches your tank."
                    : "Discover everything you need to know before adding this fish to your tank."}
                </p>
              </div>
            </div>
            <div className="relative w-full max-w-md mx-auto md:mb-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 z-10" />
              <input
                type="text"
                placeholder="Search catalog"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 text-sm md:text-base"
              />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={typedProduct.species_name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-lg">No Image Available</div>
                )}
              </div>
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((image, index) => {
                    const imageUrl = typeof image === "string" ? image : image.url;
                    const imageAlt =
                      typeof image === "string"
                        ? `${typedProduct.species_name} ${index + 1}`
                        : image.alt_text || `${typedProduct.species_name} ${index + 1}`;
                    return (
                      <div key={typeof image === "string" ? index : image.id} className="aspect-square bg-gray-100 rounded">
                        <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover rounded" loading="lazy" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2" data-testid="product-detail-title">
                  {typedProduct.species_name}
                </h1>
                {typedProduct.botanical_name && typedProduct.product_type === "plant" && (
                  <p className="text-lg text-emerald-700 font-medium">{typedProduct.botanical_name}</p>
                )}
                {typedProduct.scientific_name && (
                  <p className="text-xl text-muted-foreground italic mb-4">{typedProduct.scientific_name}</p>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-primary">${typedProduct.price}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      typedProduct.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {typedProduct.is_available ? "Available" : "Out of Stock"}
                  </span>
                </div>
                <p className="text-muted-foreground mb-6">{typedProduct.description}</p>

                {typedProduct.categories?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {typedProduct.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}${typedProduct.product_type === "plant" ? "&product_type=plant" : ""}`}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {isPlantOutOfStock ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-testid="plant-oos-callout">
                    This plant is currently propagating. Keep exploring care information below and check back once inventory returns.
                  </div>
                ) : (
                  <Button className="w-full" disabled={!typedProduct.is_available}>
                    Add to Cart
                  </Button>
                )}
              </div>

              {isPlant && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plant Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {typedProduct.plant_category && (
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2">{typedProduct.plant_category.name}</span>
                      </div>
                    )}
                    {typedProduct.plant_light_requirements && (
                      <div>
                        <span className="font-medium">Light:</span>
                        <span className="ml-2 capitalize">{typedProduct.plant_light_requirements}</span>
                      </div>
                    )}
                    {typedProduct.plant_growth_rate && (
                      <div>
                        <span className="font-medium">Growth rate:</span>
                        <span className="ml-2 capitalize">{typedProduct.plant_growth_rate}</span>
                      </div>
                    )}
                    {typedProduct.plant_substrate_preference && (
                      <div>
                        <span className="font-medium">Substrate:</span>
                        <span className="ml-2">{typedProduct.plant_substrate_preference}</span>
                      </div>
                    )}
                    {typedProduct.plant_co2_requirement && (
                      <div>
                        <span className="font-medium">CO₂:</span>
                        <span className="ml-2 capitalize">{typedProduct.plant_co2_requirement}</span>
                      </div>
                    )}
                    {typedProduct.plant_care_notes && (
                      <div>
                        <span className="font-medium">Care notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{typedProduct.plant_care_notes}</p>
                      </div>
                    )}
                    {typedProduct.plant_compatible_fauna?.length ? (
                      <div>
                        <span className="font-medium">Compatible fauna:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {typedProduct.plant_compatible_fauna.map((fauna) => (
                            <span key={fauna} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-800">
                              {fauna}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Care Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <span className="ml-2 capitalize">{typedProduct.difficulty_level}</span>
                    </div>
                    <div>
                      <span className="font-medium">Min Tank Size:</span>
                      <span className="ml-2">{typedProduct.min_tank_size_gallons} gallons</span>
                    </div>
                    {typedProduct.ph_range_min && typedProduct.ph_range_max && (
                      <div>
                        <span className="font-medium">pH Range:</span>
                        <span className="ml-2">{typedProduct.ph_range_min} - {typedProduct.ph_range_max}</span>
                      </div>
                    )}
                    {typedProduct.temperature_range_min && typedProduct.temperature_range_max && (
                      <div>
                        <span className="font-medium">Temperature:</span>
                        <span className="ml-2">{typedProduct.temperature_range_min}°F - {typedProduct.temperature_range_max}°F</span>
                      </div>
                    )}
                  </div>
                  {typedProduct.care_instructions && (
                    <div>
                      <span className="font-medium">Care Instructions:</span>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{typedProduct.care_instructions}</p>
                    </div>
                  )}
                  {typedProduct.compatibility_notes && (
                    <div>
                      <span className="font-medium">Compatibility Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{typedProduct.compatibility_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

