import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

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

