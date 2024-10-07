"use client"

import { useHiveUser } from "@/contexts/UserContext"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Modal,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react"
import { useState } from "react"
import ConnectedUserModal from "./connectedUserModal"
import DisconnectedUserModal from "./disconnectedModal"

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
  const { hiveUser, refreshUser } = useHiveUser()

  async function doLogin(useLoginAs: boolean = false) {
    try {
      setIsLogginIn(true)
      await loginWithHive(username, useLoginAs, privateKey)
      refreshUser() // Refresh user data after login
      onClose()
      setIsLogginIn(false)
      console.log(hiveUser)
    } catch (error) {
      console.error(error)
      setErrorMessage(error ? error.toString() : "Unknown error")
      setIsLogginIn(false)
    }
  }

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
          <ConnectedUserModal onClose={onClose} />
        ) : (
          <DisconnectedUserModal
            onClose={onClose}
            username={username}
            setUsername={setUsername}
            privateKey={privateKey}
            setPrivateKey={setPrivateKey}
            doLogin={doLogin}
            isLogginIn={isLogginIn}
            errorMessage={errorMessage}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
