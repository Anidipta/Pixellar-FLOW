"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet-context"

export default function SiteHeader() {
  const { user, isConnected, disconnectWallet } = useWallet()
  const router = useRouter()

  const shortAddr = (addr?: string) => {
    if (!addr) return ""
    return addr.slice(0, 6) + "…" + addr.slice(-4)
  }

  const handleProfileHover = (e: React.MouseEvent) => {
    if (!user?.backend?.profile_url) return
    const url = `/profile/${user.backend.profile_url}`
    // navigate on hover as requested
    router.push(url)
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-badge.png" alt="Pixeller" className="w-10 h-10 rounded-full shadow-sm floaty" />
            <div>
              <div className="text-lg font-bold text-neon">PIXELLER</div>
              <div className="text-xs text-muted-foreground">Pixel art marketplace</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && user ? (
            <div className="flex items-center gap-3">
              <div
                className="text-sm text-muted-foreground cursor-pointer"
                onMouseEnter={handleProfileHover}
                title={user?.backend?.profile_url ? `Go to profile /profile/${user.backend.profile_url}` : user?.address}
              >
                {shortAddr(user.address)}
              </div>
              <Button variant="outline" onClick={disconnectWallet} className="!border-secondary !text-secondary">
                Disconnect
              </Button>
            </div>
          ) : (
            <Link href="/">
              <Button variant="ghost">Connect</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
