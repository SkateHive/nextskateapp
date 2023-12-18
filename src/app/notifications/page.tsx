"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { calculateTimeAgo, getCommunityTag } from "@/lib/utils"
import {
  Avatar,
  Badge,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  StackDivider,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"

import { useCallback, useEffect, useState } from "react"

async function getData(username: string) {
  const requestBody = {
    jsonrpc: "2.0",
    method: "bridge.account_notifications",
    params: {
      account: username,
      limit: 15,
    },
    id: new Date().getTime(),
  }

  // Make the Fetch request
  const response = await fetch("https://api.hive.blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  return await response.json()
}

function getTypeColor(type: string) {
  if (type === "mention") return "yellow"
  if (type === "vote") return "green"
  if (type === "reply") return "blue"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const { hiveUser } = useHiveUser()

  const getNotifications = useCallback(async () => {
    if (!hiveUser) throw new Error("No user was found")

    const data = await getData(hiveUser.name)
    if (!data.result) return

    console.log(data)
    setNotifications(data.result)
  }, [hiveUser])

  useEffect(() => {
    getNotifications()
  }, [getNotifications])

  return (
    <Stack gap={0} divider={<StackDivider style={{ margin: 0 }} />}>
      {notifications.map(
        (
          notification: {
            msg: string
            type: string
            date: string
            url: string
          },
          i: number
        ) => {
          const [user, ...contentChunk] = notification.msg.split(" ")
          const content = contentChunk.join(" ")
          const post_url = `/post/${getCommunityTag()}/${notification.url}`

          return (
            <Flex
              align={"center"}
              as={Link}
              href={post_url}
              key={i}
              px={2}
              py={4}
              _hover={{ bg: "gray.50", textDecor: "none" }}
              gap={4}
            >
              <Link href={`/profile/${user.substring(1)}`}>
                <Avatar
                  name={user.substring(1)}
                  src={`https://images.ecency.com/webp/u/${user.substring(
                    1
                  )}/avatar/small`}
                  borderRadius={"100%"}
                />
              </Link>
              <Stack flexGrow={1} gap={1}>
                <HStack>
                  <Badge
                    colorScheme={getTypeColor(notification.type)}
                    fontSize="0.8em"
                  >
                    {notification.type}
                  </Badge>
                  <Text fontSize="14px" color="darkgray">
                    ·
                  </Text>
                  <Text fontSize="14px" color="darkgray" fontWeight="400">
                    {calculateTimeAgo(notification.date)}
                  </Text>
                </HStack>
                <NotificationContent user={user} content={content} />
              </Stack>
              <Tooltip label="View post">
                <IconButton
                  aria-label="Notification post url"
                  icon={<ExternalLink color={"gray"} />}
                  variant={"ghost"}
                />
              </Tooltip>
            </Flex>
          )
        }
      )}
    </Stack>
  )
}

function NotificationContent({
  user,
  content,
}: {
  user: string
  content: string
}) {
  return (
    <Text>
      <Link fontWeight={"bold"} href={`/profile/${user.substring(1)}`}>
        {user}
      </Link>{" "}
      {content}
    </Text>
  )
}
