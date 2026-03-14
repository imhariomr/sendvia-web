"use client"

import { useState } from "react"
import Link from "next/link"
import { ModeToggle } from "./theme"

export default function Navbar({ page }: any) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="
        w-full border-b border-gray-200 bg-white/80 backdrop-blur
        dark:bg-slate-900/80 dark:border-slate-800
      ">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <button
              onClick={() => setOpen(true)}
              className="sm:hidden text-slate-700 dark:text-white"
            >
              ☰
            </button>
          <Link href="/">
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              SendVia
            </span>
          </Link>

          <div className="flex items-center gap-6">

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-300">
              <Link href={page === 'main' ? "#features" : "/"} className="hover:text-slate-900 dark:hover:text-white transition">
                Features
              </Link>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition">
                About
              </Link>
              <Link href="/how-to-send-files-online" className="hover:text-slate-900 dark:hover:text-white transition">
                How it works
              </Link>

              {page !== "sharing" && (
                <Link href="/sharing" className="hover:text-slate-900 dark:hover:text-white transition">
                  Connect
                </Link>
              )}
            </nav>

            <ModeToggle />

          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* sidebar */}
          <div className="
            relative w-64 bg-white dark:bg-slate-900
            h-full p-6 flex flex-col gap-6 shadow-xl
          ">

            <button
              onClick={() => setOpen(false)}
              className="self-end text-xl"
            >
              ✕
            </button>

            <Link href="/" onClick={() => setOpen(false)}>
              Features
            </Link>

            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>

            <Link href="/how-to-send-files-online" onClick={() => setOpen(false)}>
              How it works
            </Link>

            {page !== "sharing" && (
              <Link href="/sharing" onClick={() => setOpen(false)}>
                Connect
              </Link>
            )}

          </div>
        </div>
      )}
    </>
  )
}