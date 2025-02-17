import { PostProvider } from "@/contexts/PostContext";
import HiveClient from "@/lib/hive/hiveclient";
import PostModel from "@/lib/models/post";
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Container } from "@chakra-ui/react";

const PostContent = dynamic(() => import('./PostContent'), { ssr: false });

export async function generateMetadata({
  params,
}: {
  params: { slug: [tag: string, user: string, postId: string] };
}): Promise<Metadata> {
  let [tag, user, postId] = params.slug;
  const post = await getData(user, postId);
  const banner = JSON.parse(post.json_metadata).image;
  return {
    title: post.title,
    description: `${String(post.body).slice(0, 128)}...`,
    authors: [{ name: post.author }],
    applicationName: 'SkateHive',
    openGraph: {
      images: banner,
    },
  };
}

async function getData(user: string, postId: string) {
  const postContent = await HiveClient.database.call("get_content", [
    user.substring(3),
    postId,
  ]);
  if (!postContent) throw new Error("Failed to fetch post content");

  return postContent;
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const [tag, user, postId] = params.slug;
  const post = await getData(user, postId);
  const postData = new PostModel(post).simplify();

  return (
    <PostProvider postData={postData}>
      <Container maxW="container.md" color="white" p={4}>
        <PostContent user={user} postId={postId} />
      </Container>
    </PostProvider>
  );
}
