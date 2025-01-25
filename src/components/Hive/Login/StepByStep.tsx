"use client"

import AuthorAvatar from "@/components/AuthorAvatar"
import { HiveAccount } from "@/lib/useHiveAuth"
import { dummyMissions } from "../../Profile/missionsData"
import {
    Box, HStack, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator,
    StepStatus, StepTitle, Stepper
} from "@chakra-ui/react"
// import { useEffect } from "react"

interface StepByStepProps {
    hiveAccount: HiveAccount
    activeStep: number
    setActiveStep: (step: number) => void
    setStep1Completed: (completed: boolean) => void
    setStep2Completed: (completed: boolean) => void
    setStep3Completed: (completed: boolean) => void
    setStep4Completed: (completed: boolean) => void
}

const StepByStep = ({
    hiveAccount,
    activeStep,
    setActiveStep,
    setStep1Completed,
    setStep2Completed,
    setStep3Completed,
    setStep4Completed
}: StepByStepProps) => {
    // let userAvatar = ""
    // let userMetadata: any
    // let userProfileName = ""
    // let userLocation = ""
    // let userBio = ""
    // let userETHwallet = ""
    // let postCount = 0
    // let witnessVotes: string[] = []
    let userLevel = 1

    try {
        //     userMetadata = JSON.parse(hiveAccount.posting_json_metadata)
        //     userAvatar = userMetadata?.profile?.profile_image || ""
        //     userProfileName = userMetadata?.profile?.name || ""
        //     userLocation = userMetadata?.profile?.location || ""
        //     userBio = userMetadata?.profile?.about || ""
        //     postCount = hiveAccount.post_count
        //     // witnessVotes = hiveAccount.witness_votes || []
        userLevel = JSON.parse(hiveAccount.json_metadata)?.extensions?.level || 1
    } catch (error) {
        console.error("Error parsing user metadata:", error)
    }

    // useEffect(() => {
    //     if (userAvatar !== "" && activeStep === 0) {
    //         setStep1Completed(true)
    //     }
    // }, [userAvatar, activeStep, setStep1Completed])

    // useEffect(() => {
    //     if (userProfileName !== "" && userBio !== "" && activeStep === 1) {
    //         setStep2Completed(true)
    //     }
    // }, [userProfileName, userBio, activeStep, setStep2Completed])

    // useEffect(() => {
    //     if (postCount > 0 && activeStep === 2) {
    //         setStep3Completed(true)
    //     }
    // }, [postCount, activeStep, setStep3Completed])

    // useEffect(() => {
    //     if (Array.isArray(witnessVotes) && witnessVotes.includes("skatehive") && activeStep === 3) {
    //         setStep4Completed(true)
    //     }
    // }, [witnessVotes, activeStep, setStep4Completed])

    const steps = [
        { title: dummyMissions[userLevel][0]["name"], description: activeStep > 0 ? dummyMissions[userLevel][0]["completed"] : dummyMissions[userLevel][0]["imcompleted"] },
        { title: dummyMissions[userLevel][1]["name"], description: activeStep > 1 ? dummyMissions[userLevel][1]["completed"] : dummyMissions[userLevel][1]["imcompleted"] },
        { title: dummyMissions[userLevel][2]["name"], description: activeStep > 2 ? dummyMissions[userLevel][2]["completed"] : dummyMissions[userLevel][2]["imcompleted"] },
    ]

    const renderContent = () => {
        // switch (userLevel) {
        //     case 0:
        //         return (
        //             <Stepper index={activeStep} orientation="vertical" height="300px" gap="0" mt={5} mb={5} colorScheme="green">
        //                 {steps.map((step, index) => (
        //                     <Step key={index}>
        //                         <StepIndicator>
        //                             <StepStatus
        //                                 complete={<StepIcon />}
        //                                 incomplete={<StepNumber />}
        //                                 active={<StepNumber />}
        //                             />
        //                         </StepIndicator>

        //                         <Box flexShrink="0">
        //                             <StepTitle>{step.title}</StepTitle>
        //                             <StepDescription>{step.description}</StepDescription>
        //                         </Box>

        //                         <StepSeparator />
        //                     </Step>
        //                 ))}
        //             </Stepper>
        //         )
        //     case 1:
        //         return (
        //             <Box >

        //                 <TableContainer w={'100%'}>
        //                     <Table w={'100%'} variant={'striped'}>
        //                         <Thead >
        //                             <Center>
        //                                 <Text fontSize={'26px'}>Current Perks</Text>
        //                             </Center>
        //                         </Thead>
        //                         <Tbody justifyContent={'center'} w={'100%'}>
        //                             <Tr>- Post texts and images!</Tr>
        //                             <Tr>- Use Mag Section</Tr>
        //                             <Tr>- Upload up to 720p video files</Tr>
        //                             <Tr>- Upload videos up to 30 seconds</Tr>
        //                         </Tbody>
        //                     </Table>
        //                 </TableContainer>
        //                 <Divider mt='15px' mb={'15px'} />
        //                 <TableContainer w={'100%'}>
        //                     <Table color={'red.200'} w={'100%'} variant={'striped'}>
        //                         <Thead >
        //                             <Center>
        //                                 <Text fontSize={'26px'}>Next Level</Text>
        //                             </Center>
        //                         </Thead>
        //                         <Tbody justifyContent={'center'} w={'100%'}>
        //                             <Tr>- Get eligible to $Airdrops</Tr>
        //                             <Tr>- Upload over 20Mb images</Tr>
        //                             <Tr>- Upload up to 1080p video files</Tr>
        //                             <Tr>- Upload videos up to 60 seconds</Tr>
        //                         </Tbody>
        //                     </Table>
        //                 </TableContainer>
        //             </Box>
        //         )
        //     case 2:
        //         return (
        //             <Box>
        //                 <Text>Welcome to Level 2! Youre dope!</Text>
        //                 {/* Add more content specific to Level 2 */}
        //             </Box>
        //         )
        //     default:
        return (
            <Stepper index={activeStep} orientation="vertical" height="300px" gap="0" mt={5} mb={5} colorScheme="green">
                {steps.map((step, index) => (
                    <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                                complete={<StepIcon />}
                                incomplete={<StepNumber />}
                                active={<StepNumber />}
                            />
                        </StepIndicator>

                        <Box flexShrink="0">
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>{step.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                    </Step>
                ))}
            </Stepper>
        )
        // }
    }

    return (
        <Box w={"100%"}>
            <HStack>
                <AuthorAvatar username={hiveAccount.name} borderRadius={5} boxSize={16} />
                {renderContent()}
            </HStack>
        </Box>
    )
}

export default StepByStep
