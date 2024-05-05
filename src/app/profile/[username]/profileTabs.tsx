// path: src/app/profile/[username]/profileTabs.tsx
import React, { useEffect } from "react";
import { Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ProfileDashboard from "./profileDashboard";
import hiveClient from "@/lib/hive/hiveclient";
import { set } from "lodash";
interface ProfilePageProps {
    params: {
        username: string
    }
}

export default async function ProfileTabs({ params }: ProfilePageProps) {



    return (
        <Box>
            <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                    <Tab>DashBoard</Tab>
                    <Tab>About</Tab>
                    <Tab>Posts</Tab>
                    <Tab>Tx History</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <ProfileDashboard />
                    </TabPanel>
                    <TabPanel>
                        <Text>{ }</Text>
                    </TabPanel>
                    <TabPanel>
                    </TabPanel>
                    <TabPanel>
                        <Text>Transfers</Text>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}

