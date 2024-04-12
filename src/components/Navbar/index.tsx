"use client"

import { Link } from "@chakra-ui/next-js"
import {
  Box,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Tooltip,
} from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"
import AvatarLogin from "./AvatarLogin"
import AuthorSearchBar from "@/app/upload/components/searchBar"


export default function Navbar() {
  const pathname = usePathname()

  return (
    <Box>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          <HStack>

            <Link href="/" scroll={false}>

              <Image
                boxSize={"48px"}
                src="https://www.skatehive.app/assets/skatehive.jpeg"
                alt="SkateHive"
                borderRadius={"5px"}
                _hover={{ cursor: "pointer" }}
              />
            </Link>

            {pathname === "/" ? null : (
              <Tooltip label="Return Home">
                <Link href="/" scroll={false}>
                  <IconButton
                    aria-label="Home"
                    icon={<Home color="limegreen" />}
                    size="lg"
                    color={"white"}
                    bg={"transparent"}
                  />
                </Link>
              </Tooltip>
            )}
          </HStack>
        </Heading>
        <AuthorSearchBar onSearch={(selectedUsername: string) => { window.location.href = `/profile/${selectedUsername}` }} />
        <HStack>

          <AvatarLogin />
        </HStack>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </Box>
  )
}
