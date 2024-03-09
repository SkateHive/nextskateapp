"use client"

import { Link } from "@chakra-ui/next-js"
import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Tooltip,
  Image,
  HStack,
  Text,
} from "@chakra-ui/react"
import { Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import AvatarLogin from "./AvatarLogin"

function getPageName(pathname: string) {
  if (pathname === "/") return "SkateHive"
  if (pathname === "/notifications") return "Notifications"
  if (pathname.startsWith("/post")) return "Post"
  if (pathname.startsWith("/profile")) return "Profile"
}

export default function Navbar() {
  const pathname = usePathname()
  const pageName = getPageName(pathname)
  const router = useRouter()

  return (
    <nav>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          <HStack>

            <Image boxSize={"48px"} src="https://www.skatehive.app/assets/skatehive.jpeg" alt="SkateHive" />
            <Text>
              {pageName}
            </Text>
          </HStack>
        </Heading>
        <Box mr={3}>
          {pathname === "/" ? (
            <AvatarLogin />
          ) : (
            <Tooltip label="Return Home">
              <Link href="/" scroll={false}>
                <IconButton
                  aria-label="Home"
                  icon={<Home />}
                  variant="ghost"
                  size="lg"
                />
              </Link>
            </Tooltip>
          )}
        </Box>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </nav>
  )
}
