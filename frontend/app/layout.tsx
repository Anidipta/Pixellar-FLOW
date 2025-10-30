import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { WalletProvider } from "@/lib/wallet-context"
import SiteHeader from "@/components/site-header"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pixeller - Web3 Pixel Art Marketplace",
  description: "Create, buy, and sell pixel art on Flow blockchain",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <WalletProvider>
          <SiteHeader />
          <main className="pt-24">{children}</main>
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}
