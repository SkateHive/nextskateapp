'use client'

import {
    Box,
    Center,
    Flex,
    HStack,
    Image,
    Skeleton,
    SkeletonText,
    Text,
    VStack,
    Collapse
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchPortfolio } from "../utils/fetchPortfolio";
import * as Types from "../types";
import { FaEye } from "react-icons/fa";

const NFTDisplay: React.FC = () => {
    const { address } = useAccount();
    const [nfts, setNfts] = useState<Types.NFT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nftWorth, setNftWorth] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const fetchAndSetNFTs = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            const data = await fetchPortfolio(address);
            console.log("Fetched Data:", data);

            if (data.nfts) {
                setNfts(data.nfts);
                setTotalPages(Math.ceil(data.nfts.length / itemsPerPage));
                const normalizedAddress = address.toLowerCase();
                const nftUsdNetWorth = data.nftUsdNetWorth?.[normalizedAddress] || 0;
                setNftWorth(nftUsdNetWorth);
            } else {
                setNfts([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to fetch NFTs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (address) fetchAndSetNFTs();
    }, [address]);

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    const paginatedNfts = nfts?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

    return (
        <VStack
            w="100%"
            gap={6}
            align="start"
            p={4}
            border="1px solid yellow"
            borderRadius="10px"
            bg="#201d21"
            m={2}
            color="white"
        >
            <HStack
                w="100%"
                border="1px solid yellow"
                p={5}
                borderTopRadius={10}
                mb={-6}
                justifyContent="space-between"
                bg="yellow.900"
                cursor="pointer"
                onClick={toggleCollapse}
            >
                <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                    <Text
                        color="white"
                        fontWeight="bold"
                        fontSize={{ base: 24, md: 34 }}
                        textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                        textAlign="center"
                        flex="1"
                    >
                        {nfts?.length || 0} NFTs
                    </Text>
                </SkeletonText>
                <FaEye color="white" />
            </HStack>

            <Skeleton
                startColor="white"
                endColor="yellow.200"
                isLoaded={!isLoading}
                fitContent
                minWidth="100%"
            >
                <Box border="1px solid yellow" bg="yellow.700" cursor="pointer">
                    <Center>
                        <HStack m={5} padding="4px 8px" justifyContent="space-between">
                            <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                <Text
                                    color="white"
                                    fontWeight="bold"
                                    fontSize={{ base: 18, md: 24 }}
                                    textAlign="center"
                                    flex="1"
                                >
                                    Worth: ${Number(nftWorth).toFixed(2)}
                                </Text>
                            </SkeletonText>
                        </HStack>
                    </Center>
                </Box>
            </Skeleton>

            <Collapse in={!isCollapsed} animateOpacity>
                <Flex wrap="wrap" justifyContent="center" gap={4}>
                    {paginatedNfts.map((nft, index) => (
                        <Box
                            key={`${nft.token.collection.address}-${index}`}
                            border="1px solid yellow"
                            borderRadius="10px"
                            m={2}
                            p={2}
                            bg="yellow.800"
                            w={{ base: "100px", md: "150px" }}
                            h={{ base: "150px", md: "200px" }}
                        >
                            {nft.token.medias.length > 0 ? (
                                <Image
                                    src={nft.token.medias[0].originalUrl}
                                    alt={nft.token.collection.name}
                                    boxSize="100%"
                                    objectFit="cover"
                                    borderRadius="10px"
                                />
                            ) : (
                                <Image
                                    src="loading.gif"
                                    alt="Loading"
                                    boxSize="100%"
                                    objectFit="cover"
                                    borderRadius="10px"
                                />
                            )}
                            <Text
                                color="white"
                                mt={2}
                                textAlign="center"
                                fontSize={{ base: "12px", md: "14px" }}
                            >
                                {nft.token.collection.name}
                            </Text>
                        </Box>
                    ))}
                </Flex>
                <HStack justifyContent="space-between" w="100%">
                    <Text
                        cursor="pointer"
                        onClick={handlePreviousPage}
                        color="yellow.400"
                    >
                        Previous
                    </Text>
                    <Text color="white">
                        {currentPage} / {totalPages}
                    </Text>
                    <Text
                        cursor="pointer"
                        onClick={handleNextPage}
                        color="yellow.400"
                    >
                        Next
                    </Text>
                </HStack>
            </Collapse>
        </VStack>
    );
};

export default NFTDisplay;
