// path: src/app/upload/components/previewModal.tsx

import React from 'react';
import {
    Divider,
    Badge,
    Progress,
    Box,
    Button,
    Center,
    Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Text,
    CardHeader, Card,
    Flex,
    VStack,
    Table,
    Thead,
    Th,
    Tr,
    Tbody,
    Td,
} from '@chakra-ui/react';
import { HiveAccount } from '@/lib/useHiveAuth';
import { PostProvider } from '@/contexts/PostContext';
import Header from '@/components/PostCard/Header';
import Footer from '@/components/PostCard/Footer';
import PostImage from '@/components/PostCard/Image';
import SocialsModal from './socialsModal';
import { useEffect } from 'react';
import * as dhive from "@hiveio/dhive"
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { commentWithKeychain } from '@/lib/hive/client-functions';
import getSummary from '../../../lib/getSummaryAI';
import slugify from '../utils/slugify';
import generatePermlink from '../utils/generatePermlink';
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
                    <Box>
                        <Text color={"black"}>
                            You - {100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100}%
                        </Text>
                        <Progress colorScheme="green" size="sm" value={100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100} />
                    </Box>
                    {beneficiariesArray.map((beneficiary, index) => (
                        <Box key={index}>
                            <Text color="black">
                                {beneficiary.account} - {Number(beneficiary.weight) / 100}%
                            </Text>
                            <Progress colorScheme="green" size="sm" value={Number(beneficiary.weight) / 100} />
                        </Box>
                    ))}
                </VStack>
            </CardHeader>
        </Card>
    );
};

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, body, thumbnailUrl, user, beneficiariesArray, tags }) => {
    const [hasPosted, setHasPosted] = React.useState(false);
    const [postLink, setPostLink] = React.useState("");
    const [AiSummary, setAiSummary] = React.useState("");

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
    useEffect(() => {
        const summarizeBlog = async () => {
            const summary = await getSummary(body);
            setAiSummary(summary);
        };

        if (body) {
            summarizeBlog();
        }
    }, [body]);

    const handlePost = async () => {
        const formatBeneficiaries = (beneficiariesArray: any[]) => {
            let seen = new Set();
            return beneficiariesArray.filter(({ account }: { account: string }) => {
                const duplicate = seen.has(account);
                seen.add(account);
                return !duplicate;
            }).map(beneficiary => ({
                account: beneficiary.account,
                weight: parseInt(beneficiary.weight, 10) // Ensure weight is an integer
            })).sort((a, b) => a.account.localeCompare(b.account));
        };

        const finalBeneficiaries = formatBeneficiaries(beneficiariesArray);
        const permlink = slugify(title.toLowerCase());
        const loginMethod = localStorage.getItem('LoginMethod');

        const summarizeBlog = async () => {
            const summary = await getSummary(body);
            setAiSummary(summary);
        };


        if (!user || !title || !user.name) {
            if (loginMethod === 'keychain') {
                alert('You have to log in with Hive Keychain to use this feature...');
            }
            return;
        }

        const formParamsAsObject = {
            "data": {
                username: user.name,
                title: title,
                body: body,
                parent_perm: "blog",
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
            const commentOptions: dhive.CommentOptionsOperation = [
                'comment_options',
                {
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
                }
            ];

            const postOperation: dhive.CommentOperation = [
                'comment',
                {
                    parent_author: '',
                    parent_permlink: 'hive-173115',
                    author: user.name,
                    permlink: permlink,
                    title: title,
                    body: body,
                    json_metadata: JSON.stringify({
                        tags: tags,
                        app: 'Skatehive App',
                        image: thumbnailUrl,
                    }),
                },
            ];

            commentWithPrivateKey(localStorage.getItem("EncPrivateKey"), postOperation, commentOptions);
            setHasPosted(true);
        }
    }

    const buildPostLink = () => {
        const username = user?.name;
        if (username) {
            const permlink = generatePermlink(title);
            const link = `https://skatehive.app/post/hive-173115/@${username}/${permlink}`;
            setPostLink(link);
        }
    }
    useEffect(() => {
        buildPostLink();
    }
        , [title, user]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent backgroundColor={"black"} border={'1px solid limegreen'}>
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
                                            <Table>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Beneficiaries</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
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
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default PreviewModal;