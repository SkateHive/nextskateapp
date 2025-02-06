import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Center, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { memo } from "react";
import ProfileBlog from "./ProfileBlog";
import VideoParts from "./profileVideos";
import ProfileCard from "./profileCard";

interface ProfilePageProps {
    user: HiveAccount;
}

const tabNames = ["level", "mag", "posts", "videoparts"];

export default memo(function ProfileTabs({ user }: ProfilePageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Converting ReadonlyURLSearchParams to URLSearchParams
    const params = new URLSearchParams(searchParams?.toString() || "");  // Here we convert to a string first

    const tab = params.get('tab');
    const tabIndex = tabNames.indexOf(tab || "level");

    const handleTabChange = (index: number) => {
        params.set('tab', tabNames[index]);  // Modify the URLSearchParams instance
        router.replace(`?${params.toString()}`);  // Update the URL without reloading the page
    };

    return (
        <Box justifyContent={'center'}>
            <Tabs
                isLazy
                isFitted
                variant="enclosed-colored"
                index={tabIndex >= 0 ? tabIndex : 0}
                onChange={handleTabChange}
            >
                <TabList color={"white"} mb="1em">
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Level</Tab>
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Posts</Tab>
                    <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Center mb={3}>
                            <VStack>
                                <ProfileCard user={user} />
                            </VStack>
                        </Center>
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
    );
});
