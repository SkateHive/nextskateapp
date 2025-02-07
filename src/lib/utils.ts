import { Comment } from "@/app/mainFeed/page"
import { isNaN } from "lodash"
import HiveClient from "./hive/hiveclient"
import * as url from "url"

export function getWebsiteURL() {
  return process.env.NEXT_PUBLIC_WEBSITE_URL || ""
}
export function getCommunityTag() {
  return process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG
}
export const getTotalPayout = (comment: Comment): number => {
  const payout = parseFloat(comment.total_payout_value?.split(" ")[0] || "0");
  const pendingPayout = parseFloat(comment.pending_payout_value?.split(" ")[0] || "0");
  const curatorPayout = parseFloat(comment.curator_payout_value?.split(" ")[0] || "0");
  return payout + pendingPayout + curatorPayout;
};
export function calculateTimeAgo(date: string): string {
  const currentUTCDate = new Date()
  const seconds = Math.floor(
    (currentUTCDate.getTime() - new Date(date + "Z").getTime()) / 1000
  )
  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + "y"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + "mo"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + "d"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + "h"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + "m"
  }
  return Math.floor(seconds) + "s"
}
export function extractFirstLink(markdownText: string): string | null {
  const regex = /!\[.*?\]\((.*?)\)/
  const match = markdownText.match(regex)
  return match ? match[1] : null
}
export function calculateHumanReadableReputation(rep: number) {
  if (rep === 0) {
    return 25
  }

  const neg = rep < 0
  const repLevel = Math.log10(Math.abs(rep))
  let reputationLevel = Math.max(repLevel - 9, 0)

  if (reputationLevel < 0) {
    reputationLevel = 0
  }

  if (neg) {
    reputationLevel *= -1
  }

  reputationLevel = reputationLevel * 9 + 25

  return Math.floor(reputationLevel)
}
export function transform3SpeakContent(content: string): string {
  const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9-_]+\/[a-zA-Z0-9]+))\)/;
  const match = content.match(regex);

  if (match) {
    const videoID = match[3];
    const iframe = `<iframe src="https://3speak.tv/embed?v=${videoID}" ></iframe>`;
    content = content.replace(regex, iframe);
  }
  return content;
}
export function formatDate(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor(
    (now.getTime() - postDate.getTime()) / 1000
  )

  if (!date || diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return isNaN(days) ? "Just now" : `${days}d` // @todo remove after CommentItem any prop refactor
  }
}
export function formatETHaddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}
export function transformEcencyImages(content: string): string {
  const regex = /https:\/\/images\.ecency\.com\/p\/([\w-?=&.]+)/g;

  return content.replace(regex, (match, imagePath) => {
    return `![Image](https://images.ecency.com/p/${imagePath})`;
  });
}
export function transformShortYoutubeLinksinIframes(content: string) {
  const regex = /https:\/\/youtu\.be\/([a-zA-Z0-9-_?=&]+)/g;
  return content.replace(regex, (match, videoID) => {
    return `<iframe src="https://www.youtube.com/embed/${videoID}" allowfullscreen></iframe>`;
  });
}
export function transformNormalYoutubeLinksinIframes(content: string) {
  const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9-_?=&]+)/g;
  return content.replace(regex, (match, videoID) => {
    return `<iframe src="https://www.youtube.com/embed/${videoID}" allowfullscreen></iframe>`;
  });
}
export function autoEmbedZoraLink(content: string) {
  const regex = /https:\/\/zora\.co\/collect\/([^\/\s?]+)(?:\/([^\/\s?]+))?(?:\?referrer=([^\/\s]+))?/g;
  const iframeRegex = /<iframe.*?src=["']https:\/\/zora\.co\/collect\/.*?["']/g;

  // Check if the content already contains the correct iframe
  if (iframeRegex.test(content)) {
    return content;
  }

  return content.replace(regex, (fullMatch, tokenId, extraPath, referrer) => {
    // Construct embed URL dynamically
    const embedUrl = `https://zora.co/collect/${tokenId}${extraPath ? `/${extraPath}` : ''}/embed${referrer ? `?referrer=${referrer}` : ''}`;

    console.log("Constructed Embed URL:", embedUrl);

    // Return iframe embed code
    return `<iframe src="${embedUrl}" style="border:0;background-color:black;position:relative;inset:0" width="100%" height="300px" allowtransparency="true" allowfullscreen="true" sandbox="allow-pointer-lock allow-same-origin allow-scripts allow-popups"></iframe>`;
  });
}
export async function fetchSkateHivePostMetadata(postId: string, username: string) {
  try {
    const post = await HiveClient.database.call('get_content', [
      username,  // No need to trim the username if it already has the right format
      postId,
    ]);
    return post;
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return null;
  }
}
export type MediaItem = {
  type: 'image' | 'video';
  subtitle?: string;
  url: string;
};
export const extractMediaItems = (markdown: string): MediaItem[] => {
  const imageMarkdownRegex = /!\[.*?\]\((.*?)\)/g;
  const imageHtmlRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const iframeRegex = /<iframe[^>]+src="([^"]+)"[^>]*>/g;
  const mediaItems: MediaItem[] = [];

  let match;
  while ((match = imageMarkdownRegex.exec(markdown))) {
    mediaItems.push({ type: 'image', url: match[1] });
  }
  while ((match = imageHtmlRegex.exec(markdown))) {
    mediaItems.push({ type: 'image', url: match[1] });
  }
  while ((match = iframeRegex.exec(markdown))) {
    mediaItems.push({ type: 'video', url: match[1] });
  }
  return mediaItems;
};
export interface LinkWithDomain {
  url: string
  domain: string
}
export function extractLinksFromMarkdown(
  markdownContent: string
): LinkWithDomain[] {
  const linkRegex = /!\[.*?\]\((.*?)\)/g
  const links = markdownContent.match(linkRegex) || []

  const linksWithDomains: LinkWithDomain[] = links.map((link) => {
    const urlMatch = link.match(/\[.*?\]\((.*?)\)/)
    const fullUrl = urlMatch ? urlMatch[1] : ""
    const parsedUrl = url.parse(fullUrl)
    const domain = parsedUrl.hostname || ""
    return { url: fullUrl, domain }
  })

  return linksWithDomains
}
export function extractIFrameLinks(htmlContent: string): LinkWithDomain[] {
  const iframeRegex = /<iframe.*?src=["']([^"']*)["']/gi
  const iframes = htmlContent.match(iframeRegex) || []

  const iframeWithDomains: LinkWithDomain[] = iframes.map((iframe) => {
    const srcMatch = iframe.match(/src=["']([^"']*)["']/)
    const fullSrc = srcMatch ? srcMatch[1] : ""
    const parsedSrc = url.parse(fullSrc)
    const domain = parsedSrc.hostname || ""
    return { url: fullSrc, domain }
  })

  return iframeWithDomains
}
export function extractCustomLinks(inputText: string): LinkWithDomain[] {
  const customLinkRegex = /https:\/\/3speak\.tv\/watch\?v=[\w\d\-\/]+/gi
  const customLinks = inputText.match(customLinkRegex) || []

  const customLinkSet = new Set<string>()
  const customLinksWithDomains: LinkWithDomain[] = []

  for (const link of customLinks) {
    if (!customLinkSet.has(link)) {
      customLinkSet.add(link)
      const parsedUrl = new URL(link)
      const domain = parsedUrl.hostname || ""
      customLinksWithDomains.push({
        url: link.replace("watch", "embed"),
        domain,
      })
    }
  }

  return customLinksWithDomains
}
export function extractSubtitle(markdown: string): string {
  // Remove markdown image syntax, HTML image tags, and iframes, then trim the remaining text.
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<img[^>]+>/g, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/g, '')
    .trim();
}

