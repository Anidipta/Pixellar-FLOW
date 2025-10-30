"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { MarketplaceGrid } from "@/components/marketplace-grid"
import { MarketplaceFilters } from "@/components/marketplace-filters"

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const savedUser = localStorage.getItem("pixeller_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Load artworks from localStorage
    const savedArt = JSON.parse(localStorage.getItem("pixeller_art") || "[]")
    // Add mock marketplace data
    const mockArt = [
      {
        id: 1,
        title: "Neon Dreams",
        image: "/neon-pixel-art.jpg",
        creator: "0x1234567890",
        price: 2.5,
        likes: 42,
        listed: true,
      },
      {
        id: 2,
        title: "Retro Sunset",
        image: "/sunset-pixel-art.jpg",
        creator: "0x0987654321",
        price: 1.8,
        likes: 28,
        listed: true,
      },
      {
        id: 3,
        title: "Digital Garden",
        image: "/garden-pixel-art.jpg",
        creator: "0xabcdef1234",
        price: 3.2,
        likes: 56,
        listed: true,
      },
      {
        id: 4,
        title: "Cyber City",
        image: "/city-pixel-art.jpg",
        creator: "0x5678901234",
        price: 2.1,
        likes: 35,
        listed: true,
      },
      {
        id: 5,
        title: "Ocean Waves",
        image: "/ocean-pixel-art.jpg",
        creator: "0xfedcba4321",
        price: 1.5,
        likes: 19,
        listed: true,
      },
      {
        id: 6,
        title: "Forest Magic",
        image: "/forest-pixel-art.jpg",
        creator: "0x1111111111",
        price: 2.8,
        likes: 48,
        listed: true,
      },
    ]

    const allArtworks = [...mockArt, ...savedArt]
    setArtworks(allArtworks)
    setFilteredArtworks(allArtworks)
  }, [])

  useEffect(() => {
    const filtered = artworks.filter((art) => art.title.toLowerCase().includes(searchTerm.toLowerCase()))

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0))
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    }

    setFilteredArtworks(filtered)
  }, [searchTerm, sortBy, artworks])

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon">Pixel Art Marketplace</h1>
            <p className="text-secondary text-sm mt-1">Discover and collect unique pixel art</p>
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

        {/* Filters */}
        <MarketplaceFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Results Info */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? "s" : ""}
        </div>

        {/* Marketplace Grid */}
        {filteredArtworks.length > 0 ? (
          <MarketplaceGrid artworks={filteredArtworks} currentUser={user} />
        ) : (
          <Card className="bg-card border-border p-12 text-center neon-glow">
            <p className="text-muted-foreground text-lg">No artworks found matching your search.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
