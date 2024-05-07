'use client'
import React from 'react';
import {
    Box,
    Link,
    Stack,
    Heading,
    Flex,
    Text,
    Image,
    useColorModeValue,
    Divider,
    HStack,

} from '@chakra-ui/react';
import { FaEthereum } from 'react-icons/fa';
import { FaHome } from 'react-icons/fa';
import { FaSpeakap } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaWallet } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';
import NotificationsPage from '@/app/notifications/page';
import CommunityTotalPayout from '../communityTotalPayout';
import { useHiveUser } from '@/contexts/UserContext';

const Sidebar2 = () => {
    const user = useHiveUser();
    const hiveUser = user.hiveUser;
    const [notifications, setNotifications] = React.useState(false);

    const handleNotifications = () => {
        setNotifications(!notifications)
    }


    return (
        <Box
            bg='Black'
            w={{ base: "full", md: 250 }}
            px={4}
            py={6}
        >

            <Heading size="md" mb={6}>
                <Image mb={1} src="/skatehive-banner.png" w={"100%"} h={"auto"} alt="SkateHive" />
            </Heading>
            <Divider mb={3} mt={3} style={{ color: 'limegreen', borderColor: 'limegreen' }} />
            <CommunityTotalPayout />
            <HStack padding={0} gap={3} fontSize={"22px"}>
                <FaHome size={"22px"} />
                <Link href={"/"}>Home</Link>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
                <FaSpeakap size={"22px"} />
                <Link href={"/plaza"}>Plaza</Link>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
                <FaEthereum size={"22px"} />
                <Link href={"/dao"}>Dao</Link>
            </HStack>
            {hiveUser ? (
                <>
                    <HStack padding={0} gap={3} fontSize={"22px"}>
                        <FaUser size={"22px"} />
                        <Link href={`/profile/${hiveUser.name}`}>Profile</Link>
                    </HStack>
                    <HStack padding={0} gap={3} fontSize={"22px"}>
                        <FaWallet size={"22px"} />
                        <Link href={`/wallet`}>Wallet</Link>
                    </HStack>
                    <HStack cursor={"pointer"} onClick={handleNotifications} padding={0} gap={3} fontSize={"22px"}>
                        <FaBell size={"22px"} />
                        <Text> Notifications</Text>
                    </HStack>
                    {notifications ? <NotificationsPage /> : null}

                </>
            ) : null}
            <Flex mt={10} direction="column" align="flex-start">
                <Text mb={2} fontSize="sm" color="gray.600">
                    Resources
                </Text>
                <Link href="#">API Docs</Link>
                <Link href="#">Community</Link>
            </Flex>
        </Box>
    );
};

export default Sidebar2;
