// path: src/app/profile/[username]/profileTabs.tsx
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProfileDashboard from "./profileDashboard";
import { HiveAccount } from "@/lib/models/user";
import ProfileBlog from "./ProfileBlog";
import ProfilePosts from "./ProfilePosts";

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
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}

