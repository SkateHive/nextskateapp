import HiveClient from "@/lib/hive/hiveclient"
import { HiveAccount } from "@/lib/useHiveAuth"
import { useEffect, useState } from "react"

export default function useHiveAccount(username: string, initialData: HiveAccount | null = null) {
    const [hiveAccount, setHiveAccount] = useState<HiveAccount | null>(initialData)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!initialData) {
            const handleGetHiveAccount = async () => {
                setIsLoading(true)
                setError(null)
                try {
                    const userData = await HiveClient.database.getAccounts([username])
                    const userAccount: HiveAccount = {
                        ...userData[0],
                    }
                    if (userAccount.posting_json_metadata) {
                        userAccount.metadata = JSON.parse(userAccount.posting_json_metadata)
                    } else if (userAccount.json_metadata) {
                        userAccount.metadata = JSON.parse(userAccount.json_metadata)
                    } else {
                        userAccount.metadata = {}
                    }
                    setHiveAccount(userAccount)
                } catch {
                    setError("Loading account error!")
                } finally {
                    setIsLoading(false)
                }
            }
            handleGetHiveAccount()
        }
    }, [username, initialData]);
    return { hiveAccount, isLoading, error }
}
