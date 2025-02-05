'use client'
import FullMag from "@/components/Magazine/fullMag";
import { useEffect } from "react";

const CommunityMagPage = () => {
  useEffect(() => {
    // Disable scrolling on the entire page
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the component is unmounted
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return <FullMag tag={[{ tag: "hive-173115", limit: 33 }]} query="created" />;
};

export default CommunityMagPage;
