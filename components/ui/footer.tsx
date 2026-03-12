import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-slate-950 dark:border-slate-800 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <Link href={'/'}>
        <span className="font-medium text-slate-900 dark:text-white">SendVia</span>
        </Link>

        <span>© {new Date().getFullYear()} SendVia. All rights reserved.</span>

        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms</Link>
        </div>
      </div>
    </footer>
  )
}