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

export const getENSavatar = async (address: string) => {
    if (avatarCache.has(address)) {
        return avatarCache.get(address);
    }

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

        avatarCache.set(address, ensAvatarResponse || '/pepenation.gif');
        return ensAvatarResponse;
    } catch (error) {
        console.error("Failed to fetch ENS avatar for address:", address, error);
        avatarCache.set(address, '/pepenation.gif');
        return '/pepenation.gif';
    }
};
