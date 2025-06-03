"use client";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Avatar } from "@chakra-ui/react";
import { useEffect, useState, useCallback, memo } from "react";
import { useUserData } from "@/contexts/UserContext";

type UserAvatarProps = {
  hiveAccount: HiveAccount;
  borderRadius?: number;
  boxSize?: number;
  size?: string | undefined;
};

// Avatar cache to prevent duplicate API calls
const avatarCache = new Map<string, string>();

const UserAvatar = memo(function UserAvatar({
  hiveAccount,
  borderRadius,
  boxSize,
  size = "small",
}: UserAvatarProps) {
  const hiveUser = useUserData();
  const [userAvatar, setUserAvatar] = useState<string>("");
  const account = hiveUser || hiveAccount;
  const metadata = JSON.parse(
    account.posting_json_metadata || account.json_metadata || "{}"
  );

  // Memoized avatar check function
  const checkAvatarExists = useCallback(
    async (url: string): Promise<string | null> => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok ? url : null;
      } catch (error) {
        return null;
      }
    },
    []
  );

  // Memoized avatar selection function
  const getUserAvatar = useCallback(async () => {
    const cacheKey = `${account.name}-${size}`;

    // Check cache first
    if (avatarCache.has(cacheKey)) {
      setUserAvatar(avatarCache.get(cacheKey)!);
      return;
    }

    const defaultAvatarUrl = `https://images.ecency.com/webp/u/${account.name}/avatar/${size}`;
    const ecencyAvatar = await checkAvatarExists(defaultAvatarUrl);

    let finalAvatarUrl: string;

    if (metadata.profile && metadata.profile.profile_image) {
      finalAvatarUrl = metadata.profile.profile_image;
    } else if (ecencyAvatar) {
      finalAvatarUrl = ecencyAvatar;
    } else {
      finalAvatarUrl = `https://images.ecency.com/webp/u/${account.name}/avatar`;
    }

    // Cache the result
    avatarCache.set(cacheKey, finalAvatarUrl);
    setUserAvatar(finalAvatarUrl);
  }, [account.name, metadata, size, checkAvatarExists]);

  useEffect(() => {
    getUserAvatar();
  }, [getUserAvatar]);

  return (
    <Avatar
      name={account.name}
      src={userAvatar}
      boxSize={boxSize || 12}
      bg="transparent"
      loading="lazy"
      borderRadius={borderRadius || 5}
    />
  );
});

export default UserAvatar;
