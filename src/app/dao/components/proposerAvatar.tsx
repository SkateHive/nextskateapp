import { Avatar } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { getENSavatar } from "../utils/getENSavatar"

interface ProposerAvatarProps {
    authorAddress: string
    boxSize?: number
}

const ProposerAvatar: React.FC<ProposerAvatarProps> = ({ authorAddress, boxSize }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const url = await getENSavatar(authorAddress)
                setAvatarUrl(url || "/infinitypepe.gif")
            } catch (error) {
                console.error(
                    "Failed to fetch avatar for address:",
                    authorAddress,
                    error
                )
                setAvatarUrl("infinitypepe.gif")
            }
        }

        if (authorAddress) {
            loadAvatar()
        }
    }, [authorAddress])

    return (
        <Avatar
            borderRadius={5}
            boxSize={boxSize || "22px"}
            src={avatarUrl || "/infinitypepe.gif"}
            name={authorAddress}
        />
    )
}


export default ProposerAvatar