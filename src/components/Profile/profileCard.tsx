
import React, { useEffect, useMemo, useState } from 'react';
import { HiveAccount } from '@/lib/useHiveAuth';
import {
    Box, Button, Card, CardBody, CardFooter, CardHeader, Center, Flex,
    HStack, Image, Text, useDisclosure,
    useToast,
    VStack,
    Skeleton, SkeletonCircle, SkeletonText
} from '@chakra-ui/react';
import { FaPhotoVideo } from 'react-icons/fa';
import { FaGear } from "react-icons/fa6";
import '../../styles/profile-card-styles.css';
import UserAvatar from '../UserAvatar';
import EditInfoModal from "./EditInfoModal";
import { checkFollow, toogleFollow } from "@/lib/hive/client-functions";
import { toogleFollowWithPassword } from "@/lib/hive/server-functions";
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { MagModal } from '../Magazine/MagModal';
import { RiUserFollowLine, RiUserUnfollowLine } from 'react-icons/ri';

interface ProfileCardProps {
    user: HiveAccount
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    const { connectedUser, userRanking, userInfo, isLoading } = useLeaderboardData(user.name);
    const toast = useToast();
    const [isFlipped, setIsFlipped] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const userMetadata = useMemo(() => JSON.parse(user.json_metadata || '{}'), [user.json_metadata]);
    const userPostingMetadata = useMemo(() => JSON.parse(user.posting_json_metadata || '{}'), [user.posting_json_metadata]);
    const [userLevel, setUserLvl] = useState(userMetadata.extensions?.level || 1);
    const [userVideoParts, setUserVideoParts] = useState(userMetadata.extensions?.video_parts?.length || 0);
    const canEditProfile = (connectedUser == user.name);
    const [stateFollowing, setStateFollowing] = useState(false);


    // check if the connected user is already following the user
    useEffect(() => {
        if (!canEditProfile) {
            fetchFollowState();
        }
    }, [connectedUser]);

    useEffect(() => {
        // if the user is ranked between 1 and 10 they are the max level and goes on
        if (userRanking && userRanking <= 10) {
            setUserLvl(5);
        }
        // if the user is ranked between 11 and 50 they are level 4
        else if (userRanking && userRanking <= 50) {
            setUserLvl(4);
        }
        // if the user is ranked between 51 and 100 they are level 3
        else if (userRanking && userRanking <= 100) {
            setUserLvl(3);
        }
        // if the user is ranked between 101 and 200 they are level 2
        else if (userRanking && userRanking <= 200) {
            setUserLvl(2);
        }
        // if the user is ranked between 201 and 500 they are level 1
        else if (userRanking && userRanking <= 500) {
            setUserLvl(1);
        }
        // if the user is ranked between 501 and 1000 they are level 0
        else if (userRanking && userRanking <= 1000) {
            setUserLvl(0);
        }
    }, [userRanking]);

    async function fetchFollowState() {
        if (!canEditProfile) {
            const result = await checkFollow(connectedUser || "", user.name);
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
        if (!connectedUser) return
        const loginMethod = localStorage.getItem("LoginMethod")
        if (loginMethod === "keychain") {
            checkFollow(connectedUser, user.name)
                .then(result => {
                    // setIsFollowing(checkFollow(connectedUser, user.name))
                    if (window && window.hive_keychain) {
                        toogleFollow(connectedUser, user.name, !result)
                            .then((result) => {
                                if (result != 'error')
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
            checkFollow(connectedUser, user.name)
                .then(result => {
                    toogleFollowWithPassword(encKey, connectedUser, user.name, !result)
                        .then((result) => {
                            if (result != 'error')
                                setStateFollowing(result == 'blog')
                        })
                }).catch(() => {
                    console.error("error broadcasting toogle follow WP")
                })
        }
    }

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    const nextImage = (url: string) => {
        if (url.startsWith('https')) {
            return url;
        }
        return `/public/${url}`;
    };

    const handleProfileUpdate = () => {
    }

    const [isMagOpen, setIsMagOpen] = useState(false);

    return (
        <>
            {isOpen &&
                <EditInfoModal
                    onUpdate={handleProfileUpdate}
                    isOpen={isOpen}
                    onClose={onClose} user={user}
                />
            }
            {isMagOpen &&
                <MagModal username={user.name} query="blog" isOpen={isMagOpen} onClose={() => setIsMagOpen(false)} />
            }
            <Flex justify="center" direction="column" width="full" height="full">

                {/* Profile Card Container */}
                <Box id="containerCardProfile"
                    border="2px solid white"            // thick border to add with cards borders
                    borderRadius="10px"                 // adding 3d effect
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
                        bg={'transparent'}                  // need to be here for chakra
                        color="white"                       // ...
                        position={'absolute'}               // do not remove
                        transition="0.6s"                   // hack
                        border="2px solid white"            // thick border to add with container borders
                        borderRadius="10px"                 // adding 3d effect
                        opacity={isFlipped ? '0' : '1'}     // display hide when flip
                        zIndex={isFlipped ? '0' : '2'}      //  ...
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
                                        {isLoading ? <Skeleton height="20px" width="100px" /> : user.name}
                                    </Text>
                                </HStack>

                                <Text fontWeight="bold" fontSize="18px"
                                    textShadow="2px 2px 1px rgba(0,0,0,1)">
                                    {isLoading ? <Skeleton height="20px" width="50px" /> : `Rank ${userRanking}`}
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
                                        {isLoading ? <SkeletonCircle size="150px" /> : <UserAvatar hiveAccount={user} borderRadius={14} boxSize={150} size="" />}
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
                                        <Text>{isLoading ? <Skeleton height="20px" width="50px" /> : `${userInfo?.hp_balance.toFixed(0)} HP`}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Image src="/logos/gnars_logo.png" alt="Logo" boxSize="18px" />
                                            <Text cursor="pointer">Gnars:</Text>
                                        </HStack>
                                        <Text cursor="pointer">{isLoading ? <Skeleton height="20px" width="50px" /> : `${String(userInfo?.gnars_balance) || 0}`}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <Image src="/skatehive_square_green.png" alt="Logo" boxSize="20px" />
                                            <Text cursor="pointer">Exp:</Text>
                                        </HStack>
                                        <Text cursor="pointer">{isLoading ? <Skeleton height="20px" width="50px" /> : `${Math.ceil(userInfo?.points || 0)} XP`}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text cursor="pointer">📹 VideoParts:</Text>
                                        <Text cursor="pointer">{isLoading ? <Skeleton height="20px" width="50px" /> : `${userVideoParts || 0}`}</Text>
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
                                            <HStack>
                                                <Button className={`box-level-${userLevel} btn-profile-card`}
                                                    width="100%"
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
                                                ><FaGear size={"22"} /></Button>
                                                <Button className={`box-level-${userLevel} btn-profile-card`}
                                                    width="100%"
                                                    leftIcon={<FaPhotoVideo size={"22px"} />}
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
                                                        setIsMagOpen(true);
                                                    }}
                                                >MAGAZINE</Button>
                                            </HStack>
                                        ) : (
                                            <HStack justifyContent={"space-between"} gap={-2}>
                                                <Button className={`box-level-${userLevel} btn-profile-card`}
                                                    // _hover={{ background: "black", color:"white!important" }}
                                                    leftIcon={stateFollowing ? <RiUserFollowLine size={"22px"} /> : <RiUserUnfollowLine size={"22px"} />}
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
                                                    {isLoading ? <Skeleton height="20px" width="70px" /> : (stateFollowing ? "Unfollow" : "Follow")}
                                                </Button>
                                                <Button className={`box-level-${userLevel} btn-profile-card`}
                                                    width="100%"
                                                    leftIcon={<FaPhotoVideo size={"22px"} />}
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

                                                        setIsMagOpen(true);
                                                    }}
                                                >MAGAZINE</Button>
                                            </HStack>
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
                        borderRadius="10px"                 // adding 3d effect
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
                                        {isLoading ? <Skeleton height="20px" width="100px" /> : user.name}
                                    </Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="18px"
                                    textShadow="2px 2px 1px rgba(0,0,0,1)">
                                    {isLoading ? <Skeleton height="20px" width="50px" /> : `Rank ${userLevel}`}
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
                                    {isLoading ? <SkeletonCircle size="20" /> : <UserAvatar hiveAccount={user} borderRadius={100} boxSize={20} />}
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
                                    {isLoading ? <SkeletonText noOfLines={4} spacing="4" /> : (typeof userPostingMetadata.profile?.about === "string" && userPostingMetadata.profile.about.length > 235
                                        ? userPostingMetadata.profile.about.substr(0, 235) + '...'
                                        : userPostingMetadata.profile?.about || "I'm too lazy to write a bio."
                                    )}

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
                                        <Box fontWeight="bold" fontSize="18px">
                                            {isLoading ? <Skeleton height="20px" width="50px" /> : `XP ${userInfo?.points || 0}`}
                                        </Box>
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
