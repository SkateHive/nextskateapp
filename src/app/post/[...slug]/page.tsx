"use client"
import HiveClient from "@/lib/hiveclient"
import {
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Discussion } from "@hiveio/dhive"
import { CornerDownLeft } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { remark } from "remark"
import html from "remark-html"
import matter from "gray-matter"

export default function Page({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Discussion>()
  const [markdownPost, setMarkdownPost] = useState<string>("")

  const formatMarkdown = useCallback(async (markdown: string) => {
    try {
      const matterResult = matter(markdown)
      const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
      const contentHtml = processedContent.toString()
      return contentHtml
    } catch (error) {
      console.error("Error formatting markdown:", error)
      return ""
    }
  }, [])

  useEffect(() => {
    const getPost = async () => {
      try {
        const hiveClient = HiveClient()
        const queryResult = await hiveClient.database.call("get_content", [
          user.substring(3),
          postId,
        ])
        setPost(queryResult)
      } catch (error) {
        console.error("Error fetching post:", error)
      }
    }

    if (!Array.isArray(params.slug)) return
    let [tag, user, postId] = params.slug
    getPost()
  }, [params.slug])

  useEffect(() => {
    if (post?.body) {
      const formatAndSetMarkdown = async () => {
        const formattedMarkdown = await formatMarkdown(post.body)
        setMarkdownPost(formattedMarkdown)
      }
      formatAndSetMarkdown()
    }
  }, [post, formatMarkdown])

  return (
    <Container p={0}>
      <Flex m={3} align="center" justify="space-between">
        <Heading ml={3} size="2xl">
          Post
        </Heading>
        <Tooltip label="Return Home">
          <IconButton
            as={Link}
            href="/"
            aria-label="Return"
            icon={<CornerDownLeft />}
            variant="ghost"
            size="lg"
          />
        </Tooltip>
      </Flex>
      <Divider mb={3} color="darkgray" />
      <Heading m={6} size="md">
        {post?.title}
      </Heading>
      <Text
        m={6}
        as={Flex}
        flexDir="column"
        gap={4}
        dangerouslySetInnerHTML={{ __html: markdownPost }}
        sx={{
          ul: {
            marginLeft: "20px",
            listStyleType: "disc",
          },
          li: {
            marginBottom: "4px",
          },
          a: {
            textDecor: "underline",
          },
        }}
      />
    </Container>
  )
}
