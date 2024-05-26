import { Text, Image, Box, Center } from "@chakra-ui/react"
const randomSentences = [
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo, it is! -master yoda'",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredmoto?",
  "We have secret sections here, can you find?",
  "We dont store any data, we dont even know how to do that",
  "P-rod said that NOW the flip ins and flip outs are too much...",
  "SkateHive is really made by skaters, that actually skate, the 4 stances and more.",
  "If its a quick post, do it in Plaza. If its a long form post do it in Mag",
  "If you need help, roll a joint and joint or grab a beer and discord.gg/skateboard",
  "You can downvote stuff if you think it sucks",
  "One day you will get our /wallet and /dao pages, take your time...",
  "Do you remember your first kickflip? I dont I am a robot",
  "You Skate? Congrats this site is yours and its money is for you.",
  "WTF are those ⌐◨-◨ ???"

];
export default function Loading() {
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <Box
      width={"100%"}
    >
      <Center>

        <Text fontSize={"24px"} marginBottom={"12px"} >{randomSentence}</Text>
      </Center>

      <Image
        borderRadius={"20px"}
        boxSize="100%"
        src="/infinitypepe.gif"
        as={"image"}
        alt=""
      />
    </Box>
  );
}
