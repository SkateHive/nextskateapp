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
    Stepper,
    useSteps
} from "@chakra-ui/react"
import { useEffect, useState } from "react"

interface StepByStepProps {
    hiveAccount: HiveAccount
}

const StepByStep = ({ hiveAccount }: StepByStepProps) => {
    let userAvatar = ""
    try {
        const userMetadata = JSON.parse(hiveAccount.posting_json_metadata)
        userAvatar = userMetadata?.profile?.profile_image || ""
    } catch (error) {
        console.error("Error parsing user metadata:", error)
    }

    let userMetadata = {}

    const [isStep1Completed, setStep1Completed] = useState(false)
    const [isStep2Completed, setStep2Completed] = useState(false)
    const [isStep3Completed, setStep3Completed] = useState(false)
    const [isStep4Completed, setStep4Completed] = useState(false)

    const steps = [
        { title: "Add Profile Pic", description: isStep1Completed ? "You look good" : "You look better with a profile pic" },
        { title: "Edit Profile", description: isStep2Completed ? "All set!" : "Complete your profile, bro" },
        { title: "Make your first Post", description: isStep3Completed ? "You're all set!" : "Introduce yourself to the OGs" },
        { title: "Vote For SkateHive Witness", description: isStep4Completed ? "You're done!" : "Support the community by voting" },
    ]

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    })

    useEffect(() => {
        if (userAvatar) {
            setStep1Completed(true)
        }
    }, [userAvatar])

    useEffect(() => {
        if (isStep1Completed) {
            setActiveStep(1) // Set active step to the next step if step 1 is completed
        }
    }, [isStep1Completed, setActiveStep])

    return (
        <Stepper index={activeStep} orientation="vertical" height="300px" gap="0" mt={5} mb={5} colorScheme="green">
            {steps.map((step, index) => (
                <Step key={index}>
                    <StepIndicator>
                        <StepStatus
                            complete={index === 0 ? isStep1Completed && <StepIcon /> : <StepIcon />}
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
