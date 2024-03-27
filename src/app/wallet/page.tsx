"use client"

import LoginButton from "@/components/Hive/Login/LoginButton"
import { Container } from "@chakra-ui/react"

function Wallet() {
  return (
    <Container display={"flex"} justifyContent={"center"}>
      <LoginButton />
    </Container>
  )
}

export default Wallet
