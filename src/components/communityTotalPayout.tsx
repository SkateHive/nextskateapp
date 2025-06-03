"use client";
import { SKATEHIVE_TAG, IMAGE_SIZES } from "@/lib/constants";
import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

function CommunityTotalPayout() {
  const [totalHBDPayout, setTotalHBDPayout] = useState<number>(0);
  const [displayedNumber, setDisplayedNumber] = useState<string>("00000");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formattedNumber = useMemo(
    () =>
      totalHBDPayout
        .toLocaleString("en-US", {
          style: "decimal",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/,/g, ""),
    [totalHBDPayout]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://stats.hivehub.dev/communities?c=${SKATEHIVE_TAG}`
        );
        const data = await response.json();
        const payout = parseFloat(
          data[SKATEHIVE_TAG]?.total_payouts_hbd?.replace("$", "") || "90000"
        );
        setTotalHBDPayout(payout);
      } catch (error: any) {
        console.error("Error fetching data: ", error);
        setError(error.message);
        setTotalHBDPayout(420.0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const intervalId = setInterval(() => {
        setDisplayedNumber(
          formattedNumber
            .split("")
            .map(() => Math.floor(Math.random() * 10))
            .join("")
        );
      }, 100);

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setDisplayedNumber(formattedNumber);
      }, 4000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [formattedNumber, loading, error]);

  return (
    <center>
      <Box
        margin="0px"
        padding="4px"
        width={"100%"}
        borderBottomLeftRadius="20px"
        borderBottomRightRadius="20px"
        color="chartreuse"
        border={"1px solid #A5D6A7"}
        position="relative"
        overflow="hidden"
        backgroundImage={`url('/moneyfalling.gif')`}
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        backgroundSize="cover"
        zIndex={0}
        mb={4}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0, 0, 0, 1)"
          transition="background-color 0.5s ease-in-out"
          _hover={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
          zIndex={1}
        />
        {loading ? (
          <VStack>
            <Image
              alt="Loading..."
              boxSize={"24px"}
              src={`/spinning-joint-sm.gif?w=${IMAGE_SIZES.LOADING_SMALL.width}&h=${IMAGE_SIZES.LOADING_SMALL.height}`}
              zIndex={2}
            />
            <Text fontSize={"12px"} color={"chartreuse"} zIndex={2}>
              Loading...
            </Text>
          </VStack>
        ) : error ? (
          <Text fontSize="18px">Error: {error}</Text>
        ) : (
          <Flex
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
          >
            <Text
              color={"lightgreen"}
              fontSize="25px"
              fontWeight="bold"
              textShadow={"1px 1px 15px black"}
              gap={1}
              display={"flex"}
              zIndex={2}
            >
              ${displayedNumber} USD
            </Text>
            <Text
              color={"#A5D6A7"}
              fontSize="12px"
              fontWeight="bold"
              textShadow={"1px 1px 15px black"}
              zIndex={2}
            >
              Paid to Skaters
            </Text>
          </Flex>
        )}
      </Box>
    </center>
  );
}

export default CommunityTotalPayout;
