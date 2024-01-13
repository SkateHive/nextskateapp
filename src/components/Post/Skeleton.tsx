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
      _hover={{
        outline: "1px solid",
        outlineColor: "gray.100",
      }}
      mt={2}
    >
      <CardHeader pb={0}>
        <Flex gap="4" align={"end"}>
          <Flex flex="1" gap="2" alignItems="center">
            <SkeletonCircle fadeDuration={4} size="10" />
            <Flex flexDir="column" gap={1}>
              <Flex gap={1} alignItems="center">
                <Skeleton h={4} w={32} />
              </Flex>
              <Skeleton h={4} w={{ base: 48, md: 56, lg: 64 }} />
            </Flex>
          </Flex>
          <Flex gap={1} align={"center"}>
            <Skeleton h={4} w={16} />
          </Flex>
        </Flex>
      </CardHeader>
      <Box p={3}>
        <Skeleton
          border={"1px"}
          borderColor={"gray.50"}
          w="100%"
          aspectRatio={16 / 9}
          borderRadius="md"
        />
      </Box>
      <CardFooter pt={0} flexDirection={"column"} gap={2}>
        <Flex w={"100%"} justify={"space-between"} align={"center"}>
          <Skeleton h={4} w={48} />
          <Stack direction={"row"} gap={1}>
            <SkeletonCircle fadeDuration={4} size="5" />
            <SkeletonCircle fadeDuration={4} size="5" />
            <SkeletonCircle fadeDuration={4} size="5" />
          </Stack>
        </Flex>
      </CardFooter>
    </Card>
  )
}
