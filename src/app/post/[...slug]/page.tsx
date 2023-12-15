"use client"
import post from "@/components/post"
import HiveClient from "@/lib/hiveclient"
import {
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Image,
  Link,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Discussion } from "@hiveio/dhive"
import { CornerDownLeft, MoreHorizontal } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { remark } from "remark"
import html from "remark-html"
import matter from "gray-matter"

export default function Page({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Discussion>()
  const [markdownPost, setMarkdownPost] = useState<string>("")
  const postMetadata = post ? JSON.parse(post.json_metadata) : {}

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
      <Flex align="center" justify="space-between">
        <Heading m={3} size="2xl">
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
      {/* <Image
        m={3}
        objectFit="cover"
        aspectRatio={16 / 9}
        src={
          (postMetadata?.image && postMetadata.image[0]) ||
          "https://ipfs.skatehive.app/ipfs/QmZEBLwMxMewYumj6k1hXqcC1STUka79kVPVR6ZHTFWATA?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE"
        }
        alt={post?.title}
        borderRadius="md"
        loading="lazy"
      /> */}
      <Heading m={1} mb={6} size="xl" textAlign="center">
        {post?.title}
      </Heading>
      <Text dangerouslySetInnerHTML={{ __html: markdownPost }} />
    </Container>
  )
}
