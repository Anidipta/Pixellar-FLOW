"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ProfileHeaderProps {
  user: any
  onEditClick: () => void
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
  return (
    <Card className="bg-card border-border p-8 neon-glow">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
          <div className="text-4xl font-bold text-primary">{user.name?.charAt(0) || "P"}</div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">{user.name || "Pixel Artist"}</h1>
          <p className="text-sm text-muted-foreground font-mono mb-4">{user.address}</p>
          <p className="text-foreground mb-4">{user.bio || "No bio yet. Click edit to add one!"}</p>

          {/* Balance */}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-input rounded px-4 py-2">
              <p className="text-xs text-muted-foreground">FLOW Balance</p>
              <p className="text-xl font-bold text-primary">{user.balance || 100} FLOW</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Button onClick={onEditClick} className="bg-primary hover:bg-primary/90 neon-glow-hover">
          Edit Profile
        </Button>
      </div>
    </Card>
  )
}
