import Link from "next/link";
import { ModeToggle } from "./theme";

export default function Navbar({page}:any) {
  return (
    <header className="
      w-full border-b border-gray-200 bg-white/80 backdrop-blur
      dark:bg-slate-900/80 dark:border-slate-800
    ">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">

        <Link href='/'>
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          SendVia
        </span>
        </Link>

        <div className="flex items-center gap-6">
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
            {
              page !== 'sharing' && (<Link href='/sharing' className="hover:text-slate-900 dark:hover:text-white transition">
              Connect
            </Link>)
            }
          </nav>

          <ModeToggle />
        </div>

      </div>
    </header>
  )
}
