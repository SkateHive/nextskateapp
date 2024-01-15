import { Flex, Text } from "@chakra-ui/react"

import { Remarkable } from "remarkable"

function formatMarkdownNew(markdown: string) {
  try {
    const md = new Remarkable({ html: true, linkify: true, breaks: true })
    const body = md.render(markdown)
    return body
  } catch (error) {
    console.error("Error formatting markdown:", error)
    return ""
  }
}

export default function Markdown({ content }: { content: string }) {
  const markdownPost = formatMarkdownNew(content)

  return (
    <Text
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
        iframe: {
          aspectRatio: 4 / 3,
          position: "relative!important",
        },
      }}
    />
  )
}
