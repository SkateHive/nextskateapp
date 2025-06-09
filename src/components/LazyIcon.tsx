import { memo, Suspense, lazy } from "react";
import { Box } from "@chakra-ui/react";
import type { IconBaseProps } from "react-icons";
import { ErrorBoundary } from "react-error-boundary";

// Direct imports from react-icons
import {
  FaHome as FaHomeIcon,
  FaUser as FaUserIcon,
  FaUserPlus as FaUserPlusIcon,
  FaWallet as FaWalletIcon,
  FaBell as FaBellIcon,
  FaBook as FaBookIcon,
  FaGift as FaGiftIcon,
  FaMap as FaMapIcon,
  FaHive as FaHiveIcon,
  FaDiscord as FaDiscordIcon,
  FaMapMarkerAlt as FaMapMarkerAltIcon,
  FaTrophy as FaTrophyIcon,
  FaSpeakap as FaSpeakapIcon,
} from "react-icons/fa";

import { FaEthereum as FaEthereumIcon } from "react-icons/fa6";

import { LuPlay as LuPlayIcon, LuPause as LuPauseIcon } from "react-icons/lu";

import {
  FiMaximize as FiMaximizeIcon,
  FiMinimize as FiMinimizeIcon,
  FiVolume2 as FiVolume2Icon,
  FiVolumeX as FiVolumeXIcon,
} from "react-icons/fi";

import { ImMenu as ImMenuIcon } from "react-icons/im";
import { MdOutlineMenuBook as MdOutlineMenuBookIcon } from "react-icons/md";

// Error fallback component for icon loading failures
const IconErrorFallback = memo(
  ({ error, size }: { error: Error; size?: string | number }) => {
    console.warn("Icon loading error:", error);
    return (
      <Box
        width={size || "1em"}
        height={size || "1em"}
        bg="transparent"
        display="inline-block"
      />
    );
  }
);

IconErrorFallback.displayName = "IconErrorFallback";

// Create lazy icon components
const createLazyIcon = (IconComponent: React.ComponentType<IconBaseProps>) => {
  return lazy(() => Promise.resolve({ default: IconComponent }));
};

// Export lazy icon components
export const FaHome = createLazyIcon(FaHomeIcon);
export const FaUser = createLazyIcon(FaUserIcon);
export const FaUserPlus = createLazyIcon(FaUserPlusIcon);
export const FaWallet = createLazyIcon(FaWalletIcon);
export const FaBell = createLazyIcon(FaBellIcon);
export const FaBook = createLazyIcon(FaBookIcon);
export const FaGift = createLazyIcon(FaGiftIcon);
export const FaMap = createLazyIcon(FaMapIcon);
export const FaHive = createLazyIcon(FaHiveIcon);
export const FaEthereum = createLazyIcon(FaEthereumIcon);
export const FaDiscord = createLazyIcon(FaDiscordIcon);
export const FaMapMarkerAlt = createLazyIcon(FaMapMarkerAltIcon);
export const FaTrophy = createLazyIcon(FaTrophyIcon);
export const FaSpeakap = createLazyIcon(FaSpeakapIcon);

// Video player icons
export const LuPlay = createLazyIcon(LuPlayIcon);
export const LuPause = createLazyIcon(LuPauseIcon);
export const FiMaximize = createLazyIcon(FiMaximizeIcon);
export const FiMinimize = createLazyIcon(FiMinimizeIcon);
export const FiVolume2 = createLazyIcon(FiVolume2Icon);
export const FiVolumeX = createLazyIcon(FiVolumeXIcon);

// Mobile navbar icons
export const ImMenu = createLazyIcon(ImMenuIcon);
export const MdOutlineMenuBook = createLazyIcon(MdOutlineMenuBookIcon);

interface LazyIconWrapperProps {
  children: React.ReactNode;
  size?: string | number;
}

const IconFallback = memo(({ size }: { size?: string | number }) => (
  <Box
    width={size || "1em"}
    height={size || "1em"}
    bg="transparent"
    display="inline-block"
  />
));

IconFallback.displayName = "IconFallback";

export const LazyIconWrapper = memo(
  ({ children, size }: LazyIconWrapperProps) => (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <IconErrorFallback error={error} size={size} />
      )}
      onError={(error) => console.warn("LazyIcon error:", error)}
    >
      <Suspense fallback={<IconFallback size={size} />}>{children}</Suspense>
    </ErrorBoundary>
  )
);

LazyIconWrapper.displayName = "LazyIconWrapper";
