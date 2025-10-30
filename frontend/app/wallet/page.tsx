"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"

export default function WalletPage() {
  const { user, balance, transactions, disconnectWallet } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neon mb-4">Please connect your wallet first</h1>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neon">Wallet</h1>
          <Link href="/">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Wallet Info */}
        <Card className="bg-card border-border p-8 mb-8 neon-glow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Wallet Address</p>
              <p className="text-lg font-mono text-primary mb-6">{user.address}</p>

              <p className="text-muted-foreground text-sm mb-2">Connected Since</p>
              <p className="text-foreground">{new Date(user.connectedAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm mb-2">FLOW Balance</p>
              <p className="text-4xl font-bold text-primary mb-6">{balance} FLOW</p>

              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Transaction History</h2>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <Card key={tx.id} className="bg-card border-border p-4 neon-glow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground capitalize">{tx.type}</p>
                      {tx.artworkTitle && <p className="text-sm text-muted-foreground">{tx.artworkTitle}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${tx.type === "purchase" ? "text-destructive" : "text-primary"}`}>
                        {tx.type === "purchase" ? "-" : "+"} {tx.amount} FLOW
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          tx.status === "completed"
                            ? "text-primary"
                            : tx.status === "pending"
                              ? "text-secondary"
                              : "text-destructive"
                        }`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border p-8 text-center neon-glow">
              <p className="text-muted-foreground">No transactions yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
