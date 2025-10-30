"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useWallet } from "@/lib/wallet-context"

interface PublishModalProps {
  artwork: any
  profileId: string
  onClose: () => void
  onPublish: () => void
}

function generateArtworkCode(profileId: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let randomPart = ""
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return profileId + randomPart
}

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let password = ""
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function PublishModal({ artwork, profileId, onClose, onPublish }: PublishModalProps) {
  const [price, setPrice] = useState<number>(1)
  const [password, setPassword] = useState<string>(generatePassword())
  const [isPublishing, setIsPublishing] = useState(false)

  const artworkCode = generateArtworkCode(profileId)

  const { user } = useWallet()

  const handlePublish = async () => {
    if (price <= 0) {
      alert("Price must be greater than 0")
      return
    }

    setIsPublishing(true)
    try {
      // Create artwork in backend
      const payload = {
        title: artwork.title || "Untitled",
        description: artwork.description || "",
        image_url: artwork.image || "",
        price_cents: Math.round(price * 100),
        is_published: true,
        owner_id: user?.backend?.id || null,
      }

      const created = await api.createArtwork(payload)
      alert(`Artwork published successfully! ID: ${created.id}`)
      onPublish()
    } catch (error) {
      alert("Failed to publish artwork")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="bg-card border-border max-w-md w-full neon-glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-foreground">Publish Artwork</h2>
            <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Artwork Preview */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Artwork</p>
              <img src={artwork.image || "/placeholder.svg"} alt={artwork.title} className="w-full rounded" />
              <p className="text-foreground font-semibold mt-2">{artwork.title}</p>
            </div>

            {/* Price Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Price (FLOW)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={price}
                onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
                className="w-full bg-input border border-border rounded px-3 py-2 text-foreground"
              />
            </div>

            {/* Artwork Code */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Artwork Code (13 digits)</p>
              <p className="text-foreground font-mono bg-input rounded px-3 py-2 break-all">{artworkCode}</p>
            </div>

            {/* Password */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Unlock Password (6 digits)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="flex-1 bg-input border border-border rounded px-3 py-2 text-foreground font-mono"
                />
                <Button
                  onClick={() => setPassword(generatePassword())}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full bg-primary hover:bg-primary/90 neon-glow-hover"
            >
              {isPublishing ? "Publishing..." : "Publish Now"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
