'use client'
import { Button, Flex, Spinner, Stack, StackDivider, HStack, Text, Center, Container, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
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
  { label: "Follow", value: "follow" },
  { label: "Reply", value: "reply" },
  { label: "Reply Comment", value: "reply_comment" },
  { label: "All", value: "all" },
  { label: "Reblog", value: "reblog" },
  { label: "Mention", value: "mention" },
  { label: "Vote", value: "vote" }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("follow")
  const { hiveUser } = useHiveUser()

  const getNotifications = async () => {
    if (!hiveUser) return

    setLoading(true)
    const data = await getUserNotifications(hiveUser?.name, 100) // Use limit incrementally
    if (Array.isArray(data)) {
      setNotifications(data)
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

  return (
    <Container maxW="container.lg" p={0}>
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
        {/* Use Chakra UI Tabs */}
        <Tabs variant="soft-rounded" colorScheme="green" onChange={(index) => setFilter(notificationTypes[index].value)}>
          <TabList justifyContent="center">
            {notificationTypes.map((type) => (
              <Tab key={type.value}>{type.label}</Tab>
            ))}
          </TabList>

          <TabPanels>
            {notificationTypes.map((type) => (
              <TabPanel key={type.value}>
                {loading && notifications.length === 0 ? (
                  <Flex w={"100%"} justify={"center"} pt={4}>
                    <Spinner size={"lg"} />
                  </Flex>
                ) : filteredNotifications.length === 0 && !loading ? (
                  <Flex w={"100%"} justify={"center"} pt={4}>
                    <Text fontSize={"48px"} color={"white"}>
                      No notifications found for {filter}
                    </Text>
                  </Flex>
                ) : (
                  filteredNotifications.map((notification: Notification, i: number) => {
                    const [user, ...contentChunk] = notification.msg.split(" ")
                    const content = contentChunk.join(" ")
                    const post_url = `/post/${getCommunityTag()}/${notification.url}`

                    return (
                      <NotificationContent
                        username={String(hiveUser?.name)}
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
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Stack>
    </Container>
  )
}