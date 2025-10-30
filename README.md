# **Pixeller** — *Create. Own. Trade. Unlock.*

> ⚡ A local-first pixel art marketplace on **Flow Testnet**, built for creators and collectors who value privacy, ownership, and style.

---

## 🌈 Overview

**Pixeller** is a **decentralized pixel art studio and marketplace** that lets users **create**, **publish**, and **trade** digital artworks securely using **Flow Wallet**.

Every artist gets a unique **profile identity**, and every artwork is **verifiably linked** to its creator. Art can be unlocked via **purchase** (Flow tokens) or a **special access code** set by the artist.

---

## 💡 Core Concept

Pixeller brings together three ideas:

1. 🎨 **Creation** — Make pixel art directly in the browser on `/paint`.
2. 💰 **Ownership** — Publish artworks linked to your Flow profile with optional access protection (token purchase or 6-character unlock code).
3. 🌐 **Marketplace** — Discover, like, comment, and buy others’ published art under `/market`, using Flow tokens.

---

## 🧩 Key Features

### 🔗 Wallet & Profile

* Flow Wallet connect (Testnet).
* Each user receives a unique **profile link**:
  `/profile/<9-char-ID>` — *mix of letters + digits*.
* Profile includes:

  * **Artworks tab** — view, publish, delete creations.
  * **Sells tab** — analytics of earnings, sold art, and transactions.
  * **Settings tab** — update display name, theme, or Flow address.

---

### 🖌️ Pixel Art Studio — `/paint`

* Fully client-side pixel canvas with **neon orange / cream / black** theme.
* **Save** and **Publish** buttons.
* On *Publish*:

  * Prompts for **Flow token amount** (price).
  * Requests a **6-character alphanumeric password** (used for unlocking).
  * Generates a unique **artwork code** (13 characters)

---

### 🛒 Marketplace — `/market`

* Displays all published artworks as thumbnails under a **thin frosted overlay layer**.
* On hover: shows **likes**, **shares**, and **comments count**.
* On click → **“View Details” modal**:

  * Prompt: *Enter password* or *Buy now*.
  * If password matches → show full artwork + creator info.
  * If bought with Flow → permanently unlocked.

---

### 🧾 Artwork Codes & Identity

* Each artwork has a **13-character alphanumeric code** (e.g., `ABC12XY34PQRS`).
* The **first 9** identify the creator; the **last 4** make the artwork unique.
* Used for tracking ownership, linking metadata, and ensuring authenticity.

---

## 🎨 Theme & Aesthetic

* **Primary Colors:**
  🧡 *Neon Orange* (#FF7B00)
  ☁️ *Cream White* (#FFF5E6)
  ⚫ *Soft Black* (#0F0F0F)
  🤎 *Light Brown Accents* (#C68B59)

* **Vibe:**
  Retro-futuristic pixel interface with glowing highlights, dark minimalism, and smooth neon accents.

---

## ⚙️ Technical Stack

* **Frontend Framework:** React + Vite + TypeScript
* **Styling:** TailwindCSS (custom theme: neon orange + cream + black)
* **Wallet Integration:** @onflow/fcl (Flow Testnet)
* **Art Creation:** Custom HTML5 Canvas pixel editor
* **Transaction Layer:** Flow Testnet tokens for buying/unlocking artworks

---

## 🧠 User Flow

1. **Connect Wallet** → `/dashboard`
2. **Go to `/paint`** → create pixel art → save or publish.
3. **Publish Artwork** → enter price + password → generates artwork code.
4. **Visit `/market`** → browse art → unlock with password or buy with Flow tokens.
5. **Go to `/profile/<id>`** → manage artworks, track sells, adjust settings.

---

## 🔮 Vision

To create a **community-owned creative economy** for pixel artists — where every creation is:

* Owned by the creator 🖋️
* Verifiable on-chain 🔗
* Unlockable through choice (purchase or password) 🔐
* Displayed in an elegant, nostalgic interface ✨

---

## 🧭 Roadmap

| Milestone                  | Description                       | Status |
| -------------------------- | --------------------------------- | ------ |
| 🎨 Pixel Painter           | Implement full canvas editor      | ✅      |
| 🔗 Flow Wallet Integration | Connect + sign transactions       | ✅      |
| 🧩 Profile System          | Unique 9-character user IDs       | ✅      |
| 🛍️ Market Preview         | Display, buy, and unlock artworks | 🏗️    |
| 💾 Local Save              | Save artworks offline             | ✅      |
| 🔐 Publish Flow            | Password + price prompt           | 🏗️    |
| 📊 Sell Analytics          | View total earnings + sales count | ⏳      |
| 💬 Comments & Likes        | Add reactions to published art    | 🔜     |

---

## 🧡 Call to Action

> Connect your **Flow Testnet wallet**, craft your first **pixel masterpiece**, and join a glowing marketplace where art meets ownership.
>
> ✨ **Create. Own. Trade. Unlock. — Welcome to Pixeller.**

