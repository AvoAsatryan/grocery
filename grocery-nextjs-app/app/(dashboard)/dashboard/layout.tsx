import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Geist, Geist_Mono } from "next/font/google"
import DashBoardNavBar from "@/components/DashboardNavBar"
import "../../globals.css"
import { Sidebar } from "@/components/sidebar/sidebar"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Grocery List App",
  description: "Never forget your grocery items again",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashBoardNavBar />

          <div className="flex">
            <div className="flex w-full max-w-[60rem] mx-auto">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}