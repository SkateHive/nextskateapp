import useHiveBalance from '@/hooks/useHiveBalance';
import { HiveAccount } from '@/lib/useHiveAuth';
import { updateProfile } from '@/lib/hive/client-functions';
import { updateProfileWithPrivateKey } from '@/lib/hive/server-functions';
import {
    Box, Button, Card, CardBody, CardFooter, CardHeader, Center, Flex,
    HStack, Image, Text, useDisclosure, VStack, useToast,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { FaHive } from 'react-icons/fa';
import { FaPencil } from "react-icons/fa6"
import UserAvatar from '../UserAvatar';
import useGnarsBalance from '@/hooks/useGnarsBalance';
import EditInfoModal from "./EditInfoModal"
import '../../styles/profile-card-styles.css';

import { dummyMissions, xpThresholds } from './missionsData';
import { useHiveUser } from '@/contexts/UserContext';

import { toogleFollowWithPassword } from "@/lib/hive/server-functions"
import { toogleFollow, checkFollow } from "@/lib/hive/client-functions"

interface ProfileCardProps {
    user: HiveAccount
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    const toast = useToast();
    var levelingUp = false;
    const connectedUser = useHiveUser();

    const [isFlipped, setIsFlipped] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const userMetadata = useMemo(() => JSON.parse(user.json_metadata || '{}'), [user.json_metadata]);
    const userPostingMetadata = useMemo(() => JSON.parse(user.posting_json_metadata || '{}'), [user.posting_json_metadata]);

    const gnarsBalance = useGnarsBalance(userMetadata.extensions?.eth_address || '');
    const { hivePower } = useHiveBalance(user);

    const [userXp, setUserXp] = useState(userMetadata.extensions?.staticXp || 0);
    const [userLevel, setUserLvl] = useState(userMetadata.extensions?.level || 1);
    const [userVideoParts, setUserVideoParts] = useState(userMetadata.extensions?.video_parts?.length || 0);

    const [buttonDisabled, setButtonDisabled] = useState(false);

    const connectedUserName = connectedUser.hiveUser?.name || "";
    const canEditProfile = (connectedUser.hiveUser?.name == user.name);
    const [isFollowing, setIsFollowing] = useState(() => fetchFollowState());
    const [stateFollowing, setStateFollowing] = useState(false);
    

    async function fetchFollowState() {
        if (!canEditProfile) {
            const result = await checkFollow(connectedUser.hiveUser?.name || "", user.name);
            setStateFollowing(result)
            return result;
        }
        return false;
    }

    const displayKeyChainError = () => {
        toast({
            title: "Error Broadcasting.",
            description: "Check if your Keychain is Enabled.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }

    const handleFollowButton = async () => {
        if (!connectedUserName) return
        const loginMethod = localStorage.getItem("LoginMethod")
        if (loginMethod === "keychain") {
            checkFollow(connectedUserName, user.name)
                .then(result => {
                    // setIsFollowing(checkFollow(connectedUserName, user.name))
                    if (window && window.hive_keychain) {
                        toogleFollow(connectedUserName, user.name, !result)
                            .then((result)=>{
                                if(result != 'error')
                                    setStateFollowing(result == 'blog')
                            })
                            .catch(() => {
                                displayKeyChainError();
                            });
                    } else {
                        displayKeyChainError();
                    }
                })
        } else if (loginMethod === "privateKey") {
            const encKey = localStorage.getItem("encryptedPrivateKey")
            checkFollow(connectedUserName, user.name)
                .then(result => {
                    toogleFollowWithPassword(encKey, connectedUserName, user.name, !result)
                        .then((result)=>{
                            if(result != 'error')
                                setStateFollowing(result == 'blog')
                        })
                }).catch(() => {
                    console.error("error broadcasting toogle follow WP")
                })
        }
    }

    const onDoubleClickHandler = () => { }

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    const nextImage = (url: string) => {
        if (url.startsWith('https')) {
            return url;
        }
        return `/public/${url}`;
    };

    function calculateLevel(xp: number): number {
        let level = 1;
        for (let i = 1; i < xpThresholds.length; i++) {
            if (xp >= xpThresholds[i]) {
                level = i + 1;
            }
        }
        return level;
    }

    const safeParse = (jsonString: string) => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return null;
        }
    };

    function isMissionCompleted(user: any): number {
        var totalXP = userXp; //xpThresholds[userLevel-1];
        var json = safeParse(user.posting_json_metadata)
        var ext = safeParse(user.json_metadata)
        // console.log("Before totalXP: " + totalXP);
        if (userLevel == 1) {
            if (json.profile?.profile_image)
                totalXP += dummyMissions[userLevel][0].xp;

            if (json.profile?.name && json.profile?.about)
                totalXP += dummyMissions[userLevel][1].xp;

            if (user.last_post)
                totalXP += dummyMissions[userLevel][2].xp;

        } else if (userLevel == 2) {
            if (user.witness_votes.includes("skatehive"))
                totalXP += dummyMissions[userLevel][0].xp;

            if (ext?.extensions?.eth_address)
                totalXP += dummyMissions[userLevel][1].xp;

            if (user.post_count > 5)
                totalXP += dummyMissions[userLevel][2].xp;

        } else if (userLevel == 3) {
            if (hivePower > 50)
                totalXP += dummyMissions[userLevel][0].xp;

            if (user.last_post && new Date(user.last_post).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
                totalXP += dummyMissions[userLevel][1].xp;

            if (user.post_count > 100)
                totalXP += dummyMissions[userLevel][2].xp;
        } else if (userLevel == 4) {
            // totalXP += dummyMissions[userLevel][0].xp;
            if (parseFloat(user.savings_hbd_balance.replace(/[^0-9.]/g, '')) >= 100)
                totalXP += dummyMissions[userLevel][1].xp;
            // totalXP += dummyMissions[userLevel][2].xp;
        }
        // console.log(totalXP);
        return totalXP;
    }

    function calculateTotalXp(user: HiveAccount) {
        return isMissionCompleted(user);
    };

    const handleProfileUpdate = () => {
    }

    function levelUpUser(newuserXP: number, newLevel: number) {
        const loginMethod = localStorage.getItem('LoginMethod');
        if (loginMethod === 'keychain') {
            updateProfile(
                String(user.name),
                userPostingMetadata.profile.name,
                userPostingMetadata.profile.about,
                userPostingMetadata.profile.location,
                userPostingMetadata.profile.cover_image,
                userPostingMetadata.profile.profile_image,
                userPostingMetadata.profile.website,
                userMetadata.extensions?.eth_address,
                userMetadata.extensions?.video_parts,
                newLevel,           // Pass the new level
                newuserXP,          // Pass the updated XP
                newuserXP,          // Pass the cumulative XP ??????
            ).then((result) => {
                console.log(result);
                if (result) {
                    setUserXp(newuserXP);
                    setUserLvl(newLevel);
                }
                setButtonDisabled(false); // Set the button to be enabled
                levelingUp = false;
            });
        }
        else if (loginMethod === 'privateKey') {
            // Handle the private key method if necessary
            const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
            updateProfileWithPrivateKey(
                encryptedPrivateKey,
                String(user.name),
                userPostingMetadata.profile.name,
                userPostingMetadata.profile.about,
                userPostingMetadata.profile.location,
                userPostingMetadata.profile.cover_image,
                userPostingMetadata.profile.profile_image,
                userPostingMetadata.profile.website,
                userMetadata.extensions?.eth_address,
                userMetadata.extensions?.video_parts,
                newLevel,           // Pass the new level
                newuserXP,          // Pass the updated XP
            ).then((result) => {
                if (result) {
                    setUserXp(newuserXP);
                    setUserLvl(newLevel);
                }
                setButtonDisabled(false); // Set the button to be enabled
                levelingUp = false;
            });
        }
    }

    const handleLevelUp = () => {
        // console.log(levelingUp);
        if (levelingUp)
            return;

        // prevent double click
        levelingUp = true;
        setButtonDisabled(true); // Set the button to be disabled

        // calculate new xp and level
        var newuserXP = calculateTotalXp(user);
        const newLevel = calculateLevel(newuserXP);  // Calculate the new level based on available XP
        if ((newLevel == userLevel)) {
            toast({
                title: "Can´t upgrade yet.",
                description: "Earn more XP before upgrading level",
                status: "loading",
                duration: 5000,
                isClosable: true,
            });
            levelingUp = false;         //end level up
            setButtonDisabled(false); // enable button back
            return;
        }

        // levelUpUser(0, 0);
        levelUpUser(newuserXP, newLevel);
    };

    return (<>
        {isOpen &&
            <EditInfoModal onUpdate={handleProfileUpdate} isOpen={isOpen}
                onClose={onClose} user={user} />}

        <Flex justify="center" direction="column" width="full" height="full">

            {/* Profile Card Container */}
            <Box id="containerCardProfile"
                border="2px solid white"            // thick border to add with cards borders
                borderRadius="20px"                 // adding 3d effect
                position="relative" className={`level-${userLevel}`}
                transition="0.6s"
                transform={isFlipped ? 'rotateY(180deg) translateZ(1px)' : 'none'}
                onClick={handleClick}
                zIndex={0}
                style={{
                    transformStyle: 'preserve-3d',
                    perspective: '2000px',
                    width: '310px',
                    height: '480px',
                }}
            >

                {/* Profile Card Front Side */}
                <Card id="front-side-card"
                    className={`front-card-profile`}
                    // border="2px solid white" 
                    // borderRadius="20px"
                    bg={'transparent'}                  // need to be here for chakra
                    color="white"                       // ...
                    position={'absolute'}               // do not remove
                    transition="0.6s"                   // hack
                    border="2px solid white"            // thick border to add with container borders
                    borderRadius="20px"                 // adding 3d effect
                    opacity={isFlipped ? '0' : '1'}     // display hide when flip
                    zIndex={isFlipped ? '0' : '2'}      //  ...
                    style={{
                        // backfaceVisibility: 'visible',  // Changed to visible   DONT need anymore?
                        // perspective: 'none',            // Removed perspective  test smoth animation
                    }}
                >
                    <CardHeader id='frontSideHeader'
                        borderTopRadius="10px"
                        textAlign="center"
                        bg="transparent"
                        p={2}
                        borderBottom="1px solid white"
                        style={{ backfaceVisibility: 'hidden', }}
                    >
                        <HStack justifyContent="space-between">
                            <HStack justifyContent="flex-start">
                                <Text fontWeight="bold" fontSize="18px"
                                    textShadow="2px 2px 1px rgba(0,0,0,1)">
                                    {user.name}
                                </Text>
                            </HStack>
                            {/* <Text fontWeight="bold" fontSize="18px"
                                  textShadow="2px 2px 1px rgba(0,0,0,1)">
                                XP {userXp}
                            </Text> */}
                            <Text fontWeight="bold" fontSize="18px"
                                textShadow="2px 2px 1px rgba(0,0,0,1)">
                                Lvl {userLevel}
                            </Text>
                        </HStack>
                    </CardHeader>

                    <CardBody id='frontSideBody'
                        bg="transparent"
                        style={{ backfaceVisibility: 'hidden', }}
                    >
                        <VStack>
                            <Center>
                                <Box borderRadius={14} border="3px solid white">
                                    <UserAvatar hiveAccount={user} borderRadius={14} boxSize={150} size="" />
                                </Box>
                            </Center>
                        </VStack>

                        <VStack w="100%" marginTop={5}>
                            <Box w={230}
                                p={2}
                                className={`box-level-${userLevel}`}
                            >
                                <HStack justify="space-between">
                                    <HStack>
                                        <Image src="/logos/hp_logo.png" alt="Logo" boxSize="20px" />
                                        <Text>Power:</Text>
                                    </HStack>
                                    <Text>{hivePower.toFixed(0)} HP</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <HStack>
                                        <Image src="/logos/gnars_logo.png" alt="Logo" boxSize="18px" />
                                        <Text cursor="pointer">Gnars:</Text>
                                    </HStack>
                                    <Text cursor="pointer">{String(gnarsBalance.gnarsBalance) || 0}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <HStack>
                                        <Image src="/skatehive_square_green.png" alt="Logo" boxSize="20px" />
                                        <Text cursor="pointer">Exp:</Text>
                                    </HStack>
                                    <Text cursor="pointer">{userXp} XP</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text cursor="pointer">📹 VideoParts:</Text>
                                    <Text cursor="pointer">{userVideoParts || 0}</Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </CardBody>

                    <CardFooter id='frontSideFooter'
                        fontSize="16px" fontWeight="bold"
                        color="white"
                        style={{ backfaceVisibility: 'hidden', }}
                    >
                        <VStack w="100%">
                            <Flex justify="center">
                                <div style={{ zIndex: 10 }}>
                                    {canEditProfile ? (
                                        <>
                                            <Button className={`box-level-${userLevel} btn-profile-card`}
                                                // _hover={{ background: "black", color:"white!important" }}
                                                // color="white"
                                                // border="1px solid white"
                                                width="100%"
                                                leftIcon={<FaPencil size={"22px"} />}
                                                m={2}
                                                variant="outline"
                                                w="auto"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    position: 'relative',
                                                    zIndex: 15              // button high above others divs
                                                }}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onOpen();
                                                }}
                                            ></Button>
                                            <Button className={`box-level-${userLevel} btn-profile-card`}
                                                // _hover={{ background: "black", color:"white!important" }}
                                                leftIcon={<FaHive size={"22px"} />}
                                                width={"100%"}
                                                m={2}
                                                variant={"outline"}
                                                w={"auto"}
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    position: 'relative',
                                                    zIndex: 15              // button high above others divs
                                                }}
                                                disabled={buttonDisabled}
                                                onDoubleClick={onDoubleClickHandler}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleLevelUp();
                                                }}
                                            >Upgrade</Button>
                                        </>) : (
                                        <Button className={`box-level-${userLevel} btn-profile-card`}
                                            // _hover={{ background: "black", color:"white!important" }}
                                            leftIcon={<FaHive size={"22px"} />}
                                            width={"100%"}
                                            m={2}
                                            variant={"outline"}
                                            w={"auto"}
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                position: 'relative',
                                                zIndex: 15              // button high above others divs
                                            }}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleFollowButton();
                                            }}
                                        >
                                            {stateFollowing ? "Unfollow" : "Follow"}
                                        </Button>
                                    )}
                                </div>
                            </Flex>
                        </VStack>
                    </CardFooter>
                </Card>

                {/* Back side of the card */}
                <Card id="back-side-card" className={`back-card-profile`}
                    position={'absolute'}
                    color="white"                       //move from css to here for chakra
                    bg={'transparent'}                  //need to be here for chakra
                    border="2px solid white"            // thick border to add with container borders
                    borderRadius="20px"                 // adding 3d effect
                    opacity={isFlipped ? '1' : '0'}     // visible when flipped
                    zIndex={isFlipped ? '2' : '0'}      // send to back when flipped
                >

                    <CardHeader id='backSideHeader'
                        borderTopRadius="10px"
                        textAlign="center"
                        bg="transparent"
                        p={2}
                        borderBottom="1px solid white"
                        style={{ backfaceVisibility: 'hidden', }}
                    >
                        <HStack justifyContent="space-between">
                            <HStack justifyContent="flex-start">
                                <Text fontWeight="bold" fontSize="18px"
                                    textShadow="2px 2px 1px rgba(0,0,0,1)">
                                    {user.name}
                                </Text>
                            </HStack>
                            {/* <Text fontWeight="bold" fontSize="18px"
                                  textShadow="2px 2px 1px rgba(0,0,0,1)">
                                XP {userXp}
                            </Text> */}
                            <Text fontWeight="bold" fontSize="18px"
                                textShadow="2px 2px 1px rgba(0,0,0,1)">
                                Lvl {userLevel}
                            </Text>
                        </HStack>
                    </CardHeader>

                    <CardBody id='backSideBody'
                        textAlign="center"
                        width="100%"
                        height="100%"
                        borderRadius="20px"
                        padding={0}
                        marginTop={0.2}
                    >
                        <CardHeader id='backSideBodyHeader'
                            style={{
                                backgroundImage: `url(${nextImage(userPostingMetadata?.profile?.cover_image || `https://images.ecency.com/webp/u/${user.name}/cover/small`)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderBottom: '1px solid silver',
                                borderRight: '1px solid silver',
                                borderRadius: '10px',
                                textAlign: 'center',
                                backgroundColor: 'gray.900',
                                padding: '0.5em',
                                margin: '1em 0em 2em 0em'
                            }}>
                            <HStack justify="center">
                                <UserAvatar hiveAccount={user} borderRadius={100} boxSize={20} />
                                <Text size="md" color="white"></Text>
                            </HStack>
                        </CardHeader>

                        <HStack justify="center">
                            <Box className={`box-level-${userLevel}`}
                                border="1px solid white"
                                borderRadius="10px"
                                minH={200}
                                minW={250}
                            >
                                {userPostingMetadata.profile?.about.length > 235
                                    ? userPostingMetadata.profile?.about.substr(0, 235) + '...'
                                    : userPostingMetadata.profile?.about
                                    || "I'm too lazy to write a bio."
                                }
                            </Box>
                        </HStack>

                    </CardBody>


                    <CardFooter id='frontSideFooter'
                        fontSize="16px" fontWeight="bold"
                        color="white"
                        style={{ backfaceVisibility: 'hidden', }}
                    >
                        <VStack w="100%">
                            <Flex justify="center">
                                <Box className={`box-level-${userLevel}`}
                                    border="1px solid white"
                                    borderRadius="10px"
                                    p={2}
                                >
                                    <Text fontWeight="bold" fontSize="18px">
                                        XP {userXp}
                                    </Text>
                                </Box>
                            </Flex>
                        </VStack>
                    </CardFooter>
                </Card>

            </Box>
        </Flex>
    </>);
}

export default ProfileCard;
