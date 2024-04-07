"use server"

import { createThirdwebClient } from "thirdweb"

const ethClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
})

export default ethClient
