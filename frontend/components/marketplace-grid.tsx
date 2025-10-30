"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/wallet-context"
import { ArtworkDetailsModal } from "@/components/artwork-details-modal"

interface MarketplaceGridProps {
  artworks: any[]
  currentUser: any
}

export function MarketplaceGrid({ artworks, currentUser }: MarketplaceGridProps) {
  const [purchases, setPurchases] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [selectedForDetails, setSelectedForDetails] = useState<any>(null)
  const { balance, executeTransaction } = useWallet()

  const handlePurchase = async (art: any) => {
    if (purchases.includes(art.id)) {
      setPurchases(purchases.filter((id) => id !== art.id))
      alert("Purchase cancelled")
      return
    }

    if (balance < (art.price || 0)) {
      alert("Insufficient FLOW balance for this purchase")
      return
    }

    setIsProcessing(art.id)
    try {
      await executeTransaction({
        type: "purchase",
        amount: art.price || 0,
        artworkId: art.id,
        artworkTitle: art.title,
      })

      setPurchases([...purchases, art.id])
      alert(`Successfully purchased "${art.title}" for ${art.price} FLOW!`)
    } catch (error) {
      alert("Purchase failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <Card
            key={art.id}
            className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow neon-glow"
          >
            <div className="relative w-full h-64 bg-input overflow-hidden group">
              <img
                src={art.image || "/placeholder.svg"}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {/* Thin overlay layer */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              {purchases.includes(art.id) && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold">
                  OWNED
                </div>
              )}
            </div>

            {/* Art Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-foreground mb-2 truncate">{art.title}</h3>

              {/* Creator */}
              <p className="text-xs text-muted-foreground mb-3">
                By <span className="text-primary font-mono">{art.creator.slice(0, 10)}...</span>
              </p>

              {/* Stats */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-primary">♥</span>
                  <span className="text-muted-foreground">{art.likes || 0}</span>
                </div>
                <div className="text-primary font-bold">{art.price || 0} FLOW</div>
              </div>

              <div className="space-y-2">
                {purchases.includes(art.id) ? (
                  <>
                    <Button
                      onClick={() => setSelectedForDetails(art)}
                      className="w-full bg-primary hover:bg-primary/90 neon-glow-hover"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handlePurchase(art)}
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setSelectedForDetails(art)}
                      variant="outline"
                      className="w-full border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handlePurchase(art)}
                      disabled={isProcessing === art.id}
                      className="w-full bg-primary hover:bg-primary/90 neon-glow-hover"
                    >
                      {isProcessing === art.id ? "Processing..." : "Buy Now"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Artwork Details Modal */}
      {selectedForDetails && (
        <ArtworkDetailsModal
          artwork={selectedForDetails}
          onClose={() => setSelectedForDetails(null)}
          isPurchased={purchases.includes(selectedForDetails.id)}
          currentUser={currentUser}
        />
      )}
    </>
  )
}
