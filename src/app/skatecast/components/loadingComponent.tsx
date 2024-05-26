import { VStack, Image } from "@chakra-ui/react";

const LoadingComponent = () => (
    <VStack overflowY="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        maxW={"740px"}
        width={"100%"}
        height={"100%"}
        overflow={"auto"}>
        <VStack>
            <Image minW={"100%"} src="https://i.ibb.co/Br0SMjz/Crop-animated.gif" alt="Loading..." />
            <Image mt={-2} minW={"100%"} src="https://i.ibb.co/L8mj1CV/Crop-animated-1.gif" alt="Loading..." />
            <Image mt={-2} minW={"100%"} src="https://i.ibb.co/L8mj1CV/Crop-animated-1.gif" alt="Loading..." />
            <Image mt={-2} minW={"100%"} src="https://i.ibb.co/L8mj1CV/Crop-animated-1.gif" alt="Loading..." />
            <Image mt={-2} minW={"100%"} src="https://i.ibb.co/L8mj1CV/Crop-animated-1.gif" alt="Loading..." />

            Loading...

        </VStack>
    </VStack>
)

export default LoadingComponent