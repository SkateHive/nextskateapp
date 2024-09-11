import { QueryProvider } from "@/contexts/QueryContext";
import { HiveAccount } from "@/lib/models/user";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpointValue } from "@chakra-ui/react";
import ProfileBlog from "./ProfileBlog";
import ProfileDashboard from "./profileDashboard";
import VideoParts from "./profileVideos";

import { memo } from "react";
import Zine from "../Magazine/test/page";

interface ProfilePageProps {
    user: HiveAccount
}

export default memo(function ProfileTabs({ user }: ProfilePageProps) {
    const displayZine = useBreakpointValue({ base: 'none', lg: 'block' });

    return (
        <QueryProvider query="blog" tag={[{ tag: user.name, limit: 20 }]}>
            <Box justifyContent={'center'}>
                <Tabs isLazy isFitted variant="enclosed-colored">
                    <TabList color={"white"} mb="1em">
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Level</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }} display={displayZine}>Mag</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Posts</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <ProfileDashboard user={user} />
                        </TabPanel>
                        <TabPanel display={displayZine}>
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

