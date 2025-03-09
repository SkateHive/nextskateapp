import { QueryProvider } from "@/contexts/QueryContext";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Center, Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfilePosts from "../Profile/ProfilePosts";
import VideoParts from "../Profile/profileVideos";
import ProfileCard from "../Profile/profileCard";
import SkaterFeed from "./SkaterFeed";

interface ProfilePageProps {
  user: HiveAccount;
}

const tabNames = ["feed", "card", "pages", "videoparts"];

export default function SkaterTabs({ user }: ProfilePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Converting ReadonlyURLSearchParams to URLSearchParams
  const params = new URLSearchParams(searchParams?.toString() || "");

  const tab = params.get('tab');
  const tabIndex = tabNames.indexOf(tab || "feed");

  const handleTabChange = (index: number) => {
    params.set('tab', tabNames[index]);
    // Updating the URL without reloading the page
    router.replace(`?${params.toString()}`);
  };

  return (
    <QueryProvider query="blog" tag={[{ tag: user.name, limit: 20 }]}>
      <Box>
        <Tabs
          isLazy
          isFitted
          variant="enclosed-colored"
          index={tabIndex >= 0 ? tabIndex : 0}
          onChange={handleTabChange}
        >
          <TabList color={"white"} mb="1em">
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Feed</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Card</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Pages</Tab>
            <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>VideoParts</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SkaterFeed user={user} />
            </TabPanel>
            <TabPanel>
              <Center mb={3}>
                <VStack>
                  <ProfileCard user={user} />
                </VStack>
              </Center>
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
