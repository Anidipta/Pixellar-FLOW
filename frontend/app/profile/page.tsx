"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileStats } from "@/components/profile-stats"
import { ProfileGallery } from "@/components/profile-gallery"
import { EditProfileModal } from "@/components/edit-profile-modal"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userArtworks, setUserArtworks] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalSales: 0,
    followers: 0,
    following: 0,
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("pixeller_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)

      // Load user's artworks
      const allArt = JSON.parse(localStorage.getItem("pixeller_art") || "[]")
      const userArt = allArt.filter((art: any) => art.creator === userData.address)
      setUserArtworks(userArt)

      // Calculate stats
      setStats({
        totalArtworks: userArt.length,
        totalSales: Math.floor(Math.random() * 50) + userArt.length * 2,
        followers: Math.floor(Math.random() * 500) + 10,
        following: Math.floor(Math.random() * 200) + 5,
      })
    }
  }, [])

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser)
    localStorage.setItem("pixeller_user", JSON.stringify(updatedUser))
    setIsEditModalOpen(false)
  }

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
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neon">My Profile</h1>
          <div className="flex gap-3">
            <Link href="/market">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Browse Market
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Header */}
        <ProfileHeader user={user} onEditClick={() => setIsEditModalOpen(true)} />

        {/* Stats */}
        <ProfileStats stats={stats} />

        {/* Gallery Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">My Artworks</h2>
            <Link href="/paint">
              <Button className="bg-primary hover:bg-primary/90 neon-glow-hover">Create New</Button>
            </Link>
          </div>

          {userArtworks.length > 0 ? (
            <ProfileGallery artworks={userArtworks} />
          ) : (
            <Card className="bg-card border-border p-12 text-center neon-glow">
              <p className="text-muted-foreground text-lg mb-4">You haven't created any artworks yet.</p>
              <Link href="/paint">
                <Button className="bg-primary hover:bg-primary/90">Start Creating</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal user={user} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateProfile} />
      )}
    </div>
  )
}
