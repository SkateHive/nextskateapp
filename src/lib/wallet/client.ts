"use client"

import { createThirdwebClient } from "thirdweb"
import { createWallet } from "thirdweb/wallets"

const ethClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
})

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
]

export { ethClient, wallets }
