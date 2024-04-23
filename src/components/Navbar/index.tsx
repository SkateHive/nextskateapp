"use client"

import AuthorSearchBar from "@/app/upload/components/searchBar"
import { useHiveUser } from "@/contexts/UserContext"
import { claimRewards } from "@/lib/hive/client-functions"
import { formatEthereumAddress } from "@/lib/web3"
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
  Icon,
  IconButton,
  Image,
  Tooltip,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react"
import { Bell, Home, HomeIcon, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FaHive, FaSpeakap, FaWallet } from "react-icons/fa"
import { FaEthereum } from "react-icons/fa6"
import { useAccount } from "wagmi"
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
  const { hiveUser } = useHiveUser()
  const [hasRewards, setHasRewards] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const ethAccount = useAccount()

  console.log({
    hiveUser,
    ethAccount,
  })

  useEffect(() => {
    if (hiveUser !== null) {
      checkRewards(setHasRewards, hiveUser)
    }
  }, [hiveUser])

  const handleClaimRewards = () => {
    if (hiveUser) {
      claimRewards(hiveUser)
    }
  }

  return (
    <Box>
      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg={"black"} color={"white"}>
          <DrawerHeader>
            {/* <DrawerHeader borderBottomWidth="1px" borderColor={"limegreen"}> */}
            <CommunityTotalPayout />
          </DrawerHeader>
          <DrawerBody display={"flex"} flexDir={"column"} gap={1}>
            <Button
              width={"100%"}
              leftIcon={<HomeIcon size={"16px"} />}
              as={Link}
              href={"/"}
              bg="black"
            >
              Home
            </Button>
            <Button
              width={"100%"}
              bg="black"
              leftIcon={<FaSpeakap size={"16px"} />}
              as={Link}
              href={`/plaza`}
            >
              Plaza
            </Button>
            <Button
              width={"100%"}
              bg="black"
              leftIcon={<FaEthereum size={"16px"} />}
              as={Link}
              href={`/dao`}
            >
              Dao
            </Button>

            {hiveUser ? (
              <>
                <Button
                  width={"100%"}
                  bg="black"
                  leftIcon={<User size={"16px"} />}
                  as={Link}
                  href={`/profile/${hiveUser.name}`}
                >
                  Profile
                </Button>
                <Button
                  width={"100%"}
                  bg="black"
                  leftIcon={<FaWallet size={"16px"} />}
                  as={Link}
                  href={`/wallet`}
                >
                  Wallet
                </Button>
                <Button
                  width={"100%"}
                  leftIcon={<Bell size={"16px"} />}
                  as={Link}
                  href={"/notifications"}
                  bg="black"
                >
                  Notifications
                </Button>
              </>
            ) : null}
            <Button
              width={"100%"}
              bg="black"
              leftIcon={
                <Icon color={hiveUser ? "red.400" : "white"} as={FaHive} />
              }
            >
              {hiveUser ? <p>{hiveUser.name}</p> : <span>Login</span>}
            </Button>
            <Button
              width={"100%"}
              bg="black"
              leftIcon={
                <Icon
                  color={ethAccount.address ? "blue.400" : "white"}
                  as={FaEthereum}
                />
              }
            >
              {ethAccount.address ? (
                formatEthereumAddress(ethAccount.address)
              ) : (
                <span>Connect</span>
              )}
            </Button>
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
