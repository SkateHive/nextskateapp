'use client'
import { Center, Box, Button, VStack, Input, FormControl, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Image } from "@chakra-ui/react";
import React, { useState } from "react";
import { HiveAccount } from "@/lib/models/user";
import { updateProfile } from "@/lib/hive/client-functions";

interface VideoPartsFormProps {
    skater: HiveAccount;
    onNewVideoPart: (videoPart: VideoPart) => void; // Callback to notify parent of new video part
    isOpen: boolean; // Modal open state
    onClose: () => void; // Modal close function
}

interface VideoPart {
    name: string;
    filmmaker: string[];
    friends: string[];
    year: number;
    url: string;
}

const VideoPartsForm = ({ skater, onNewVideoPart, isOpen, onClose }: VideoPartsFormProps) => {
    const [videoPart, setVideoPart] = useState<VideoPart>({
        name: "",
        filmmaker: [""],
        friends: [""],
        year: new Date().getFullYear(),
        url: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VideoPart) => {
        setVideoPart({
            ...videoPart,
            [field]: field === "filmmaker" || field === "friends" ? e.target.value.split(",") : e.target.value
        });
    };

    const submitVideoPart = () => {
        onNewVideoPart(videoPart);
        onClose(); // Close the modal after submission
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={"black"} border={"0.6px solid grey"}>
                <ModalHeader>
                    <Center>

                        Submit Video Part
                    </Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Image
                            src="https://media.giphy.com/media/qTNIlLJNOwdNK/giphy.gif"
                            alt="skateboard"
                            boxSize={["100px", "200px"]}
                        />
                        <FormControl>
                            <FormLabel>Video Name</FormLabel>
                            <Input
                                value={videoPart.name}
                                onChange={(e) => handleChange(e, "name")}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Filmmaker(s) </FormLabel>
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
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button w={"100%"} colorScheme="green" mr={3} onClick={submitVideoPart}>
                        Submit Video Part
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default VideoPartsForm;
