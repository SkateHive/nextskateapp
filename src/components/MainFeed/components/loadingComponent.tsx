import { Box, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/fonts.css";

const matrixCharacters =
  "FUCKアイウエオカキクケコサシスセソタチツテトナニFUCKヌネノ";
const randomSentences = [
  "skate or don't",
  "F-u-c-k instagram!",
  "Ready to grind on chain?",
  "Praise skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "who was Gnartoshi Shredmoto?",
  "take back the internet!",
  "Never lose your bros clips",
  "support your local skateshops!",
  "The Peoples Thrasher",
  "Get $HIGHER",
  "Stack HP, buy with HBD",
  "Drop hills not bombs!",
  "Nobody owns Skatehive",
  "Connecting with Uganda Nodes",
  "Forget Youtube",
  "Stop using youtube",
  "If it takes to long, your connection sucks",
  "Macba Lives",
  "Skate till you tired, then skate more",
  "Bless Skateshop aceita HBD, USDC e BTC",
];

function getRandomChar() {
  return matrixCharacters[Math.floor(Math.random() * matrixCharacters.length)];
}

function generateColumnLines(lines = 30) {
  let column = [];
  for (let i = 0; i < lines; i++) {
    column.push(getRandomChar());
  }
  return column.join("\n");
}

const LoadingComponent = () => {
  const [randomSentence, setRandomSentence] = useState(randomSentences[0]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    // Generate consistent random content on the client
    const newSentence =
      randomSentences[Math.floor(Math.random() * randomSentences.length)];
    const newColumns = Array.from({ length: 20 }, () =>
      generateColumnLines(50)
    );
    setRandomSentence(newSentence);
    setColumns(newColumns);
  }, []);

  return (
    <div lang="en">
      <VStack
        bg="transparent"
        blur={5}
        overflowY="hidden"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        width="100%"
        height="100vh"
        justify="center"
        align="center"
        position="relative"
      >
        {columns.map((columnText, i) => (
          <Box
            key={i}
            position="absolute"
            top="-100%"
            left={`${(100 / 20) * i}%`}
            w="5%"
            color="limegreen"
            fontFamily="monospace"
            fontSize="14px"
            lineHeight="1.2"
            whiteSpace="pre"
            style={{
              animation: `matrixFall ${5 + Math.random() * 2}s linear ${-Math.random() * 2}s infinite`,
            }}
          >
            {columnText}
          </Box>
        ))}
        <Text
          position="relative"
          zIndex={1}
          color="#00FF00"
          fontSize="40px"
          textAlign="center"
          fontFamily="Joystix"
          p={4}
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
