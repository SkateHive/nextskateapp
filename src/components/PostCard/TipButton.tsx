import { usePostContext } from "@/contexts/PostContext"
import { useUserData } from "@/hooks/useUserData"
import {
    Button,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import HiveTipModal from "./HiveTipModal"
import TipModal from "./TipModal"

interface TipButtonProps {
    author: string
}

export default function TipButton({ author }: TipButtonProps) {
    const [isTipModalOpen, setIsTipModalOpen] = useState(false)
    const [token, setToken] = useState("")
    const { post } = usePostContext()
    const userData = useUserData(author)
    const [authorETHwallet, setAuthorETHwallet] = useState("")
    const [isHiveTipModalOpen, setIsHiveTipModalOpen] = useState(false)
    const [isUserEthWalletSet, setIsUserEthWalletSet] = useState(false)
    
    useEffect(() => {
        if (userData?.json_metadata) {
            const eth_address = JSON.parse(userData.json_metadata).extensions?.eth_address;
            setIsUserEthWalletSet(!!eth_address);
        }
    }, [userData]);



    const openBaseTipModal = (token: string) => {
        setToken(token)
        setIsTipModalOpen(true)
        if (isUserEthWalletSet) {
            setAuthorETHwallet(JSON.parse(userData.json_metadata).extensions.eth_address)
        }
        else {
            setAuthorETHwallet("")
        }


    }

    const handleHiveTipClick = () => {
        setIsHiveTipModalOpen(true)
    }

    return (
        <Menu >
            <MenuButton w={"auto"} as={Button} color="green.200" variant={"ghost"} size="sm">
                ⌐◨-◨
            </MenuButton>
            <MenuList bg="black" >
                <MenuItem
                    bg="black"
                    _hover={{ bg: "red.500", color: "black" }}

                    onClick={
                        () => handleHiveTipClick()
                    }
                >
                    <Image alt="hive-logo" mr={3} boxSize={"20px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />
                    $HIVE
                </MenuItem>
                {isUserEthWalletSet && (
                    <>
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "green.500", color: "black" }}
                            onClick={() => openBaseTipModal('SENDIT')}
                        >
                            <Image alt="sendit" mr={3} boxSize={"20px"} src="https://sendit.city/assets/images/image03.jpg?v=c141f3fc" />
                            $SENDIT
                        </MenuItem>
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "yellow.500" }}
                            onClick={() => openBaseTipModal('NOGS')}
                        >
                            <Image alt="nogs" mr={3} boxSize={"20px"} src="https://app.noggles.com/svg/moon-logo.svg" />
                            $NOGS
                        </MenuItem>
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "blue.500" }}
                            onClick={() => openBaseTipModal('MEMBER')}
                        >
                            <Image alt="member" mr={3} boxSize={"20px"} src="https://member.clinic/images/01-1.jpg" />
                            $MEMBER
                        </MenuItem>
                    </>
                )}
            </MenuList>

            <TipModal
                isOpen={isTipModalOpen}
                onClose={() => setIsTipModalOpen(false)}
                token={token}
                author={author}
                authorETHwallet={authorETHwallet}
            />
            <HiveTipModal
                isOpen={isHiveTipModalOpen}
                onClose={() => setIsHiveTipModalOpen(false)}
                author={author}
            />
        </Menu>

    )
}

