import { useHiveUser } from "@/contexts/UserContext";
import HiveClient from "@/lib/hive/hiveclient";
import { Button, Center, Image, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import HiveTipModal from "./HiveTipModal";
import TipModal from "./TipModal";

interface TipButtonProps {
    author: string;
    permlink: string;
}

interface UserData {
    json_metadata: string;
}

export const getUserData = async (username: string) => {
    const response = await HiveClient.database.call("get_accounts", [[username]]);
    return response[0];
};

export const getPost = async (author: string, permlink: string) => {
    const response = await HiveClient.database.call("get_content", [author, permlink]);
    return response;
};

export default function TipButton({ author, permlink }: TipButtonProps) {
    const { hiveUser } = useHiveUser();
    const [isHiveTipModalOpen, setIsHiveTipModalOpen] = useState(false);
    const [post, setPost] = useState<any>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isUserEthWalletSet, setIsUserEthWalletSet] = useState(false);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [token, setToken] = useState<string>("");
    const [authorETHwallet, setAuthorETHwallet] = useState<string>("");

    useEffect(() => {
    }, [author, permlink]);

    const fetchUserData = async () => {
        if (author) {
            const data = await getUserData(author);
            setUserData(data);
            handleCheckUserEthWallet(data);
        } else {
            console.warn("Author is empty, unable to fetch user data.");
        }
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

    const loadPost = async () => {
        try {
            const loadedPost = await getPost(author, permlink);
            setPost(loadedPost);
        } catch (error) {
            console.error("Failed to load post:", error);
        }
    };

    const handleHiveTipClick = async () => {
        await loadPost();
        if (post) {
            setIsHiveTipModalOpen(true);
        } else {
            console.warn("The post was not found.");
        }
    };

    return (
        <Menu>
            <Tooltip
                label="Support !"
                bg={"black"}
                color={"limegreen"}
                border={"1px dashed #A5D6A7"}
            >
                <MenuButton
                    _active={{ bg: "transparent" }}
                    onClick={fetchUserData}
                    w={"auto"}
                    as={Button}
                    color="green.200"
                    variant={"ghost"}
                    _hover={{ background: "none" }}
                    size="sm"
                >
                    ⌐◨-◨
                </MenuButton>
            </Tooltip>
            <MenuList color={"white"} bg="black">
                {!hiveUser ? (
                    <Center>
                        <Text fontSize="sm" color="gray.400" p={3}>
                            Please log in to tip the author!
                        </Text>
                    </Center>
                ) : (
                    <>
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
                                    onClick={() => openBaseTipModal("SENDIT")}
                                >
                                    <Image alt="sendit" mr={3} boxSize={"20px"} src="https://sendit.city/assets/images/image03.jpg?v=c141f3fc" />
                                    $SENDIT
                                </MenuItem>
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "yellow.500" }}
                                    onClick={() => openBaseTipModal("NOGS")}
                                >
                                    <Image alt="nogs" mr={3} boxSize={"20px"} src="/logos/nog.png" />
                                    $NOGS
                                </MenuItem>
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "blue.500" }}
                                    onClick={() => openBaseTipModal("MEMBER")}
                                >
                                    <Image alt="member" mr={3} boxSize={"20px"} src="https://member.clinic/images/01-1.jpg" />
                                    $MEMBER
                                </MenuItem>
                            </>
                        )}
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
                author={post?.author}
                permlink={post?.permlink}
                post={post}
            />
        </Menu>
    );
}
