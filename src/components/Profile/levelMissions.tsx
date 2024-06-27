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
import { useEffect, useState } from "react";
import { Mission, dummyMissions, recurringTasks } from './missionsData';

interface LevelMissionsProps {
    level: number;
    missions?: Mission[];
    user: HiveAccount;
}

export default function LevelMissions({ level, missions = [], user }: LevelMissionsProps) {
    const [activeLevel, setActiveLevel] = useState(level);
    const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
    const user_posting_metadata = JSON.parse(user.posting_json_metadata);

    const [completedMissions, setCompletedMissions] = useState({
        hasProfilePic: false,
        hasCompletedProfile: false,
        hasPosted: false,
        hasCompletedLevel1: false
    });

    useEffect(() => {
        if (user_posting_metadata) {
            console.log("Profile Pic", user_posting_metadata);
            setCompletedMissions(prev => ({ ...prev, hasProfilePic: true }));
        }
        if (user_posting_metadata?.profile?.name && user_posting_metadata?.profile?.about) {
            console.log("Profile", user_posting_metadata?.profile);
            setCompletedMissions(prev => ({ ...prev, hasCompletedProfile: true }));
        }
        if (user?.last_post) {
            console.log("Last Post", user?.last_post);
            setCompletedMissions(prev => ({ ...prev, hasPosted: true }));
        }
        if (user_posting_metadata?.extensions?.level >= 1) {
            console.log("Level 1", user_posting_metadata?.extensions?.level);
            setCompletedMissions(prev => ({ ...prev, hasCompletedLevel1: true }));
        }
    }, []);

    useEffect(() => {
        setActiveLevel(level);
        setActiveMissions(missions.length > 0 ? missions : dummyMissions[level] || []);
    }, [level, missions]);

    useEffect(() => {
        setActiveMissions(dummyMissions[activeLevel] || []);
    }, [activeLevel]);

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
                    <Tag fontSize="24px">Missions #{activeLevel}</Tag>
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
                                <Th w="50%">Mission</Th>
                                <Th w="20%">XP</Th>
                                <Th w="30%">Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {activeMissions.map((mission, index) => (
                                <Tr key={index}>
                                    <Td minWidth="200px" maxWidth="400px">
                                        <Text as={isMissionCompleted(mission.name) ? "s" : "span"}>
                                            {mission.name}
                                        </Text>
                                    </Td>
                                    <Td minWidth="100px" maxWidth="150px">{mission.xp}</Td>
                                    <Td minWidth="150px" maxWidth="200px">
                                        {isMissionCompleted(mission.name) ? (
                                            <Tag colorScheme="green">Completed</Tag>
                                        ) : (
                                            <Button colorScheme="green" h="24px" w="100%">
                                                Complete
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
                <Tag fontSize="24px">Recurring Tasks</Tag>
            </Center>

            <TableContainer w="100%">
                <Box borderRadius="15px" border="1px solid white" minW="100%">
                    <Table variant="unstyled" mt={2} color="white" w="100%">
                        <Thead>
                            <Tr>
                                <Th w="50%">Task</Th>
                                <Th w="20%">XP</Th>
                                <Th w="30%">Action</Th>
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
                                    <Td minWidth="100px" maxWidth="150px">{task.xp}</Td>
                                    <Td minWidth="150px" maxWidth="200px">
                                        {isMissionCompleted(task.name) ? (
                                            <Tag colorScheme="green">Completed</Tag>
                                        ) : (
                                            <Button colorScheme="green" h="24px" w="100%">
                                                Complete
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
