"use client"

import EditInfoModal from "@/components/Profile/EditInfoModal"
import { useHiveUser } from "@/contexts/UserContext"
import { updateProfile } from "@/lib/hive/client-functions"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
    Button,
    Center,
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

    const metadata = hiveUser?.json_metadata
    const userLevel = metadata ? JSON.parse(metadata)?.extensions?.level : 0

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
        if (userLevel === 1) {
            setActiveStep(4)
        }
    }, [isStep1Completed, isStep2Completed, isStep3Completed, isStep4Completed, activeStep, userLevel])

    useEffect(() => {
        refreshUser()
    }, [isEditInfoModalOpen, refreshUser])

    const handleButtonClick = () => {
        switch (activeStep) {
            case 0: // user has no profile image
                setIsEditInfoModalOpen(true)
                break
            case 1: // user has profile incomplete
                setIsEditInfoModalOpen(true)
                refreshUser()
                break
            case 2: // user never made its first post
                window.location.reload()
                refreshUser()
                break
            case 3:
                console.log("activeStep 3")
                const loginMethod = localStorage.getItem("LoginMethod");
                if (loginMethod === "keychain") {
                    updateProfile(
                        String(hiveUser?.name),
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.name,
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.about,
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.location,
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.cover_image,
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.profile_image,
                        JSON.parse(hiveUser?.posting_json_metadata ?? "")?.profile?.website,
                        JSON.parse(hiveUser?.json_metadata ?? "")?.extensions?.eth_address,
                        JSON.parse(hiveUser?.json_metadata ?? "")?.extensions?.video_parts,
                        1
                    );
                    window.location.href = `/profile/${hiveUser?.name}`

                } else if (loginMethod === "privateKey") {
                    console.log("write level 2 in profile with privatekey")
                    window.location.href = `/profile/${hiveUser?.name}`
                }
                refreshUser()
                break
            case 4:
                window.location.href = `/profile/${hiveUser?.name}`
                break
            default:
                break
        }
    }

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
                <Center>(Level {userLevel})</Center>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <StepByStep
                    hiveAccount={hiveUser}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setStep1Completed={setStep1Completed}
                    setStep2Completed={setStep2Completed}
                    setStep3Completed={setStep3Completed}
                    setStep4Completed={setStep4Completed}
                />
            </ModalBody>
            <ModalFooter>
                <VStack w={"100%"}>
                    <Button colorScheme="green" variant={"outline"} w={"100%"} mt={4} onClick={handleButtonClick}>
                        {activeStep === 0 && "Upload Profile Pic"}
                        {activeStep === 1 && "Update Profile"}
                        {activeStep === 2 && "Create Post"}
                        {activeStep === 3 && "Try Level 2 🚀"}
                        {activeStep === 4 && "Level Up !"}
                    </Button>
                    <Button
                        w={"100%"}
                        onClick={() => {
                            logout()
                            if (window) {
                                window.location.reload()
                            }
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
