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
import NextLink from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  return (
    <nav>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          {isHome ? "Feed" : "Post"}
        </Heading>
        <Box display={isHome ? "none" : "block"}>
          <Tooltip label="Return Home">
            <IconButton
              as={NextLink}
              href="/"
              aria-label="Return"
              icon={<CornerDownLeft />}
              variant="ghost"
              size="lg"
            />
          </Tooltip>
        </Box>
      </Flex>
      <Divider mb={3} color="darkgray" />
    </nav>
  )
}
