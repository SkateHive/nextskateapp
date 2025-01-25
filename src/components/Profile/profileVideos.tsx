'use client'
import { useHiveUser } from "@/contexts/UserContext";
import { updateProfile } from "@/lib/hive/client-functions";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Button, SimpleGrid, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { useState } from "react";
import VideoCard from "./videoPartCard";
import VideoPartsForm from "./videoPartForm";

interface VideoPartsProps {
    skater: HiveAccount;
}
interface VideoPart {
    name: string;
    filmmaker: string[];
    friends: string[];
    year: number;
    url: string;
}

const VideoParts = ({ skater }: VideoPartsProps) => {
    const [extensions, setExtensions] = useState<any>(
        (() => {
            try {
                const parsedExtensions = JSON.parse(skater?.json_metadata)?.extensions || {};
                if (!parsedExtensions.video_parts) {
                    parsedExtensions.video_parts = [];
                }
                return parsedExtensions;
            } catch (error) {
                console.error("Error parsing JSON metadata:", error);
                return { video_parts: [] };
            }
        })()
    );

    const { isOpen, onOpen, onClose } = useDisclosure();
    const user = useHiveUser();
    const handleNewVideoPart = (videoPart: VideoPart) => {
        const newExtensions = {
            ...extensions,
            video_parts: [...extensions.video_parts, videoPart]
        };
        setExtensions(newExtensions);

        updateProfile(
            skater.name,
            JSON.parse(skater?.posting_json_metadata)?.profile?.name,
            JSON.parse(skater?.posting_json_metadata)?.profile?.about,
            JSON.parse(skater?.posting_json_metadata)?.profile?.location,
            JSON.parse(skater?.posting_json_metadata)?.profile?.cover_image,
            JSON.parse(skater?.posting_json_metadata)?.profile?.profile_image,
            JSON.parse(skater?.posting_json_metadata)?.profile?.website,
            newExtensions.eth_address,
            newExtensions.video_parts,
            newExtensions.level
        );
    };

    const handleRemoveVideoPart = (index: number) => {
        const newVideoParts = extensions.video_parts.filter((_: VideoPart, i: number) => i !== index);
        const newExtensions = {
            ...extensions,
            video_parts: newVideoParts
        };
        setExtensions(newExtensions);

        updateProfile(
            skater.name,
            JSON.parse(skater?.posting_json_metadata)?.profile?.name,
            JSON.parse(skater?.posting_json_metadata)?.profile?.about,
            JSON.parse(skater?.posting_json_metadata)?.profile?.location,
            JSON.parse(skater?.posting_json_metadata)?.profile?.cover_image,
            JSON.parse(skater?.posting_json_metadata)?.profile?.profile_image,
            JSON.parse(skater?.posting_json_metadata)?.profile?.website,
            newExtensions.eth_address,
            newExtensions.video_parts,
            newExtensions.level
        );
    };

    return (
        <Box>
            <VStack>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
                    {extensions?.video_parts?.length > 0 ? extensions.video_parts.map((videoPart: VideoPart, index: number) => (
                        <VideoCard key={index} videoPart={videoPart} onRemove={() => handleRemoveVideoPart(index)} />
                    )) : <Text>No video parts available</Text>}
                </SimpleGrid>
                {skater.name === user.hiveUser?.name && (
                    <Button
                        colorScheme="green"
                        variant="outline"
                        size="lg"
                        mt={4}
                        onClick={onOpen}
                    >
                        Submit epic video part
                    </Button>
                )}
                <VideoPartsForm skater={skater} onNewVideoPart={handleNewVideoPart} isOpen={isOpen} onClose={onClose} />
            </VStack>
        </Box>
    );
}

export default VideoParts;
