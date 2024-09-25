'use client';
import HiveClient from "@/lib/hive/hiveclient";
import { Avatar, SystemStyleObject } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type Quality = 'small' | 'medium' | 'large';

interface AuthorAvatarProps {
    username: string;
    borderRadius?: number;
    hover?: SystemStyleObject;
    boxSize?: number;
    quality?: Quality
}

// Create a cache object to store profile images
const profileImageCache: { [key: string]: string } = {};

export default function AuthorAvatar({ username, borderRadius, hover, boxSize, quality }: AuthorAvatarProps) {
    const [profileImage, setProfileImage] = useState("/loading.gif");
    const [userData, setUserData] = useState<any>({});

    // Helper function to check if the image exists
    const checkImageExists = async (url: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok; // Return true if the image exists
        } catch {
            return false; // Return false if an error occurs
        }
    };

    const fetchProfileImage = useCallback(async () => {
        if (profileImageCache[username]) {
            setProfileImage(profileImageCache[username]);
        } else {
            const hiveClient = HiveClient;
            const userData = await hiveClient.database.getAccounts([String(username)]);
            if (userData.length > 0) {
                const user = userData[0];
                setUserData(user);

                let profileImageUrl = "";

                if (user.posting_json_metadata) {
                    const metadata = JSON.parse(user.posting_json_metadata);
                    profileImageUrl = metadata.profile?.profile_image || "";
                }

                if (!profileImageUrl && user.json_metadata) {
                    const metadata = JSON.parse(user.json_metadata);
                    profileImageUrl = metadata.profile?.profile_image || "";
                }

                // First, check if the Ecency avatar exists
                const defaultAvatarUrl = `https://images.ecency.com/webp/u/${username}/avatar/${quality || 'small'}`;
                const ecencyAvatarExists = await checkImageExists(defaultAvatarUrl);

                // Use Ecency avatar if it exists, otherwise fallback to profile image from metadata
                const finalImageUrl = ecencyAvatarExists ? defaultAvatarUrl : profileImageUrl || defaultAvatarUrl;

                // Store the verified image URL in cache
                profileImageCache[username] = finalImageUrl;
                setProfileImage(finalImageUrl);
            }
        }
    }, [username]);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        if (inView) {
            fetchProfileImage();
        }
    }, [inView, fetchProfileImage]);

    return (
        <Avatar
            ref={ref}
            onClick={() => window.open(`/skater/${username}`, "_blank", "noreferrer noopener")}
            name={username}
            src={profileImage}
            boxSize={boxSize || 12}
            bg="transparent"
            loading="lazy"
            borderRadius={borderRadius || 5}
            _hover={hover || { transform: "scale(1.05)", cursor: "pointer" }}
        />
    );
}
