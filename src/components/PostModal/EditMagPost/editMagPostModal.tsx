'use client'
import { sendHiveOperation } from '@/lib/hive/server-functions';
import PostModel from '@/lib/models/post';
import { Button, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { Operation } from '@hiveio/dhive';
import { diff_match_patch } from 'diff-match-patch';
import { useEffect, useState } from 'react';
import ModalBodySection from './ModalBodySection';
import ModalFooterSection from './ModalFooterSection';
import ModalHeaderSection from './ModalHeaderSection';
import PostPreviewSection from './PostPreviewSection';


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
    }, [post.body, post.json_metadata]);


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
          sendHiveOperation (encryptedPrivateKey, operations)
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
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "2xl", lg: "6xl" }}>
            <ModalOverlay bg="blackAlpha.900" />
            {isPreview ? (
            <ModalContent bg={'#0e1118'} border={"1px solid #171c25"} color="white">
                <ModalHeader>
                    <Center>Edit Preview</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <PostPreviewSection
                        editedTitle={editedTitle}
                        editedContent={editedContent}
                        selectedThumbnail={selectedThumbnail}
                        postImages={postImages}
                        postDataForPreview={postDataForPreview}
                    />
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
            <ModalContent bg={'#0e1118'} border={"1px solid #171c25"} color="white">
                <ModalHeader>
                    <Center   color="white" >Edit</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <ModalHeaderSection
                        editedTitle={editedTitle}
                        setEditedTitle={setEditedTitle}
                        handlePreview={handlePreview}
                    />
                    <ModalBodySection
                        editedContent={editedContent}
                        setEditedContent={setEditedContent}
                        postImages={postImages}
                        selectedThumbnail={selectedThumbnail}
                        setSelectedThumbnail={setSelectedThumbnail}

                    />
                </ModalBody>
                <ModalFooter>
                    <ModalFooterSection handleSave={() => handleSave(username)} onClose={onClose} />
                </ModalFooter>
            </ModalContent>
        )}
    </Modal >
    );
}