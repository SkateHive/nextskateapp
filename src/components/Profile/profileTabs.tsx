import { HiveAccount } from "@/lib/models/user";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ProfileBlog from "./ProfileBlog";
import ProfilePosts from "./ProfilePosts";
import VideoParts from "./profileVideos";

interface ProfilePageProps {
    user: HiveAccount
}

export default function ProfileTabs({ user }: ProfilePageProps) {
    return (
        <Box h={"100vh"} >
            <Tabs isLazy isFitted variant="enclosed">
                <TabList color={"white"} mb="1em">
                    <Tab >Blog</Tab>
                    <Tab>Posts</Tab>
                    <Tab>VideoParts</Tab>
                    <Tab>Comments</Tab>

                </TabList>
                <TabPanels>
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

