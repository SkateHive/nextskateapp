// path: src/app/upload/components/previewModal.tsx


import React from 'react';

import { Box, Button, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Image, CardHeader, Flex, Link, Avatar, Card } from '@chakra-ui/react';
import ReactMardown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from '../utils/MarkdownRenderers';
import PostAvatar from '@/components/Post/Avatar';
import { HiveAccount } from '@/lib/useHiveAuth';
import { PostProvider } from '@/contexts/PostContext';
import Post from '@/components/Post';
import Header from '@/components/Post/Header';
import Footer from '@/components/Post/Footer';
import PostImage from '@/components/Post/Image';




interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    body: string;
    thumbnailUrl: string;
    user: HiveAccount;
    beneficiariesArray: any[];
}


interface BeneficiaryForBroadcast {
    account: string;
    weight: string;
}

interface BeneficiariesCard {
    beneficiariesArray: BeneficiaryForBroadcast[];
}

const BeneficiariesCard: React.FC<BeneficiariesCard> = ({ beneficiariesArray }) => {
    console.log(beneficiariesArray)
    return (
        <Card bg='darkseagreen' border={"1px solid limegreen"}>
            <CardHeader>
                <Text>
                    {beneficiariesArray.map((beneficiary, index) => {
                        return (
                            <Text key={index} color={"black"}>
                                {beneficiary.account} - {Number(beneficiary.weight) / 100}%
                            </Text>
                        )
                    }
                    )}
                </Text>
            </CardHeader>
        </Card>
    )
}





const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, body, thumbnailUrl, user, beneficiariesArray }) => {
    console.log(user)
    let postData = {
        post_id: Number(1),
        author: user.name || "skatehive",
        permlink: 'permlink',
        title: title,
        body: body,
        json_metadata: JSON.stringify({ images: [thumbnailUrl] }),
        created: String(Date.now()),
        url: 'url',
        root_title: 'root_title',
        total_payout_value: '4.20',
        curator_payout_value: '0.0',
        pending_payout_value: '0.0',
        active_votes: [
            { voter: "BamMargera", weight: 10000, percent: "0", reputation: 0, rshares: 0 },
            { voter: "user2", weight: 5000, percent: "0", reputation: 0, rshares: 0 },
            { voter: "user3", weight: 20000, percent: "0", reputation: 0, rshares: 0 },
        ]
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent minWidth={'90%'} backgroundColor={"black"} border={'1px solid limegreen'}>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>

                    <Box maxW={"50%"}>
                        <Center>

                            <Card
                                bg={"black"}
                                border={"0.6px solid white"}
                                size="sm"
                                boxShadow="none"
                                borderRadius="none"
                                p={2}
                            >
                                <PostProvider postData={postData}>
                                    <Header />

                                    <PostImage />
                                    <Footer />
                                </PostProvider>
                            </Card>
                        </Center>
                    </Box>

                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
};

export default PreviewModal;