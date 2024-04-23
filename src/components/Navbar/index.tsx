"use client"

import AuthorSearchBar from "@/app/upload/components/searchBar"
import { useHiveUser } from "@/contexts/UserContext"
import { claimRewards } from "@/lib/hive/client-functions"
import { Link } from "@chakra-ui/next-js"
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  Tooltip,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import CommunityTotalPayout from "../communityTotalPayout"
import AvatarLogin from "./AvatarLogin"
import checkRewards from "./utils/checkReward"

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`

export default function Navbar() {
  const pathname = usePathname()
  const user = useHiveUser()
  const [hasRewards, setHasRewards] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={"black"} color={"white"}>
          <DrawerHeader borderBottomWidth="1px" borderColor={"limegreen"}>
            <CommunityTotalPayout />
          </DrawerHeader>
          <DrawerBody>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          <HStack>
            <Image
              onClick={onOpen}
              boxSize={"48px"}
              src="https://www.skatehive.app/assets/skatehive.jpeg"
              alt="SkateHive"
              borderRadius={"5px"}
              _hover={{ cursor: "pointer" }}
            />
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
        <AuthorSearchBar
          onSearch={(selectedUsername: string) => {
            window.location.href = `/profile/${selectedUsername}`
          }}
        />
        <HStack>
          {hasRewards && (
            <Button
              colorScheme="yellow"
              variant="outline"
              animation={`${blink} 1s linear infinite`}
              onClick={handleClaimRewards}
            >
              Claim Rewards !
            </Button>
          )}
          <AvatarLogin />
        </HStack>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </Box>
  )
}
