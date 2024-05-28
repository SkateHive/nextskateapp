'use client'
import HiveClient from "@/lib/hive/hiveclient";
import { getWebsiteURL } from "@/lib/utils";
import { Link } from "@chakra-ui/next-js";
import { Avatar, SystemStyleObject } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface AuthorAvatarProps {
    username: string;
    borderRadius?: number;
    hover?: SystemStyleObject;
}

export default function AuthorAvatar({ username, borderRadius, hover }: AuthorAvatarProps) {
    const [profileImage, setProfileImage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const hiveClient = HiveClient;

            const userData = await hiveClient.database.getAccounts([String(username)]);

            if (userData.length > 0) {
                const metadata = userData[0].json_metadata ? JSON.parse(userData[0].json_metadata) : {};
                const profileImageUrl = metadata.profile?.profile_image;
                setProfileImage(profileImageUrl);
            }
        };

        fetchData();
    }, [username]);

    return (
        <Link href={`/skater/${username}`}>
            <Avatar
                name={username}
                src={profileImage || `https://images.ecency.com/webp/u/${username}/avatar/small`}
                boxSize={12}
                bg="transparent"
                loading="lazy"
                borderRadius={borderRadius || 5}
                _hover={hover || { cursor: "pointer" }}
            />
        </Link>
    );
}
