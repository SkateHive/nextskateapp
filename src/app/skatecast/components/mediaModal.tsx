import {
    Image,
    Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay
} from "@chakra-ui/react"
import { Box } from "@chakra-ui/react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { transformIPFSContent } from "@/lib/utils"


const PINATA_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN


const AvatarMediaModal = ({
    isOpen,
    onClose,
    media,
}: {
    isOpen: boolean
    onClose: () => void
    media: any
}) => {
    const pinataToken = PINATA_TOKEN



    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay filter="blur(8px)" />
            <ModalContent bg={"black"}>
                <ModalHeader>Media</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        {media.type}
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default AvatarMediaModal