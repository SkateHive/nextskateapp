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
  useDisclosure,
} from "@chakra-ui/react"
import { AtSign, Bell, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AvatarLogin() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [username, setUsername] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser()

  const [isLogginOut, setIsLogginOut] = useState(false)
  const [isLogginIn, setIsLogginIn] = useState(false)

  async function doLogin() {
    try {
      setIsLogginIn(true)
      await loginWithHive(username)
      onClose()
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
      <MenuButton>
        <Tooltip label="Profile">
          <Avatar
            name={hiveUser.name}
            src={hiveUser.metadata?.profile.profile_image}
            borderRadius={"100%"}
            size="md"
          />
        </Tooltip>
      </MenuButton>
      <MenuList>
        <MenuItem
          icon={<Bell size={"16px"} />}
          as={Link}
          href={"/notifications"}
        >
          Notifications
        </MenuItem>
        <MenuItem icon={<LogOut size={"16px"} />} onClick={handleLogout}>
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
        <ModalContent mx={4}>
          <ModalHeader>Log In</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={Boolean(errorMessage)}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <AtSign size={"16px"} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Hive Username"
                  onChange={(event) =>
                    setUsername(event.target.value.toLowerCase())
                  }
                />
              </InputGroup>
              {Boolean(errorMessage) && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {isLogginIn ? (
              <Button w={"100%"}>
                <Spinner size={"sm"} />
              </Button>
            ) : (
              <Button w={"100%"} onClick={doLogin}>
                Continue
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
