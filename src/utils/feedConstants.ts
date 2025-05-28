import { FaHistory, FaMoneyBill } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { SortMethod } from "./feedUtils";
import { APP_CONFIG } from "@/lib/config";

export interface SortOption {
  key: SortMethod;
  label: string;
  icon: React.ComponentType;
}

export const SORT_OPTIONS: SortOption[] = [
  {
    key: "chronological",
    label: "Latest",
    icon: FaHistory,
  },
  {
    key: "payout",
    label: "Payout",
    icon: FaMoneyBill,
  },
  {
    key: "engagement",
    label: "Engagement",
    icon: FaArrowRightArrowLeft,
  },
];

export const SCROLL_CONFIG = {
  THRESHOLD: APP_CONFIG.MAIN_FEED.SCROLL_THRESHOLD,
  POSTS_INCREMENT: APP_CONFIG.MAIN_FEED.POSTS_INCREMENT,
  INITIAL_POSTS: APP_CONFIG.MAIN_FEED.INITIAL_VISIBLE_POSTS,
} as const;
