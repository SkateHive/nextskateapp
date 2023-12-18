"use client"

import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Tooltip,
} from "@chakra-ui/react"
import { CornerDownLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import AvatarLogin from "./AvatarLogin"

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const router = useRouter()

  return (
    <nav>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          {isHome ? "Feed" : "Post"}
        </Heading>
        <Box mr={3}>
          {isHome ? (
            <AvatarLogin />
          ) : (
            <Tooltip label="Return Home">
              <IconButton
                aria-label="Return"
                icon={<CornerDownLeft />}
                variant="ghost"
                size="lg"
                onClick={() => router.push("/")}
              />
            </Tooltip>
          )}
        </Box>
      </Flex>
      <Divider mb={3} color="darkgray" />
    </nav>
  )
}
