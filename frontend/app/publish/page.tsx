"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useWallet } from "@/lib/wallet-context"
import { PublishForm } from "@/components/publish-form"
import { PublishedArtworks } from "@/components/published-artworks"

export default function PublishPage() {
  const { user } = useWallet()
  const [publishedArt, setPublishedArt] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) {
      const allPublished = JSON.parse(localStorage.getItem("pixeller_published") || "[]")
      const userPublished = allPublished.filter((art: any) => art.creator === user.address)
      setPublishedArt(userPublished)
    }
  }, [user])

  const handlePublish = (newArt: any) => {
    const allPublished = JSON.parse(localStorage.getItem("pixeller_published") || "[]")
    const published = {
      ...newArt,
      id: Date.now(),
      creator: user.address,
      publishedAt: new Date().toISOString(),
      sales: 0,
      revenue: 0,
    }
    allPublished.push(published)
    localStorage.setItem("pixeller_published", JSON.stringify(allPublished))
    setPublishedArt([...publishedArt, published])
    setShowForm(false)
  }

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
            <h1 className="text-4xl font-bold text-neon">Publish & Monetize</h1>
            <p className="text-secondary text-sm mt-1">List your artwork with tiered access levels</p>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                My Profile
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Publish Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-8 bg-primary hover:bg-primary/90 neon-glow-hover">
            + Publish New Artwork
          </Button>
        )}

        {/* Publish Form */}
        {showForm && (
          <Card className="bg-card border-border p-6 mb-8 neon-glow">
            <PublishForm onPublish={handlePublish} onCancel={() => setShowForm(false)} />
          </Card>
        )}

        {/* Published Artworks */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Published Artworks</h2>
          {publishedArt.length > 0 ? (
            <PublishedArtworks artworks={publishedArt} />
          ) : (
            <Card className="bg-card border-border p-12 text-center neon-glow">
              <p className="text-muted-foreground text-lg mb-4">No published artworks yet.</p>
              <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                Publish Your First Artwork
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
