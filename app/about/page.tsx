"use client"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">

      <Navbar page='about'/>

      {/* Hero */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            About SendVia
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg">
            A simple, fast and secure way to share files directly between your devices.
            No uploads. No cloud. Just peer-to-peer transfer. Work everywhere  desktop, android, iphone and other devices.
          </p>

        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-6 grid gap-10 md:grid-cols-2 items-center">

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We built SendVia to remove friction from file sharing. 
              No signups, no storage limits, no waiting for uploads.
              Your files go directly from one device to another using secure WebRTC connections.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm bg-gray-50 dark:bg-slate-950">
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li>⚡ Instant transfers</li>
              <li>🔒 Secure peer-to-peer</li>
              <li>☁️ No cloud storage</li>
              <li>🆓 Completely free</li>
            </ul>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-100 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 text-center">

          <h2 className="text-2xl font-semibold mb-12">How it works</h2>

          <div className="grid gap-6 sm:grid-cols-3">

            <Step title="Start sharing" desc="Open the app and generate a connection code." />
            <Step title="Connect devices" desc="Enter the code on another device." />
            <Step title="Send instantly" desc="Drag & drop files and transfer begins immediately." />

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-slate-950 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Ready to share your files?
        </h2>

        <button
          onClick={() => router.push("/sharing")}
          className="
            px-7 py-3 rounded-xl font-medium
            bg-slate-900 text-white
            dark:bg-white dark:text-black
            hover:-translate-y-1 transition
          "
        >
          Start Sharing
        </button>
      </section>

      <Footer />
    </main>
  )
}


/* reusable step card */
function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="
      rounded-xl border border-gray-200 dark:border-slate-800
      bg-white dark:bg-slate-950
      p-6 shadow-sm
    ">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  )
}
