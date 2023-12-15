"use client"
import Posts from "@/components/posts"
import HiveClient from "@/lib/hiveclient"
import {
  Button,
  Container,
  Divider,
  Heading,
  Skeleton,
  Stack,
} from "@chakra-ui/react"

import { Discussion } from "@hiveio/dhive"
import { useEffect, useState } from "react"

const SKATEHIVE_TAG = "hive-173115"
const SKATEHIVE_QUERY = "created"

export default function Home() {
  const [posts, setPosts] = useState<Discussion[]>([])

  const hiveClient = HiveClient()
  const getPosts = async () => {
    const queryResult = await hiveClient.database.getDiscussions(
      SKATEHIVE_QUERY,
      {
        tag: SKATEHIVE_TAG,
        limit: posts.length + 10,
      }
    )
    if (queryResult?.length) setPosts(queryResult)
    console.log(queryResult)
  }

  useEffect(() => {
    getPosts()
  }, [])

  return (
    <main>
      <Container p={0} overflow="visible">
        <Heading m={3} size="2xl">
          Feed
        </Heading>
        <Divider mb={3} color="darkgray" />
        <Posts posts={posts} getPosts={getPosts} />
      </Container>
    </main>
  )
}
