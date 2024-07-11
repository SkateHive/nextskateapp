import { HiveAccount } from "@/lib/models/user";
import { Box, Center, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ProfileBlog from "./ProfileBlog";
import ProfilePosts from "./ProfilePosts";
import ProfileDashboard from "./profileDashboard";
import VideoParts from "./profileVideos";

import Zine from "../Magazine/test/page";

interface ProfilePageProps {
    user: HiveAccount
}

export default function ProfileTabs({ user }: ProfilePageProps) {
    return (
        <Box justifyContent={'center'} >
            <Tabs isLazy isFitted variant="enclosed-colored">
                <TabList color={"white"} mb="1em">
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Level</Tab>
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Mag</Tab>
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Posts</Tab>
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
                    {/* <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Comments</Tab> */}

                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ProfileDashboard user={user} />
                    </TabPanel>
                    <TabPanel>
                        <Zine tag={[{ tag: user.name, limit: 20 }]} query="blog" />
                    </TabPanel>
                    <TabPanel>
                        <ProfileBlog user={user} />
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
    )
}

