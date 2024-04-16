import { Avatar } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { getENSavatar } from "../getENSavatar"

interface ProposerAvatarProps {
    authorAddress: string
}

const ProposerAvatar: React.FC<ProposerAvatarProps> = ({ authorAddress }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const url = await getENSavatar(authorAddress)
                setAvatarUrl(url || "/infinitypepe.gif") // Ensure fallback to a default avatar if none is found
            } catch (error) {
                console.error(
                    "Failed to fetch avatar for address:",
                    authorAddress,
                    error
                )
                setAvatarUrl("infinitypepe.gif") // Use default avatar on error
            }
        }

        if (authorAddress) {
            loadAvatar()
        }
    }, [authorAddress])

    return (
        <Avatar
            borderRadius={5}
            boxSize={"22px"}
            src={avatarUrl || "/infinitypepe.gif"}
            name={authorAddress}
        />
    )
}


export default ProposerAvatar