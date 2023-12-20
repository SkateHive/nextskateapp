"use client"

import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Tooltip,
} from "@chakra-ui/react"
import { Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import AvatarLogin from "./AvatarLogin"

function getPageName(pathname: string) {
  if (pathname === "/") return "Feed"
  if (pathname === "/notifications") return "Notifications"
  if (pathname.startsWith("/post")) return "Post"
  if (pathname.startsWith("/profile")) return "Profile"
}

export default function Navbar() {
  const pathname = usePathname()
  const pageName = getPageName(pathname)
  const router = useRouter()

  const [isHiveKeychainInstalled, setIsHiveKeychainInstalled] = useState(true)

  useEffect(() => {
    // Check if Hive Keychain extension is available
    if (typeof window !== "undefined") {
      setIsHiveKeychainInstalled(!!window.hive_keychain)
    }
  }, [])

  return (
    <nav>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          {pageName}
        </Heading>
        <Box mr={3}>
          {pathname === "/" ? (
            <AvatarLogin />
          ) : (
            <Tooltip label="Return Home">
              <IconButton
                aria-label="Home"
                icon={<Home />}
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
