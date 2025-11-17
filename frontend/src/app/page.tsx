"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth";
import { Search, BookOpen, Palette, Fish, Heart, Shield, Truck, Stethoscope, Leaf } from "lucide-react";

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full hidden md:block"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full hidden md:block"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full hidden md:block"></div>
        </div>
        <div className="relative container mx-auto px-4 pt-6 pb-4 md:h-[172px] md:flex md:items-end md:justify-center">
          <div className="flex items-start justify-between mb-4 md:absolute md:top-6 md:left-4 md:right-4 md:mb-0">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Hello {userName},
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Let's Explore Our Freshwater Fish Collection
              </p>
            </div>
            {user ? (
              <Link href="/profile" className="flex-shrink-0 ml-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                  {user.first_name ? (
                    <span className="text-white font-semibold text-base md:text-lg">
                      {user.first_name[0].toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="flex-shrink-0 ml-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
          <div className="relative w-full max-w-md mx-auto md:mb-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 z-10" />
            <input
              type="text"
              placeholder="Search For Fish"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 text-sm md:text-base"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
              {[
                {
                  key: "articles",
                  href: "/articles",
                  label: "Articles",
                  description: "Guides & inspiration",
                  icon: BookOpen,
                },
                {
                  key: "aquascaping",
                  href: "/articles/category/aquascaping",
                  label: "Aquascaping",
                  description: "Design better tanks",
                  icon: Palette,
                  hideOnSmall: false,
                },
                {
                  key: "species",
                  href: "/products",
                  label: "Species",
                  description: "Shop freshwater fish",
                  icon: Fish,
                },
                {
                  key: "plants",
                  href: "/products?product_type=plant",
                  label: "Plants",
                  description: "Carpeting, sword & stem",
                  icon: Leaf,
                },
                {
                  key: "fish-care",
                  href: "/articles/category/fish-care",
                  label: "Fish Care",
                  description: "Health & husbandry tips",
                  icon: Stethoscope,
                  hideOnSmall: true,
                },
              ].map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`group ${link.hideOnSmall ? "hidden md:block" : ""}`}
                >
                  <div className="w-full min-h-[110px] md:min-h-[180px] bg-white rounded-lg shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 md:gap-4 px-3 text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[4px_6px_25px_rgba(141,141,141,0.25)]">
                    <link.icon className="w-7 h-7 md:w-16 md:h-16 text-blue-500" />
                    <div>
                      <h3 className="text-xs md:text-lg font-medium text-gray-800">{link.label}</h3>
                      <p className="text-[10px] md:text-sm text-gray-500 mt-1">{link.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 md:hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                    <Heart className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Expert Care</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                    Detailed care instructions for every fish species
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                    Each fish comes with comprehensive care guides, tank requirements,
                    and compatibility information.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 md:hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                    <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Healthy Fish</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                    Only the highest quality, disease-free fish
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                    We quarantine and test all fish before shipping to ensure
                    they arrive healthy and ready for your aquarium.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 md:hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                    <Truck className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Fast Shipping</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                    Live arrival guarantee with insulated packaging
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                    Professional packaging and expedited shipping to get your
                    fish to you quickly and safely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
