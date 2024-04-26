'use client'

import {
    Box,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Center,
    VStack,
  } from "@chakra-ui/react"

  interface PostModalInterface {
    isOpen: boolean
    onClose(): void
  }

  export default function EditInfoModal({ isOpen, onClose }: PostModalInterface) {


    return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={{ base: "lg", md: "2xl", lg: "6xl" }}
        >
          <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
          <ModalContent
            bg={"black"}
            border={"1.4px solid limegreen"}
            borderRadius={0}
            p={4}
            w={"100%"}
          >
            <ModalHeader>

            </ModalHeader>
            <ModalCloseButton mr={4} mt={2} color={"red"} />
            <ModalBody
              display={"flex"}
              flexDir={{ base: "column", lg: "row" }}
              minH={"60vh"}
              gap={6}
            >
              <Box
                bg={"black"}
                flex={0}
                p={0}
                border={"0px solid limegreen"}
                borderRadius={0}
                minW={"50%"}
              >

              </Box>
              <Input placeholder="test" />  
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      )
  }