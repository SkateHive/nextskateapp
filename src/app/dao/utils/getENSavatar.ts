import { createConfig, getEnsAvatar, http } from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import { normalize } from 'viem/ens'
import { getENSnamefromAddress } from './getENSfromAddress'

const config = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
});

const ensNameCache = new Map();
const avatarCache = new Map();
const MAX_RETRIES = 3;

export const getENSavatar = async (address: string) => {
    if (avatarCache.has(address)) {
        return avatarCache.get(address);
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            let ensName4avatar = ensNameCache.get(address);
            if (!ensName4avatar) {
                ensName4avatar = await getENSnamefromAddress(address);
                if (ensName4avatar) {
                    ensNameCache.set(address, ensName4avatar);
                }
            }

            if (!ensName4avatar) {
                console.error("No ENS name found for address:", address);
                return '/pepenation.gif';
            }

            const normalizedENS = normalize(String(ensName4avatar));
            const ensAvatarResponse = await getEnsAvatar(config, {
                name: normalizedENS,
                chainId: mainnet.id,
            });

            const avatarUrl = ensAvatarResponse || '/pepenation.gif';
            avatarCache.set(address, avatarUrl);
            return avatarUrl;
        } catch (error) {
            console.error(`Failed to fetch ENS avatar for address: ${address} (Attempt ${retries + 1}/${MAX_RETRIES})`, error);
            retries++;
        }
    }

    avatarCache.set(address, '/pepenation.gif');
    return '/pepenation.gif';
};
