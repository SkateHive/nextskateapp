//import { getUserFromUsername } from "../services/userService"

import { Account } from "@hiveio/dhive"

interface HiveAccountMetadataProps {
  [key: string]: any
}
export interface HiveAccount extends Account {

  reputation?: number | string
  metadata?: HiveAccountMetadataProps
}

/*
export interface UserProps {
  id: number
  name: string
  created: string
  posting_json_metadata: string
}

export default class UserModel {
  id: number
  name: string
  created: string
  posting_json_metadata: string
  metadata?: UserMetadata

  constructor(user?: UserProps) {
    this.id = user?.id || 0
    this.name = user?.name || ""
    this.created = user?.created || ""
    this.posting_json_metadata = user?.posting_json_metadata || "{}"
    this.metadata = JSON.parse(this.posting_json_metadata)
  }

  simplify(): UserProps {
    return {
      id: this.id,
      name: this.name,
      created: this.created,
      posting_json_metadata: this.posting_json_metadata,
    }
  }
  static async getNewFromUsername(username: string) {
    const userData = await getUserFromUsername(username)
    return new UserModel(userData)
  }
}

interface UserMetadata {
  profile: UserProfile
}

interface UserProfile {
  website: string
  profile_image: string
  cover_image: string
  about: string
}
*/
