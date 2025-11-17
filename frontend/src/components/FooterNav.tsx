"use client";

import Link from "next/link";
import { Fish } from "lucide-react";

export function FooterNav() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative w-full mx-auto h-[115px]">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ filter: "drop-shadow(0px -5px 22px rgba(0, 0, 0, 0.08))" }}
          viewBox="0 0 376 115"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 30 L 0 115 L 376 115 L 376 30 A 35 35 0 0 0 341 0 L 35 0 A 35 35 0 0 0 0 30 Z"
            fill="#FFFFFF"
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-3 md:pb-4 z-10">
          <nav className="flex items-center justify-center gap-12 md:gap-20 w-full px-6 md:px-10">
            <Link href="/" className="flex flex-col items-center gap-2 md:gap-2.5">
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <span
                className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-500"
                style={{ fontFamily: "SF Pro Text, system-ui, -apple-system" }}
              >
                HOME
              </span>
            </Link>
            <Link href="/products" className="hidden md:flex flex-col items-center gap-2 md:gap-2.5">
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <Fish className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <span
                className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400"
                style={{ fontFamily: "SF Pro Text, system-ui, -apple-system" }}
              >
                PRODUCTS
              </span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-2 md:gap-2.5">
              <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span
                className="text-[9px] md:text-[10px] font-medium leading-[11.93px] text-blue-400"
                style={{ fontFamily: "SF Pro Text, system-ui, -apple-system" }}
              >
                PROFILE
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

