import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Volt - Smart Power & Meter Tracker",
  description: "Real-time prepaid electricity meter tracking and power supply monitoring",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Volt",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased font-sans"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Volt" />
      </head>
      <body suppressHydrationWarning className="bg-zinc-50 dark:bg-zinc-950 flex min-h-screen justify-center items-stretch">
        <ThemeProvider>
          <QueryProvider>
            <div className="w-full max-w-[440px] min-h-screen flex flex-col bg-background shadow-md border-x border-border relative overflow-x-hidden">
              {children}
              <Toaster />
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

