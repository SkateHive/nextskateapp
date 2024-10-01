import useHiveBalance from "@/hooks/useHiveBalance";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
    Box,
    Button,
    Center,
    HStack,
    Table,
    TableContainer,
    Tag,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Mission, dummyMissions, recurringTasks } from './missionsData';

interface LevelMissionsProps {
    initialLevel: number;
    user: HiveAccount;
    updateAvailableXp: (xp: number) => void;
}

export default function LevelMissions({ initialLevel, user, updateAvailableXp }: LevelMissionsProps) {
    const [activeLevel, setActiveLevel] = useState(initialLevel);
    const [activeMissions, setActiveMissions] = useState<Mission[]>([]);

    const safeParse = (jsonString: string) => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return null;
        }
    };

    const user_posting_metadata = safeParse(user.posting_json_metadata);
    const user_json_metadata = safeParse(user.json_metadata);
    const user_has_voted_in_skatehive_witness = user.witness_votes.includes("skatehive");
    const [user_has_ethereum_address, setUserHasEthereumAddress] = useState(false);
    const [user_posts, setUserPosts] = useState([]);
    const userLatestPostDate = user.last_post;
    const { hivePower, savingsUSDvalue } = useHiveBalance(user);

    const [completedMissions, setCompletedMissions] = useState({
        hasProfilePic: false,
        hasCompletedProfile: false,
        hasPosted: false,
        hasCompletedLevel1: false,
        hasVotedForSkateHiveWitness: false,
        hasAddedEthereumAddress: false,
        hasMoreThanFivePosts: false,
        hasVotedOnSkateHiveProposal: false,
        hasMoraThanFivePosts: false,
        hasUserPostedLastWeek: false,
        hasMoreThan50HP: false,
        hasMoreThan100Posts: false,
        hasMoreThan100HBDSavings: true
    });

    const calculateTotalXp = useCallback(() => {
        let totalXp = 0;
        const completedMissionSet = new Set<string>();

        for (let level in dummyMissions) {
            const missions = dummyMissions[level];
            missions.forEach(mission => {
                if (isMissionCompleted(mission.name) && !completedMissionSet.has(mission.name)) {
                    completedMissionSet.add(mission.name);
                    totalXp += mission.xp;
                }
            });
        }
        return totalXp;
    }, [completedMissions]);

    useEffect(() => {
        const newCompletedMissions = { ...completedMissions };

        // lvl 1
        if (user_posting_metadata) {
            newCompletedMissions.hasProfilePic = !!user_posting_metadata.profile?.profile_image;
        }

        if (user_posting_metadata?.profile?.name && user_posting_metadata?.profile?.about) {
            newCompletedMissions.hasCompletedProfile = true;
        }

        if (user?.last_post) {
            newCompletedMissions.hasPosted = true;
        }

        // lvl 2
        if (user_posting_metadata?.extensions?.level >= 1) {
            newCompletedMissions.hasCompletedLevel1 = true;
        }

        if (user_has_voted_in_skatehive_witness) {
            newCompletedMissions.hasVotedForSkateHiveWitness = true;
        }

        if (user_json_metadata?.extensions?.eth_address) {
            setUserHasEthereumAddress(true);
            newCompletedMissions.hasAddedEthereumAddress = true;
        }

        if (user.post_count > 5) {
            newCompletedMissions.hasMoreThanFivePosts = true;
        }

        // lvl 3
        if (userLatestPostDate && new Date(userLatestPostDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
            newCompletedMissions.hasUserPostedLastWeek = true;
        }

        if (hivePower > 50) {
            newCompletedMissions.hasMoreThan50HP = true;
        }

        if (user.post_count > 100) {
            newCompletedMissions.hasMoreThan100Posts = true;
        }

        if (savingsUSDvalue >= 100) {
            newCompletedMissions.hasMoreThan100HBDSavings = true;
        }

        setCompletedMissions(newCompletedMissions);
    }, [user, hivePower]);

    useEffect(() => {
        setActiveMissions(dummyMissions[activeLevel] || []);
    }, [activeLevel]);

    useEffect(() => {
        const calculateTotalXpAsync = async () => {
            const totalXp = await calculateTotalXp();
            updateAvailableXp(totalXp);
        };
        calculateTotalXpAsync();
    }, [completedMissions, calculateTotalXp, updateAvailableXp]);

    const handlePrevLevel = () => {
        if (activeLevel > 1) {
            setActiveLevel(activeLevel - 1);
        }
    };

    const handleNextLevel = () => {
        setActiveLevel(activeLevel + 1);
    };

    const isMissionCompleted = (missionName: string) => {
        switch (missionName) {
            case "Add Profile Picture":
                return completedMissions.hasProfilePic;
            case "Complete Profile":
                return completedMissions.hasCompletedProfile;
            case "Make your first post":
                return completedMissions.hasPosted;
            case "Vote on Skatehive Witness":
                return completedMissions.hasVotedForSkateHiveWitness;
            case "Add Ethereum Address":
                return completedMissions.hasAddedEthereumAddress;
            case "More than 5 Posts":
                return completedMissions.hasMoreThanFivePosts;
            case "Vote on SkateHive Proposal":
                return completedMissions.hasVotedOnSkateHiveProposal;
            case "Posted this week":
                return completedMissions.hasUserPostedLastWeek;
            case "More than 50 HP":
                return completedMissions.hasMoreThan50HP;
            case "More than 100 Posts":
                return completedMissions.hasMoreThan100Posts;
            case "Savings HBD $100":
                return completedMissions.hasMoreThan100HBDSavings;
            default:
                return false;
        }
    };

    return (
        <VStack minWidth={'500px'}>
            <HStack>
                <Button
                    _hover={{ background: "transparent" }}
                    variant="ghost"
                    onClick={handlePrevLevel}
                    isDisabled={activeLevel <= 1}
                >
                    <ArrowLeft color="white" />
                </Button>
                <Center>
                    <Tag colorScheme="green" fontSize="24px">Missions #{activeLevel}</Tag>
                </Center>
                <Button
                    _hover={{ background: "transparent" }}
                    variant="ghost"
                    onClick={handleNextLevel}
                    isDisabled={activeLevel >= 7}
                >
                    <ArrowRight color="white" />
                </Button>
            </HStack>
            <TableContainer w="100%">
                <Box borderRadius="15px" border="1px solid white" minW="220px">
                    <Table variant="unstyled" mt={2} color="white" w="100%">
                        <Thead>
                            <Tr>
                                <Th w="80%"><Center>Mission</Center></Th>
                                <Th w="20%"><Center> Reward</Center></Th>
                            </Tr>
                        </Thead>
                        <Tbody overflowX={'auto'}>
                            {activeMissions.map((mission, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <Text as={isMissionCompleted(mission.name) ? "s" : "span"}>
                                            {mission.name}
                                        </Text>
                                    </Td>
                                    <Td>
                                        {isMissionCompleted(mission.name) ? (
                                            <Tag colorScheme="green" w="100%">Completed</Tag>
                                        ) : (
                                            <Button colorScheme="green" h="24px" w="100%">
                                                {mission.xp} XP
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </TableContainer>

            <Center mt={3}>
                {/* <Tag colorScheme="green" fontSize="24px">Recurring Tasks</Tag> */}
            </Center>

            <TableContainer w="100%">
                <Box borderRadius="15px" border="1px solid white" minW="100%">
                    <Table variant="unstyled" mt={2} color="white" w="100%">
                        <Thead>
                            <Tr>
                                <Th w="80%"> <Center> Recurring Tasks</Center></Th>
                                <Th w="20%"> <Center> Action</Center></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recurringTasks['1'].map((task, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <Text as={isMissionCompleted(task.name) ? "s" : "span"}>
                                            {task.name}
                                        </Text>
                                    </Td>
                                    <Td>
                                        {isMissionCompleted(task.name) ? (
                                            <Tag colorScheme="green" w="100%">Completed</Tag>
                                        ) : (
                                            <Button colorScheme="green" h="24px" w="100%">
                                                {task.xp} XP
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </TableContainer>
        </VStack>
    );
}
