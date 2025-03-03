import { Asset, NFTDetails, Ticket, TokenBalance, TokenDetails } from "./types"

// Pool Types
export interface CreatePoolVariables {
  tokenA: string
  tokenB: string
  amountA: number
  amountB: number
}

export interface SwapVariables {
  poolKey: string
  tokenKey: string
  amount: number
  minAmountOut: number
}

export interface AddLiquidityVariables {
  poolKey: string
  amountA: number
  amountB: number
}

export interface WithdrawLiquidityVariables {
  poolKey: string
  amount: number
}

export interface UseSwapEstimateParams {
  poolKey: string
  tokenKey: string
  amount: number | null
}

export interface UsePoolsQueryParams {
  page: number
  pageSize: number
}

// Ticket Types
export interface CreateTicketVariables {
  assetInType: 'coin' | 'token'
  assetOutType: 'coin' | 'token'
  assetInPath: string
  assetOutPath: string
  amountIn: number
  minAmountOut: number
  expiryHours: number
}

export interface UseTicketsQueryParams {
  page: number
  pageSize: number
}

export interface FulfillTicketVariables {
  ticket: Ticket
  amount: number
}

// NFT Types
export interface CreateNFTTicketVariables {
  nftPath: string
  assetOutType: Asset['type']
  assetOutPath: string
  minAmountOut: number
  expiryHours: number
}

export interface BuyNFTVariables {
  ticketId: Ticket['id']
  amount: number
  assetType: Asset['type']
  assetPath: Asset['path']
}

// Shared Query Result Types
export interface TokensAndBalancesResult {
  tokens: TokenDetails[]
  balances: TokenBalance[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

export interface NFTBalancesResult {
  nfts: NFTDetails[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}
