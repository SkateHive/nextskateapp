import { FaDonate } from "react-icons/fa"
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Image
} from "@chakra-ui/react"
import { useState } from "react"
import usePosts from "@/hooks/usePosts"
import TipModal from "./TipModal"
import { usePostContext } from "@/contexts/PostContext";
import { useUserData } from "@/hooks/useUserData"

export default function TipButton() {
    const [isTipModalOpen, setIsTipModalOpen] = useState(false)
    const [token, setToken] = useState("")
    const { post } = usePostContext()
    const [author] = post?.author.split("/") || []
    const userData = useUserData(author)
    const [authorETHwallet, setAuthorETHwallet] = useState("")

    const openTipModal = (token: string) => {
        setToken(token)
        setIsTipModalOpen(true)
        setAuthorETHwallet(JSON.parse(userData.json_metadata).extensions.eth_address)

    }

    return (
        <Menu >
            <MenuButton leftIcon={<FaDonate />} w={"auto"} as={Button} color="limegreen" variant={"outline"} size="sm">
                Support
            </MenuButton>
            <MenuList bg="black" >
                <MenuItem
                    bg="black"
                    onClick={
                        () => openTipModal('HIVE')
                    }
                >
                    <Image mr={3} boxSize={"20px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />
                    Tip $HIVE
                </MenuItem>
                <MenuItem
                    bg="black"
                    onClick={
                        () => openTipModal('SENDIT')
                    }
                >
                    <Image mr={3} boxSize={"20px"} src="https://sendit.city/assets/images/image03.jpg?v=c141f3fc" />
                    Tip $SENDIT
                </MenuItem>
                <MenuItem
                    bg="black"
                    onClick={
                        () => openTipModal('NOGS')
                    }
                >
                    <Image mr={3} boxSize={"20px"} src="https://app.noggles.com/svg/moon-logo.svg" />
                    Tip $NOGS
                </MenuItem>
                <MenuItem
                    bg="black"
                    onClick={
                        () => openTipModal('MEMBER')
                    }
                ><Image mr={3} boxSize={"20px"} src="https://member.clinic/images/01-1.jpg" />
                    Tip $MEMBER</MenuItem>

            </MenuList>
            <TipModal
                isOpen={isTipModalOpen}
                onClose={() => setIsTipModalOpen(false)}
                token={token}
                author={author}
                authorETHwallet={authorETHwallet}
            />
        </Menu>

    )
}

