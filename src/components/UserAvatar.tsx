"use client";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Avatar } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUserData } from "@/contexts/UserContext";

type UserAvatarProps = {
  hiveAccount: HiveAccount;
  borderRadius?: number;
  boxSize?: number;
  size?: string | undefined;
};

export default function UserAvatar({
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

  useEffect(() => {
    const defaultAvatarUrl = `https://images.ecency.com/webp/u/${account.name}/avatar/${size}`;

    // Function to check if the Ecency avatar exists
    const checkAvatarExists = async (url: string) => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (response.ok) {
          return url;
        } else {
          return null; // Return null if the small avatar doesn't exist
        }
      } catch (error) {
        return null; // If an error occurs, return null
      }
    };

    // Function to handle avatar selection logic
    const getUserAvatar = async () => {
      // First, check if Ecency avatar exists
      const ecencyAvatar = await checkAvatarExists(defaultAvatarUrl);

      if (metadata.profile && metadata.profile.profile_image) {
        // First, check if profile image from metadata is available
        setUserAvatar(metadata.profile.profile_image);
      } else if (ecencyAvatar) {
        // Otherwise, use the Ecency avatar if it exists
        setUserAvatar(ecencyAvatar);
      } else {
        // Fallback to default larger avatar
        setUserAvatar(
          `https://images.ecency.com/webp/u/${account.name}/avatar`
        );
      }
    };

    getUserAvatar(); // Call the function to set the avatar
  }, [account.name, metadata, size]);

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
}
