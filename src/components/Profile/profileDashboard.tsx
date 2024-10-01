'use client';
import { HiveAccount } from '@/lib/useHiveAuth';
import { Box, Button, Center, Flex, HStack, Step, StepDescription, StepIndicator, StepSeparator, StepStatus, StepTitle, Stepper, Tag, Text, VStack, useSteps } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import LevelMissions from './levelMissions';
import ProfileCard from './profileCard';

interface ProfileDashboardProps {
    user: HiveAccount;
}

const ProfileDashboard = ({ user }: ProfileDashboardProps) => {
    const user_metadata = JSON.parse(user.json_metadata || '{}');
    // const user_posting_metadata = JSON.parse(user.posting_json_metadata || '{}');
    const extensions = user_metadata.extensions;
    const userLevel = extensions?.level || 1;
    //const userLevel = 4;

    const userXp = extensions?.staticXp || 0;
    const [availableXp, setAvailableXp] = useState(userXp);

    const steps = [
        { title: 'Level 1', description: 'start' },
        { title: 'Level 2', description: 'min. 180 xp' },
        { title: 'Level 3', description: 'min. 270 xp' },
        { title: 'Level 4', description: 'min. 540 xp' },
        { title: 'Level 5', description: 'min. 720 xp' },
        { title: 'Level 6', description: 'min. 900 xp' },
        { title: 'Level 7', description: 'min. 1080 xp' },
    ];

    const filteredSteps = steps.filter((step, index) => {
        const start = Math.max(0, userLevel - 2);
        var end = 0;
        if (userLevel >= 1)
            end = Math.min(steps.length - 1, userLevel + 2);
        else
            end = Math.min(steps.length - 1, userLevel + 3);
        return index >= start && index <= end;
      });

    const updateAvailableXp = useCallback((xp: number) => {
        // console.log(`Updating available XP to: ${xp}`);
        setAvailableXp(xp);
    }, []);

    function Levels() {
        var activeLevel = userLevel;
        activeLevel = filteredSteps.indexOf(steps[userLevel])-1;

        const { activeStep } = useSteps({
            index: activeLevel,
            count: steps.length,
        });

        return (
            <Box m={10}>
                <Stepper sx={{
                    "&::-webkit-scrollbar": {display: "none",}}}
                    overflowX="auto" size='lg' colorScheme='green' index={activeStep}>

                    {filteredSteps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus complete={`🛹`} incomplete={`🚧`} active={`📍`} />
                            </StepIndicator>

                            <Box flexShrink='0'>
                                <StepTitle>{step.title}</StepTitle>
                                <StepDescription>{activeLevel === index ? 'current' : step.description}</StepDescription>
                            </Box>

                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
            </Box>
        );
    }

    // const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <Box>
            <Center mt={5} mb={8}>
                <VStack gap={5}>
                    <Flex gap={20} flexDirection={{ base: 'column', lg: 'row' }}>
                        <Box>
                            <Center mb={3}>
                                <VStack>
                                    <ProfileCard user={user} />
                                </VStack>
                            </Center>
                        </Box>
                        <Box width={'100%'}>
                            {/*<Center>
                                 <HStack>
                                    <Text fontSize={'26px'}>
                                        Total XP:
                                    </Text>
                                    <Tag bg={'limegreen'} color={'black'} fontSize={'26px'}>
                                        {userXp}/{availableXp}
                                    </Tag>
                                </HStack>
                            </Center> */}
                            <LevelMissions user={user} initialLevel={userLevel} updateAvailableXp={updateAvailableXp} />
                        </Box>
                    </Flex>
                </VStack>
            </Center>
            <Levels />
        </Box>
    );
}

export default ProfileDashboard;
