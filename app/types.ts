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
  status: string
} 
