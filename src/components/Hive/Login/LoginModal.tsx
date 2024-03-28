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
  const { loginWithHive } = useAuthHiveUser()

  async function doLogin(useLoginAs: boolean = false) {
    try {
      setIsLogginIn(true)
      await loginWithHive(username, useLoginAs)
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
        <ModalHeader>Log In</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={Boolean(errorMessage)}>
            <VStack>
              <Input
                placeholder="Hive Username"
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
              />
              <Input
                placeholder="Private Key"
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
              />
            </VStack>
            {Boolean(errorMessage) && (
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          {isLogginIn ? (
            <Button w={"100%"} disabled>
              <Spinner size={"sm"} />
            </Button>
          ) : (
            <VStack w={"100%"}>
              <Button w={"100%"} onClick={() => doLogin()}>
                Continue
              </Button>
              {environment === "development" && (
                <Button w={"100%"} onClick={() => doLogin(true)}>
                  Continue As (DEV)
                </Button>
              )}
            </VStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
