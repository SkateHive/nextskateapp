import React from "react";
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import LoadingComponent from "@/components/MainFeed/components/loadingComponent";

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      bg="black"
      zIndex={10}
    >
      <LoadingComponent />
    </Box>
  );
};

export default LoadingOverlay;
