import { Avatar, Center, Image, Text, VStack } from "@chakra-ui/react";
import { createConfig, http } from '@wagmi/core';
import { useState } from "react";
import { base, mainnet } from "viem/chains";
import { normalize } from 'viem/ens';
import { useEnsAvatar, useEnsName, useEnsText } from "wagmi";

interface ProfileProps {
    eth_address: string;
}

// Create and export the configuration outside the component
const config = createConfig({
    chains: [base, mainnet],
    transports: {
        [base.id]: http(),
        [mainnet.id]: http(),
    },
});

const ETHprofile: React.FC<ProfileProps> = ({ eth_address }) => {
    const [ens_address, setEnsAddress] = useState<string>(eth_address);
    const [coverImageUrl, setCoverImageUrl] = useState<string>("https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif");
    const [ens_profile, setEnsProfile] = useState<string>("/loading.gif");
    const ensAddress = useEnsName({
        address: eth_address as `0x${string}`,
        chainId: mainnet.id,
    });
    const ensAvatar = useEnsAvatar({
        name: normalize(ensAddress.data || ""),
        chainId: mainnet.id,
    })
    const coverImage = useEnsText({
        name: normalize(ensAddress.data || ""),
        key: "coverImageUrl",
    });

    const ensHiveText = useEnsText({
        name: normalize(ensAddress.data || ""),
        key: "profile",
    });

    return (
        <VStack color={'white'}>
            <Image
                w={{ base: "100%", lg: "80%" }}
                src={coverImage.data || coverImageUrl}
                height={"200px"}
                objectFit="cover"
                borderRadius="md"
                alt={"Profile thumbnail"}
                loading="lazy"
                mt={{ base: "0px", lg: 5 }}
                border={"1px solid limegreen"}
            />
            <Center border={"3px solid limegreen"} borderRadius={7} mt={'-80px'}>
                <Avatar
                    src={ensAvatar.data || ens_profile}
                    borderRadius={4}
                    boxSize={100}
                />
            </Center>
            <Text>{ensAddress.data || eth_address}</Text>

        </VStack>
    );
};

export default ETHprofile;
