"use client"

import UserAvatar from "@/components/UserAvatar"
import { useHiveUser } from "@/contexts/UserContext"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
  Box,
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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  VStack,
  useSteps
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

  const steps = [
    { title: 'Add Profile Pic', description: 'Done' },
    { title: 'Edit Profile', description: 'If you want, but its cool' },
    { title: 'Make your first Post', description: 'Introduce yourself, bro' },
    { title: 'Vote For SkateHive Witness', description: 'Complicated Shit. Just do it' }
  ]

  function StepByStep() {
    const { activeStep } = useSteps({
      index: 1,
      count: steps.length,
    })
    const [isStep1Completed, setStep1Completed] = useState(false)
    const [isStep2Completed, setStep2Completed] = useState(false)
    const [isStep3Completed, setStep3Completed] = useState(false)
    const [isStep4Completed, setStep4Completed] = useState(false)
    return (
      <Stepper index={activeStep} orientation='vertical' height='300px' gap='0' mt={5} mb={5}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    )
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
          <>
            <ModalHeader> <Center>Connected as {hiveUser.name}</Center></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align={"normal"}>
                <HStack>
                  <UserAvatar hiveAccount={hiveUser} borderRadius={5} boxSize={16} />
                  <StepByStep />
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
