import { calculateTimeAgo } from "@/lib/utils"
import {
  Avatar,
  Badge,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"
import { Notification } from "../page"

interface NotificationContentProps {
  notification: Notification
}

function getTypeColor(type: string) {
  if (type === "mention") return "yellow"
  if (type === "vote") return "green"
  if (type === "reply") return "blue"
}

const tranformNotificationUrl = (url: string) => {
  console.log("URL:", url)
  return url

}

export function NotificationContent({
  notification,
}: NotificationContentProps) {
  return (
    <Flex
      align={"center"}
      px={2}
      py={4}
      _hover={{ bg: "limegreen", color: "black" }}
      gap={4}
    >
      <Link href={`/profile/${notification.user}`}>
        <Avatar
          boxSize={"30px"}
          name={notification.user}
          src={`https://images.ecency.com/webp/u/${notification.user}/avatar/small`}
          borderRadius={"100%"}
        />
      </Link>
      <Stack flexGrow={1} gap={1}>
        <HStack>
          <Badge colorScheme={getTypeColor(notification.type)} fontSize="0.6em">
            {notification.type.replace("_", " ")}
          </Badge>
          <Text fontSize="14px" color="darkgray">
            ·
          </Text>
          <Text fontSize="8px" color="darkgray" fontWeight="400">
            {calculateTimeAgo(notification.date)}
          </Text>
        </HStack>
        <Text fontSize={"12px"}>
          <Link fontWeight={"bold"} href={`/profile/${notification.user}`}>
            @{notification.user}
          </Link>{" "}
          {notification.msg}
        </Text>
      </Stack>
      <Tooltip label="View post">
        <IconButton
          size={"xxs"}
          aria-label="Notification post url"
          icon={<ExternalLink color={"gray"} />}
          variant={"ghost"}
          as={Link}
          href={tranformNotificationUrl(notification.url)}
        />
      </Tooltip>
    </Flex>
  )
}
