'use client'
import HiveClient from "@/lib/hive/hiveclient";
import { Link } from "@chakra-ui/next-js";
import { Avatar, SystemStyleObject } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

interface AuthorAvatarProps {
    username: string;
    borderRadius?: number;
    hover?: SystemStyleObject;
    boxSize?: number;
}

// Create a cache object to store profile images
const profileImageCache: { [key: string]: string } = {};

export default function AuthorAvatar({ username, borderRadius, hover, boxSize }: AuthorAvatarProps) {
    const [profileImage, setProfileImage] = useState("/loading.gif");

    const fetchProfileImage = useCallback(async () => {
        if (profileImageCache[username]) {
            setProfileImage(profileImageCache[username]);
        } else {
            const hiveClient = HiveClient;
            const userData = await hiveClient.database.getAccounts([String(username)]);
            if (userData.length > 0) {
                const user = userData[0];
                let profileImageUrl = "";

                if (user.posting_json_metadata) {
                    const metadata = JSON.parse(user.posting_json_metadata);
                    profileImageUrl = metadata.profile?.profile_image || "";
                }

                if (!profileImageUrl && user.json_metadata) {
                    const metadata = JSON.parse(user.json_metadata);
                    profileImageUrl = metadata.profile?.profile_image || "";
                }

                profileImageCache[username] = profileImageUrl || "/loading.gif";
                setProfileImage(profileImageUrl || "/loading.gif");
            }
        }
    }, [username]);

    useEffect(() => {
        fetchProfileImage();
    }, [fetchProfileImage]);

    return (
        <Link href={`/skater/${username}`}>
            <Avatar
                name={username}
                src={profileImage}
                boxSize={boxSize || 12}
                bg="transparent"
                loading="lazy"
                borderRadius={borderRadius || 5}
                _hover={hover || { transform: "scale(1.05)", cursor: "pointer" }}
            />
        </Link>
    );
}
