'use client'
import { Box, Button, Center, Container, Flex, FormControl, FormLabel, Image, Input, Text, VStack, Divider } from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { useClient } from "wagmi";

export const SignupModal = () => {
  return(
    <p>jasper qt</p>
  )
}

export default function Home() {

  const [isKeychainInstalled, setIsKeychainInstalled] = useState(false)
  const [isSignUpClicked, setIsSignUpClicked] = useState(false)


  useEffect(() => {
    if (window.hive_keychain) {
      setIsKeychainInstalled(true)
    } else {
      setIsKeychainInstalled(false)
    }
  }, [])

  const handleSignUpClick = () => {
    console.log("buttonclick")
    setIsSignUpClicked(!isSignUpClicked)
    console.log(isSignUpClicked)
  }

  return (
    <Center minHeight="100vh" bg="black">
      <Container
        bg="black"
        p={5}
        borderRadius="md"
        boxShadow="md"
        width="80%"
        maxWidth="800px"
      >
        <Flex
          justify="space-between"
          align="flex-start"
          flexDirection={{ base: "column", md: "row" }}
        >
          <VStack
            textAlign="center"
            mr={{ base: 0, md: 8 }}
            mb={{ base: 4, md: 0 }}
            flex={1}
          >
            <Image
              src="https://beta.skatehive.app/skatehive_square_green.png"
              alt="Welcome Image"
              borderRadius="md"
            />
            <Text mt={3} fontSize="md" color="#c7c6c6">
              Decentralized skateboarding community.
            </Text>
          </VStack>

          <VStack flex={1} mt={4} width="100%">
            <form id="auth-form" style={{ width: "100%" }}>
              
              {!isSignUpClicked ?(
              <FormControl id="login-hive" mb={4}>
                <Flex align="center">
                  
                  <Input
                    type="text"
                    name="login-hive"
                    placeholder="Hive Account Name"
                    borderColor="#ccc"
                    _placeholder={{ color: "#919191" }}
                    borderRadius="md"
                  />
                  <Button type="submit" variant={"outline"} colorScheme="green" ml={2}>
                    Log In
                  </Button>
                </Flex>
              </FormControl>
              ) : (
                <SignupModal />
              )}

            {!isKeychainInstalled && (
            <FormControl id="privatekey" mb={4}>
                <Input
                  type="password"
                  name="privatekey"
                  placeholder="Public Posting Key"
                  borderColor="#ccc"
                  textAlign="center"
                  _placeholder={{ color: "#919191" }}
                  borderRadius="md"
                />
              </FormControl>)
            }
            </form>
            

            <Text my={4} textAlign="center" color="#b8b8b8" fontStyle="italic" marginTop={"100px"}>Don't have an account?</Text>
            
            <Button 
              onClick={handleSignUpClick}
            width="100%" type="submit" variant={"outline"} colorScheme="green" ml={2}>
              Sign Up
            </Button>
          </VStack>

        </Flex>
      </Container>
    </Center>
  );
}
