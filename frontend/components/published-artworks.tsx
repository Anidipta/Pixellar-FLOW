"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PublishedArtworksProps {
  artworks: any[]
}

export function PublishedArtworks({ artworks }: PublishedArtworksProps) {
  const [selectedArt, setSelectedArt] = useState<any>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <Card key={art.id} className="bg-card border-border overflow-hidden neon-glow">
            <div className="p-4">
              <h3 className="text-lg font-bold text-foreground mb-2">{art.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{art.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="bg-input rounded p-2">
                  <p className="text-xs text-muted-foreground">Sales</p>
                  <p className="font-bold text-primary">{art.sales || 0}</p>
                </div>
                <div className="bg-input rounded p-2">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-bold text-primary">{art.revenue || 0} FLOW</p>
                </div>
              </div>

              {/* Tiers Preview */}
              <div className="space-y-2 mb-4">
                {art.tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="text-xs bg-input rounded p-2">
                    <p className="font-bold text-foreground">{tier.name}</p>
                    <p className="text-muted-foreground">{tier.price} FLOW</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setSelectedArt(art)}
                className="w-full bg-primary hover:bg-primary/90 neon-glow-hover"
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedArt && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedArt(null)}
        >
          <Card className="bg-card border-border max-w-2xl w-full max-h-[90vh] overflow-auto neon-glow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-foreground">{selectedArt.title}</h2>
                <button
                  onClick={() => setSelectedArt(null)}
                  className="text-2xl text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <p className="text-foreground mb-6">{selectedArt.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-input rounded p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-primary">{selectedArt.sales || 0}</p>
                </div>
                <div className="bg-input rounded p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">{selectedArt.revenue || 0}</p>
                </div>
                <div className="bg-input rounded p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Published</p>
                  <p className="text-sm font-bold text-primary">
                    {new Date(selectedArt.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Tiers */}
              <h3 className="text-lg font-bold text-foreground mb-4">Access Tiers</h3>
              <div className="space-y-3">
                {selectedArt.tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="bg-input rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-foreground">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">{tier.price} FLOW</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
