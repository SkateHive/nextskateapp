'use client'
import FullMag from "@/components/Magazine/fullMag";

const CommunityMagPage = () => {

  return <FullMag tag={[{ tag: "hive-173115", limit: 33 }]} query="created" />;
};

export default CommunityMagPage;
