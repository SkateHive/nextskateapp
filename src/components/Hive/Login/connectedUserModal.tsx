"use client"

import AuthorAvatar from "@/components/AuthorAvatar"
import EditInfoModal from "@/components/Profile/EditInfoModal"
import { useHiveUser } from "@/contexts/UserContext"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
    Button,
    Center,
    HStack,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    VStack
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import StepByStep from "./StepByStep"

function ConnectedUserModal({ onClose }: { onClose: () => void }) {
    const { logout } = useAuthHiveUser()
    const { hiveUser, refreshUser } = useHiveUser()
    const [activeStep, setActiveStep] = useState(0)
    const [isStep1Completed, setStep1Completed] = useState(false)
    const [isStep2Completed, setStep2Completed] = useState(false)
    const [isStep3Completed, setStep3Completed] = useState(false)
    const [isStep4Completed, setStep4Completed] = useState(false)
    const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false)

    useEffect(() => {
        if (isStep1Completed && activeStep === 0) {
            setActiveStep(1)
        }
        if (isStep2Completed && activeStep === 1) {
            setActiveStep(2)
        }
        if (isStep3Completed && activeStep === 2) {
            setActiveStep(3)
        }
        if (isStep4Completed && activeStep === 3) {
            setActiveStep(4)
        }
    }, [isStep1Completed, isStep2Completed, isStep3Completed, isStep4Completed, activeStep])

    const handleButtonClick = () => {
        switch (activeStep) {
            case 0:
                console.log("Handling Step 1 action")
                setIsEditInfoModalOpen(true)
                break
            case 1:
                console.log("Handling Step 2 action")
                setIsEditInfoModalOpen(true)
                refreshUser()
                break
            case 2:
                console.log("Handling Step 3 action")
                refreshUser()
                break
            case 3:
                refreshUser()
                break
            case 4:
                alert("You are now a Level 2 user! Next Steps Soon! 🚀")
                break
            default:
                break
        }
    }
    useEffect(() => {
        refreshUser()
    }, [isEditInfoModalOpen])

    if (!hiveUser) {
        return null // or handle the case when hiveUser is null
    }
    return (
        <>
            {isEditInfoModalOpen && (
                <EditInfoModal
                    user={hiveUser}
                    isOpen={isEditInfoModalOpen}
                    onClose={() => setIsEditInfoModalOpen(false)}
                    onUpdate={refreshUser} // Refresh user data after closing the modal
                />
            )}
            <ModalHeader>
                <Center>Connected as {hiveUser.name}</Center>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <HStack>
                    <AuthorAvatar username={hiveUser.name} borderRadius={5} boxSize={16} />
                    <StepByStep
                        hiveAccount={hiveUser}
                        activeStep={activeStep}
                        setActiveStep={setActiveStep}
                        setStep1Completed={setStep1Completed}
                        setStep2Completed={setStep2Completed}
                        setStep3Completed={setStep3Completed}
                        setStep4Completed={setStep4Completed}
                    />
                </HStack>
            </ModalBody>
            <ModalFooter>
                <VStack w={"100%"}>
                    <Button colorScheme="green" variant={"outline"} w={"100%"} mt={4} onClick={handleButtonClick}>
                        {activeStep === 0 && "Upload Profile Pic"}
                        {activeStep === 1 && "Update Profile"}
                        {activeStep === 2 && "Create Post"}
                        {activeStep === 3 && "Vote"}
                        {activeStep === 4 && "Go to Level 2 🚀"}
                    </Button>
                    <Button
                        w={"100%"}
                        onClick={() => {
                            logout()
                            onClose()
                        }}
                        colorScheme="red"
                        variant={"outline"}
                    >
                        Log Out
                    </Button>
                </VStack>
            </ModalFooter>
        </>
    )
}

export default ConnectedUserModal
