import { usePostContext } from "@/contexts/PostContext";
import HiveClient from "@/lib/hive/hiveclient";
import {
    Button,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from "@chakra-ui/react";
import { useState } from "react";
import HiveTipModal from "./HiveTipModal";
import TipModal from "./TipModal";

interface TipButtonProps {
    author: string;
}

interface UserData {
    json_metadata: string;
}
export const getUserData = async (username: string) => {
    const response = await HiveClient.database.call('get_accounts', [[username]]);
    const userData = response[0];
    return userData;
};
export default function TipButton({ author }: TipButtonProps) {
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [token, setToken] = useState<string>("");
    const { post } = usePostContext();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [authorETHwallet, setAuthorETHwallet] = useState<string>("");
    const [isHiveTipModalOpen, setIsHiveTipModalOpen] = useState(false);
    const [isUserEthWalletSet, setIsUserEthWalletSet] = useState(false);

    const fetchUserData = async () => {
        const data = await getUserData(author); // Use the new getUserData function
        setUserData(data);
        handleCheckUserEthWallet(data);
    };

    const handleCheckUserEthWallet = (data: UserData) => {
        if (data?.json_metadata) {
            const eth_address = JSON.parse(data.json_metadata).extensions?.eth_address;
            setIsUserEthWalletSet(!!eth_address);
        }
    };

    const openBaseTipModal = (token: string) => {
        setToken(token);
        setIsTipModalOpen(true);
        if (isUserEthWalletSet && userData) {
            setAuthorETHwallet(JSON.parse(userData.json_metadata).extensions.eth_address);
        } else {
            setAuthorETHwallet("");
        }
    };

    const handleHiveTipClick = () => {
        setIsHiveTipModalOpen(true);
    };

    return (
        <Menu>
            <MenuButton onClick={fetchUserData} w={"auto"} as={Button} color="green.200" variant={"ghost"} _hover={{
                background: "none",
            }} size="sm">
                ⌐◨-◨
            </MenuButton>
            <MenuList bg="black">
                <MenuItem
                    bg="black"
                    _hover={{ bg: "red.500", color: "black" }}
                    onClick={handleHiveTipClick}
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
    );
}
