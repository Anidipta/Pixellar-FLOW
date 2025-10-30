const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function createOrGetUser(address: string) {
  // Prefer finding by wallet address on the backend
  const wallet = address.toLowerCase()

  try {
    const resList = await fetch(`${API_URL}/users/?limit=1000`)
    if (resList.ok) {
      const users = await resList.json()
      const found = users.find((u: any) => (u.wallet_address || '').toLowerCase() === wallet || (u.username || '').toLowerCase() === wallet.replace(/^0x/, ''))
      if (found) return found
    }
  } catch (err) {
    // ignore and try create
    console.warn('Could not list users for lookup', err)
  }

  // Create the user by wallet_address (backend will generate profile_url)
  try {
    const res = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: wallet }),
    })
    if (res.ok) {
      return await res.json()
    }
    const text = await res.text()
    console.error("Failed to create user", res.status, text)
    return null
  } catch (err) {
    console.error("Error creating user", err)
    return null
  }
}

export async function createArtwork(payload: any) {
  const res = await fetch(`${API_URL}/artworks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create artwork")
  return res.json()
}

export default {
  createOrGetUser,
  createArtwork,
}
