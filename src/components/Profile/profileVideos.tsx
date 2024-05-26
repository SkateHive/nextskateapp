'use client'
import { Box, Button, VStack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { HiveAccount } from "@/lib/models/user";
import { updateProfile } from "@/lib/hive/client-functions";
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
                if (!parsedExtensions.videoParts) {
                    parsedExtensions.videoParts = [];
                }
                return parsedExtensions;
            } catch (error) {
                console.error("Error parsing JSON metadata:", error);
                return { videoParts: [] }; // Initialize with default value
            }
        })()
    );

    const [showForm, setShowForm] = useState(false);

    console.log(extensions);

    const newVideoPart: VideoPart = {
        name: "SkateHacker",
        filmmaker: ["Spike Jonze", "Renan Carvalho"],
        friends: ["Willy Wonka", "Mark Gonzales"],
        year: 2024,
        url: "https://www.youtube.com/watch?v=RQ9L6V8MI2k"
    };

    const submitVideoPart = () => {
        setShowForm(true);
    }

    return (
        <Box>
            <VStack>
                <Text>
                    {extensions?.video_parts?.length > 0 ? extensions.video_parts.map((videoPart: VideoPart, index: number) => (
                        <Box key={index}>
                            <Text>{videoPart.name}</Text>
                            <Text>{videoPart.filmmaker.join(", ")}</Text>
                            <Text>{videoPart.friends.join(", ")}</Text>
                            <Text>{videoPart.year}</Text>
                            <Text>{videoPart.url}</Text>
                        </Box>
                    )) : "No video parts available"}
                </Text>
                <Button
                    colorScheme="green"
                    variant="outline"
                    size="lg"
                    mt={4}
                    onClick={submitVideoPart}
                >
                    Submit epic video part
                </Button>
                {showForm && <VideoPartsForm skater={skater} />}
            </VStack>
        </Box>
    );
}

export default VideoParts;
