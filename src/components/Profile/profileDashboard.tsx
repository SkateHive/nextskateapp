'use client';
import { updateProfile } from '@/lib/hive/client-functions';
import { HiveAccount } from '@/lib/useHiveAuth';
import { Box, Button, Center, Flex, HStack, Step, StepDescription, StepIndicator, StepSeparator, StepStatus, StepTitle, Stepper, Tag, Text, VStack, useSteps } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { FaHive } from 'react-icons/fa';
import LevelMissions from './levelMissions';
import ProfileCard from './profileCard';

interface ProfileDashboardProps {
    user: HiveAccount;
}
const xpThresholds = [0, 180, 270, 540, 720, 900, 1080];

const ProfileDashboard = ({ user }: ProfileDashboardProps) => {
    const user_metadata = JSON.parse(user.json_metadata || '{}');
    const user_posting_metadata = JSON.parse(user.posting_json_metadata || '{}');
    const extensions = user_metadata.extensions;
    const userLevel = extensions?.level || 0;
    const userXp = extensions?.staticXp || 0;
    const [availableXp, setAvailableXp] = useState(userXp);

    const steps = [
        { title: 'Level 1', description: 'current' },
        { title: 'Level 2', description: 'min. 180 xp' },
        { title: 'Level 3', description: 'min. 270 xp' },
        { title: 'Level 4', description: 'min. 540 xp' },
        { title: 'Level 5', description: 'min. 720 xp' },
        { title: 'Level 6', description: 'min. 900 xp' },
        { title: 'Level 7', description: 'min. 1080 xp' },
    ];
    function calculateLevel(xp: number): number {
        let level = 0;
        for (let i = 0; i < xpThresholds.length; i++) {
            if (xp >= xpThresholds[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        return level;
    }

    const updateAvailableXp = useCallback((xp: number) => {
        // console.log(`Updating available XP to: ${xp}`);
        setAvailableXp(xp);
    }, []);

    function Levels() {
        const { activeStep } = useSteps({
            index: userLevel - 1 || 0,
            count: steps.length,
        });

        return (
            <Box m={10}>
                <Stepper sx={{
                    "&::-webkit-scrollbar": {
                        display: "none",
                    }
                }}
                    overflowX="auto" size='lg' colorScheme='green' index={activeStep}>
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus complete={`🛹`} incomplete={`💀`} active={`📍`} />
                            </StepIndicator>

                            <Box flexShrink='0'>
                                <StepTitle>{step.title}</StepTitle>
                                <StepDescription>{step.description}</StepDescription>
                            </Box>

                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
            </Box>
        );
    }
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const handleUpdateXPClick = () => {
        const loginMethod = localStorage.getItem('LoginMethod');

        if (userLevel < 1) {
            setIsLoginModalOpen(true);
        } else {
            // console.log("User Level: ", userLevel)
            // console.log(user_posting_metadata)
            if (loginMethod === 'keychain') {
                const newLevel = calculateLevel(availableXp);  // Calculate the new level based on available XP

                updateProfile(
                    String(user.name),
                    user_posting_metadata.profile.name,
                    user_posting_metadata.profile.about,
                    user_posting_metadata.profile.location,
                    user_posting_metadata.profile.cover_image,
                    user_posting_metadata.profile.profile_image,
                    user_posting_metadata.profile.website,
                    user_metadata.extensions.eth_address,
                    user_metadata.extensions.video_parts,
                    newLevel,         // Pass the new level
                    availableXp,      // Pass the updated XP
                    user_metadata.extensions.cumulativeXp
                );
            } else if (loginMethod === 'privatekey') {
                // Handle the private key method if necessary
            }
        }
    };


    return (
        <Box>
            <Center mt={5} mb={8}>
                <VStack gap={5}>
                    <Flex gap={20} flexDirection={{ base: 'column', lg: 'row' }}>
                        <Box>
                            <Center mb={3}>
                                <VStack>
                                    <HStack>
                                        <Text fontSize={'26px'}>
                                            Total XP:
                                        </Text>
                                        <Tag bg={'limegreen'} color={'black'} fontSize={'26px'}> {userXp}/{availableXp}</Tag>
                                    </HStack>
                                    <ProfileCard user={user} />
                                    <Button
                                        _hover={{ background: "transparent" }}
                                        leftIcon={<FaHive size={"22px"} />}
                                        color="yellow.200"
                                        border={"1px solid white"}
                                        width={"100%"}
                                        mt={2}
                                        variant={"outline"}
                                        w={"auto"}
                                        onClick={handleUpdateXPClick}
                                    >
                                        Update XP
                                    </Button>
                                </VStack>
                            </Center>
                        </Box>
                        <Box>
                            <LevelMissions user={user} initialLevel={userLevel + 1} updateAvailableXp={updateAvailableXp} />
                        </Box>
                    </Flex>
                </VStack>
            </Center>
            <Levels />
        </Box>
    );
}

export default ProfileDashboard;
