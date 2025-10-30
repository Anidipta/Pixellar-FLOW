"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet-context"

interface UnlockModalProps {
  artwork: any
  onClose: () => void
  currentUser: any
}

export function UnlockModal({ artwork, onClose, currentUser }: UnlockModalProps) {
  const [selectedTier, setSelectedTier] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { balance, executeTransaction, user } = useWallet()

  const handleUnlock = async () => {
    if (!selectedTier) {
      alert("Please select an access tier")
      return
    }

    if (balance < selectedTier.price) {
      alert("Insufficient FLOW balance")
      return
    }

    setIsProcessing(true)
    try {
      await executeTransaction({
        type: "purchase",
        amount: selectedTier.price,
        artworkId: artwork.id,
        artworkTitle: `${artwork.title} - ${selectedTier.name}`,
      })

      // Save unlocked content
      const unlockedKey = `pixeller_unlocked_${user.address}`
      const unlocked = JSON.parse(localStorage.getItem(unlockedKey) || "[]")
      unlocked.push({
        id: artwork.id,
        title: artwork.title,
        creator: artwork.creator,
        accessLevel: selectedTier.accessLevel,
        unlockedAt: new Date().toISOString(),
      })
      localStorage.setItem(unlockedKey, JSON.stringify(unlocked))

      alert(`Successfully unlocked "${selectedTier.name}" access for ${selectedTier.price} FLOW!`)
      onClose()
    } catch (error) {
      alert("Unlock failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="bg-card border-border max-w-2xl w-full neon-glow" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-foreground">Unlock Content</h2>
            <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <p className="text-foreground mb-6">{artwork.title}</p>

          {/* Tier Selection */}
          <div className="space-y-3 mb-6">
            {artwork.tiers?.map((tier: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedTier(tier)}
                className={`border-2 rounded p-4 cursor-pointer transition-all ${
                  selectedTier?.name === tier.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground">{tier.name}</p>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{tier.price} FLOW</p>
                </div>
              </div>
            ))}
          </div>

          {/* Balance Info */}
          <div className="bg-input rounded p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-primary">{balance} FLOW</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!selectedTier || isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90 neon-glow-hover"
            >
              {isProcessing ? "Processing..." : `Unlock for ${selectedTier?.price || 0} FLOW`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
