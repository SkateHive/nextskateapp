// path: src/app/upload/components/previewModal.tsx


import React from 'react';

import { Divider, Badge, Progress, Box, Button, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Image, CardHeader, Flex, Link, Avatar, Card, HStack, VStack, Th, Table, Tr, Tbody, Td, Thead } from '@chakra-ui/react';
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
import hiveUpload from '../utils/hiveUpload';



interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    body: string;
    thumbnailUrl: string;
    user: HiveAccount;
    beneficiariesArray: any[];
    tags: string[];
}


interface BeneficiaryForBroadcast {
    account: string;
    weight: string;
}

interface BeneficiariesCard {
    beneficiariesArray: BeneficiaryForBroadcast[];
}


const BeneficiariesCard: React.FC<BeneficiariesCard> = ({ beneficiariesArray }) => {
    return (
        <Card bg='darkseagreen' border="1px solid limegreen">
            <CardHeader>
                <VStack spacing={4} align="stretch">
                    {beneficiariesArray.map((beneficiary, index) => (
                        <Box key={index}>
                            <Text color="black">
                                {beneficiary.account} - {Number(beneficiary.weight) / 100}%
                            </Text>
                            <Progress colorScheme="green" size="sm" value={Number(beneficiary.weight) / 100} />
                        </Box>
                    ))}
                    <Box>
                        <Text color={"black"}>
                            You - {100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100}%
                        </Text>
                        <Progress colorScheme="green" size="sm" value={100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100} />
                    </Box>
                </VStack>
            </CardHeader>
        </Card>
    );
};





const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, body, thumbnailUrl, user, beneficiariesArray, tags }) => {

    let postDataForPreview = {
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

    const handlePost = () => {
        console.log(beneficiariesArray)
        hiveUpload(String(user.name), title, body, beneficiariesArray, thumbnailUrl, tags, user)
    }



    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent backgroundColor={"black"} border={'1px solid limegreen'}>

                <ModalHeader>Post Preview (Review details)</ModalHeader>
                <Divider />
                <ModalCloseButton />
                <ModalBody>

                    <Box >
                        <Center>
                            <VStack>
                                <Box width={"100%"}>

                                    <Card
                                        bg={"black"}
                                        border={"0.6px solid white"}
                                        size="sm"
                                        boxShadow="none"
                                        borderRadius="none"
                                        p={2}
                                    >
                                        <PostProvider postData={postDataForPreview}>
                                            <Header />
                                            <PostImage />
                                            <Footer />
                                        </PostProvider>
                                    </Card>
                                </Box>
                                <Box border={'1px solid white'} w="sm" maxWidth="sm">
                                    <Table >
                                        <Thead>
                                            <Tr>
                                                <Th>Beneficiaries</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody >
                                            <Tr >
                                                <Td>
                                                    <BeneficiariesCard beneficiariesArray={beneficiariesArray} />
                                                </Td>
                                            </Tr>
                                        </Tbody>

                                    </Table>
                                    <Table>

                                        <Th>Tags</Th>
                                        <Td>

                                            <Flex flexWrap="wrap">
                                                {tags.map((tag, index) => (
                                                    <Badge key={index} colorScheme="green" variant="solid" size="sm" m={1}>
                                                        {tag}
                                                    </Badge>
                                                ))}

                                            </Flex>
                                        </Td>
                                    </Table>


                                </Box>
                            </VStack>
                        </Center>
                    </Box>

                </ModalBody>
                <ModalFooter>
                    <VStack width={'100%'}>
                        <Button width={'100%'} colorScheme='red' onClick={onClose}>Let me try again, I am high</Button>
                        <Button width={'100%'} colorScheme='green' onClick={handlePost}>Looks dope, confirm!</Button>

                    </VStack>

                </ModalFooter>
            </ModalContent>
        </Modal >
    );
};

export default PreviewModal;