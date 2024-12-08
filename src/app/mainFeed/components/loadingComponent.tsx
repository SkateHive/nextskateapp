import { Box, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/fonts.css";

const matrixCharacters = "アイウエオカキクケコサシスセソタチツテトナニヌネノ";
const randomSentences = [
  "skate or don't",
  "F-u-c-k instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "who was Gnartoshi Shredamoto?",
  "bless up",
  "skate or die",
  "take back the internet!",
  "Never lose your bros clips",
  "support your local skateshops!",
  "Peoples Thrasher",
  "Stack HP, buy with HBD",
  "Drop hills not bombs!",
  "This app was made by Raissa Legal"
];

function getRandomChar() {
  return matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];
}

// Generate one column of characters
function generateColumnLines(lines = 30) {
  let column = [];
  for (let i = 0; i < lines; i++) {
    column.push(getRandomChar());
  }
  return column.join("\n");
}

const LoadingComponent = () => {
  const [fontSize, setFontSize] = useState("44px");
  const [randomSentence, setRandomSentence] = useState("");

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
        newFontSize = "12px";
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

  // Number of columns across the screen
  const columnsCount = 20;
  const columns = Array.from({ length: columnsCount }, (_, i) => {
    const columnText = generateColumnLines(50);
    const delay = Math.random() * 5; // random delay to start the animation
    const duration = 10 + Math.random() * 5; // random duration for variety
    const leftPosition = (100 / columnsCount) * i; // distribute columns evenly

    return (
      <Box
        key={i}
        position="absolute"
        top="-100%"
        left={leftPosition + "%"}
        w="5%"
        color="limegreen"
        fontFamily="monospace"
        fontSize="14px"
        lineHeight="1.2"
        whiteSpace="pre"
        style={{
          animation: `matrixFall ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        {columnText}
      </Box>
    );
  });

  return (
    <div lang="en">
      <VStack
        bg={"black"}
        overflowY="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        maxW={"740px"}
        width={"100%"}
        height={"100vh"}
        overflow={"auto"}
        justify="center"
        align="center"
        position="relative"
      >
        {columns}
        <Text
          position="relative"
          zIndex={1}
          color="#00FF00"
          fontSize={fontSize}
          textAlign="center"
          fontFamily="Joystix"
          p={4}
          bg="rgba(0,0,0,0.5)"
          borderRadius="md"
        >
          {randomSentence}
        </Text>

        <style jsx global>{`
        @keyframes matrixFall {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(200%);
          }
        }
      `}</style>
      </VStack>
    </div>
  );
};

export default LoadingComponent;
