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

  // Load wallet state on mount
  useEffect(() => {
    // Subscribe to FCL user updates
    const unsubscribe = fcl.currentUser().subscribe(async (flowUser: any) => {
      if (!flowUser || !flowUser.addr) {
        // disconnected
        setUser(null)
        setBalance(0)
        setIsConnected(false)
        return
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

      // Ensure backend user exists
      try {
        const backendUser = await api.createOrGetUser(flowUser.addr)
        if (backendUser) {
          // attach backend id on the client user object
          setUser((u: any) => ({ ...u, backend: backendUser }))
        }
      } catch (err) {
        console.error("Failed to create/get backend user", err)
      }
    })

    return () => unsubscribe && unsubscribe()
  }, [])

  const connectWallet = async () => {
    try {
      await fcl.authenticate()
      // fcl.currentUser subscription will handle the rest
    } catch (err) {
      console.error("FCL authenticate failed", err)
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
