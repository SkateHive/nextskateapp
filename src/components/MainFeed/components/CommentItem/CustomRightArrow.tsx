import { Box } from "@chakra-ui/react";
import { LucideArrowRight } from "lucide-react";

interface CustomRightArrowProps {
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  color?: string;
}

const CustomRightArrow = ({ onClick, color }: CustomRightArrowProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    onClick(e);
  };
  return (
    <Box
      onClick={handleClick}
      position="absolute"
      right="0"
      zIndex="10"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width={{ base: "30px", md: "40px" }}
      height="100%"
      cursor="pointer"
      opacity={0}
      transition="opacity 0.3s ease"
      backdropFilter="blur(3px)"
      borderTopRightRadius="10px"
      borderBottomRightRadius="10px"
      _hover={{ opacity: 1 }}
      role="button"
      aria-label="Next image"
    >
      <LucideArrowRight color={color} />
    </Box>
  );
};

export default CustomRightArrow;
