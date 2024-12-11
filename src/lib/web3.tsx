import { Alchemy, Network } from "alchemy-sdk"

const config = {
  apiKey: `${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  network: Network.BASE_MAINNET,
}
export const alchemy = new Alchemy(config)

