import { HiveAccount } from "@/lib/models/user";
import { Box, Center, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ProfileBlog from "./ProfileBlog";
import ProfilePosts from "./ProfilePosts";
import ProfileDashboard from "./profileDashboard";
import VideoParts from "./profileVideos";
import { QueryProvider, useQueryResult } from "@/contexts/QueryContext";

import Zine from "../Magazine/test/page";
import { memo } from "react";

interface ProfilePageProps {
    user: HiveAccount
}

export default memo(function ProfileTabs({ user }: ProfilePageProps) {
    return (
        <QueryProvider query="blog" tag={[{ tag: user.name, limit: 20 }]}>
            <Box justifyContent={'center'}>
                <Tabs isLazy isFitted variant="enclosed-colored">
                    <TabList color={"white"} mb="1em">
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Level</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Mag</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Posts</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <ProfileDashboard user={user} />
                        </TabPanel>
                        <TabPanel>
                            <Zine tag={[{ tag: user.name, limit: 10 }]} query="blog" />
                        </TabPanel>
                        <TabPanel>
                            <ProfileBlog user={user} />
                        </TabPanel>
                        <TabPanel>
                            <VideoParts skater={user} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </QueryProvider>
    );
});

