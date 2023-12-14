"use client"

import { Discussion } from "@hiveio/dhive"
import { ReactElement } from "react"

interface PostsProperties {
  posts: Discussion[]
}

export default function Posts({ posts }: PostsProperties): ReactElement {
  console.log(posts)
  return <p>Hello world</p>
}
