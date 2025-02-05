import { QueryProvider } from "@/contexts/QueryContext";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import Zine from "../Magazine/page";
import ProfileDashboard from "../Profile/profileDashboard";
import ProfilePosts from "../Profile/ProfilePosts";
import VideoParts from "../Profile/profileVideos";

interface ProfilePageProps {
  user: HiveAccount;
}

const tabNames = ["card", "zine", "posts", "videoparts"];

export default function SkaterTabs({ user }: ProfilePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Converting ReadonlyURLSearchParams to URLSearchParams
  const params = new URLSearchParams(searchParams?.toString() || "");

  const tab = params.get('tab');
  const tabIndex = tabNames.indexOf(tab || "card");

  const handleTabChange = (index: number) => {
    params.set('tab', tabNames[index]);
    // Updating the URL without reloading the page
    router.replace(`?${params.toString()}`);
  };

  return (
    <QueryProvider query="blog" tag={[{ tag: user.name, limit: 20 }]}>
      <Box>
        <Tabs
          isLazy
          isFitted
          variant="enclosed-colored"
          index={tabIndex >= 0 ? tabIndex : 0}
          onChange={handleTabChange}
        >
          <TabList color={"white"} mb="1em">
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Card</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Zine</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Posts</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ProfileDashboard user={user} />
            </TabPanel>
            <TabPanel>
              <Zine tag={[{ tag: user.name, limit: 20 }]} query="blog" />
            </TabPanel>
            <TabPanel>
              <ProfilePosts user={user} />
            </TabPanel>
            <TabPanel>
              <VideoParts skater={user} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </QueryProvider>
  );
}
