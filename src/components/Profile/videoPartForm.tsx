'use client'
import { Box, Button, VStack, Input, FormControl, FormLabel } from "@chakra-ui/react";
import React, { useState } from "react";
import { HiveAccount } from "@/lib/models/user";
import { updateProfile } from "@/lib/hive/client-functions";

interface VideoPartsFormProps {
    skater: HiveAccount;
}

interface VideoPart {
    name: string;
    filmmaker: string[];
    friends: string[];
    year: number;
    url: string;
}

const VideoPartsForm = ({ skater }: VideoPartsFormProps) => {
    const [videoPart, setVideoPart] = useState<VideoPart>({
        name: "",
        filmmaker: [""],
        friends: [""],
        year: new Date().getFullYear(),
        url: ""
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VideoPart) => {
        setVideoPart({
            ...videoPart,
            [field]: field === "filmmaker" || field === "friends" ? e.target.value.split(",") : e.target.value
        });
    };

    const submitVideoPart = () => {
        const newExtensions = {
            ...extensions,
            videoParts: [...extensions.videoParts, videoPart]
        };
        setExtensions(newExtensions);
        updateProfile(
            skater.name,
            skater.metadata?.profile.name,
            skater.metadata?.profile.about,
            skater.metadata?.profile.cover_image,
            skater.metadata?.profile.profile_image,
            skater.metadata?.profile.website,
            skater.metadata?.extensions?.eth_address,
            newExtensions.videoParts
        );
    };

    return (
        <Box>
            <VStack spacing={4}>
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                        value={videoPart.name}
                        onChange={(e) => handleChange(e, "name")}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Filmmaker</FormLabel>
                    <Input
                        value={videoPart.filmmaker.join(",")}
                        onChange={(e) => handleChange(e, "filmmaker")}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Friends</FormLabel>
                    <Input
                        value={videoPart.friends.join(",")}
                        onChange={(e) => handleChange(e, "friends")}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input
                        type="number"
                        value={videoPart.year}
                        onChange={(e) => handleChange(e, "year")}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>URL</FormLabel>
                    <Input
                        value={videoPart.url}
                        onChange={(e) => handleChange(e, "url")}
                    />
                </FormControl>
                <Button
                    colorScheme="green"
                    variant="outline"
                    size="lg"
                    mt={4}
                    onClick={submitVideoPart}
                >
                    Submit Video Part
                </Button>
            </VStack>
        </Box>
    );
};

export default VideoPartsForm;
