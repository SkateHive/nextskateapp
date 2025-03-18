import { PostProvider } from "@/contexts/PostContext";
import HiveClient from "@/lib/hive/hiveclient";
import PostModel from "@/lib/models/post";
import type { Metadata, ResolvingMetadata } from 'next';
import dynamic from 'next/dynamic';
import { Box } from "@chakra-ui/react";

const PostContent = dynamic(() => import('./PostContent'), { ssr: false });

export async function generateMetadata(
  { params }: { params: { slug: [tag: string, user: string, postId: string] } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let [tag, user, postId] = params.slug;
  const post = await getData(user, postId);
  const banner = JSON.parse(post.json_metadata).image;

  // Get metadataBase from parent if available
  const parentMetadata = await parent;
  const metadataBase = parentMetadata.metadataBase || new URL('https://skatehive.app');
  //TODO: fix tested code
  const frame = {
    version: "next",
    imageUrl: banner && banner.length > 0 ? new URL(banner[0], metadataBase).toString() : 'https://www.skatehive.app/default-image.png', // Ensure imageUrl is a valid URL
    button: {
      title: "Open post",
      action: {
        type: "launch_frame",
        name: "Farcaster Frames Hive v2 Demo",
        url: `${metadataBase.origin}/post/${postId}`,
        splashImageUrl: 'https://www.skatehive.app/SKATE_HIVE_VECTOR_FIN.svg',
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };
  return {
    title: post.title,
    description: `${String(post.body).slice(0, 128)}...`,
    authors: [{ name: post.author }],
    applicationName: 'SkateHive',
    openGraph: {
      url: `${metadataBase.origin}/post/${postId}`, // Ensure absolute URL
      images: Array.isArray(banner) ? banner.map((img: string) => ({
        url: new URL(img, metadataBase).toString(),
        width: 1200,
        height: 630,
      })) : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: `${String(post.body).slice(0, 128)}...`,
      images: Array.isArray(banner) ? banner.map((img: string) => new URL(img, metadataBase).toString()) : [],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
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
      <Box w="container.md" color="white" p={4}>
        <PostContent user={user} postId={postId} />
      </Box>
    </PostProvider>
  );
}
