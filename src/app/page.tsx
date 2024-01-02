import Feed from "@/components/Feed"
import { PostComponentProps } from "@/components/Post"
import { getWebsiteURL } from "@/lib/utils"

export const revalidate = 30

async function getData(threshold: number = 0): Promise<PostComponentProps[]> {
  const res = await fetch(
    getWebsiteURL() + `/api/posts?limit=${threshold + 10}`
  )
  const data = await res.json()
  return data
}

export default async function Home() {
  // const posts = await getData()
  // return <Feed postsData={posts} />
  return <Feed />
}
