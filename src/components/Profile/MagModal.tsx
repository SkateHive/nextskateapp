import React from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure
} from "@chakra-ui/react";
import { HiveAccount } from "@/lib/useHiveAuth";
import FullMag from "../Magazine/test/fullMag";
import { QueryProvider } from "@/contexts/QueryContext";

interface MagModalProps {
    username: string
    query: string
    isOpen: boolean
    onClose: () => void
}


export function MagModal({ username, query, isOpen, onClose }: MagModalProps) {
    return (
        <QueryProvider query={query} tag={[{ tag: String(username), limit: 30 }]}>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <ModalOverlay backdropFilter="blur(8px)" />
                <ModalContent bg={'transparent'}>
                    <ModalCloseButton />
                    <ModalBody bg='transparent'>
                        <FullMag tag={[{ tag: String(username), limit: 30 }]} query={query} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </QueryProvider>
    );
}