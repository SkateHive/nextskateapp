"use server"

import HiveClient from "@/lib/hiveclient"
import { UserProps } from "../models/user"
const hiveClient = HiveClient()

export async function getUserFromUsername(
  username: string
): Promise<UserProps> {
  const response = await hiveClient.database.getAccounts([username])
  if (Array.isArray(response) && response.length > 0)
    return response[0] as UserProps
  return {} as UserProps
}
