'use client'
import { Flex, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Textarea, Input, ModalFooter, Image, Box, Center, HStack, Text, Divider } from '@chakra-ui/react';
import { diff_match_patch } from 'diff-match-patch';
import { useMediaQuery } from '@chakra-ui/react';
import React, { Fragment, useState } from 'react';
import PostModel from '@/lib/models/post';
import { useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Post from '../PostCard';
import PostPreview from '@/app/upload/components/PostPreview';
import { set } from 'lodash';
import { on } from 'events';

interface editModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostModel;
    username: string;
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

export const EditModal = ({ isOpen, onClose, post, username }: editModalProps) => {
    const [editedContent, setEditedContent] = useState(post.body);
    const [editedTitle, setEditedTitle] = useState(post.title);
    const [editedImages, setEditedImages] = useState(extractImagesFromContent(post.body));
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [patch, setPatch] = useState<string | null>(null);
    const [isSmallerThan400] = useMediaQuery('(max-width: 400px)');
    const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(true);

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
            const operations = [
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
                ],
            ];
            window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
                console.log(response);
                if (response.success) {
                    setIsEditing(false);
                    setEditedContent(patchedContent); // Update state after a successful broadcast
                } else {
                    console.error('Error updating the post:', response.message);
                }
            });
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

    let postDataForPreview = {
        post_id: Number(1),
        author: post.author || "skatehive",
        permlink: 'permlink',
        title: post.title,
        body: editedContent,
        json_metadata: JSON.stringify({ images: [selectedThumbnail] }),
        created: String(Date.now()),
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
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "lg", md: "2xl", lg: "6xl" }} >
            <ModalOverlay />
            {isPreview ? (
                <ModalContent bg={'black'} border={"1px solid limegreen"}>
                    <ModalHeader>
                        <Center>Edit Preview</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <HStack justifyContent={"space-between"}>
                            <Text fontSize="28px" color="green.200" as="b">
                                {editedTitle}
                            </Text>

                            <FaEye onClick={handlePreview} size={'28px'} />
                        </HStack>
                        <Divider my={4} />
                        <Box p={2} border={'2px dashed red'} overflow={'auto'} h={{ base: "200px", md: "400px", lg: "600px" }}
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownRenderers}
                            >{editedContent}</ReactMarkdown>
                        </Box>
                        <Divider my={4} />
                        <HStack>
                            <Box w={'100%'} textAlign={'center'}>
                                <Text color={'green.200'} fontSize={'2xl'} mb={4}> Selected Thumbnail </Text>
                                {postImages && postImages.length > 0 && (
                                    <Center>
                                        <Image
                                            src={selectedThumbnail || postImages[0]}
                                            alt="Thumbnail"
                                            style={{
                                                objectFit: 'cover',
                                                width: '40%',
                                                borderRadius: '5px',
                                            }}
                                        />
                                    </Center>
                                )}
                            </Box>
                            <Box w={'50%'}>
                                <PostPreview postData={postDataForPreview} />
                            </Box>
                        </HStack>
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
                <ModalContent bg={'black'} border={"1px solid limegreen"}>
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