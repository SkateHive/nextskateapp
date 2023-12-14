import { Client } from "@hiveio/dhive"

const client = new Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
])

export default function HiveClient() {
  return client
}
