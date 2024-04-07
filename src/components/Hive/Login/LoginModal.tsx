"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import { ethClient, wallets } from "@/lib/wallet/client"
import {
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
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
import { base } from "thirdweb/chains"
import { ConnectButton, useConnect } from "thirdweb/react"
import { walletConnect } from "thirdweb/wallets"

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
  const { connect, isConnecting, error } = useConnect()
  const wallet = walletConnect()

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
          <VStack w={"100%"}>
            <HStack w={"100%"}>
              <Button
                w={"100%"}
                onClick={() => doLogin()}
                colorScheme="green"
                variant={"outline"}
                disabled={isLogginIn}
              >
                {isLogginIn ? <Spinner size={"sm"} /> : "Hive connect"}
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
            </HStack>
            <ConnectButton
              theme={"dark"}
              client={ethClient}
              wallets={wallets}
              chain={base}
              connectButton={{
                label: "Connect ETH wallet",
                style: {
                  backgroundColor: "black",
                  border: "1px solid white",
                  color: "white",
                  paddingBlock: "0",
                  height: "40px",
                  width: "100%",
                  borderRadius: "6px",
                },
              }}
            />
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
