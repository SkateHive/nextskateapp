"use client"

import { HiveAccount } from "@/lib/models/user"
import {
    Box,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper
} from "@chakra-ui/react"
import { useEffect } from "react"

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
    let userAvatar = ""
    let userMetadata: any
    let userProfileName = ""
    let userLocation = ""
    let userBio = ""
    let userETHwallet = ""
    let postCount = 0
    let witnessVotes: string[] = []

    try {
        userMetadata = JSON.parse(hiveAccount.posting_json_metadata)
        userAvatar = userMetadata?.profile?.profile_image || ""
        userProfileName = userMetadata?.profile?.name || ""
        userLocation = userMetadata?.profile?.location || ""
        userBio = userMetadata?.profile?.about || ""
        postCount = hiveAccount.post_count

    } catch (error) {
        console.error("Error parsing user metadata:", error)
    }

    useEffect(() => {
        if (userAvatar !== "" && activeStep === 0) {
            setStep1Completed(true)
        }
    }, [userAvatar, activeStep, setStep1Completed])

    useEffect(() => {
        if (userProfileName !== "" && userBio !== "" && activeStep === 1) {
            setStep2Completed(true);
        }
    }, [userProfileName, userBio, activeStep, setStep2Completed]);

    useEffect(() => {
        if (postCount > 0 && activeStep === 2) {
            setStep3Completed(true);
        }
    }, [postCount, activeStep, setStep3Completed]);

    useEffect(() => {
        if (Array.isArray(witnessVotes) && witnessVotes.includes("skatehive") && activeStep === 3) {
            setStep4Completed(true);
        }
    }, [witnessVotes, activeStep, setStep4Completed]);

    const steps = [
        { title: "Add Profile Pic", description: activeStep > 0 ? "You look good" : "You look better with a profile pic" },
        { title: "Edit Profile", description: activeStep > 1 ? "All set!" : "Complete your profile, bro" },
        { title: "Make your first Post", description: activeStep > 2 ? "You're all set!" : "Introduce yourself to the OGs" },
        { title: "Vote For SkateHive Witness", description: activeStep > 3 ? "You're ready to level 2!" : "Support the community by voting" },
    ]

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
}

export default StepByStep
