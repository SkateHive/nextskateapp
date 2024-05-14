"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { getCommunityTag } from "@/lib/utils"
import { Button, Flex, Spinner, Stack, StackDivider } from "@chakra-ui/react"

import { useCallback, useEffect, useState } from "react"

import { NotificationContent } from "./components/NotificationContent"
import { getUserNotifications } from "./lib/getAccountNotification"
import { get } from "lodash"

export interface Notification {
  msg: string
  type: string
  date: string
  url: string
  user?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const { hiveUser } = useHiveUser()

  const getNotifications = async () => {
    if (!hiveUser) return

    const data = await getUserNotifications(hiveUser?.name, notifications?.length + 10)
    setNotifications(data)
  }

  useEffect(() => {
    getNotifications()
  }, [])

  const show_load_button =
    notifications?.length > 1 && notifications?.length < 100

  return (
    <Stack overflow={"auto"} sx={{
      "::-webkit-scrollbar": {
        display: "none",
      }
    }}
      gap={0} divider={<StackDivider style={{ margin: 0 }} />}>
      {notifications?.length === 0 && (
        <Flex w={"100%"} justify={"center"} pt={4}>
          <Spinner size={"lg"} />
        </Flex>
      )}
      {notifications?.map((notification: Notification, i: number) => {
        const [user, ...contentChunk] = notification.msg.split(" ")

        const content = contentChunk.join(" ")
        const post_url = `/post/${getCommunityTag()}/${notification.url}`

        return (
          <NotificationContent
            key={i}
            notification={
              {
                user: user.substring(1),
                msg: content,
                url: post_url,
                type: notification.type,
                date: notification.date,
              } as Notification
            }
          />
        )
      })}
      {show_load_button && (
        <Button my={4} onClick={getNotifications}>
          Load more
        </Button>
      )}
    </Stack>
  )
}