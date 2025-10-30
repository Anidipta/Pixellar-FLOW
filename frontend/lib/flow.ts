"use client"

import * as fcl from "@onflow/fcl"

// Configure FCL for Flow Testnet
fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn")
  .put('app.detail.title', 'Pixellar')
  .put('app.detail.icon', 'https://raw.githubusercontent.com/Anidipta/Pixellar-FLOW/refs/heads/main/frontend/public/logo-badge.png')
  .put('app.detail.description', 'Create. Own. Trade. Unlock.')

export default fcl
