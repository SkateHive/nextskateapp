'use client'
import {
    Avatar,
    Button,
    Center,
    Divider,
    HStack,
    Text,
    VStack,
    Grid,
    Box,
    GridItem,
    Tooltip
} from "@chakra-ui/react"
import { FaHive } from "react-icons/fa"
import { useHiveUser } from "@/contexts/UserContext"
import { claimRewards } from "@/lib/hive/client-functions"
import { useEffect, useState } from "react"
import { FaGift } from "react-icons/fa"
import { convertVestingSharesToHivePower } from "../utils/calculateHP"

function HiveBox() {
    const { hiveUser } = useHiveUser()
    const vestingShares = String(hiveUser?.vesting_shares).split(" ")[0]
    const delegatedVestingShares = hiveUser?.delegated_vesting_shares
    const receivedVestingShares = hiveUser?.received_vesting_shares
    const [hivePower, setHivePower] = useState('')
    const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState('')
    const [HPthatUserDelegated, setHPthatUserDelegated] = useState(0)
    const [totalHP, setTotalHP] = useState(0)

    const calculateHP = async () => {
        const HP = await convertVestingSharesToHivePower(String(vestingShares), String(delegatedVestingShares), String(receivedVestingShares)).then((res) => {
            setHivePower(res.hivePower)
            setDelegatedToUserInUSD(res.delegatedToUserInUSD)
            setHPthatUserDelegated(Number(res.DelegatedToSomeoneHivePower))
            const sum = Number(res.DelegatedToSomeoneHivePower) + Number(res.hivePower)
            setTotalHP(sum)
        })
    }

    useEffect(() => {
        calculateHP();
    }, [hiveUser]);

    return (
        <VStack
            w={"100%"}
            gap={6}
            align={"normal"}
            p={4}
            flex="1"
            border={"1px solid red"}
        >
            <Center>
                <HStack>
                    <FaHive />
                    <Text align={"center"} fontSize={28}>
                        Hive Wallet
                    </Text>
                </HStack>
            </Center>
            <Divider mt={-6} color="limegreen" />
            {hiveUser ? (
                <VStack align={"normal"}>
                    <Center>
                        <HStack>
                            <Avatar
                                name={hiveUser.name}
                                src={hiveUser.metadata?.profile.profile_image}
                                borderRadius={"100%"}
                                size="md"
                                bg="gray.200"
                            />
                            <Text fontSize={22}>{hiveUser.name}</Text>
                            <Tooltip
                                border={"1px solid red"}
                                color={"black"}
                                bg={"white"}
                                placement="right-start"
                                label={
                                    <Text>Rewards to Claim : <br /> HBD: {String(hiveUser.reward_hbd_balance)}<br />
                                        Hive {String(hiveUser.reward_hive_balance)}<br />
                                        HP {String(hiveUser.reward_vesting_hive)}
                                    </Text>}
                            >
                                <FaGift onClick={() => claimRewards(hiveUser)}>Claim!</FaGift>
                            </Tooltip>
                        </HStack>
                    </Center>
                    <VStack align={"normal"} gap={0}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                            <GridItem>
                                <Box >
                                    <Box border={"1px solid red"}>
                                        <Center>
                                            <Text>{String(hiveUser.balance)}</Text>
                                        </Center>
                                    </Box>
                                    <Box border={"1px solid red"}>
                                        <Center>
                                            <Text>{String(hiveUser.hbd_balance)}</Text>
                                        </Center>
                                    </Box>
                                </Box>
                            </GridItem>
                            <GridItem>
                                <Box>
                                    <Box border={"1px solid red"}>
                                        <Center>
                                            <Text>Savings: {String(hiveUser.savings_hbd_balance)}</Text>
                                        </Center>
                                    </Box>
                                    <Box border={"1px solid red"}>
                                        <Center>
                                            <Text>HivePower: {totalHP.toFixed(3)} </Text>
                                        </Center>
                                    </Box>
                                </Box>
                                <Box> </Box>
                            </GridItem>
                        </Grid>
                    </VStack>
                </VStack>
            ) : null}
        </VStack>
    )
}

export default HiveBox;