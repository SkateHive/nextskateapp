
export function getWebsiteURL() {
  return process.env.NEXT_PUBLIC_WEBSITE_URL || ""
}
export function getCommunityTag() {
  return process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG
}
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
export function formatETHaddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}
export function transformIPFSContent(content: string): string {
  const regex = /<iframe src="https:\/\/ipfs\.skatehive\.app\/ipfs\/([a-zA-Z0-9-?=&]+)"(?:(?!<\/iframe>).)*\sallowfullscreen><\/iframe>/g;

  return content.replace(regex, (match, videoID) => {
    return `<video controls muted loop> 
                <source src="https://ipfs.skatehive.app/ipfs/${videoID}" type="video/mp4">
                <source src="https://ipfs.skatehive.app/ipfs/${videoID}" type="video/quicktime">
            </video>`;
  });
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





export function formatDate(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor(
    (now.getTime() - postDate.getTime()) / 1000
  )

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}

