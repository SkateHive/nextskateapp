import { PostViewProvider } from "@/contexts/PostViewContext";
import MagLayout from "./magLayout";
import SkateCast from "./mainFeed/page";
export default function Home() {
  return (
    <PostViewProvider>
      <SkateCast />
      <MagLayout />
    </PostViewProvider>
  );
}
