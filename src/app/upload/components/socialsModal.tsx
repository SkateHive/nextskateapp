import { Button, Divider, Flex, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Toast, VStack } from '@chakra-ui/react';
import * as React from 'react';
import { FaCopy, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
interface SocialModalProps {
    isOpen: boolean;
    onClose: () => void;
    postUrl: string;
    content: any;
    aiSummary: string;

}

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, postUrl, content, aiSummary }) => {
    const useToast = Toast;

    const [postLinkCopied, setPostLinkCopied] = React.useState(false);


    const handleCopyPostLink = () => {
        try {
            navigator.clipboard.writeText(postUrl);
            setPostLinkCopied(true);
            setTimeout(() => {
                setPostLinkCopied(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to copy the link:', error);
        }
    };
    const handleShareWarpCast = async () => {
        try {
            const postPageUrl = encodeURI(postUrl);
            const warptext = `${aiSummary} ${postPageUrl}`;

            window.open(`https://warpcast.com/~/compose?text=${warptext}`, "_blank", "noreferrer noopener");
        }
        catch (error) {
            console.error('Failed to share in WarpCast:', error);
        }
    }
    const handleShareTwitter = async () => {
        try {
            const postPageUrl = encodeURI(postUrl);
            const tweetText = `${aiSummary} ${postPageUrl}`;
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, "_blank", "noreferrer noopener");

        }
        catch (error) {
            console.error('Failed to share in Twitter:', error);
        }
    }
    const handleShareDiscord = async () => {
        try {
            const postPageUrl = encodeURI(postUrl);
            const tweetText = `${aiSummary} ${postPageUrl}`;
            navigator.clipboard.writeText(tweetText);

            window.open('https://discord.com/channels/631777256234156033/631778823716864011', "_blank", "noreferrer noopener");
        }
        catch (error) {
            console.error('Failed to share in Discord:', error);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
            <ModalOverlay />
            <ModalContent border={"1px solid white"} bg="gray.900" color="white">
                <ModalHeader fontSize="lg" fontWeight="bold">Share Your Post !!!</ModalHeader>
                <Divider />
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        <Flex gap={2} marginTop={"5%"} wrap="wrap" justify="center">
                            <Button onClick={handleShareTwitter} border={"1px solid white"} color="white" leftIcon={<FaXTwitter />} size="sm">Twitter</Button>
                            <Button onClick={handleShareWarpCast} color={"white"} bg={"#7c65c1"} leftIcon={<Image alt='warpcast' src='/warpcast.png' boxSize="20px" />} size="sm">Warpcast</Button>
                            <Button onClick={handleShareDiscord} color="white" bg={"purple"} leftIcon={<FaDiscord />} size="sm">Discord</Button>

                        </Flex>
                        <Flex align="center" justify="space-between" mt={4}>
                            <Input value={postUrl} bg={"grey"} isReadOnly variant="filled" size="sm" />
                            <Button bg={"transparent"} border={"1px solid white"} color={"white"} onClick={handleCopyPostLink} leftIcon={<FaCopy />} size="sm">
                                {postLinkCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </Flex>
                    </VStack>
                </ModalBody>
                <ModalFooter>

                </ModalFooter>
            </ModalContent>
        </Modal>

    );
}

export default SocialModal;
