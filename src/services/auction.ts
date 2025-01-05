import { noCacheApolloClient } from '@/utils/apollo';
import { gql } from '@apollo/client';
import { Address } from 'viem';

export async function fetchAuction(
  address: string,
  orderBy: string,
  orderDirection: string,
  first: number
) {
  const where = { dao: address.toLocaleLowerCase() };

  try {
    const { data } = (await noCacheApolloClient.query({
      query: GET_DATA,
      variables: {
        where,
        orderBy,
        orderDirection,
        first,
      },
    })) as GraphResponse;

    return data.auctions;
  } catch (error) {
    throw new Error('Erro ao consultar propostas');
  }
}

export interface GraphResponse {
  data: Data;
}

export interface Data {
  auctions: Auction[];
}

export interface Auction {
  bidCount: number;
  bids: Bid[];
  endTime: string;
  extended: boolean;
  settled: boolean;
  startTime: string;
  token: Token;
  dao: Dao;
  firstBidTime?: string;
  highestBid?: HighestBid;
  winningBid?: WinningBid;
}

export interface Bid {
  amount: string;
  bidder: Address;
  bidTime: string;
}

export interface HighestBid {
  amount: bigint;
  bidTime: string;
  bidder: Address;
}

export interface Token {
  content: any;
  image: string;
  name: string;
  tokenContract: string;
  tokenId: bigint;
  id: string;
}

export interface WinningBid {
  amount: bigint;
  bidTime: string;
  bidder: Address;
}

export interface Dao {
  auctionConfig: AuctionConfig;
}

export interface AuctionConfig {
  minimumBidIncrement: string;
  reservePrice: string;
}

const GET_DATA = gql`
  query Auctions(
    $where: Auction_filter
    $orderBy: Auction_orderBy
    $orderDirection: OrderDirection
    $first: Int
  ) {
    auctions(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
    ) {
      bidCount
      bids(orderBy: bidTime) {
        amount
        bidder
        bidTime
      }
      endTime
      extended
      firstBidTime
      highestBid {
        amount
        bidTime
        bidder
      }
      settled
      startTime
      token {
        content
        image
        name
        tokenContract
        tokenId
        id
      }
      winningBid {
        amount
        bidTime
        bidder
      }
      dao {
        auctionConfig {
          minimumBidIncrement
          reservePrice
        }
      }
    }
  }
`;