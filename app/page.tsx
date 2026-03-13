"use client"

import Link from "next/link"
import styles from "./page.module.css"
import { ModeToggle } from "@/components/ui/theme"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"

function Hero() {
  const router = useRouter();
  return (
    <section className="w-full py-20 sm:py-28 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-6xl px-6 grid gap-14 lg:grid-cols-2 items-center">

        {/* Left */}
        <div className="space-y-6">

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-white">
            Instant file sharing
            <br />
            between your devices
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-md">
            Send files directly. No size limit. No uploads. No waiting. Just fast, secure
            device-to-device transfer in seconds.
          </p>

          <button
            className={`
              ${styles.floatButton}
              ${styles.softShadow}
              ${styles.softShadowHover}

              mt-4 inline-flex items-center justify-center
              rounded-xl bg-slate-900 text-white
              dark:bg-white dark:text-black

              px-6 py-3 text-sm font-medium
              hover:-translate-y-1 active:scale-95
              transition-all duration-200
            `}
            onClick={()=>router.push('/sharing')}
          >
            Start Sharing
          </button>
        </div>

        {/* Right Card */}
        <div className="flex justify-center lg:justify-end">
          <div className="
            w-72 sm:w-80 rounded-2xl
            border border-gray-200 bg-white p-8 shadow-md
            dark:bg-slate-900 dark:border-slate-800
            transition-colors
          ">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Device status
            </p>

            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">
              Connect to device
            </h3>

            <div className="
              mt-6 h-10 rounded-lg border border-gray-200
              dark:border-slate-700
              flex items-center px-3 text-sm text-gray-400
            ">
              Click on start sharing...
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="
      rounded-xl border border-gray-200 bg-white p-6 shadow-sm
      dark:bg-slate-900 dark:border-slate-800
      hover:shadow-md transition
    ">
      <h3 className="font-medium text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="w-full py-20 bg-gray-100 dark:bg-slate-900 transition-colors">
      <div className="mx-auto max-w-6xl px-6">

        <h2 className="text-2xl font-semibold mb-10 text-slate-900 dark:text-white">
          Features
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureItem title="Free to use" description="Share files without limits or subscriptions." />
          <FeatureItem title="We don't store your data" description="Files transfer directly between devices only." />
          <FeatureItem title="No size limits" description="Share huge files, folders, and videos directly between devices with no size limits." />
          <FeatureItem title="Simple and easy" description="Open, connect, and send. Nothing complicated." />
        </div>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      <Navbar page='main'/>
      <Hero />
      <Features />
      <Footer />
    </main>
  )
}
