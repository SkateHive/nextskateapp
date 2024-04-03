// path: src/app/upload/components/previewModal.tsx


import React from 'react';

import { Box, Button, Divider, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Image, CardHeader, Flex, Link, Avatar, Card } from '@chakra-ui/react';
import ReactMardown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from '../utils/MarkdownRenderers';
import PostAvatar from '@/components/Post/Avatar';
import { HiveAccount } from '@/lib/useHiveAuth';
interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    body: string;
    thumbnailUrl: string;
    user: HiveAccount;
    beneficiariesArray: any[];
}


{/* <CardHeader p={2} pb={0}>
<PostModal isOpen={isOpen} onClose={onClose} />
<Flex gap="4" align={"start"}>
  <Flex flex="1" gap="2" alignItems="center">
    <Link href={post.getFullAuthorUrl()}>
      <PostAvatar
        name={post.author}
        src={
          postAvatar ??
          `https://images.ecency.com/webp/u/${post.author}/avatar/small`
        }
      />
    </Link>
    <Flex flexDir="column" gap={0} w={"100%"}>
      <Flex gap={1} alignItems="center">
        <Text fontSize="14px" as="b">
          {post.author}
        </Text>
        <Text fontSize="14px" color="darkgray">
          ·
        </Text>
        <Text fontSize="12px" color="darkgray" fontWeight="300">
          {moment.utc(post.created).fromNow()}
        </Text>
      </Flex>
      <HStack justify={"space-between"} display={"flex"}>
        <Text fontSize="16px" noOfLines={1}>
          {post.title}
        </Text>
      </HStack>
    </Flex>
  </Flex>
  {variant === "preview" ? (
    <Tooltip label="Open post">
      <Icon
        onClick={onOpen}
        mt={1}
        cursor={"pointer"}
        as={Eye}
        h={7}
        w={7}
        color="limegreen"
      />
    </Tooltip>
  ) : null}
</Flex>
</CardHeader> */}
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
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent minWidth={'90%'} backgroundColor={"black"} border={'1px solid limegreen'}>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <HStack>
                        <Box maxW={"50%"}>
                            <ReactMardown
                                className="markdown-body"
                                components={MarkdownRenderers}
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {body}
                            </ReactMardown>
                        </Box>
                        <Divider colorScheme='green' orientation='vertical' />
                        <Box mt={4}>
                            <Text fontSize="sm" color="gray.500">
                                This is a preview of how your post will look like on Hive.
                            </Text>
                            <Card>

                                <CardHeader p={2} pb={0}>
                                    <Flex gap="4" align={"start"}>

                                        <Avatar
                                            name={user?.name}
                                            src={

                                                `https://images.ecency.com/webp/u/${user?.name}/avatar/small`
                                            }
                                        />
                                        <Flex flexDir="column" gap={0} w={"100%"}>
                                            <Flex gap={1} alignItems="center">
                                                <Text fontSize="14px" as="b">
                                                    {user?.name}
                                                </Text>
                                                <Text fontSize="14px" color="darkgray">
                                                    ·
                                                </Text>
                                                <Text fontSize="12px" color="darkgray" fontWeight="300">
                                                    {new Date().toLocaleString()}
                                                </Text>
                                            </Flex>
                                            <HStack justify={"space-between"} display={"flex"}>
                                                <Text fontSize="16px" noOfLines={1}>
                                                    {title}
                                                </Text>
                                            </HStack>

                                        </Flex>
                                    </Flex>
                                </CardHeader>
                            </Card>



                            <Text>
                                Thumbail
                            </Text>
                            <Image src={thumbnailUrl} alt="Thumbnail" />

                            <Text>
                                Tags
                            </Text>
                            <Text>
                                Beneficiaries
                            </Text>
                            <BeneficiariesCard beneficiariesArray={beneficiariesArray} />
                        </Box>
                    </HStack>

                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
};

export default PreviewModal;