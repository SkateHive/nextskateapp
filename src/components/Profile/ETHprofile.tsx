import { Avatar, Center, Image, Text, VStack } from "@chakra-ui/react";
import { Address } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from 'viem/ens';
import { useEnsAvatar, useEnsName, useEnsText } from "wagmi";
import { FormattedAddress } from "../NNSAddress";

interface ProfileProps {
    eth_address: Address;
}

const ETHprofile: React.FC<ProfileProps> = ({ eth_address }) => {
    const ens_address = useEnsName({ address: eth_address, chainId: mainnet.id });

    const ensAvatar = useEnsAvatar({
        name: normalize(ens_address.data || ""),
        chainId: mainnet.id,
    })
    const coverImage = useEnsText({
        name: normalize(ens_address.data || ""),
        key: "coverImageUrl",
    });

    const ensHiveText = useEnsText({
        name: normalize(ens_address.data || ""),
        key: "profile",
    });

    return (
        <VStack color={'white'}>
            <Image
                w={{ base: "100%", lg: "80%" }}
                src={coverImage.data || ""}
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
                    src={ensAvatar.data || ""}
                    borderRadius={4}
                    boxSize={100}
                />
            </Center>
            <FormattedAddress address={eth_address} />

        </VStack>
        // TODO: ETH profile of someone with farcaster posts 
    );
};

export default ETHprofile;
