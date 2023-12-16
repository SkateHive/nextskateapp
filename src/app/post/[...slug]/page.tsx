"use client"
import HiveClient from "@/lib/hiveclient"
import { Container, Flex, Heading, Text } from "@chakra-ui/react"
import { Discussion } from "@hiveio/dhive"
import { useCallback, useEffect, useState } from "react"

import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

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
