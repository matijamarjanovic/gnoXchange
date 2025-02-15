export interface Asset {
  type: string
  path?: string
  name?: string
  symbol?: string
  decimals?: number
  denom?: string
  tokenHubPath?: string
}

export interface Ticket {
  id: string
  creator: string
  assetIn: Asset
  assetOut: Asset
  amountIn: number
  minAmountOut: number
  createdAt: string
  expiresAt: string
  status: TicketStatus
}

export interface TokenDetails {
  key: string
  name: string
  symbol: string
  decimals: number
} 

export interface CoinDetails {
  denom: string
  name: string
  decimals: 6
}

export interface NFTDetails {
  key: string
  collection: string
  tokenId: string
  uri: string
}

export type TicketStatus = 'open' | 'completed' | 'pending' | 'all';
