import { PostProvider } from "@/contexts/PostContext";
import HiveClient from "@/lib/hive/hiveclient";
import PostModel from "@/lib/models/post";
import type { Metadata, ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/react";
const InitFrameSDK = dynamic(() => import("@/hooks/init-frame-sdk"), {
  ssr: false,
});

const PostContent = dynamic(() => import("./PostContent"), { ssr: false });

export async function generateMetadata(
  { params }: { params: { slug: [tag: string, user: string, postId: string] } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let [tag, user, postId] = params.slug;
  const post = await getData(user, postId);
  // extract the images from the markdown file
  const images = post.body ? post.body.match(/!\[.*?\]\((.*?)\)/g) : [];
  const imageUrls = images
    ? images.map((img: string) => {
      const match = img.match(/\((.*?)\)/);
      return match ? match[1] : "";
    })
    : [];

  // Get banner image
  let originalBanner = post.json_metadata?.image || imageUrls[0] || [];

  // Hard-code the domain to skatehive.app to match account association payload
  const domainUrl = "https://legacy.skatehive.app";

  // Decode the user to remove URL encoding (e.g., %40 -> @)
  const decodedUser = decodeURIComponent(user);

  // Create post URL with the skatehive.app domain
  const postUrl = new URL(
    `/post/${tag}/${decodedUser}/${postId}`,
    domainUrl
  ).toString();

  // Fallback image for frames and metadata
  const fallbackImage = "https://www.skatehive.app/SKATE_HIVE_VECTOR_FIN.svg";
  const frameImage =
    (Array.isArray(imageUrls) && imageUrls[0]) ||
    (Array.isArray(originalBanner) && originalBanner[0]) ||
    fallbackImage;

  // Create frame object with compliant image URL
  const frameObject = {
    version: "next",
    imageUrl: frameImage,
    button: {
      title: "Open post",
      action: {
        type: "launch_frame", // Simplified action type
        name: "Skatehive",
        url: postUrl,
      },
    },
    postUrl: postUrl,
  };

  return {
    title: post.title,
    description: `${String(post.body).slice(0, 128)}...`,
    authors: [{ name: post.author }],
    applicationName: "SkateHive",
    openGraph: {
      url: postUrl,
      images: Array.isArray(originalBanner)
        ? originalBanner.map((img: string) => ({
          url: new URL(img, domainUrl).toString(),
          width: 1200,
          height: 630,
        }))
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: `${String(post.body).slice(0, 128)}...`,
      images: frameImage,
    },
    other: {
      // Use compliant image URL
      "fc:frame": JSON.stringify(frameObject),
      "fc:frame:image": frameImage,
      "fc:frame:post_url": postUrl,
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
    <>
      <InitFrameSDK />
      <PostProvider postData={postData}>
        <Box
          w={{ base: "100%", md: "container.md" }}
          maxW="100%"
          bg="black"
          color="white"
        >
          <PostContent user={user} postId={postId} />
        </Box>
      </PostProvider>
    </>
  );
}
