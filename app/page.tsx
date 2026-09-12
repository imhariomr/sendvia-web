"use client"

import Link from "next/link"
import styles from "./page.module.css"
import { ModeToggle } from "@/components/ui/theme"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import FAQ from "./FAQ/page"
import Script from "next/script"

function Hero() {
  const router = useRouter();
  return (
    <section className="w-full py-20 sm:py-28 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-6xl px-6 grid gap-14 lg:grid-cols-2 items-center">

        {/* Left */}
        <div className="space-y-6">

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-white">
            Secure File Sharing Between Devices Instantly
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-8">
            MeTube lets you securely share large files instantly between devices
            without cloud uploads or size limits. Fast, encrypted, peer-to-peer
            file transfers directly from your browser.
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
            onClick={() => router.push('/sharing')}
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
    <>
    <Script
        id="MeTube-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MeTube",
            applicationCategory: "FileSharingApplication",
            operatingSystem: "Web",
            url: "https://MeTube.site",
            description:
              "Secure peer-to-peer file sharing platform for transferring large files instantly.",
          }),
        }}
      />

    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
      <Navbar page='main' />
      <Hero />
      <Features />
      {/* ADD THIS SECTION HERE */}
      <section className="w-full py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-6">

          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Fast & Secure Large File Sharing
          </h2>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-8">
            MeTube is a modern peer-to-peer file sharing platform that helps
            users transfer files instantly between devices without storing data
            on external servers. Share videos, folders, documents, and large files
            securely with encrypted direct connections.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-xl">
                No Upload Limits
              </h3>

              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Transfer huge files directly between devices without waiting
                for slow cloud uploads.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-xl">
                Private Transfers
              </h3>

              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Your files stay between connected devices using secure encrypted
                browser-based transfers.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="faq"
        className="w-full py-20 bg-gray-50 dark:bg-slate-900"
      >
        <FAQ />
      </section>
      <Footer />
    </main>
    </>
  )
}
