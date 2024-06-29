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
    const user_posting_metadata = JSON.parse(user.posting_json_metadata);
    const user_has_voted_in_skatehive_witness = user.witness_votes.includes("skatehive");
    const [user_has_ethereum_address, setUserHasEthereumAddress] = useState(false);
    const [user_posts, setUserPosts] = useState([]);
    const userLatestPostDate = user.last_post;

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
        hasUserPostedLastWeek: false
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
                    // console.log(`Adding ${mission.xp} XP for ${mission.name}`);
                }
            });
        }
        // console.log(`Calculated Total XP: ${totalXp}`);
        return totalXp;
    }, [completedMissions]);

    useEffect(() => {
        // console.log("Setting initial completed missions based on user data");
        const newCompletedMissions = { ...completedMissions };

        if (user_posting_metadata) {
            newCompletedMissions.hasProfilePic = !!user_posting_metadata.profile?.profile_image;
        }
        if (user_posting_metadata?.profile?.name && user_posting_metadata?.profile?.about) {
            newCompletedMissions.hasCompletedProfile = true;
        }
        if (user?.last_post) {
            newCompletedMissions.hasPosted = true;
        }
        if (user_posting_metadata?.extensions?.level >= 1) {
            newCompletedMissions.hasCompletedLevel1 = true;
        }
        if (user_has_voted_in_skatehive_witness) {
            newCompletedMissions.hasVotedForSkateHiveWitness = true;
        }
        if (user.json_metadata && JSON.parse(user.json_metadata).extensions && JSON.parse(user.json_metadata).extensions.eth_address) {
            setUserHasEthereumAddress(true);
            newCompletedMissions.hasAddedEthereumAddress = true;
        }
        if (user.post_count > 5) {
            newCompletedMissions.hasMoreThanFivePosts = true;
        }
        if (userLatestPostDate && new Date(userLatestPostDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
            newCompletedMissions.hasUserPostedLastWeek = true;
        }
        setCompletedMissions(newCompletedMissions);
        // console.log(newCompletedMissions);
    }, [user]);

    useEffect(() => {
        // console.log(`Active Level Changed: ${activeLevel}`);
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
                // console.log(`Checking if hasProfilePic is true: ${completedMissions.hasProfilePic}`);
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
            case "More than 5 Posts":
                return completedMissions.hasMoraThanFivePosts;
            case "Posted this week":
                return completedMissions.hasUserPostedLastWeek;
            default:
                return false;
        }
    };

    return (
        <VStack w="100%">
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
                <Box borderRadius="15px" border="1px solid white" minW="100%">
                    <Table variant="unstyled" mt={2} color="white" w="100%">
                        <Thead>
                            <Tr>
                                <Th w="50%"><Center>Mission</Center></Th>
                                <Th w="30%"><Center> Reward</Center></Th>
                            </Tr>
                        </Thead>
                        <Tbody overflowX={'auto'}>
                            {activeMissions.map((mission, index) => (
                                <Tr key={index}>
                                    <Td minWidth="150px" maxWidth="200px">
                                        <Text as={isMissionCompleted(mission.name) ? "s" : "span"}>
                                            {mission.name}
                                        </Text>
                                    </Td>
                                    <Td minWidth="150px" maxWidth="200px">
                                        {isMissionCompleted(mission.name) ? (
                                            <Tag colorScheme="green">Completed</Tag>
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
                <Tag colorScheme="green" fontSize="24px">Recurring Tasks</Tag>
            </Center>

            <TableContainer w="100%">
                <Box borderRadius="15px" border="1px solid white" minW="100%">
                    <Table variant="unstyled" mt={2} color="white" w="100%">
                        <Thead>
                            <Tr>
                                <Th w="50%"> <Center> Task</Center></Th>
                                <Th w="30%"> <Center> Action</Center></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recurringTasks['1'].map((task, index) => (
                                <Tr key={index}>
                                    <Td minWidth="200px" maxWidth="400px">
                                        <Text as={isMissionCompleted(task.name) ? "s" : "span"}>
                                            {task.name}
                                        </Text>
                                    </Td>
                                    <Td minWidth="150px" maxWidth="200px">
                                        {isMissionCompleted(task.name) ? (
                                            <Tag colorScheme="green">Completed</Tag>
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
