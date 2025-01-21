import { http, createConfig, getEnsName } from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'

import { wagmiConfig } from '@/app/providers'

export const getENSnamefromAddress = async (address: string) => {
    const formattedAddress = address.split('0x')[1]

    let ensName = await getEnsName(wagmiConfig, {
        address: `0x${formattedAddress}`,
        chainId: mainnet.id,
    })

    if (ensName) {
        return ensName;
    } else {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
}

