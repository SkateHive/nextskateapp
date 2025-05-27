import { AuctionBid } from '@/components/auction/bid';
import { FormattedAddress } from '@/components/NNSAddress';
import { useLastAuction } from '@/hooks/auction';
import {
  useWatchAuctionAuctionBidEvent,
  useWatchAuctionAuctionSettledEvent,
} from '@/hooks/wagmiGenerated';
import { Auction } from '@/services/auction';
import { weiToSparks } from '@/utils/spark';
import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { revalidatePath } from 'next/cache';
import Countdown from 'react-countdown';
import { BsEmojiAstonished } from 'react-icons/bs';
import { FaBirthdayCake, FaEthereum, FaUser } from 'react-icons/fa';
import { LuSparkles } from 'react-icons/lu';

interface AuctionCardProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuction?: Auction
}

const AuctionCard: React.FC<AuctionCardProps> = ({ isOpen, onClose, defaultAuction }) => {
  const { data: activeAuction, refetch } = useLastAuction(defaultAuction);
  useWatchAuctionAuctionBidEvent({
    onLogs(logs) {
      refetch();
      revalidatePath('/');
    },
  });

  useWatchAuctionAuctionSettledEvent({
    onLogs(logs) {
      refetch();
      revalidatePath('/');
    },
  });


  if (!activeAuction) {
    return (
      <VStack
        shadow="lg"
        w="full"
        height="full"
        padding={6}
        rounded="xl"
        gap={4}
        bgGradient="linear(to-r, gray.50, white)"
        _dark={{
          bgGradient: "linear(to-r, gray.800, gray.900)",
          borderColor: 'yellow.400',
          borderWidth: 1
        }}
        transition="all 0.2s"
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          align={'start'}
          justify={'space-between'}
          w={'full'}
        >
          <VStack align={'stretch'} gap={2} w={'full'}>
            <Heading as='h2'>
              <Skeleton height='40px' width='160px' />
            </Heading>
            <Text>
              <Skeleton height='20px' width='100px' />
            </Text>
            <Text>
              <Skeleton height='20px' width='80px' />
            </Text>
          </VStack>
          <Skeleton
            rounded={'md'}
            w={'full'}
            maxW={{ md: '240px' }}
            height='240px'
          />
        </Stack>
      </VStack>
    );
  }

  const auctionEndedAt = new Date(parseInt(activeAuction.endTime) * 1000);
  const isAuctionRunning = parseInt(activeAuction.endTime) * 1000 > Date.now();
  console.log({ activeAuction });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader sx={{
            color: 'limegreen', // Define a cor preta
          
          }}>Auction Details</ModalHeader>
        <ModalCloseButton
          sx={{
            color: 'black', // Define a cor preta
            _hover: {
              color: 'gray.700', // Cor ao passar o mouse
            },
            _focus: {
              boxShadow: 'none', // Remove a borda de foco padrão
            }
          }}
        />
        <ModalBody>
          <VStack

            maxW={{ base: "100%", lg: "100%" }}
            mx="auto"
            height="full"        
            backdropFilter="blur(10px)"
            border="1px solid"         
            position="relative"
            overflow="hidden"
          >
            <Stack
              direction="column"
              gap={{ base: 4, md: 6 }}
              align="center"
              justify="space-between"
              w="full"
              zIndex={1}
            >
              <Box
                position="relative"
                w="full"
                minW={{ lg: "300px" }}
                overflow="hidden"
                rounded="xl"
                shadow="lg"

              >
                <Image
                  rounded="md"
                  w="full"
                  height="100%"
                  mt={0.5}
                  src={activeAuction.token.image}
                  alt={`Auction token id ${activeAuction.token.tokenId}`}
                />
              </Box>

              <VStack
                align="stretch"
                gap={4}
                w="full"
                h="full"
              >
                <VStack
                  as="h2"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  bgGradient="linear(to-r, blue.400, purple.600)"
                  bgClip="text"
                  letterSpacing="tight"
                >
                  <Heading
                    as="h2"
                    fontSize="3xl"
                    fontWeight="bold"
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    bgClip="text"
                  >
                    {activeAuction?.token?.name}
                  </Heading>
                  {activeAuction.highestBid ? (
                    <>
                      <HStack gap={2}>
                        <Icon
                          as={FaUser}
                          w={4}
                          h={4}
                          color="blue.500"
                        />
                        <FormattedAddress
                          address={activeAuction.highestBid.bidder}
                          textBefore={isAuctionRunning ? 'Highest bid' : 'Winner'}
                        />
                      </HStack>
                      <HStack gap={1}>
                        <FaEthereum size={12} style={{ scale: '1.3' }} />
                        <Text>Highest bid </Text>
                        <Badge
                          colorScheme="limegreen"
                          variant="subtle"
                          px={3}
                          py={1}
                          rounded="full"
                          fontSize="sm"
                          
                        >
                          ✧{weiToSparks(activeAuction.highestBid.amount)}{' '}
                        </Badge>
                      </HStack>
                      {isAuctionRunning ? (
                        <Box
                          bg="blue.50"
                          p={3}
                          rounded="lg"
                          _dark={{
                            bg: "blue.900"
                          }}
                        >
                          <Countdown
                            date={parseInt(activeAuction.endTime) * 1000}
                            daysInHours={false}
                          />
                        </Box>
                      ) : (
                        <HStack gap={1}>
                          <FaBirthdayCake size={12} />
                          <Text>
                            Born at{' '}
                            {auctionEndedAt.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                        </HStack>
                      )}
                    </>
                  ) : isAuctionRunning ? (
                    <HStack
                      gap={2}
                      p={3}
                      rounded="lg"
                     
                      borderWidth="1px"
                      borderColor="blue.100"
                    
                    
                    >
                      <Icon
                        as={LuSparkles}
                        w={4}
                        h={4}
                        color="blue.500"
                       
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="limegreen"
                      >
                        Place the first bid
                      </Text>
                    </HStack>
                  ) : (
                    <HStack
                      gap={2}
                      p={3}
                      rounded="lg"
                      bg="gray.50"
                      borderWidth="1px"
                      borderColor="gray.200"
                      transition="all 0.2s"
                      _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
                      _dark={{
                        bg: "gray.800",
                        borderColor: "gray.700"
                      }}
                    >
                      <Icon
                        as={BsEmojiAstonished}
                        w={4}
                        h={4}
                        color="gray.500"
                        _dark={{ color: "gray.300" }}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.600"
                        _dark={{ color: "gray.200" }}
                      >
                        No bids
                      </Text>
                    </HStack>
                  )}
                </VStack>
                <Box
                  bg="black"
                  p={3}
                  rounded="lg"
                  _dark={{
                    bg: "blue.900"
                  }}
                >
                  <AuctionBid
                    tokenId={BigInt(activeAuction.token.tokenId)}
                    winningBid={
                      activeAuction.winningBid
                        ? BigInt(activeAuction.winningBid.amount)
                        : 0n
                    }
                    isAuctionRunning={isAuctionRunning}
                    onBid={refetch}
                    onSettle={refetch}
                  />
                </Box>
              </VStack>
            </Stack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AuctionCard;