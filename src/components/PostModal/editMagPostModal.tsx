'use client'
import PostPreview from '@/app/upload/components/PostPreview';
import { sendHiveOperation } from '@/lib/hive/server-functions';
import PostModel from '@/lib/models/post';
import { Box, Button, Center, Flex, HStack, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useMediaQuery } from '@chakra-ui/react';
import { Operation } from '@hiveio/dhive';
import { diff_match_patch } from 'diff-match-patch';
import { Fragment, useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import MarkdownRenderer from '../ReactMarkdown/page';
import { useHiveUser } from '@/contexts/UserContext';

interface editModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostModel;
}

const extractImagesFromContent = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = content.match(imageRegex);


    if (matches) {
        return matches.map((match) => {
            const urlMatch = match.match(/\((.*?)\)/);
            return urlMatch ? urlMatch[1] : '';
        });
    }

    return [];
};

export const EditModal = ({ isOpen, onClose, post }: editModalProps) => {
    const [editedContent, setEditedContent] = useState(post.body);
    const [editedTitle, setEditedTitle] = useState(post.title);
    const [isSmallerThan400] = useMediaQuery('(max-width: 400px)');
    const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(true);
    const user = useHiveUser();
    const username = user?.hiveUser?.name || '';
    useEffect(() => {
        const parsedMetadata = JSON.parse(post.json_metadata);
        const postImagesFromMetadata = parsedMetadata.images || [];
        const imagesFromContent = extractImagesFromContent(post.body);

        // Merge the images from metadata and content, removing duplicates
        const mergedImages = Array.from(new Set([...postImagesFromMetadata, ...imagesFromContent]));

        setPostImages(mergedImages);
    }, []);


    const dmp = new diff_match_patch();

    const createPatch = (originalContent: string, editedContent: string) => {
        // Create a patch
        const patch = dmp.patch_make(originalContent, editedContent);

        // Check if the patch contains changes
        if (patch.length > 0) {
            // Convert the patch to a string
            const patchString = dmp.patch_toText(patch);

            // Check if the patched content is not longer than the original content
            const patchedContent = dmp.patch_apply(patch, originalContent);
            if (!patchedContent[1].some((change: boolean) => !change)) {
                return patchString;
            }
        }

        return null;
    };
    const handleSave = (username: string) => {
        if (editedContent === post.body) {
            return onClose();
        }

        const patch = createPatch(post.body, editedContent);
        const parsedMetadata = JSON.parse(post.json_metadata);
        const tags = parsedMetadata.tags || [];
        const thumbnail = parsedMetadata.image || null;
        const thumbnailToUse = selectedThumbnail || thumbnail || null;
        const updatedMetadata = JSON.stringify({
            ...parsedMetadata,
            thumbnail: thumbnailToUse,
            image: postImages,
        });

        if (patch) {
            const patchedContent =
                patch.length < new TextEncoder().encode(post.body).length
                    ? dmp.patch_apply(dmp.patch_fromText(patch), post.body)[0]
                    : editedContent;
            console.log('patchedContent', patchedContent);
            const user_name = String(username)
            const operation: Operation =
                [
                    'comment',
                    {
                        parent_author: '', // Leave as an empty string for a new post
                        parent_permlink: tags[0] || '', // Use the first tag as parent_permlink or an empty string if tags are not present
                        author: user_name,
                        permlink: post.permlink,
                        title: editedTitle,
                        body: patchedContent,
                        thumbnail: thumbnailToUse,
                        json_metadata: JSON.stringify(updatedMetadata),
                    },
                ]

            const operations = [operation]

            const loginMethod = localStorage.getItem("LoginMethod")
            if (!user_name) {
                console.error("Username is missing")
                return
            }
            if (loginMethod === "keychain") {
                window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
                    console.log(response);
                    if (response.success) {
                        setIsEditing(false);
                        setEditedContent(patchedContent); // Update state after a successful broadcast
                    } else {
                        console.error('Error updating the post:', response.message);
                    }
                });
            } else if (loginMethod === "privateKey") {
                const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
                sendHiveOperation(encryptedPrivateKey, operations)
            }

        } else {
            alert('No changes detected, if you are trying to change the thumbnail, change at least one character on the post.');
        }
        setIsEditing(false);
        onClose();
    };
    const [isPreview, setIsPreview] = useState(false);
    const handlePreview = () => {
        setIsPreview(!isPreview);
    }
    const date = String(Date.now());
    let postDataForPreview = {
        post_id: Number(1),
        author: post.author || "skatehive",
        permlink: 'permlink',
        title: post.title,
        body: editedContent,
        json_metadata: JSON.stringify({ images: [selectedThumbnail] }),
        created: date,
        url: 'url',
        root_title: 'root_title',
        total_payout_value: '4.20',
        curator_payout_value: '0.0',
        pending_payout_value: '0.0',
        active_votes: [
            { voter: "BamMargera", weight: 10000, percent: "0", reputation: 78, rshares: 0 },
            { voter: "SpiderMan", weight: 5000, percent: "0", reputation: 69, rshares: 0 },
            { voter: "Magnolia", weight: 20000, percent: "0", reputation: 100, rshares: 0 },
        ]
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "lg", md: "2xl", lg: "6xl" }}  >
            <ModalOverlay />
            {isPreview ? (
                <ModalContent bg={'black'} color={'white'} border={"1px solid limegreen"}>
                    <ModalHeader>
                        <Center>Preview</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <HStack justifyContent={"space-between"}>
                            <Text fontSize="28px" color="green.200" as="b">
                                {editedTitle}
                            </Text>

                            <FaEye onClick={handlePreview} size={'28px'} />
                        </HStack>
                        <Box >
                            <PostPreview postData={postDataForPreview} />
                        </Box>
                        <Box p={2} mb={2} borderRadius={'10px'} border={'2px solid white'} >
                            <Center>

                                <Text> {post.title}</Text>
                            </Center>
                        </Box>
                        <Box p={2} borderRadius={'10px'} border={'2px solid white'} overflow={'auto'} h={{ base: "300px", md: "400px", lg: "600px" }}
                        >
                            <MarkdownRenderer content={editedContent} />
                        </Box>


                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handlePreview} colorScheme="blue">
                            Edit
                        </Button>
                        <Button onClick={onClose} colorScheme="red">
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            ) : (
                <ModalContent color={'white'} bg={'black'} border={"1px solid limegreen"}>
                    <ModalHeader>
                        <Center>Edit</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <HStack>
                            <Input
                                placeholder="Title"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                            />
                            <FaEye onClick={handlePreview} size={'28px'} />
                        </HStack>
                        <Textarea
                            placeholder="Content"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            h={{ base: "200px", md: "400px", lg: "600px" }}
                        />
                        {postImages && postImages.length > 0 && (
                            <Flex borderRadius={"10px"} m="25px" marginBottom={"-25px"} padding={"10px"} alignItems="center" marginTop={4}>
                                <Flex direction="row" alignItems="center" flexWrap="wrap">
                                    {postImages.map((image: string, index: number) => (
                                        <Fragment key={index}>
                                            <Box
                                                width="148px"
                                                height="148px"
                                                m={1}
                                                borderRadius="5px">
                                                <Image
                                                    src={image}
                                                    boxSize={"148px"}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    style={{
                                                        objectFit: 'cover',
                                                        cursor: 'pointer',
                                                        border: selectedThumbnail === image ? '2px solid teal' : 'none',
                                                        width: '148px',
                                                        marginRight: (index + 1) % 4 === 0 ? 0 : '10px',
                                                        marginBottom: '10px',
                                                        borderRadius: '5px',
                                                    }}
                                                    onClick={() => setSelectedThumbnail(image)}
                                                />
                                                {(index + 1) % 4 === 0 && <br />}
                                            </Box>
                                        </Fragment>
                                    ))}
                                </Flex>
                            </Flex>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => handleSave(username)} loadingText="Saving" colorScheme="green">
                            Save
                        </Button>
                        <Button onClick={onClose} colorScheme="red">
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            )}

        </Modal >
    );
}