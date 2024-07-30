import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { sendHiveOperation } from '@/lib/hive/server-functions';
import PostModel from '@/lib/models/post';
import { Box, Button, Center, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea } from '@chakra-ui/react';
import { Operation } from '@hiveio/dhive';
import { diff_match_patch } from 'diff-match-patch';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink = process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

interface EditCommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    commentBody: string;
    onSave?: (editedBody: string) => void;
    post: PostModel;
    username: string;

}

interface Metadata {
    tags: never[];
    thumbnail?: string;
    images?: string[] | null;
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

export const EditCommentModal = ({ isOpen, onClose, commentBody, onSave, post, username }: EditCommentModalProps) => {
    const [editedContent, setEditedContent] = useState(commentBody);
    const [editedTitle, setEditedTitle] = useState(post.title);
    const [postImages, setPostImages] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(true);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        const parsedMetadata: Metadata = JSON.parse(post.json_metadata);
        const postImagesFromMetadata = parsedMetadata.images || [];
        const imagesFromContent = extractImagesFromContent(post.body);
        const mergedImages = Array.from(new Set([...postImagesFromMetadata, ...imagesFromContent]));

        setPostImages(mergedImages);
    }, [post.body, post.json_metadata]);

    const dmp = new diff_match_patch();

    const createPatch = (originalContent: string, editedContent: string) => {
        const patch = dmp.patch_make(originalContent, editedContent);

        if (patch.length > 0) {
            const patchString = dmp.patch_toText(patch);
            const patchedContent = dmp.patch_apply(patch, originalContent);
            if (!patchedContent[1].some((change: boolean) => !change)) {
                return patchString;
            }
        }

        return null;
    };

    const handleSave = () => {
        const parsedMetadata: Metadata = JSON.parse(post.json_metadata);

        if (editedContent === commentBody && editedTitle === post.title && JSON.stringify(postImages) === JSON.stringify(parsedMetadata.images)) {
            return onClose();
        }

        const patch = createPatch(commentBody, editedContent);
        const tags = parsedMetadata.tags || [];
        const thumbnail = parsedMetadata.images || null;
        const updatedMetadata = JSON.stringify({
            ...parsedMetadata,
            thumbnail: thumbnail,
            images: postImages,
        });

        if (patch) {
            const patchedContent =
                patch.length < new TextEncoder().encode(commentBody).length
                    ? dmp.patch_apply(dmp.patch_fromText(patch), commentBody)[0]
                    : editedContent;

            const operation = [
                'comment',
                {
                    parent_author: parent_author,
                    parent_permlink: parent_permlink,
                    author: username,
                    permlink: post.permlink,
                    title: editedTitle,
                    body: patchedContent,
                    json_metadata: updatedMetadata,
                },
            ] as const;

            const operations: Operation[] = [operation];

            const loginMethod = localStorage.getItem("LoginMethod");

            if (!username) {
                console.error("Username is missing");
                return;
            }

            if (loginMethod === "keychain") {
                window.hive_keychain.requestBroadcast(username, operations, 'posting', (response: any) => {
                    console.log(response);
                    if (response.success) {
                        setIsEditing(false);
                        setEditedContent(patchedContent);
                        onSave?.(patchedContent);
                    } else {
                        console.error('Error updating the post:', response.message);
                    }
                });
            } else if (loginMethod === "privateKey") {
                const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
                sendHiveOperation(encryptedPrivateKey, operations);
                onSave?.(patchedContent);
            }
        } else {
            alert('No changes detected, if you are trying to change the thumbnail, change at least one character on the post.');
        }
        setIsEditing(false);
        onClose();
    };


    useEffect(() => {
        setEditedContent(commentBody);
    }, [commentBody]);

    const handlePreview = () => {
        setIsPreview(!isPreview);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xs">
            <ModalOverlay />
            {isPreview ? (
                <ModalContent bg="black" color="white" border="1px solid limegreen">
                    <ModalHeader>
                        <Center>Preview</Center>
                    </ModalHeader>
                    <ModalBody>
                        <Box p={2} borderRadius={'10px'} border={'1px solid white'} overflow={'auto'} >
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownRenderers}
                            >
                                {editedContent}
                            </ReactMarkdown>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handlePreview} colorScheme="blue" borderRadius={'20px'} border="2px" mr={10}>
                            Edit
                        </Button>
                        <Button onClick={onClose} colorScheme="red" borderRadius={'20px'} border="2px" mr={2}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            ) : (
                <ModalContent bg="black" color="white" border="1px solid limegreen">
                    <ModalHeader>
                        <Center>Edit Comment</Center>
                    </ModalHeader>
                    <ModalBody>
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            placeholder="Edit your comment..."

                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handlePreview} colorScheme="blue" borderRadius={'20px'} border="2px" mr={2}>
                            Preview
                        </Button>
                        <Button onClick={handleSave} colorScheme="green" borderRadius={'20px'} border="2px" mr={2}>
                            Save
                        </Button>
                        <Button onClick={onClose} colorScheme="red" borderRadius={'20px'} border="2px" mr={2}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            )}
        </Modal>
    );
};

export default EditCommentModal;

