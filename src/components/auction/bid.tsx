'use client';

import {
  useWriteAuctionCreateBid,
  useWriteAuctionSettleCurrentAndCreateNewAuction,
} from '@/hooks/wagmiGenerated';
import { convertSparksToEth } from '@/utils/spark';
import { getConfig } from '@/utils/wagmi';
import { Button, Link as ChakraLink, HStack, NumberInput, NumberInputField, Tooltip, useColorModeValue, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useCallback, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

interface BidProps {
  tokenId: bigint;
  winningBid: bigint;
  isAuctionRunning: boolean;
  onBid?: () => void;
  onSettle?: () => void;
}

export function AuctionBid(props: BidProps) {
  const { tokenId, winningBid, isAuctionRunning } = props;
  const [txHash, setTxHash] = useState<string | null>(null);

  const account = useAccount();
  const [bidValue, setBidValue] = useState('111111');

  const { writeContractAsync: writeBid } = useWriteAuctionCreateBid();
  const onClickBid = useCallback(async () => {
    try {
      const txHash = await writeBid({
        args: [tokenId],
        value: parseEther(convertSparksToEth(bidValue)),
      });
      const receipt = await waitForTransactionReceipt(getConfig(), {
        hash: txHash,
      });
      console.log('Bid receipt', receipt);
      setTxHash(txHash);
      if (props.onBid) {
        props.onBid();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error creating bid: ${error.message}`);
      } else {
        window.alert('Error creating bid');
      }
    }
  }, [writeBid, tokenId, bidValue, props]);

  const { writeContractAsync: writeSettle } =
    useWriteAuctionSettleCurrentAndCreateNewAuction();

  const onClickSettle = useCallback(async () => {
    if (isAuctionRunning) {
      window.alert('O leilão ainda está ativo. Não é possível finalizar.');
      return;
    }

    try {
      const txHash = await writeSettle({});
      const receipt = await waitForTransactionReceipt(getConfig(), {
        hash: txHash,
      });
      console.log('Settle receipt', receipt);
      setTxHash(txHash);
      if (props.onSettle) {
        props.onSettle();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Erro ao finalizar o leilão: ${error.message}`);
      } else {
        window.alert('Erro ao finalizar o leilão');
      }
    }
  }, [props, writeSettle, isAuctionRunning]);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  return (
    <VStack align={'stretch'} gap={0} w={'full'}>
      {/* Exibição do Hash da Transação */}
      {txHash && (
        <HStack maxW={'full'}>
          <ChakraLink as={NextLink} href={`https://basescan.org/tx/${txHash}`} isExternal>
            Transaction: {txHash.slice(0, 4)}...{txHash.slice(-4)}
            <LuExternalLink />
          </ChakraLink>
        </HStack>
      )}

      {/* Área de Bid ou Finalização */}
      <VStack align="stretch" spacing={4}>
        {isAuctionRunning ? (
          <>
            <HStack w={'100%'}>
              <Tooltip label="Sparks" hasArrow>
                <ChakraLink
                  as={NextLink}
                  href={'https://zora.co/writings/sparks'}
                  target='_blank'
                  fontWeight={'bold'}
                  fontSize={'2xl'}
                >
                  ✧
                </ChakraLink>
              </Tooltip>

              <NumberInput
                w={'100%'}
                fontFamily={'mono'}
                size={'lg'}
                value={bidValue}
                onChange={(valueString) => setBidValue(valueString)}
                step={111111}
                min={0}
                _disabled={{
                  cursor: 'not-allowed',
                  bg: 'gray.100', // ou qualquer cor de fundo para quando o input estiver desabilitado
                  borderColor: 'gray.300', // cor de borda quando desabilitado
                }}
                >
                <NumberInputField />
              </NumberInput>
            </HStack>
            <Button
              variant={'solid'}
              onClick={onClickBid}
              disabled={
                account.isDisconnected ||
                !isAuctionRunning ||
                parseEther(bidValue) < winningBid
              }
            >
              Place Bid
            </Button>
          </>
        ) : (
          <Button
            colorScheme="orange"
            variant="solid"
            size="lg"
            onClick={onClickSettle}
            isDisabled={account.isDisconnected}
            w="full"
          >
            Settle Auction
          </Button>
        )}
      </VStack>
    </VStack>
  );
}
