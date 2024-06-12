'use client';

import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { Button, Center, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea } from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { useState } from "react";

interface MobileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
}

const parent_author = "skatehacker";
const parent_permlink = "test-advance-mode-post";

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
const MobileUploadModal: React.FC<MobileUploadModalProps> = ({ isOpen, onClose, file }) => {
    const [post, setPost] = useState<string>('');
    const [finalPost, setFinalPost] = useState<string>('');
    const user = useHiveUser();
    const { addComment, isLoading } = useComments(parent_author, parent_permlink);
    const permlink = new Date()
        .toISOString()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();

    const handlePost = async () => {
        if (!file) {
            return;
        }
        const ipfsData = await uploadFileToIPFS(file);
        if (ipfsData !== undefined) {
            const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
            const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` : `![Image](${ipfsUrl})`;
            setFinalPost(`${post}\n${markdownLink}`);
            console.log(finalPost);
        }

        if (user.hiveUser) {
            const postData = {
                parent_author: parent_author,
                parent_permlink: parent_permlink,
                author: String(user.hiveUser.name),
                permlink: permlink,
                title: "Cast",
                body: finalPost,
                json_metadata: JSON.stringify({
                    tags: ["skateboard"],
                    app: "skatehive",
                }),
            };
            const commentOptions: dhive.CommentOptionsOperation = [
                "comment_options",
                {
                    author: String(user.hiveUser.name),
                    permlink: permlink,
                    max_accepted_payout: "10000.000 HBD",
                    percent_hbd: 10000,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions: [
                        [
                            0,
                            {
                                beneficiaries: [
                                    {
                                        account: "skatehacker",
                                        weight: 1000,
                                    },
                                ],
                            },
                        ],
                    ],
                },
            ];

            const postOperation: dhive.CommentOperation = [
                "comment",
                {
                    parent_author: parent_author,
                    parent_permlink: parent_permlink,
                    author: String(user.hiveUser.name),
                    permlink: permlink,
                    title: "Cast",
                    body: finalPost,
                    json_metadata: JSON.stringify({
                        tags: ["skateboard"],
                        app: "Skatehive App",
                        image: "/skatehive_square_green.png",
                    }),
                },
            ];

            try {
                await commentWithPrivateKey(
                    localStorage.getItem("EncPrivateKey")!,
                    postOperation,
                    commentOptions
                );

                addComment(postData);
                onClose();

            } catch (error) {
                console.error("Error posting comment:", (error as Error).message);
            }
        }

    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent w={{ base: "100%", md: "75%" }} bg="black" border="0.6px solid grey" borderRadius="md" mx={4}>
                <ModalHeader>
                    <Center>

                        <Text color={'green.200'}>
                            Post something DOPE!
                        </Text>
                    </Center>
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                    <Textarea
                        value={post}
                        onChange={(e) => setPost(e.target.value)}
                        placeholder="Write something here..."
                        bg="transparent"
                        _focus={{ border: "#A5D6A7", boxShadow: "none" }}
                        resize="none"
                        minHeight="100px"
                        borderRadius="xl"
                        border="1px solid grey"
                        color="white"
                    />
                    {file && <Image src={URL.createObjectURL(file)} alt="Selected file" />}
                </ModalBody>
                <ModalFooter>
                    <Button
                        width={"100%"}
                        variant={"outline"}
                        colorScheme="green"
                        onClick={() => {
                            // onClose();
                            handlePost();
                        }}
                    >
                        Post
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MobileUploadModal;