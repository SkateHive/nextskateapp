"use client"

import useAuthHiveUser from "@/lib/useHiveAuth"
import { Link } from "@chakra-ui/next-js"
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Home } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import AvatarLogin from "./AvatarLogin"
function getPageName(pathname: string) {
  if (pathname === "/") return "SkateHive"
  if (pathname === "/notifications") return "Notifications"
  if (pathname.startsWith("/post")) return "Post"
  if (pathname.startsWith("/profile")) return "Profile"
  if (pathname.startsWith("/upload")) return "Create"
}

export default function Navbar() {
  const pathname = usePathname()
  const pageName = getPageName(pathname)
  const router = useRouter()
  const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser()
  return (
    <nav>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          <HStack>
            <Image
              boxSize={"48px"}
              src="https://www.skatehive.app/assets/skatehive.jpeg"
              alt="SkateHive"
              borderRadius={"5px"}
            />
            {/* <Text>{pageName}</Text> */}
          </HStack>
        </Heading>
        <Box mr={3}>
          {pathname === "/" ? (
            <>
              <Button
                onClick={() => router.push("/upload")}
                bg={"transparent"}
                color={"white"}
                _hover={{ bg: "transparent", color: "limegreen" }}
              >
                {" "}
                + Upload 🛹
              </Button>
            </>
          ) : (
            <Tooltip label="Return Home">
              <Link href="/" scroll={false}>
                <IconButton
                  aria-label="Home"
                  icon={<Home />}
                  size="lg"
                  color={"white"}
                  bg={"transparent"}
                  _hover={{ bg: "transparent", color: "limegreen" }}
                />
              </Link>
            </Tooltip>
          )}
        </Box>
        <HStack>
          <AvatarLogin />
          <ConnectButton showBalance={false} label="Connect ETH wallet" />
        </HStack>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </nav>
  )
}
