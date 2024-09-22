'use client'
import { HiveAccount } from "@/lib/useHiveAuth"
import { Avatar } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export default function UserAvatar({ hiveAccount, borderRadius, boxSize }: { hiveAccount: HiveAccount, borderRadius: number, boxSize: number }) {
  const [userAvatar, setUserAvatar] = useState<string>("")
  const metadata = JSON.parse(hiveAccount.posting_json_metadata || hiveAccount.json_metadata || "{}")

  useEffect(() => {
    const defaultAvatarUrl = `https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`;

    // Function to check if the Ecency avatar exists
    const checkAvatarExists = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        } else {
          return null;  // Return null if the small avatar doesn't exist
        }
      } catch (error) {
        return null; // If an error occurs, return null
      }
    };

    // Function to handle avatar selection logic
    const getUserAvatar = async () => {
      // First, check if Ecency avatar exists
      const ecencyAvatar = await checkAvatarExists(defaultAvatarUrl);

      if (ecencyAvatar) {
        // If Ecency avatar exists, use it
        setUserAvatar(ecencyAvatar);
      } else if (metadata.profile && metadata.profile.profile_image) {
        // Otherwise, check if profile image from metadata is available
        setUserAvatar(metadata.profile.profile_image);
      } else {
        // Fallback to default larger avatar
        setUserAvatar(`https://images.ecency.com/webp/u/${hiveAccount.name}/avatar`);
      }
    };

    getUserAvatar(); // Call the function to set the avatar
  }, [hiveAccount.name, metadata]);

  return (
    <Avatar
      name={hiveAccount.name}
      src={userAvatar}
      boxSize={boxSize || 12}
      bg="transparent"
      loading="lazy"
      borderRadius={borderRadius || 5}
    />
  );
}
