'use client'
import { HiveAccount } from '@/lib/useHiveAuth';
import { Box, Center, HStack, Step, StepDescription, StepIndicator, StepSeparator, StepStatus, StepTitle, Stepper, Tag, Text, VStack, useSteps } from '@chakra-ui/react';
import ProfileCard from './profileCard';

interface ProfileDashboardProps {
    user: HiveAccount
}

const ProfileDashboard = ({ user }: ProfileDashboardProps) => {
    const user_metadata = JSON.parse(user.json_metadata);
    const extensions = user_metadata.extensions;
    const userLevel = extensions['level'];
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
            <Box whiteSpace="nowrap">
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

    console.log(extensions['eth_address']);
    return (
        <Box >

            <Levels />
            <Center mt={10}>
                <VStack gap={5}>
                    <ProfileCard user={user} />
                    <HStack>
                        <Text fontSize={'26px'}>
                            You are in
                        </Text>
                        <Tag bg={'limegreen'} color={'black'} fontSize={'26px'}> Level {extensions['level'] || 0}</Tag>
                    </HStack>
                </VStack>
            </Center>
        </Box>
    );
}

export default ProfileDashboard;
