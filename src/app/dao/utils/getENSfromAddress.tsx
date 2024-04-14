import { http, createConfig, getEnsName } from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'

const config = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
})

export const getENSnamefromAddress = async (address: string) => {
    const formattedAddress = address.split('0x')[1]

    let ensName = await getEnsName(config, {
        address: `0x${formattedAddress}`,
        chainId: mainnet.id,
    })

    if (ensName) {
        console.log("ENS Name found:", ensName);
        return ensName;
    } else {
        console.log("No ENS Name found for address:", address);
        return address;
    }
    console.log(ensName)
    return ensName
}

