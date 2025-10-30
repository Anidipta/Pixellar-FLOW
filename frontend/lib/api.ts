const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function createOrGetUser(address: string) {
  // Create a user on backend if not exists. Use flow address as username/email fallback.
  const username = address.replace(/^0x/i, "")
  const email = `${username}@flow.test`

  // Try listing users and find by username first
  try {
    const resList = await fetch(`${API_URL}/users/?limit=1000`)
    if (resList.ok) {
      const users = await resList.json()
      const found = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase())
      if (found) return found
    }
  } catch (err) {
    // ignore and try create
  }

  // Create the user
  try {
    const res = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, display_name: username }),
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
