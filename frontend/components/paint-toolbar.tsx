"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

interface PaintToolbarProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function PaintToolbar({ canvasRef }: PaintToolbarProps) {
  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw grid
    const gridSize = 20
    ctx.strokeStyle = "#E0E0E0"
    ctx.lineWidth = 0.5

    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `pixeller-art-${Date.now()}.png`
    link.click()
  }

  const handleUndo = () => {
    // Simple undo - clear and redraw (in production, use history stack)
    handleClear()
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-neon">Tools</h3>

      <Button
        onClick={handleClear}
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
      >
        Clear Canvas
      </Button>

      <Button
        onClick={handleDownload}
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
      >
        Download PNG
      </Button>

      <Button
        onClick={handleUndo}
        variant="outline"
        className="w-full border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
      >
        Undo
      </Button>
    </div>
  )
}
