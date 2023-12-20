import { Link, Text } from "@chakra-ui/react"

export function UserProfileLink({
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
