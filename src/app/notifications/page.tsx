'use client';
import {
  Button,
  Flex,
  Spinner,
  Stack,
  StackDivider,
  HStack,
  Text,
  Center,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useHiveUser } from "@/contexts/UserContext";
import { getCommunityTag } from "@/lib/utils";
import { NotificationContent } from "./components/NotificationContent";
import { getUserNotifications } from "./lib/getAccountNotification";
import TransationHistory from "./components/TransactionHistory";

export interface Notification {
  msg: string;
  type: string;
  date: string;
  url: string;
  user?: string;
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
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("follow");
  const { hiveUser } = useHiveUser();

  const getNotifications = async () => {
    if (!hiveUser) return;

    setLoading(true);
    try {
      const data = await getUserNotifications(hiveUser?.name, 100); // Use limit incrementally
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications, data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications();
  }, [hiveUser]);

  // Handle filtering of notifications
  useEffect(() => {
    if (filter === "all") {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter((n) => n.type === filter));
    }
  }, [filter, notifications]);

  return (
    <Container maxW="container.lg" p={0}>
      <Stack
        w={"100%"}
        h={"100vh"}
        overflow={"auto"}
        sx={{
          "::-webkit-scrollbar": {
            display: "none"
          }
        }}
        gap={0}
        divider={<StackDivider style={{ margin: 0 }} />}
      >
        {/* Use Chakra UI Tabs */}
        <Tabs
          isLazy
          variant="enclosed"
          color="white"
          onChange={(index) => {
            if (index === 0) {
              // Tips Tab
              setFilter("all");
            } else {
              setFilter(notificationTypes[index - 1].value);
            }
          }}
        >
          <TabList justifyContent="center" mt={5} color={"limegreen"}>
            <Tab _selected={{ bg: "limegreen", color: "black" }}>Tips</Tab>
            {notificationTypes.map((type) => (
              <Tab _selected={{ bg: "limegreen", color: "black" }} key={type.value}>
                {type.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* Tips Panel */}
            <TabPanel>
              <TransationHistory />
            </TabPanel>
            {notificationTypes.map((type) => (
              <TabPanel key={type.value}>
                {loading ? (
                  <Flex w={"100%"} justify={"center"} pt={4}>
                    <Spinner size={"lg"} />
                  </Flex>
                ) : filteredNotifications.length === 0 ? (
                  <Flex w={"100%"} justify={"center"} pt={4}>
                    <Text fontSize={"48px"} color={"white"}>
                      No notifications found for {filter}
                    </Text>
                  </Flex>
                ) : (
                  filteredNotifications.map((notification: Notification, i: number) => {
                    const [user, ...contentChunk] = notification.msg.split(" ");
                    const content = contentChunk.join(" ");
                    const post_url = `/post/${getCommunityTag()}/${notification.url}`;

                    return (
                      <NotificationContent
                        username={String(hiveUser?.name)}
                        key={i}
                        notification={{
                          user: user.substring(1),
                          msg: content,
                          url: post_url,
                          type: notification.type,
                          date: notification.date
                        }}
                      />
                    );
                  })
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Stack>
    </Container>
  );
}
