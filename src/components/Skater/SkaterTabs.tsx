import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Zine from "../Magazine/test/page";
import ProfilePosts from "../Profile/ProfilePosts";
import VideoParts from "../Profile/profileVideos";
import { QueryProvider } from "@/contexts/QueryContext";
import ProfileDashboard from "../Profile/profileDashboard";

interface ProfilePageProps {
  user: HiveAccount;
}

export default function SkaterTabs({ user }: ProfilePageProps) {
  return (
    <QueryProvider query="blog" tag={[{ tag: user.name, limit: 20 }]}>
      <Box>
        <Tabs isLazy isFitted variant="enclosed-colored">
          <TabList color={"white"} mb="1em">
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
              Card
            </Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
              Zine
            </Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
              Posts
            </Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
              VideoParts
            </Tab>
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
