import HiveClient from "@/lib/hiveclient"
import useSWR from "swr"

export const SWR_POST_COMMENTS_TAG = "comments"

export interface Comment {
  abs_rshares: number
  active_votes: ActiveVote[]
  allow_curation_rewards: boolean
  allow_replies: boolean
  allow_votes: boolean
  author: string
  author_reputation: number
  author_rewards: number
  beneficiaries: any[]
  body: string
  body_length: number
  cashout_time: string
  category: string
  children: number
  children_abs_rshares: number
  created: string
  curator_payout_value: string
  depth: number
  id: number
  json_metadata: string
  last_payout: string
  last_update: string
  max_accepted_payout: string
  max_cashout_time: string
  net_rshares: number
  net_votes: number
  parent_author: string
  parent_permlink: string
  pending_payout_value: string
  percent_hbd: number
  permlink: string
  promoted: string
  reblogged_by: any[]
  replies: any[]
  reward_weight: number
  root_author: string
  root_permlink: string
  root_title: string
  title: string
  total_payout_value: string
  total_pending_payout_value: string
  total_vote_weight: number
  url: string
  vote_rshares: number
}

export interface ActiveVote {
  percent: number
  reputation: number
  rshares: number
  time: string
  voter: string
  weight: number
}

export async function fetchComments(
  author: string,
  permlink: string
): Promise<Comment[]> {
  const comments = await HiveClient.database.call("get_content_replies", [
    author,
    permlink,
  ])
  return comments as Comment[]
}

export function useComments(author: string, permlink: string) {
  console.log(author, permlink)
  const {
    data: comments,
    error,
    isLoading,
  } = useSWR(`${SWR_POST_COMMENTS_TAG}/${permlink}`, () =>
    fetchComments(author, permlink)
  )

  return {
    comments,
    error,
    isLoading,
  }
}
