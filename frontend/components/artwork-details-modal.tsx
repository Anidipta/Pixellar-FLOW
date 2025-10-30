"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ArtworkDetailsModalProps {
  artwork: any
  onClose: () => void
  isPurchased: boolean
  currentUser: any
}

export function ArtworkDetailsModal({ artwork, onClose, isPurchased, currentUser }: ArtworkDetailsModalProps) {
  const [passwordInput, setPasswordInput] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState("")

  const handlePasswordSubmit = () => {
    // Check if password matches (for published artworks)
    if (artwork.password && passwordInput === artwork.password) {
      setIsUnlocked(true)
      setError("")
    } else if (artwork.password) {
      setError("Incorrect password")
    } else {
      setIsUnlocked(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card
        className="bg-card border-border max-w-2xl w-full max-h-[90vh] overflow-auto neon-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-foreground">{artwork.title}</h2>
            <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <div className="relative mb-6">
            <img src={artwork.image || "/placeholder.svg"} alt={artwork.title} className="w-full rounded" />
            {/* Thin overlay */}
            <div className="absolute inset-0 bg-black/10 rounded" />
          </div>

          {/* Creator Details */}
          <div className="mb-6 p-4 bg-input rounded">
            <p className="text-sm text-muted-foreground mb-2">Creator</p>
            <p className="text-foreground font-mono">{artwork.creator}</p>
            {artwork.artworkCode && (
              <>
                <p className="text-sm text-muted-foreground mt-3 mb-1">Artwork Code</p>
                <p className="text-foreground font-mono text-sm">{artwork.artworkCode}</p>
              </>
            )}
          </div>

          {/* Price and Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-input rounded">
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-2xl font-bold text-primary">{artwork.price} FLOW</p>
            </div>
            <div className="p-4 bg-input rounded">
              <p className="text-sm text-muted-foreground mb-1">Likes</p>
              <p className="text-2xl font-bold text-primary">{artwork.likes || 0}</p>
            </div>
          </div>

          {isPurchased ? (
            <>
              {artwork.password && !isUnlocked ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Enter password to unlock full artwork</p>
                  <input
                    type="password"
                    placeholder="Enter 6-digit password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value)
                      setError("")
                    }}
                    className="w-full bg-input border border-border rounded px-3 py-2 text-foreground"
                  />
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button
                    onClick={handlePasswordSubmit}
                    className="w-full bg-primary hover:bg-primary/90 neon-glow-hover"
                  >
                    Unlock
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-primary/10 rounded border border-primary">
                  <p className="text-primary font-semibold">✓ Unlocked</p>
                  <p className="text-sm text-muted-foreground mt-1">You have full access to this artwork</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-input rounded">
              <p className="text-sm text-muted-foreground mb-3">Purchase this artwork to unlock full access</p>
              <Button className="w-full bg-primary hover:bg-primary/90 neon-glow-hover">
                Buy for {artwork.price} FLOW
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
