import { FaDonate } from "react-icons/fa"
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from "@chakra-ui/react"
import { useState } from "react"

import TipModal from "./TipModal"


export default function TipButton() {
    const [isTipModalOpen, setIsTipModalOpen] = useState(false)
    const [token, setToken] = useState("")

    const openTipModal = (token: string) => {
        setToken(token)
        setIsTipModalOpen(true)
    }

    return (
        <Menu >
            <MenuButton leftIcon={<FaDonate />} w={"auto"} as={Button} color="limegreen" variant={"outline"} size="sm">
                Support
            </MenuButton>
            <MenuList bg="black" >
                <MenuItem bg="black"
                    onClick={() => openTipModal('HIVE')}
                >Send Hive</MenuItem>
                <MenuItem bg="black"
                    onClick={() => openTipModal('SENDIT')}
                >
                    Send it
                </MenuItem>
                <MenuItem bg="black"
                    onClick={() => openTipModal('NOGS')}
                > Tip ⌐◨-◨ </MenuItem>
                <MenuItem bg="black"
                    onClick={() => openTipModal('MEMBER')}
                > Tip Member</MenuItem>

            </MenuList>
            <TipModal
                isOpen={isTipModalOpen}
                onClose={() => setIsTipModalOpen(false)}
                token={token}
                author="Samuel Veliz"
            />
        </Menu>

    )
}

