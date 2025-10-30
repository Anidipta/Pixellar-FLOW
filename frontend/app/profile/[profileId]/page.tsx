"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileStats } from "@/components/profile-stats"
import { ProfileGallery } from "@/components/profile-gallery"
import { EditProfileModal } from "@/components/edit-profile-modal"

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.profileId as string
  const [user, setUser] = useState<any>(null)
  const [userArtworks, setUserArtworks] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"arts" | "sells" | "settings">("arts")
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalSales: 0,
    totalEarnings: 0,
    followers: 0,
    following: 0,
  })
  const [publishedArtworks, setPublishedArtworks] = useState<any[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem("pixeller_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.profileId === profileId) {
        setUser(userData)

        // Load user's artworks
        const allArt = JSON.parse(localStorage.getItem("pixeller_art") || "[]")
        const userArt = allArt.filter((art: any) => art.creator === userData.address)
        setUserArtworks(userArt)

        // Load published artworks
        const published = JSON.parse(localStorage.getItem("pixeller_published") || "[]")
        const userPublished = published.filter((art: any) => art.creatorId === userData.profileId)
        setPublishedArtworks(userPublished)

        // Calculate stats
        const totalEarnings = userPublished.reduce((sum: number, art: any) => sum + (art.totalEarnings || 0), 0)
        setStats({
          totalArtworks: userArt.length,
          totalSales: userPublished.reduce((sum: number, art: any) => sum + (art.sales || 0), 0),
          totalEarnings: totalEarnings,
          followers: Math.floor(Math.random() * 500) + 10,
          following: Math.floor(Math.random() * 200) + 5,
        })
      }
    }
  }, [profileId])

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser)
    localStorage.setItem("pixeller_user", JSON.stringify(updatedUser))
    setIsEditModalOpen(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neon mb-4">Profile not found</h1>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">Go to Home</Button>
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

        <div className="mt-12">
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("arts")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "arts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Arts
            </button>
            <button
              onClick={() => setActiveTab("sells")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "sells"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sells
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "settings"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Arts Tab */}
          {activeTab === "arts" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Artworks</h2>
                <Link href="/paint">
                  <Button className="bg-primary hover:bg-primary/90 neon-glow-hover">Create New</Button>
                </Link>
              </div>

              {userArtworks.length > 0 ? (
                <ProfileGallery artworks={userArtworks} profileId={profileId} />
              ) : (
                <Card className="bg-card border-border p-12 text-center neon-glow">
                  <p className="text-muted-foreground text-lg mb-4">You haven't created any artworks yet.</p>
                  <Link href="/paint">
                    <Button className="bg-primary hover:bg-primary/90">Start Creating</Button>
                  </Link>
                </Card>
              )}
            </div>
          )}

          {/* Sells Tab */}
          {activeTab === "sells" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Sales Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card border-border p-6 neon-glow">
                  <p className="text-muted-foreground text-sm mb-2">Total Sales</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalSales}</p>
                </Card>
                <Card className="bg-card border-border p-6 neon-glow">
                  <p className="text-muted-foreground text-sm mb-2">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalEarnings.toFixed(2)} FLOW</p>
                </Card>
                <Card className="bg-card border-border p-6 neon-glow">
                  <p className="text-muted-foreground text-sm mb-2">Published Artworks</p>
                  <p className="text-3xl font-bold text-primary">{publishedArtworks.length}</p>
                </Card>
              </div>

              {publishedArtworks.length > 0 ? (
                <div className="space-y-4">
                  {publishedArtworks.map((art) => (
                    <Card key={art.id} className="bg-card border-border p-4 neon-glow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{art.title}</h3>
                          <p className="text-sm text-muted-foreground">Code: {art.artworkCode}</p>
                          <p className="text-sm text-muted-foreground">Price: {art.price} FLOW</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{art.sales || 0}</p>
                          <p className="text-xs text-muted-foreground">sales</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border p-12 text-center neon-glow">
                  <p className="text-muted-foreground text-lg">No published artworks yet.</p>
                </Card>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>
              <Card className="bg-card border-border p-6 neon-glow">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                    <p className="text-foreground font-mono">{user.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Profile ID</p>
                    <p className="text-foreground font-mono">{user.profileId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Profile Link</p>
                    <p className="text-foreground font-mono break-all">/profile/{user.profileId}</p>
                  </div>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 neon-glow-hover mt-4"
                  >
                    Edit Profile
                  </Button>
                </div>
              </Card>
            </div>
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
