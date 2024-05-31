"use client"
import useAuthHiveUser from "@/lib/useHiveAuth"
import { Button, useDisclosure } from "@chakra-ui/react"
import { LogIn, LogOut } from "lucide-react"
import LoginModal from "./LoginModal"

const environment = process.env.NODE_ENV

function LoginButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { hiveUser, logout } = useAuthHiveUser()

  return (
    <>
      {hiveUser ? (
        <Button
          aria-label="Loggin out"
          rightIcon={<LogOut size={"16px"} />}
          size={"md"}
          onClick={logout}
        >
          Log Out
        </Button>
      ) : (
        <Button
          aria-label="Log in"
          rightIcon={<LogIn size={"16px"} />}
          size={"md"}
          onClick={onOpen}
        >
          Log in
        </Button>
      )}
      <LoginModal onClose={onClose} isOpen={isOpen} />
    </>
  )
}

export default LoginButton
