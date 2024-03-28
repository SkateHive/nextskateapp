import {
  Box,
  Card,
  CardFooter,
  CardHeader,
  Flex,
  Skeleton,
  SkeletonCircle,
  Stack,
} from "@chakra-ui/react"

export default function PostSkeleton() {
  return (
    <Card
      size="sm"
      boxShadow="none"
      borderRadius="lg"
      border={"1px solid limegreen"}
      _hover={{
        outline: "1px solid",
        outlineColor: "limegreen",
      }}
      mt={2}
      bg={"black"}
    >
      <CardHeader pb={0}>
        <Flex gap="4" align={"end"}>
          <Flex flex="1" gap="2" alignItems="center">
            <SkeletonCircle
              startColor="limegreen"
              endColor="black"
              fadeDuration={4}
              size="10"
              borderRadius={"20%"}
            />
            <Flex flexDir="column" gap={1}>
              <Flex gap={1} alignItems="center">
                <Skeleton
                  startColor="limegreen"
                  endColor="black"
                  h={4}
                  w={32}
                />
              </Flex>
              <Skeleton
                startColor="limegreen"
                endColor="black"
                h={4}
                w={{ base: 32, md: 42, lg: 52 }}
              />
            </Flex>
          </Flex>
          <Flex gap={1} align={"center"}>
            <Skeleton startColor="limegreen" endColor="black" h={4} w={16} />
          </Flex>
        </Flex>
      </CardHeader>
      <Box p={3}>
        <Skeleton
          startColor="limegreen"
          endColor="black"
          border={"1px"}
          borderColor={"gray.50"}
          w="100%"
          aspectRatio={16 / 9}
          borderRadius="md"
        />
      </Box>
      <CardFooter pt={0} flexDirection={"column"} gap={2}>
        <Flex w={"100%"} justify={"space-between"} align={"center"}>
          <Skeleton startColor="limegreen" endColor="black" h={4} w={48} />
          <Stack direction={"row"} gap={1}>
            <SkeletonCircle
              startColor="limegreen"
              endColor="black"
              fadeDuration={4}
              size="5"
            />
            <SkeletonCircle
              startColor="limegreen"
              endColor="black"
              fadeDuration={4}
              size="5"
            />
            <SkeletonCircle
              startColor="limegreen"
              endColor="black"
              fadeDuration={4}
              size="5"
            />
          </Stack>
        </Flex>
      </CardFooter>
    </Card>
  )
}
