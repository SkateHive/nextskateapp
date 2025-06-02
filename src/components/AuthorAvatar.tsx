"use client";
import React from "react";
import HiveClient from "@/lib/hive/hiveclient";
import { Avatar, SystemStyleObject } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { IMAGE_SIZES } from "@/lib/constants";

type Quality = "small" | "medium" | "large";

interface AuthorAvatarProps {
  username: string;
  borderRadius?: number;
  hover?: SystemStyleObject;
  boxSize?: number;
  quality?: Quality;
}

// cache in memory
const profileImageCache: Map<string, string> = new Map();

function checkImageExists(url: string): Promise<boolean> {
  return fetch(url, { method: "HEAD" })
    .then((response) => response.ok)
    .catch(() => false); // Retorna falso em caso de erro
}

const AuthorAvatar = React.memo(function AuthorAvatar({
  username,
  borderRadius,
  hover,
  boxSize,
  quality,
}: AuthorAvatarProps) {
  const [profileImage, setProfileImage] = useState(
    `/loading.gif?w=${IMAGE_SIZES.LOADING_MEDIUM.width}&h=${IMAGE_SIZES.LOADING_MEDIUM.height}`
  );
  const [isLoading, setIsLoading] = useState(true);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fetchProfileImage = useCallback(async () => {
    // If the image is already cached, return it
    if (profileImageCache.has(username)) {
      setProfileImage(profileImageCache.get(username)!);
      setIsLoading(false);
      return;
    }

    // Use HiveClient to get user data
    const hiveClient = HiveClient;
    const userData = await hiveClient.database.getAccounts([String(username)]);
    if (userData.length > 0) {
      const user = userData[0];

      let profileImageUrl = "";

      // Check if the metadata has the profile image
      if (user.posting_json_metadata) {
        const metadata = JSON.parse(user.posting_json_metadata);
        profileImageUrl = metadata.profile?.profile_image || "";
      }

      if (!profileImageUrl && user.json_metadata) {
        const metadata = JSON.parse(user.json_metadata);
        profileImageUrl = metadata.profile?.profile_image || "";
      }

      const defaultAvatarUrl = `https://images.ecency.com/webp/u/${username}/avatar/${quality || "small"}`;

      const ecencyAvatarExists = await checkImageExists(defaultAvatarUrl);

      const finalImageUrl = ecencyAvatarExists
        ? defaultAvatarUrl
        : profileImageUrl || defaultAvatarUrl;

      profileImageCache.set(username, finalImageUrl);

      setProfileImage(finalImageUrl);
      setIsLoading(false);
    }
  }, [username, quality]);

  useEffect(() => {
    if (inView) {
      fetchProfileImage();
    }
  }, [inView, fetchProfileImage]);

  return (
    <Avatar
      ref={ref}
      onClick={() =>
        window.open(`/skater/${username}`, "_blank", "noreferrer noopener")
      }
      name={username}
      src={isLoading ? "/loading.gif" : profileImage}
      boxSize={boxSize || 12}
      bg="transparent"
      loading="lazy"
      borderRadius={borderRadius || 5}
      cursor="pointer"
      _hover={hover || { transform: "scale(1.05)", cursor: "pointer" }}
    />
  );
});

export default AuthorAvatar;
