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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neon mb-4">Welcome to Pixeller</h1>
          <p className="text-secondary mb-2">Connected: {user.address}</p>
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
            <Link href={`/profile/${user.profileId}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                My Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neon mb-2">PIXELLER</h1>
          <p className="text-secondary text-lg">Web3 Pixel Art Marketplace</p>
          <div className="mt-4 h-1 w-24 bg-primary mx-auto neon-glow"></div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 neon-glow">
          <h2 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h2>
          <p className="text-muted-foreground mb-6 text-center text-sm">
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
