import { Box, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/fonts.css";

const randomSentences = [
  "Don't mall grab, or do it, you do you...",
  "Ok to push Mongo, it is! -master yoda",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times ?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredamoto?",
  "We have secret sections here, can you find?"
];

const LoadingComponent = () => {
  const [randomSentence, setRandomSentence] = useState("");
  const [fontSize, setFontSize] = useState("44px");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomSentences.length);
    setRandomSentence(randomSentences[randomIndex]);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      let newFontSize = "44px";

      if (screenWidth <= 480) {
        newFontSize = "22px";
      } else if (screenWidth <= 840) {
        newFontSize = "12x";
      } else if (screenWidth <= 900) {
        newFontSize = "13px";
      } else if (screenWidth <= 1025) {
        newFontSize = "15px";
      } else if (screenWidth <= 1180) {
        newFontSize = "18px";
      } else if (screenWidth <= 1350) {
        newFontSize = "24px";
      } else {
        newFontSize = "32px";
      }

      setFontSize(newFontSize);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <VStack
      bg={"black"}
      overflowY="auto"
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      maxW={"740px"}
      width={"100%"}
      height={"100%"}
      overflow={"auto"}
      justify="center"
      align="center"
    >
      <Box position="relative" width="100%">
        <Image
          minW={"100%"}
          src="/skatehive_loader.gif"
          alt="Loading gif"

        />
        <Text
          position="absolute"
          top="20%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="#00FF00"
          fontSize={fontSize}
          textAlign="center"
          width="100%"
          fontFamily="Joystix"
        >
          {randomSentence}
        </Text>
      </Box>
      <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
      <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
      <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
      <Image mt={-2} minW={"100%"} src="/home_animation_body.gif" alt="Loading gif" />
    </VStack>
  );
};

export default LoadingComponent;
