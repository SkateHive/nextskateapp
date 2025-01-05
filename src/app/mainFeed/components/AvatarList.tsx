"use client"
import AuthorAvatar from "@/components/AuthorAvatar"
import { useLastAuction } from "@/hooks/auction"
import { Avatar, Box, Link as ChakraLink, Divider, HStack, Tooltip, useDisclosure } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import AirdropModal from "./airdropModal"

interface AvatarListProps {
  sortedComments: any[]
}
const AvatarList = ({ sortedComments }: AvatarListProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loginMethod, setLoginMethod] = useState<string | null>(null)
  const eth_user = useAccount()
  const router = useRouter()
  const { data: activeAuction } = useLastAuction();
  const { isOpen: isAuctionModalOpen, onOpen: onAuctionModalOpen, onClose: onAuctionModalClose } = useDisclosure();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoginMethod(localStorage.getItem("LoginMethod"))
    }
  }, [])

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const AuctionAvatar = () => {
    return (
      <>
        <Box
          w={"40px"}
          h={"40px"}
          borderRadius={"50%"}
          bg={"gray.200"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          mr={1}
          onClick={onAuctionModalOpen}
        >
          <Tooltip
            label={activeAuction?.token?.name}
            bg={"black"}
            color={"purple"}
            border={"1px dashed purple"}
          >
           <ChakraLink
            href={`https://nouns.build/dao/base/${activeAuction?.token?.tokenContract}`}
            isExternal
          >
            <Avatar
              border={"1px dashed purple"}
              name={activeAuction?.token?.name }
              boxSize={12}
              bg="black"
              src={activeAuction?.token?.image || "/auction.gif"}
              loading="lazy"
              borderRadius={5}
              _hover={{ cursor: "pointer", border: '1px solid purple' }}
            />
          </ChakraLink>
          </Tooltip>
        </Box>

        {/* <AuctionCard isOpen={isAuctionModalOpen} onClose={onAuctionModalClose} /> */}
      </>
    );
  };

  const InviteAvatar = () => {
    return (
      <Box
        suppressHydrationWarning
        w={"40px"}
        h={"40px"}
        borderRadius={"50%"}
        bg={"gray.200"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        onClick={() => router.push("/invite")}
      >
        <Tooltip
          suppressHydrationWarning
          label={"Invite someone cool enough"}
          bg={"black"}
          color={"#A5D6A7"}
          border={"1px dashed #A5D6A7"}
        >
          <Avatar
            suppressHydrationWarning
            border={"1px dashed limegreen"}
            name="+"
            boxSize={12}
            bg="black"
            src="/loading.gif"
            borderRadius={5}
            cursor="pointer"
          />
        </Tooltip>
      </Box>
    )
  }

  const AirdropAvatar = () => {
    return (
      <>
        {isOpen && <AirdropModal sortedComments={sortedComments} isOpen={isOpen} onClose={handleCloseModal} />}

        <Box
          mr={1}
          w={"40px"}
          h={"40px"}
          borderRadius={"50%"}
          bg={"gray.200"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Tooltip
            label={"Create Community Airdrop"}
            bg={"black"}
            color={"gold"}
            border={"1px dashed gold"}
          >
            <Avatar
              onClick={() => setIsOpen(true)}
              border={"1px solid red"}
              name="community airdrop"
              boxSize={12}
              bg="black"
              src="https://i.ibb.co/cgykmcc/image.png"
              loading="lazy"
              borderRadius={5}
              _hover={{ border: "1px solid gold", cursor: "pointer" }} />
          </Tooltip>
        </Box>
      </>
    )
  }

  const NotificationsAvatar = () => {
    if (!loginMethod) {
      return null;
    }

    return (
      <Box
        w={"40px"}
        h={"40px"}
        borderRadius={"50%"}
        bg={"gray.200"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        mr={1}
        onClick={() => router.push("/notifications")}
      >
        <Tooltip
          label={"Notifications"}
          bg={"black"}
          color={"yellow"}
          border={"1px dashed yellow"}
        >
          <Avatar
            border={"1px dashed yellow"}
            name="Notifications"
            boxSize={12}
            bg="black"
            src="/Notification.gif"
            loading="lazy"
            borderRadius={5}
            _hover={{ cursor: "pointer", border: '1px dashed red' }} />
        </Tooltip>
      </Box>
    );
  };

  return (
    <HStack
      flexWrap={"nowrap"}
      w={"100%"}
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      overflowX="auto"
      minHeight={"60px"}
      px={4}
    >
      <AuctionAvatar />
      <NotificationsAvatar />
      <AirdropAvatar />
      <InviteAvatar />
      {sortedComments?.map((comment, index, commentsArray) => {
        const isDuplicate =
          commentsArray.findIndex((c) => c.author === comment.author) !==
          index
        if (isDuplicate) {
          return null
        }
        return (
          <AuthorAvatar
            username={comment.author}
            key={comment.author}
            hover={{
              zIndex: 1,
              transform: "scale(1.05)",
              border: "1px solid #A5D6A7",
            }}
            borderRadius={100}
            quality="small"
          />
        )
      })}
      <Divider />
    </HStack>
  )
}

export default AvatarList
