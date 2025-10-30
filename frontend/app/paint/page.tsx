"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { PaintCanvas } from "@/components/paint-canvas"
import { PaintToolbar } from "@/components/paint-toolbar"

export default function PaintPage() {
  const [user, setUser] = useState<any>(null)
  const [artTitle, setArtTitle] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("pixeller_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleSaveArt = () => {
    if (!canvasRef.current || !artTitle.trim()) {
      alert("Please enter a title for your artwork")
      return
    }

    const imageData = canvasRef.current.toDataURL("image/png")
    const savedArt = {
      id: Date.now(),
      title: artTitle,
      image: imageData,
      creator: user?.address,
      createdAt: new Date().toISOString(),
    }

    const existingArt = JSON.parse(localStorage.getItem("pixeller_art") || "[]")
    existingArt.push(savedArt)
    localStorage.setItem("pixeller_art", JSON.stringify(existingArt))

    alert("Art saved successfully!")
    setArtTitle("")
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon">Paint Studio</h1>
            <p className="text-secondary text-sm mt-1">Artist: {user.address}</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border p-6 neon-glow">
              <PaintCanvas canvasRef={canvasRef} />
            </Card>
          </div>

          {/* Toolbar & Controls */}
          <div className="space-y-4">
            <Card className="bg-card border-border p-4 neon-glow">
              <PaintToolbar canvasRef={canvasRef} />
            </Card>

            {/* Save Section */}
            <Card className="bg-card border-border p-4 neon-glow">
              <h3 className="text-lg font-bold text-neon mb-4">Save Artwork</h3>
              <input
                type="text"
                placeholder="Enter artwork title..."
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-foreground placeholder-muted-foreground mb-3 text-sm"
              />
              <Button
                onClick={handleSaveArt}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold neon-glow-hover"
              >
                Save to Gallery
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
