"use client"

import { Discussion } from "@hiveio/dhive"
import React, { ReactElement } from "react"
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Highlight,
  Skeleton,
  StackDivider,
  VStack,
} from "@chakra-ui/react"
import Post from "./post"
import InfiniteScroll from "react-infinite-scroll-component"

interface PostsProperties {
  posts: Discussion[]
  getPosts: () => void
}

export default function Posts({
  posts,
  getPosts,
}: PostsProperties): ReactElement {
  const isLoading = Boolean(posts && posts.length)
  return (
    <VStack spacing={2} align="stretch" divider={<StackDivider />}>
      <InfiniteScroll
        dataLength={posts.length}
        next={getPosts}
        hasMore={posts.length !== 100}
        loader={
          <Flex w="100%" justify={"center"}>
            Buscando...
          </Flex>
        }
        endMessage={
          <Flex w="100%" justify={"center"}>
            <Highlight
              query=""
              styles={{ px: "2", py: "1", rounded: "full", bg: "red.100" }}
            >
              Limite de 100 posts.
            </Highlight>
          </Flex>
        }
      >
        {posts && posts.length ? (
          posts.map((post, i) => <Post key={i} post={post} />)
        ) : (
          <>
            <Post />
            <Post />
            <Post />
          </>
        )}
      </InfiniteScroll>
    </VStack>
  )
}
