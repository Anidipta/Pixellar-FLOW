"use client"

import { Card } from "@/components/ui/card"

interface MarketplaceFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

export function MarketplaceFilters({ searchTerm, setSearchTerm, sortBy, setSortBy }: MarketplaceFiltersProps) {
  return (
    <Card className="bg-card border-border p-4 mb-8 neon-glow">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search artworks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input border border-border rounded px-4 py-2 text-foreground placeholder-muted-foreground"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-foreground">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-input border border-border rounded px-3 py-2 text-foreground text-sm"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
