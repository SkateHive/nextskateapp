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