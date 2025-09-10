'use client';

import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          {/* Tiny logo */}
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-emerald-600">
            <span className="h-3 w-3 rounded-sm bg-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Invoice PDF
            <span className="text-gray-400">.com</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="ml-4 hidden items-center gap-5 text-sm text-gray-600 md:flex">
          <Link href="/help" className="hover:text-gray-900">
            Help
          </Link>
          <Link href="/invoice" className="hover:text-gray-900">
            Create invoice
          </Link>
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Language + theme placeholders (icons optional) */}
          <button
            className="hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 md:inline-flex"
            aria-label="Language"
            title="Language"
          >
            <span className="i-lucide-languages h-4 w-4" />
          </button>
          <button
            className="hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 md:inline-flex"
            aria-label="Theme"
            title="Theme"
          >
            <span className="i-lucide-sun h-4 w-4" />
          </button>

          <Link
            href="/signin"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
