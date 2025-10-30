"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface PublishFormProps {
  onPublish: (data: any) => void
  onCancel: () => void
}

export function PublishForm({ onPublish, onCancel }: PublishFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    basePrice: 1.0,
    tiers: [
      { name: "Preview", price: 0, accessLevel: "preview", description: "Low-res preview" },
      { name: "Full Access", price: 2.0, accessLevel: "full", description: "High-res full artwork" },
      { name: "Exclusive", price: 5.0, accessLevel: "exclusive", description: "Exclusive + commercial rights" },
    ],
  })

  const handleTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...formData.tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setFormData({ ...formData, tiers: newTiers })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert("Please enter a title")
      return
    }
    onPublish(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Artwork Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter artwork title..."
          className="w-full bg-input border border-border rounded px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your artwork..."
          className="w-full bg-input border border-border rounded px-3 py-2 text-foreground resize-none h-24"
        />
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Access Tiers</h3>
        <div className="space-y-4">
          {formData.tiers.map((tier, index) => (
            <div key={index} className="bg-input border border-border rounded p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => handleTierChange(index, "name", e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Price (FLOW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, "price", Number.parseFloat(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={tier.description}
                  onChange={(e) => handleTierChange(index, "description", e.target.value)}
                  className="w-full bg-background border border-border rounded px-2 py-1 text-foreground text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-secondary text-secondary hover:bg-secondary/10 bg-transparent"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 neon-glow-hover">
          Publish Artwork
        </Button>
      </div>
    </form>
  )
}
