'use client';

import {
    Box,
    Center,
    Collapse,
    HStack,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Text,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEye } from "react-icons/fa";

interface CollapsibleBoxProps {
    title: string;
    isLoading: boolean;
    netWorth: number;
    children: React.ReactNode;
    iconSrc?: string;
    address?: string;
    color: string;
    minHeight?: string; // Optional minHeight for dynamic sizing
    maxHeight?: string; // Optional maxHeight for dynamic sizing
}

const CollapsibleBox: React.FC<CollapsibleBoxProps> = ({
    title,
    isLoading,
    netWorth,
    children,
    iconSrc,
    address,
    color,
    minHeight = "300px", // Default minHeight for better layout
    maxHeight = "auto" // Default maxHeight
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <VStack
            w="100%"
            align="stretch" // Stretch to full available width
            spacing={0} // Remove default spacing between children
            border={`1px solid ${color}`}
            borderRadius="10px"
            bg="#201d21"
            color="white"
            maxHeight={maxHeight}
        >
            {/* Header Section */}
            <HStack
                w="100%"
                p={4}
                justifyContent="space-between"
                bg={`${color}.900`}
                cursor="pointer"
                borderBottom={`1px solid ${color}`} // Separate content
                onClick={toggleCollapse}
                borderTopRadius="10px"
            >
                <SkeletonCircle isLoaded={!isLoading} size="48px">
                    {iconSrc && <img src={iconSrc} alt="icon" style={{ width: '48px', height: '48px' }} />}
                </SkeletonCircle>
                <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                    <Text
                        fontSize={{ base: 16, md: 20 }}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {title}
                    </Text>
                </SkeletonText>
                <FaEye color="white" />
            </HStack>

            {/* Net Worth Section */}
            <Skeleton
                isLoaded={!isLoading}
                w="100%"
                borderBottom={`1px solid ${color}`}
                bg={`${color}.700`}
            >
                <Center w="100%" p={4}>
                    <Text
                        fontSize={{ base: 18, md: 24 }}
                        fontWeight="bold"
                        color="white"
                    >
                        Worth: ${Number(netWorth).toFixed(2)}
                    </Text>
                </Center>
            </Skeleton>

            {/* Collapsible Content */}
            <Collapse in={!isCollapsed} animateOpacity >
                <Box w="100%" p={4} overflowY="auto" maxHeight="400px">
                    {children}
                </Box>
            </Collapse>
        </VStack>
    );
};

export default CollapsibleBox;
