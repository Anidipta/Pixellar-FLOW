"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"

export default function UnlockedPage() {
  const { user } = useWallet()
  const [unlockedContent, setUnlockedContent] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      const unlocked = JSON.parse(localStorage.getItem(`pixeller_unlocked_${user.address}`) || "[]")
      setUnlockedContent(unlocked)
    }
  }, [user])

  if (!user) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon">My Unlocked Content</h1>
            <p className="text-secondary text-sm mt-1">Artworks you have purchased access to</p>
          </div>
          <Link href="/market">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Browse More
            </Button>
          </Link>
        </div>

        {/* Unlocked Content */}
        {unlockedContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedContent.map((content) => (
              <Card key={content.id} className="bg-card border-border overflow-hidden neon-glow">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-foreground mb-2">{content.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">By {content.creator.slice(0, 10)}...</p>

                  <div className="bg-input rounded p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Access Level</p>
                    <p className="font-bold text-primary capitalize">{content.accessLevel}</p>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    Unlocked {new Date(content.unlockedAt).toLocaleDateString()}
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 neon-glow-hover">View Full Artwork</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center neon-glow">
            <p className="text-muted-foreground text-lg mb-4">You haven't unlocked any content yet.</p>
            <Link href="/market">
              <Button className="bg-primary hover:bg-primary/90">Browse Marketplace</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
