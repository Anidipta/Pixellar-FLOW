"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"

export default function LoginPage() {
  const { user, isConnected, connectWallet, balance } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleFlowConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center neon-glow p-8 rounded-lg backdrop-blur-sm" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.5))' }}>
          <h1 className="text-4xl font-extrabold text-neon mb-3 floaty">Welcome to Pixeller</h1>
          <p className="text-muted-foreground mb-2">Connected: <span className="font-mono">{user.address}</span></p>
          <p className="text-primary font-bold mb-8">Balance: {balance} FLOW</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/paint">
              <Button className="bg-primary hover:bg-primary/90 neon-glow-hover">Start Creating</Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Browse Market
              </Button>
            </Link>
            {user?.backend?.profile_url ? (
              <Link href={`/profile/${user.backend.profile_url}`}>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                  My Profile
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-extrabold text-neon mb-2 floaty">PIXELLER</h1>
          <p className="text-muted-foreground text-lg">Web3 Pixel Art Marketplace</p>
          <div className="mt-4 h-1 w-24 bg-primary mx-auto neon-glow"></div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 neon-glow" style={{ backdropFilter: 'blur(6px)', background: 'linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.55))' }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h2>
          <p className="text-foreground mb-6 text-center text-sm black">
            Connect your Flow wallet to start creating and trading pixel art
          </p>

          <Button
            onClick={handleFlowConnect}
            disabled={isConnecting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 neon-glow-hover"
          >
            {isConnecting ? "Connecting..." : "Connect Flow Wallet"}
          </Button>
        </div>
      </div>
    </div>
  )
}
