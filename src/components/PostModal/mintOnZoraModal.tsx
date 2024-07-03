import {
    Button,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text
} from '@chakra-ui/react';
import { ZDK, ZDKChain, ZDKNetwork } from "@zoralabs/zdk";
import React, { useEffect, useState } from 'react';

interface MintOnZoraModalProps {
    isOpen: boolean;
    onClose: () => void;
    postBody: string;
}

const networkInfo = {
    network: ZDKNetwork.Base,
    chain: ZDKChain.BaseMainnet,
}
const API_ENDPOINT = "https://api.zora.co/graphql";
const args = {
    endPoint: API_ENDPOINT,
    networks: [networkInfo],
    apiKey: process.env.API_KEY || '',
}

const MintOnZoraModal: React.FC<MintOnZoraModalProps> = ({ isOpen, onClose, postBody }) => {
    const zdk = new ZDK(args);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const collectionAddress = "0x7ca35292b0652ba9e1bd46504491c39d12f99586";

    useEffect(() => {
        const fetchCollection = async () => {
            const query = `
                query($addresses: [String!]!) {
                    collections(where: { collectionAddresses: $addresses }) {
                        nodes {
                            address
                            description
                            name
                            symbol
                            totalSupply
                            networkInfo {
                                chain
                                network
                            }
                        }
                    }
                }
            `;
            const variables = { addresses: [collectionAddress] };

            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.API_KEY}`,
                    },
                    body: JSON.stringify({ query, variables }),
                });

                const result = await response.json();

                // Check if the response contains any errors
                if (result.errors) {
                    console.error('Error in response:', result.errors);
                    return;
                }

                // Check if the collections data is present
                if (!result.data || !result.data.collections || !result.data.collections.nodes.length) {
                    console.error('No collections data found');
                    return;
                }

                console.log(result.data.collections.nodes[0]);
            } catch (error) {
                console.error('Error fetching collection:', error);
            }
        };

        if (collectionAddress) {
            fetchCollection();
        }
    }, [collectionAddress]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Mint on Zora</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text mb={2}>Title</Text>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                    />
                    <Text mt={4} mb={2}>Description</Text>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                    />
                    <Flex mt={4}>
                        <Button
                            onClick={() => {
                                // Mint on Zora
                                // ...
                                onClose();
                            }}
                            colorScheme="blue"
                        >
                            Mint
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default MintOnZoraModal;
