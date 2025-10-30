"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PublishModal } from "@/components/publish-modal"

interface ProfileGalleryProps {
  artworks: any[]
  profileId: string
}

export function ProfileGallery({ artworks, profileId }: ProfileGalleryProps) {
  const [selectedArt, setSelectedArt] = useState<any>(null)
  const [publishingArt, setPublishingArt] = useState<any>(null)

  const handleDelete = (artId: number) => {
    if (confirm("Are you sure you want to delete this artwork?")) {
      const allArt = JSON.parse(localStorage.getItem("pixeller_art") || "[]")
      const filtered = allArt.filter((art: any) => art.id !== artId)
      localStorage.setItem("pixeller_art", JSON.stringify(filtered))
      window.location.reload()
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
            {/* Art Image */}
            <div
              className="relative w-full h-64 bg-input overflow-hidden cursor-pointer"
              onClick={() => setSelectedArt(art)}
            >
              <img
                src={art.image || "/placeholder.svg"}
                alt={art.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>

            {/* Art Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-foreground mb-2">{art.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Created {new Date(art.createdAt).toLocaleDateString()}
              </p>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setSelectedArt(art)}
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary/10 bg-transparent text-xs"
                >
                  View
                </Button>
                <Button onClick={() => setPublishingArt(art)} className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                  Publish
                </Button>
                <Button
                  onClick={() => handleDelete(art.id)}
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10 bg-transparent text-xs"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Art Detail Modal */}
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

              <img
                src={selectedArt.image || "/placeholder.svg"}
                alt={selectedArt.title}
                className="w-full rounded mb-4"
              />

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  <span className="text-foreground">{new Date(selectedArt.createdAt).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Publish Modal */}
      {publishingArt && (
        <PublishModal
          artwork={publishingArt}
          profileId={profileId}
          onClose={() => setPublishingArt(null)}
          onPublish={() => {
            setPublishingArt(null)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
