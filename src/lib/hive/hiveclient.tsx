import { Client } from "@hiveio/dhive"

const HiveClient = new Client([
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.deathwing.me"
])

export default HiveClient
