import { Account } from "@hiveio/dhive"

interface HiveAccountMetadataProps {
  [key: string]: any
}
export interface HiveAccount extends Account {

  reputation?: number | string
  metadata?: HiveAccountMetadataProps
}


