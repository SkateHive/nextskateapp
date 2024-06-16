"use client"

import UserAvatar from "@/components/UserAvatar"
import { useHiveUser } from "@/contexts/UserContext"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaHive } from "react-icons/fa"
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
  const { loginWithHive, logout } = useAuthHiveUser()
  const { hiveUser } = useHiveUser()
  const [isKeychainInstalled, setIsKeychainInstalled] = useState(false)

  useEffect(() => {
    if (window.hive_keychain) {
      setIsKeychainInstalled(true)
    } else {
      setIsKeychainInstalled(false)
    }
  }, [])

  async function doLogin(useLoginAs: boolean = false) {
    try {
      setIsLogginIn(true)
      await loginWithHive(username, useLoginAs, privateKey)
      onClose()
      console.log(hiveUser)
    } catch (error) {
      console.error(error)
      setErrorMessage(error ? error.toString() : "Unknown error")
      setIsLogginIn(false)
    }
  }
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      doLogin();
    }
  };
  return (
    <Modal isOpen={isOpen} isCentered onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={"black"}
        mx={4}
        border={"1.2px solid #A5D6A7"}
        boxShadow={"0 0 20px #A5D6A7"}
        color={"#A5D6A7"}
      >
        {hiveUser ? (
          <>
            <ModalHeader>Connected as {hiveUser.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align={"normal"}>
                <HStack>
                  <UserAvatar hiveAccount={hiveUser} borderRadius={5} boxSize={16} />
                  <Text>{hiveUser.name}</Text>
                </HStack>
                <Button
                  w={"100%"}
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  colorScheme="red"
                  variant={"outline"}
                >
                  Log Out
                </Button>
              </VStack>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader><Center><Text mr={2}>Connect with HIVE </Text><FaHive color="red" /> </Center></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Image mb={2} src="/pepe-login.png" alt="Hive Logo" />
              <FormControl isInvalid={Boolean(errorMessage)}>
                <VStack align={"normal"}>
                  <Input
                    borderColor={"green.600"}
                    color={"#A5D6A7"}
                    _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                    focusBorderColor="#A5D6A7"
                    placeholder="Hive Username"
                    onChange={(event) =>
                      setUsername(event.target.value.toLowerCase())
                    }
                    onKeyDown={handleKeyDown}

                  />
                  {!isKeychainInstalled && (
                    <Input
                      type="password"
                      borderColor={"green.600"}
                      color={"#A5D6A7"}
                      _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                      focusBorderColor="#A5D6A7"
                      placeholder="Password"
                      onChange={(event1) => setPrivateKey(event1.target.value)}
                    />
                  )}
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
                {isLogginIn ? <Spinner size={"sm"} /> : "Log In"}
              </Button>
              <Button
                w={"100%"}
                onClick={() => window.open("https://hiveonboard.com/create-account")}
                colorScheme="blue"
                variant={"outline"}

              >
                Sign Up
              </Button>
              {/* {environment === "development" && (
                <Button
                  w={"100%"}
                  onClick={() => doLogin(true)}
                  colorScheme="red"
                  variant={"ghost"}
                >
                  Continue As (DEV)
                </Button>
              )} */}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
