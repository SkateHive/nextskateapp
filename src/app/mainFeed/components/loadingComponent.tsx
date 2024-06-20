import { Image, VStack } from "@chakra-ui/react";

const LoadingComponent = () => (
    <VStack bg={"black"} overflowY="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        maxW={"740px"}
        width={"100%"}
        height={"100%"}
        overflow={"auto"}>
        <VStack>
            <Image minW={"100%"} src="/home_animation_header.gif" alt="Loading gif" />
            <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
            <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
            <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
            <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
        </VStack>
    </VStack>
)

export default LoadingComponent