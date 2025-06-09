"use client";
import React from "react";
import { useLastAuction } from "@/hooks/auction";
import { useRouter } from "next/navigation";
import PixelTransition from "./PixelTransition";
import { Image } from "@chakra-ui/react";
const SidebarLogo = () => {
  const { data: activeAuction } = useLastAuction();
  const router = useRouter();

  return (
    <PixelTransition
      firstContent={
        <Image
          src="/SKATE_HIVE_VECTOR_FIN.svg"
          alt="SkateHive Default Logo"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onClick={() =>
            router.push(
              `https://nouns.build/dao/base/${activeAuction?.token?.tokenContract}`
            )
          }
          cursor={"pointer"}
          fetchPriority="high"
          loading="eager"
        />
      }
      secondContent={
        <Image
          src={activeAuction?.token?.image || "/SKATE_HIVE_VECTOR_FIN.svg"}
          alt="SkateHive Hover Logo"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onClick={() =>
            router.push(
              `https://nouns.build/dao/base/${activeAuction?.token?.tokenContract}`
            )
          }
          cursor={"pointer"}
        />
      }
      gridSize={12}
      pixelColor="#A8FC4E"
      animationStepDuration={0.4}
    />
  );
};

export default SidebarLogo;
