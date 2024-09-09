'use client'
import { Button, Flex, Spinner, Stack, StackDivider, HStack, Text, Center } from "@chakra-ui/react"
import { useEffect, useState, useCallback } from "react"
import debounce from "lodash/debounce"
import { useHiveUser } from "@/contexts/UserContext"
import { getCommunityTag } from "@/lib/utils"
import { NotificationContent } from "./components/NotificationContent"
import { getUserNotifications } from "./lib/getAccountNotification"

export interface Notification {
  msg: string
  type: string
  date: string
  url: string
  user?: string
}

// List of all possible notification types
const notificationTypes = [
  "follow", "reply_comment", "reply", "all", "reblog", "mention", "vote"
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("reply")
  const { hiveUser } = useHiveUser()

  const getNotifications = async () => {
    if (!hiveUser) return

    setLoading(true)
    const data = await getUserNotifications(hiveUser?.name, 100) // Use limit incrementally
    if (Array.isArray(data)) {
      setNotifications((prevNotifications) => [...prevNotifications, ...data])
    } else {
      console.error("Failed to fetch notifications, data is not an array:", data)
    }
    setLoading(false)
  }

  useEffect(() => {
    getNotifications()
  }, [hiveUser])

  // Handle filtering of notifications
  useEffect(() => {
    if (filter === "all") {
      setFilteredNotifications(notifications)
    } else {
      setFilteredNotifications(notifications.filter((n) => n.type === filter))
    }
  }, [filter, notifications])

  const handleLoadMore = useCallback(
    debounce(() => {
      getNotifications()
    }, 500),
    [getNotifications]
  )

  // const show_load_button = notifications?.length > 0 && notifications?.length < 100 // Assuming 100 as the max limit

  return (
    <Stack
      w={"100%"}
      h={"100vh"}
      overflow={"auto"}
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
      gap={0}
      divider={<StackDivider style={{ margin: 0 }} />}
    >
      {/* Filter buttons */}
      <HStack justify="center" py={4} spacing={4}>
        {notificationTypes.map((type) => (
          <Button
            key={type}
            onClick={() => setFilter(type)}
            colorScheme={filter === type ? "green" : "gray"}
          >
            {type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </HStack>

      {loading && notifications?.length === 0 ? (
        <Flex w={"100%"} justify={"center"} pt={4}>
          <Spinner size={"lg"} />
        </Flex>
      ) : filteredNotifications?.length === 0 && !loading ? (
        <Flex w={"100%"} justify={"center"} pt={4}>
          <Text fontSize={'48px'} color={'white'}>No notifications found for {filter}</Text>
        </Flex>
      ) : (
        filteredNotifications?.map((notification: Notification, i: number) => {
          const [user, ...contentChunk] = notification.msg.split(" ")
          const content = contentChunk.join(" ")
          const post_url = `/post/${getCommunityTag()}/${notification.url}`

          return (
            <NotificationContent
              key={i}
              notification={{
                user: user.substring(1),
                msg: content,
                url: post_url,
                type: notification.type,
                date: notification.date,
              }}
            />
          )
        })
      )}
      {/* {show_load_button && (
        <Center>
          <Button w={"100px"} my={4} onClick={handleLoadMore} variant={"outline"} colorScheme={"green"}>
            Load more
          </Button>
        </Center>
      )} */}
    </Stack>
  )
}
