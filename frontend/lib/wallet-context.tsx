"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import fcl from "./flow"
import api from "./api"

interface Transaction {
  id: string
  type: "purchase" | "sale" | "transfer"
  amount: number
  artworkId?: number
  artworkTitle?: string
  timestamp: string
  status: "pending" | "completed" | "failed"
}

interface WalletContextType {
  user: any
  balance: number
  transactions: Transaction[]
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  executeTransaction: (transaction: Omit<Transaction, "id" | "timestamp" | "status">) => Promise<void>
  updateBalance: (amount: number) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function generateProfileId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const FALLBACK_ADDR = "0xacb382b67edad6b4"

  // Load wallet state on mount
  useEffect(() => {
    // Restore persisted session if present
    try {
      const saved = localStorage.getItem("pixeller_user")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.address) {
          setUser(parsed)
          setIsConnected(true)
          // Try to refresh balance from Flow (best-effort)
          ;(async () => {
            try {
              const account = await fcl.account(parsed.address)
              setBalance(Number(account?.balance || 0) / 1e8)
            } catch (err) {
              // ignore
            }
          })()
        }
      }
    } catch (err) {
      // ignore localStorage parse errors
    }

    // Subscribe to FCL user updates. We will not clear a persisted session on disconnect;
    // session remains until the user explicitly clicks Disconnect.
    const unsubscribe = fcl.currentUser().subscribe(async (flowUser: any) => {
      if (!flowUser || !flowUser.addr) {
        // If we have a persisted session, keep it. Otherwise clear.
        try {
          const saved = localStorage.getItem("pixeller_user")
          if (!saved) {
            setUser(null)
            setBalance(0)
            setIsConnected(false)
          }
          return
        } catch (e) {
          setUser(null)
          setBalance(0)
          setIsConnected(false)
          return
        }
      }

      // Build a minimal user object
      const minimal = {
        address: flowUser.addr,
        name: flowUser.name || flowUser.addr,
        loggedIn: !!flowUser.addr,
      }

      setUser(minimal)
      setIsConnected(true)

      // Get balance from Flow
      try {
        const account = await fcl.account(flowUser.addr)
        const bal = Number(account?.balance || 0) / 1e8
        setBalance(bal)
      } catch (err) {
        console.error("Failed to fetch account balance", err)
      }

      // Ensure backend user exists and attach
      try {
        const backendUser = await api.createOrGetUser(flowUser.addr)
        if (backendUser) {
          const withBackend = { ...minimal, backend: backendUser }
          setUser(withBackend)
          // persist session
          try {
            localStorage.setItem("pixeller_user", JSON.stringify(withBackend))
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Failed to create/get backend user", err)
      }
    })

    return () => unsubscribe && unsubscribe()
  }, [])

  const connectWallet = async () => {
    // Attempt normal fcl authenticate, but allow a short timeout for user convenience.
    // If the app has been auto-falling back too many times, disable auto-fallback.
    const allowFallback = (() => {
      try {
        const v = localStorage.getItem("pixeller_allow_fallback")
        if (v === null) return true
        return v === "true"
      } catch (e) {
        return true
      }
    })()

    let timedOut = false
    const authPromise = fcl.authenticate()
    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        timedOut = true
        resolve("__timeout__")
      }, 2000)
    })

    try {
      const result = await Promise.race([authPromise, timeoutPromise])
      if (result === "__timeout__") {
        // fallback only if allowed and not disabled by prior uses
        if (!allowFallback) {
          // simply return and let the wallet modal be used by the user explicitly
          return
        }

        // count fallback uses to stop after two auto-fallbacks
        try {
          const raw = localStorage.getItem("pixeller_fallback_uses")
          const count = raw ? parseInt(raw, 10) || 0 : 0
          const next = count + 1
          localStorage.setItem("pixeller_fallback_uses", String(next))
          if (next >= 2) {
            localStorage.setItem("pixeller_allow_fallback", "false")
          }
        } catch (e) {
          // ignore localStorage errors
        }

        // fallback: use public testnet address and proceed
        const addr = FALLBACK_ADDR
        const minimal = { address: addr, name: addr, loggedIn: false }
        setUser(minimal)
        setIsConnected(true)

        try {
          const account = await fcl.account(addr)
          const bal = Number(account?.balance || 0) / 1e8
          setBalance(bal)
        } catch (err) {
          console.warn("Failed to fetch fallback account balance", err)
        }

        try {
          const backendUser = await api.createOrGetUser(addr)
          if (backendUser) {
            const withBackend = { ...minimal, backend: backendUser }
            setUser(withBackend)
            try {
              localStorage.setItem("pixeller_user", JSON.stringify(withBackend))
            } catch (e) {
              // ignore
            }
          }
        } catch (err) {
          console.error("Failed to create/get backend user for fallback", err)
        }
      } else {
        // authentication resolved within timeout; fcl.currentUser subscription will handle the rest
      }
    } catch (err) {
      // if error and timed out, still perform fallback if allowed
      console.error("FCL authenticate failed", err)
      if (timedOut && allowFallback) {
        try {
          const raw = localStorage.getItem("pixeller_fallback_uses")
          const count = raw ? parseInt(raw, 10) || 0 : 0
          const next = count + 1
          localStorage.setItem("pixeller_fallback_uses", String(next))
          if (next >= 2) {
            localStorage.setItem("pixeller_allow_fallback", "false")
          }
        } catch (e) {}

        const addr = FALLBACK_ADDR
        const minimal = { address: addr, name: addr, loggedIn: false }
        setUser(minimal)
        setIsConnected(true)
        try {
          const account = await fcl.account(addr)
          const bal = Number(account?.balance || 0) / 1e8
          setBalance(bal)
        } catch (err2) {
          console.warn("Failed to fetch fallback account balance", err2)
        }
        try {
          const backendUser = await api.createOrGetUser(addr)
          if (backendUser) {
            const withBackend = { ...minimal, backend: backendUser }
            setUser(withBackend)
            try {
              localStorage.setItem("pixeller_user", JSON.stringify(withBackend))
            } catch (e) {}
          }
        } catch (err3) {
          console.error("Failed to create/get backend user for fallback", err3)
        }
        return
      }
      throw err
    }
  }

  const disconnectWallet = () => {
    try {
      fcl.unauthenticate()
    } catch (err) {
      console.warn("Error unauthenticating", err)
    }
    setUser(null)
    setBalance(0)
    setIsConnected(false)
    try {
      localStorage.removeItem("pixeller_user")
    } catch (e) {}
  }

  const executeTransaction = async (transactionData: Omit<Transaction, "id" | "timestamp" | "status">) => {
    // NOTE: This is an app-level simulated transaction handler. For a real mint/purchase you'd
    // integrate Flow transactions here. We'll keep balance updated locally using Flow account queries
    // after operations.

    if (!user?.address) throw new Error("Wallet not connected")

    // Basic local bookkeeping
    const transaction: Transaction = {
      ...transactionData,
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "completed",
    }

    const newBalance = transactionData.type === "purchase" ? balance - transactionData.amount : balance + transactionData.amount
    if (newBalance < 0) {
      transaction.status = "failed"
      throw new Error("Insufficient balance")
    }

    setBalance(newBalance)
    setTransactions((prev) => [transaction, ...prev])

    // Persist transactions locally
    try {
      localStorage.setItem("pixeller_transactions", JSON.stringify([transaction, ...transactions]))
    } catch (err) {
      console.warn("Failed to persist transactions", err)
    }

    // After a purchase/update, refresh Flow account balance
    try {
      const account = await fcl.account(user.address)
      setBalance(Number(account?.balance || 0) / 1e8)
    } catch (err) {
      console.warn("Failed to refresh Flow balance", err)
    }

    return
  }

  const updateBalance = (amount: number) => {
    const newBalance = balance + amount
    setBalance(newBalance)

    if (user) {
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem("pixeller_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <WalletContext.Provider
      value={{
        user,
        balance,
        transactions,
        isConnected,
        connectWallet,
        disconnectWallet,
        executeTransaction,
        updateBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
