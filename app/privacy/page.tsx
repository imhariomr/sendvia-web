"use client"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Twitter } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">

      <Navbar />

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-10">

          <h1 className="text-3xl sm:text-4xl font-semibold">
            Privacy Policy
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Your privacy matters to us. SendVia is designed to transfer files
            directly between devices without storing your data on any servers.
          </p>

          <PolicyBlock title="No Data Storage">
            Files are transferred peer-to-peer using secure WebRTC connections.
            We do not upload, store, or keep copies of your files.
          </PolicyBlock>

          <PolicyBlock title="No Accounts Required">
            You can use SendVia without creating an account. We do not collect
            personal information like emails or passwords.
          </PolicyBlock>

          <PolicyBlock title="Local Processing Only">
            All file handling happens locally on your device and directly
            between connected peers.
          </PolicyBlock>

          <PolicyBlock title="Security">
            Connections are encrypted end-to-end to ensure your files remain
            private and secure during transfer.
          </PolicyBlock>

          <PolicyBlock title="Contact">
            If you have questions about privacy, reach out to us on{" "}
            <a
              href="https://twitter.com/docker242"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-2 underline hover:opacity-80"
            >
              <Twitter size={16} />
              @docker242
            </a>
          </PolicyBlock>

        </div>
      </section>

      <Footer />
    </main>
  )
}


function PolicyBlock({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    </div>
  )
}
