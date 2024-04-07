"use client"

import { createThirdwebClient } from "thirdweb"

const ethClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
})

export default ethClient
