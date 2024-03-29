"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"

const environment = process.env.NODE_ENV

function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [errorMessage, setErrorMessage] = useState("")
  const [isLogginIn, setIsLogginIn] = useState(false)
  const [username, setUsername] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const { loginWithHive } = useAuthHiveUser()

  async function doLogin(useLoginAs: boolean = false) {
    try {
      setIsLogginIn(true)
      await loginWithHive(username, useLoginAs, privateKey)
      onClose()
    } catch (error) {
      console.error(error)
      setErrorMessage(error ? error.toString() : "Unknow error")
      setIsLogginIn(false)
    }
  }

  return (
    <Modal isOpen={isOpen} isCentered onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={"black"}
        mx={4}
        border={"1.2px solid limegreen"}
        boxShadow={"0 0 20px limegreen"}
      >
        <ModalHeader>Hive Log In</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={Boolean(errorMessage)}>
            <VStack align={"normal"}>
              <Input
                borderColor={"green.600"}
                color={"limegreen"}
                _placeholder={{ color: "limegreen", opacity: 0.4 }}
                focusBorderColor="limegreen"
                placeholder="Hive Username"
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
              />
              {
                <Input
                  borderColor={"green.600"}
                  color={"limegreen"}
                  _placeholder={{ color: "limegreen", opacity: 0.4 }}
                  focusBorderColor="limegreen"
                  placeholder="Private Key"
                  onChange={(event1) => setPrivateKey(event1.target.value)}
                />
              }
            </VStack>
            {Boolean(errorMessage) && (
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            w={"100%"}
            onClick={() => doLogin()}
            colorScheme="green"
            variant={"outline"}
            disabled={isLogginIn}
          >
            {isLogginIn ? <Spinner size={"sm"} /> : "Continue"}
          </Button>
          {environment === "development" && (
            <Button
              w={"100%"}
              onClick={() => doLogin(true)}
              colorScheme="red"
              variant={"ghost"}
            >
              Continue As (DEV)
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
