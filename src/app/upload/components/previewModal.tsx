import { commentWithKeychain } from '@/lib/hive/client-functions';
import { commentWithPrivateKey } from '@/lib/hive/server-functions';
import { HiveAccount } from '@/lib/useHiveAuth';
import {
    Box,
    Center,
    Divider,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';

import slugify from '../utils/slugify';
import BeneficiariesTable from './BeneficiariesTable';
import { createCommentOptions, createPostOperation } from './formatPostData';
import ModalFooterButtons from './ModalFooterButton';
import PostPreview from './PostPreview';
import SocialsModal from './socialsModal';
import TagsTable from './TagsTable';
import usePostLink from './usePostLink';
import useSummary from './useSummary';


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

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, body, thumbnailUrl, user, beneficiariesArray, tags }) => {
    const [hasPosted, setHasPosted] = useState(false);
    const AiSummary = useSummary(body);
    const postLink = usePostLink(title, user);

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
            { voter: "BamMargera", weight: 10000, percent: "0", reputation: 78, rshares: 0 },
            { voter: "SpiderMan", weight: 5000, percent: "0", reputation: 69, rshares: 0 },
            { voter: "Magnolia", weight: 20000, percent: "0", reputation: 100, rshares: 0 },
        ]
    }

    const handlePost = async () => {
        const formatBeneficiaries = (beneficiariesArray: any[]) => {
            let seen = new Set();
            return beneficiariesArray.filter(({ account }: { account: string }) => {
                const duplicate = seen.has(account);
                seen.add(account);
                return !duplicate;
            }).map(beneficiary => ({
                account: beneficiary.account,
                weight: parseInt(beneficiary.weight, 10)
            })).sort((a, b) => a.account.localeCompare(b.account));
        };
        const finalBeneficiaries = formatBeneficiaries(beneficiariesArray);
        const permlink = slugify(title.toLowerCase());
        const loginMethod = localStorage.getItem('LoginMethod');

        if (!user || !title || !user.name) {
            if (loginMethod === 'keychain') {
                alert('Something wrong is not right...');
            }
            return;
        }

        const formParamsAsObject = {
            "data": {
                username: user.name,
                title: title,
                body: body,
                parent_perm: "hive-173115",
                json_metadata: JSON.stringify({ format: "markdown", description: AiSummary, tags: tags }),
                permlink: permlink,
                comment_options: JSON.stringify({
                    author: user.name,
                    permlink: permlink,
                    max_accepted_payout: '10000.000 HBD',
                    percent_hbd: 10000,
                    allow_votes: true,
                    allow_curation_rewards: true,
                    extensions: [
                        [0, {
                            beneficiaries: finalBeneficiaries
                        }]
                    ]
                })
            }
        }

        if (loginMethod === 'keychain') {
            const response = await commentWithKeychain(formParamsAsObject);
            if (response?.success) {
                setHasPosted(true);
            } else {
                alert('Something went wrong, please try again');
            }
        } else if (loginMethod === 'privateKey') {
            const commentOptions = createCommentOptions(user, permlink, finalBeneficiaries);
            const postOperation = createPostOperation(user, permlink, title, body, tags, thumbnailUrl);
            commentWithPrivateKey(localStorage.getItem("EncPrivateKey"), postOperation, commentOptions);
            setHasPosted(true);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent backgroundColor={"black"} border={'1px solid #A5D6A7'}>
                {hasPosted ? (
                    <SocialsModal isOpen={hasPosted} onClose={onClose} postUrl={postLink} content={body} aiSummary={AiSummary} />
                ) : (
                    <>
                        <ModalHeader>Post Preview (Review details)</ModalHeader>
                        <Divider />
                        <ModalCloseButton />
                        <ModalBody>
                            <Box>
                                <Center>
                                    <VStack>
                                        <Box width={"100%"}>
                                            <PostPreview postData={postDataForPreview} />
                                        </Box>
                                        <Box border={'1px solid white'} w="432px">
                                            <BeneficiariesTable beneficiariesArray={beneficiariesArray} />
                                            <TagsTable tags={tags} />
                                        </Box>
                                    </VStack>
                                </Center>
                            </Box>
                        </ModalBody>
                        <ModalFooter>
                            <ModalFooterButtons onClose={onClose} handlePost={handlePost} />
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PreviewModal;
