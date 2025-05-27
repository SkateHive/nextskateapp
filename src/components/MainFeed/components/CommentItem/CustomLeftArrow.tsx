import { Box } from "@chakra-ui/react";
import { LucideArrowLeft } from "lucide-react";

interface CustomLeftArrowProps {
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    color?: string;
}

const CustomLeftArrow = ({ onClick, color }: CustomLeftArrowProps) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        onClick(e);
    };
    return (
        <Box
            onClick={handleClick}
            position="absolute"
            left="0"
            zIndex="10"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width={{ base: '30px', md: '40px' }}
            height="100%"
            cursor="pointer"
            opacity={0}
            transition="opacity 0.3s ease"
            backdropFilter="blur(3px)"
            borderTopLeftRadius="10px"
            borderBottomLeftRadius="10px"
            _hover={{ opacity: 1 }}
        >
            <LucideArrowLeft color={color} />
        </Box>
    );
};

export default CustomLeftArrow;
