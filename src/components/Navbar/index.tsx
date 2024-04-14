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
  Button,
} from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"
import AvatarLogin from "./AvatarLogin"
import AuthorSearchBar from "@/app/upload/components/searchBar"
import { FaGift } from "react-icons/fa"
import { useHiveUser, HiveUserContextProps } from "@/contexts/UserContext"
import { claimRewards } from "@/lib/hive/client-functions"
import { use, useEffect, useState } from "react"
import { has } from "lodash"
import { AuthUser, HiveAccount } from "@/lib/useHiveAuth"
import { keyframes } from "@chakra-ui/react";
import checkRewards from "./utils/checkReward"


const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;

export default function Navbar() {
  const pathname = usePathname()
  const user = useHiveUser()
  const [hasRewards, setHasRewards] = useState(false);

  useEffect(() => {
    if (user.hiveUser !== null) {
      checkRewards(setHasRewards, user.hiveUser)
    }
  }, [user.hiveUser])

  const handleClaimRewards = () => {
    if (user.hiveUser) {
      claimRewards(user.hiveUser)
    }
  }

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
          {hasRewards &&
            <Button
              colorScheme="yellow"
              variant="outline"
              animation={`${blink} 1s linear infinite`}
              onClick={handleClaimRewards}
            >
              Claim Rewards !
            </Button>
          }
          <AvatarLogin />
        </HStack>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </Box>
  )
}

