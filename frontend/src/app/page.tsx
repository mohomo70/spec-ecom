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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-white rounded-full"></div>
        </div>
        <div className="relative container mx-auto px-4 h-[172px] flex items-end justify-center">
          <div className="relative w-full max-w-md mb-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search For Fish"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/articles" className="group">
              <div className="w-[136px] h-[107px] bg-white rounded-[3px] shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-800">Articles</h3>
              </div>
            </Link>
            
            <Link href="/aquascaping" className="group">
              <div className="w-[136px] h-[107px] bg-white rounded-[3px] shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105">
                <Palette className="w-8 h-8 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-800">Aquascaping</h3>
              </div>
            </Link>
            
            <Link href="/species" className="group">
              <div className="w-[136px] h-[107px] bg-white rounded-[3px] shadow-[4px_6px_19px_rgba(141,141,141,0.15)] flex flex-col items-center justify-center gap-2 transition-transform group-hover:scale-105">
                <Fish className="w-8 h-8 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-800">Species</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Care</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Detailed care instructions for every fish species
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Each fish comes with comprehensive care guides, tank requirements,
                  and compatibility information.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Healthy Fish</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Only the highest quality, disease-free fish
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We quarantine and test all fish before shipping to ensure
                  they arrive healthy and ready for your aquarium.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Shipping</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Live arrival guarantee with insulated packaging
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Professional packaging and expedited shipping to get your
                  fish to you quickly and safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16">
        <div className="relative w-full  mx-auto h-[115px]">
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
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-10">
            <nav className="flex items-center justify-center gap-16 w-full px-10">
              <Link href="/" className="flex flex-col items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium leading-[11.93px] text-blue-500" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>HOME</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium leading-[11.93px] text-blue-400" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system' }}>PROFILE</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">&copy; 2025 Freshwater Fish Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
