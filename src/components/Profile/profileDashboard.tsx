'use client'
import { HiveAccount } from '@/lib/useHiveAuth';
import { Box, Center, Flex, HStack, Step, StepDescription, StepIndicator, StepSeparator, StepStatus, StepTitle, Stepper, Tag, Text, VStack, useSteps } from '@chakra-ui/react';
import LevelMissions from './levelMissions';
import ProfileCard from './profileCard';

interface ProfileDashboardProps {
    user: HiveAccount
}

const ProfileDashboard = ({ user }: ProfileDashboardProps) => {
    const user_metadata = JSON.parse(user.json_metadata || '{}');
    const extensions = user_metadata.extensions;
    const userLevel = extensions && extensions['level'] || 0;
    const steps = [
        { title: 'Level 1', description: 'current' },
        { title: 'Level 2', description: 'min. 180 xp' },
        { title: 'Level 3', description: 'min. 270 xp' },
        { title: 'Level 4', description: 'min. 540 xp' },
        { title: 'Level 5', description: 'min. 720 xp' },
        { title: 'Level 6', description: 'min. 900 xp' },
        { title: 'Level 7', description: 'min. 1080 xp' },
    ];

    function Levels() {
        const { activeStep } = useSteps({
            index: userLevel - 1 || 0, // Make sure the active step matches the user level
            count: steps.length,
        });

        return (
            <Box m={10} whiteSpace="nowrap">
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

    return (
        <Box >

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
                                        <Tag bg={'limegreen'} color={'black'} fontSize={'26px'}> 666 </Tag>
                                    </HStack>
                                    <ProfileCard user={user} />
                                </VStack>
                            </Center>
                        </Box>
                        <LevelMissions user={user} level={userLevel + 1} missions={[]} />
                    </Flex>
                </VStack>
            </Center>
            <Levels />

        </Box>
    );
}

export default ProfileDashboard;
