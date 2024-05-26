// path: src/app/profile/[username]/profileTabs.tsx
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProfileDashboard from "./profileDashboard";
import { HiveAccount } from "@/lib/models/user";
import ProfileBlog from "./ProfileBlog";
import ProfilePosts from "./ProfilePosts";
import { Video } from "lucide-react";
import VideoParts from "./profileVideos";

interface ProfilePageProps {
    user: HiveAccount
}

export default async function ProfileTabs({ user }: ProfilePageProps) {

    return (
        <Box>
            <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                    <Tab>Blog</Tab>
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

