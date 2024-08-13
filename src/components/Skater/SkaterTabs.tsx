import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Zine from "../Magazine/test/page";
import ProfilePosts from "../Profile/ProfilePosts";
import VideoParts from "../Profile/profileVideos";

interface ProfilePageProps {
  user: HiveAccount;
}

export default function SkaterTabs({ user }: ProfilePageProps) {
  return (
    <Box>
      <Tabs isLazy isFitted variant="enclosed-colored">
        <TabList color={"white"} mb="1em">
          {/* <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>DashBoard</Tab> */}
          <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
            Zine
          </Tab>
          <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
            Posts
          </Tab>
          <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>
            VideoParts
          </Tab>
          {/* <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Comments</Tab> */}
        </TabList>
        <TabPanels>
          {/* <TabPanel>
                        <ProfileDashboard user={user} />
                    </TabPanel> */}
          {/* <TabPanel>
                        <ProfileBlog user={user} />
                    </TabPanel> */}
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
  );
}
