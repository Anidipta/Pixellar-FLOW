"use client"

import { Card } from "@/components/ui/card"

interface ProfileStatsProps {
  stats: {
    totalArtworks: number
    totalSales: number
    followers: number
    following: number
  }
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      <Card className="bg-card border-border p-6 text-center neon-glow">
        <p className="text-muted-foreground text-sm mb-2">Artworks</p>
        <p className="text-3xl font-bold text-primary">{stats.totalArtworks}</p>
      </Card>

      <Card className="bg-card border-border p-6 text-center neon-glow">
        <p className="text-muted-foreground text-sm mb-2">Total Sales</p>
        <p className="text-3xl font-bold text-primary">{stats.totalSales}</p>
      </Card>

      <Card className="bg-card border-border p-6 text-center neon-glow">
        <p className="text-muted-foreground text-sm mb-2">Followers</p>
        <p className="text-3xl font-bold text-primary">{stats.followers}</p>
      </Card>

      <Card className="bg-card border-border p-6 text-center neon-glow">
        <p className="text-muted-foreground text-sm mb-2">Following</p>
        <p className="text-3xl font-bold text-primary">{stats.following}</p>
      </Card>
    </div>
  )
}
