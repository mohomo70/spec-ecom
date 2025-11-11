"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth";
import { Search, BookOpen, Palette, Fish, Heart, Shield, Truck } from "lucide-react";


export default function HomePage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const userName = user?.first_name || user?.email?.split("@")[0] || "Guest";

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
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 text-sm md:text-base"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 max-w-4xl mx-auto">
            <Link href="/articles" className="group">
              <div className="w-[120px] h-[95px] md:w-[150px] md:h-[120px] bg-white rounded-lg shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[4px_6px_25px_rgba(141,141,141,0.25)]">
                <BookOpen className="w-7 h-7 md:w-9 md:h-9 text-blue-500" />
                <h3 className="text-xs md:text-sm font-medium text-gray-800">Articles</h3>
              </div>
            </Link>
            
            <Link href="/aquascaping" className="group">
              <div className="w-[120px] h-[95px] md:w-[150px] md:h-[120px] bg-white rounded-lg shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[4px_6px_25px_rgba(141,141,141,0.25)]">
                <Palette className="w-7 h-7 md:w-9 md:h-9 text-blue-500" />
                <h3 className="text-xs md:text-sm font-medium text-gray-800">Aquascaping</h3>
              </div>
            </Link>
            
            <Link href="/species" className="group">
              <div className="w-[120px] h-[95px] md:w-[150px] md:h-[120px] bg-white rounded-lg shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[4px_6px_25px_rgba(141,141,141,0.25)]">
                <Fish className="w-7 h-7 md:w-9 md:h-9 text-blue-500" />
                <h3 className="text-xs md:text-sm font-medium text-gray-800">Species</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
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
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative w-full mx-auto h-[115px]">
          <svg 
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0px -5px 22px rgba(0, 0, 0, 0.08))' }}
            viewBox="0 0 376 115"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 30 L 0 115 L 376 115 L 376 30 A 35 35 0 0 0 341 0 L 35 0 A 35 35 0 0 0 0 30 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
            <nav className="flex items-center justify-center gap-12 md:gap-16 w-full px-6 md:px-10">
              <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
