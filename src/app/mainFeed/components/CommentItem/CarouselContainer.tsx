import { Box } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";

interface CarouselContainerProps {
    children: ReactNode;
}

const CarouselContainer = ({ children }: CarouselContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (containerRef.current) {
            const arrows = containerRef.current.querySelectorAll<HTMLDivElement>('.custom-arrow');
            arrows.forEach((arrow: HTMLDivElement) => {
                arrow.style.opacity = '1';
            });
        }
    };

    const handleMouseLeave = () => {
        if (containerRef.current) {
            const arrows = containerRef.current.querySelectorAll<HTMLDivElement>('.custom-arrow');
            arrows.forEach((arrow: HTMLDivElement) => {
                arrow.style.opacity = '0';
            });
        }
    };

    return (
        <Box
            m={4}
            maxW={'80%'}
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            borderRadius={'10px'}
        >
            {children}
        </Box>
    );
};

export default CarouselContainer;
