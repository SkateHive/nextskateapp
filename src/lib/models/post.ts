import { Asset, Discussion } from "@hiveio/dhive"
import { extractFirstLink, getWebsiteURL } from "../utils"
import UserModel from "./user"

export interface PostProps {
  post_id: number
  author: string
  permlink: string
  title: string
  body: string
  json_metadata: string
  created: string
  url: string
  root_title: string
  total_payout_value: Asset | string
  curator_payout_value: Asset | string
  pending_payout_value: Asset | string
  active_votes: PostActiveVotes[]
}

export default class PostModel {
  post_id: number
  author: string
  permlink: string
  title: string
  body: string
  json_metadata: string
  created: string
  url: string
  root_title: string
  total_payout_value: Asset | string
  curator_payout_value: Asset | string
  pending_payout_value: Asset | string
  active_votes: PostActiveVotes[]
  private _metadata: PostMetadata | null = null
  private _author_details: UserModel | null = null

  constructor(post?: PostProps) {
    this.post_id = post?.post_id || 0
    this.author = post?.author || ""
    this.permlink = post?.permlink || ""
    this.title = post?.title || ""
    this.body = post?.body || ""
    this.json_metadata = post?.json_metadata || "{}"
    this.created = post?.created || Date.now().toString()
    this.url = post?.url || ""
    this.root_title = post?.root_title || ""
    this.total_payout_value = post?.total_payout_value || "0.000 HBD"
    this.curator_payout_value = post?.curator_payout_value || "0.000 HBD"
    this.pending_payout_value = post?.pending_payout_value || "0.000 HBD"
    this.active_votes = post?.active_votes || []
  }

  getEarnings(): number {
    const totalPayout = parseFloat(
      this.total_payout_value.toString().split(" ")[0]
    )
    const curatorPayout = parseFloat(
      this.curator_payout_value.toString().split(" ")[0]
    )
    const pendingPayout = parseFloat(
      this.pending_payout_value.toString().split(" ")[0]
    )
    return totalPayout + curatorPayout + pendingPayout
  }

  getThumbnail(): string {
    return (
      (this.metadata().image && this.metadata().image[0]) ||
      (this.body && extractFirstLink(this.body)) ||
      ""
    )
  }

  getFullUrl(): string {
    return `${getWebsiteURL()}/post${this.url}`
  }

  getFullAuthorUrl(): string {
    return `${getWebsiteURL()}/profile/${this.author}`
  }

  simplify(): PostProps {
    return {
      post_id: this.post_id,
      author: this.author,
      permlink: this.permlink,
      title: this.title,
      body: this.body,
      json_metadata: this.json_metadata,
      created: this.created,
      url: this.url,
      root_title: this.root_title,
      total_payout_value: this.total_payout_value,
      curator_payout_value: this.curator_payout_value,
      pending_payout_value: this.pending_payout_value,
      active_votes: this.active_votes,
    }
  }

  public async authorDetails(): Promise<UserModel> {
    if (!this._author_details)
      this._author_details = await UserModel.getNewFromUsername(this.author)
    return this._author_details
  }

  metadata(): PostMetadata {
    if (!this._metadata) this._metadata = JSON.parse(this.json_metadata)
    return this._metadata as PostMetadata
  }

  static newFromDiscussion(post: Discussion): PostModel {
    return new PostModel({
      // @todo remove when the Discussion get updated with new Props
      ...post,
      post_id: (post as any).post_id,
    })
  }

  public userHasVoted(username: string) {
    return this.active_votes.some(
      (vote) => vote.voter === username && vote.percent !== "0"
    )
  }
}

export interface PostMetadata {
  app: string
  format: string
  description: string
  tags: string[]
  users: string[]
  links: string[]
  image: string[]
}

export interface PostActiveVotes {
  percent: string
  reputation: number
  rshares: number
  voter: string
}
