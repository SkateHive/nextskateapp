"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Avatar,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { AtSign, Bell, LogIn, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSWRConfig } from "swr"

const env = process.env.NODE_ENV

export default function AvatarLogin() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { mutate } = useSWRConfig()
  const [username, setUsername] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser()

  const [isLogginOut, setIsLogginOut] = useState(false)
  const [isLogginIn, setIsLogginIn] = useState(false)

  async function doLogin(useLoginAs: boolean = false) {
    try {
      setIsLogginIn(true)
      await loginWithHive(username, useLoginAs)
      onClose()
      mutate("posts")
    } catch (error) {
      console.error(error)
      setErrorMessage(error ? error.toString() : "Unknow error")
      setIsLogginIn(false)
    }
  }

  async function handleLogout() {
    setIsLogginOut(true)
    logout()
  }

  return hiveUser ? (
    <Menu placement="bottom-end">
      <MenuButton >
        <Tooltip label="Profile">
          <Avatar
            name={hiveUser.name}
            src={hiveUser.metadata?.profile.profile_image}
            borderRadius={"100%"}
            size="md"
            bg="gray.200"
          />
        </Tooltip>
      </MenuButton>
      <MenuList bg="black">
        <MenuItem
          icon={<Bell size={"16px"} />}
          as={Link}
          href={"/notifications"}
          bg="black"
        >
          Notifications
        </MenuItem>
        <MenuItem
          bg="black"
          icon={<User size={"16px"} />}
          as={Link}
          href={`/profile/${hiveUser.name}`}
        >
          Profile
        </MenuItem>
        <MenuItem bg="black"
          icon={<LogOut size={"16px"} />} onClick={handleLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  ) : (
    <>
      {isLogginOut ? (
        <Button
          aria-label="Loggin out"
          rightIcon={<Spinner size={"sm"} />}
          size={"sm"}
        >
          Loggin Out
        </Button>
      ) : (
        <Button
          aria-label="Log in"
          rightIcon={<LogIn size={"16px"} />}
          size={"sm"}
          onClick={onOpen}
        >
          Log in
        </Button>
      )}
      <Modal isOpen={isOpen} isCentered onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={'black'} mx={4}>
          <ModalHeader>Log In</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={Boolean(errorMessage)}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <AtSign size={"16px"} color="gray" />
                </InputLeftElement>
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
              </InputGroup>
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
                {env === "development" && (
                  <Button w={"100%"} onClick={() => doLogin(true)}>
                    Continue As (DEV)
                  </Button>
                )}
              </VStack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
