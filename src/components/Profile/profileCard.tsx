import { HiveAccount } from '@/lib/useHiveAuth';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Center,
    Flex,
    HStack,
    Image,
    Text,
    VStack
} from '@chakra-ui/react';
import React from 'react';
import { FaArrowDown, FaHive } from 'react-icons/fa';
import LoginModal from '../Hive/Login/LoginModal';
import UserAvatar from '../UserAvatar';
interface ProfileCardProps {
    user: HiveAccount
}

const flipCardStyles = {
    perspective: "1000px",
};

const flipCardInnerStyles = {
    position: "relative",
    width: "100%",
    height: "100%",
    textAlign: "center",
    transition: "transform 0.6s",
    transformStyle: "preserve-3d",
    willChange: "transform",
};

const flipCardFlippedStyles = {
    transform: "rotateY(180deg)",
};

const flipCardSideStyles = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    willChange: "transform",
};

const flipCardBackStyles = {
    transform: "rotateY(180deg)",
};

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const handleClick = () => {
        setIsFlipped(!isFlipped)
    }
    const user_metadata = JSON.parse(user.json_metadata || '{}');
    const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
    const userLevel = user_metadata.extensions?.level || 0;

    const handleUpdateXPClick = () => {
        console.log(userLevel);
        if (userLevel < 1) {
            setIsLoginModalOpen(true);
        }
        else {
            console.log("Update XP")
            console.log("User Level: ", userLevel)
            console.log(user_metadata)
        };
    }

    return (
        <>
            {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
            <Box sx={flipCardStyles} width="310px" height="550px" onClick={handleClick}>

                <Box sx={{ ...flipCardInnerStyles, ...(isFlipped && flipCardFlippedStyles) }}>
                    <Card
                        sx={flipCardSideStyles}
                        bg={"black"}
                        border={"2px solid white"}
                        size="sm"
                        color={"white"}
                        boxShadow="inset 0 0 30px #333, inset 10px 0 40px black, inset -10px 0 40px #003366, inset 10px 0 150px black, inset -10px 0 150px green, 0 0 30px #333, -5px 0 300px limegreen, 5px 0 40px #004d00"
                        p={2}
                        borderRadius="20px"
                        width="100%"
                        height="430px"
                        backgroundImage='https://i.pinimg.com/originals/18/9f/db/189fdb5d2fc52eac4fa2a6de6edaf222.gif'
                    >
                        <CardHeader color={'white'} borderBottom={"1px solid white"} borderTopRadius="10px" textAlign="center" bg="transparent" p={2}>
                            <HStack justifyContent={'space-between'}>
                                <HStack justifyContent={"flex-start"}>
                                    <Image src="/skatehive_square_green.png" alt="Logo" boxSize="36px" />
                                    <Text fontWeight={"bold"} fontSize={"18px"} >
                                        {user.name}
                                    </Text>
                                </HStack>
                                <Text fontWeight={"bold"} fontSize={"12px"}>

                                    Level {user_metadata.extensions['level'] || 0}
                                </Text>
                            </HStack>
                        </CardHeader>
                        <Box p={4}>
                            <CardBody bg={"transparent"}>
                                <VStack>
                                    <Center>
                                        <Box borderRadius={14} border={'3px solid black'}>
                                            <UserAvatar hiveAccount={user} borderRadius={10} boxSize={200} />
                                        </Box>
                                    </Center>
                                </VStack>
                            </CardBody>
                            <CardFooter fontSize={'16px'} fontWeight={'bold'} color={'white'} mb={-5}>
                                <VStack m={0} w={"100%"}>
                                    <Box border={'1px solid white'} w={200} borderRadius="10px" p={3}>
                                        <HStack justify={"space-between"}>
                                            <Text >
                                                Power:
                                            </Text>
                                            <Text >
                                                100
                                            </Text>
                                        </HStack>
                                        <HStack justify={"space-between"}>
                                            <Text cursor={"pointer"} >
                                                Gnars: {" "}
                                            </Text>
                                            <Text cursor={"pointer"} >
                                                soon
                                            </Text>
                                        </HStack>
                                        <HStack justify={"space-between"}>
                                            <Text cursor={"pointer"} >
                                                Xp: {" "}
                                            </Text>
                                            <Text cursor={"pointer"} >
                                                soon
                                            </Text>
                                        </HStack>
                                        <HStack justify={"space-between"}>
                                            <Text cursor={"pointer"} >
                                                Video Parts: {" "}
                                            </Text>
                                            <Text cursor={"pointer"}>
                                                soon
                                            </Text>
                                        </HStack>
                                    </Box>
                                    <CardFooter mt={5}>
                                        <Flex justify={"right"}>

                                            <Button
                                                _hover={{ background: "transparent" }}
                                                leftIcon={<FaHive size={"22px"} />}
                                                color="yellow.200"
                                                border={"1px solid white"}
                                                width={"100%"}
                                                mt={2}
                                                variant={"outline"}
                                                w={"auto"}
                                                onClick={() => handleUpdateXPClick()}
                                            >
                                                Update XP
                                            </Button>
                                        </Flex>
                                    </CardFooter>
                                </VStack>
                            </CardFooter>


                        </Box>
                    </Card>
                    <Card
                        sx={{ ...flipCardSideStyles, ...flipCardBackStyles }}
                        bg={"black"}
                        border={"2px solid white"}
                        size="sm"
                        color={"white"}
                        p={2}
                        boxShadow="inset 0 0 30px #333, inset 10px 0 40px black, inset -10px 0 40px #003366, inset 10px 0 150px black, inset -10px 0 150px green, 0 0 30px #333, -5px 0 300px limegreen, 5px 0 40px #004d00"
                        borderRadius="20px"
                        width="100%"
                        height="100%"
                        backgroundImage='https://i.pinimg.com/originals/18/9f/db/189fdb5d2fc52eac4fa2a6de6edaf222.gif'
                    >
                        <CardHeader borderBottom={"1px solid white"} borderTopRadius="10px" textAlign="center" bg="gray.900" p={2}>
                            <HStack justify={"center"}>
                                <UserAvatar hiveAccount={user} borderRadius={10} boxSize={100} />
                                <Text size="md" color="white">
                                </Text>
                            </HStack>
                        </CardHeader>
                        <CardBody textAlign="center" width="100%" height="100%" borderRadius="20px">
                            SOON !
                        </CardBody>
                        <CardFooter>
                            <Button leftIcon={<FaArrowDown />} size="sm" variant={"outline"} w={"auto"} onClick={() => setIsFlipped(false)}>
                                Back
                            </Button>
                        </CardFooter>
                    </Card>
                </Box>
            </Box>
        </>
    )
}

export default ProfileCard;