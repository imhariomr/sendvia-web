import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "./context/socket-context";
import { UploadingFilesProvider } from "./context/uploading-file-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://Metube.site"),

  title: {
    default: "Metube | Fast & Secure File Transfer App",
    template: "%s | Metube",
  },

  description:
    "Metube lets you securely share large files instantly. Fast, private, encrypted, and easy file transfer platform for teams and individuals.",

  keywords: [
    "file sharing",
    "secure file transfer",
    "send large files",
    "encrypted file sharing",
    "temporary file sharing",
    "fast file transfer",
    "share files online",
    "Metube",
  ],

  authors: [
    {
      name: "Metube",
      url: "https://Metube.site",
    },
  ],

  creator: "Metube",
  publisher: "Metube",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://Metube.site",
  },

  openGraph: {
    type: "website",
    url: "https://Metube.site",
    title: "Metube | Fast & Secure File Transfer App",
    description:
      "Securely share large files instantly with Metube. Fast, encrypted, and simple file transfers.",
    siteName: "Metube",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Metube File Sharing Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Metube | Fast & Secure File Transfer App",
    description:
      "Secure file sharing platform for sending large files instantly.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UploadingFilesProvider>
          <SocketProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </SocketProvider>
        </UploadingFilesProvider>
      </body>
    </html>
  );
}