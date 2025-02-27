import { GnoService } from '@/app/services/abci-service'
import { Asset, NFTDetails, PoolInfo, Ticket, TicketStatus, TokenBalance, TokenDetails } from '@/app/types/types'

const REALM_PATH = 'gno.land/r/matijamarjanovic/gnoxchange'
const TOKENHUB_PATH = 'gno.land/r/matijamarjanovic/tokenhub'
const gnoService = GnoService.getInstance()

export async function getPoolCount(): Promise<number> {
  try {
    const poolCount = await gnoService.evaluateExpression(
      REALM_PATH,
      'GetAllPoolNamesCount()'
    )
    
    const numberMatch = poolCount.match(/\((\d+)\s+int\)/)
    const parsedCount = numberMatch ? parseInt(numberMatch[1]) : 0
    
    if (isNaN(parsedCount)) {
      console.error('Failed to parse pool count:', poolCount)
      return 0
    }
    
    return parsedCount
  } catch (error) {
    console.error('Error fetching pool count:', error)
    return 0
  }
}

export async function getPoolsPage(page: number, pageSize: number): Promise<PoolInfo[]> {
  try {
    const poolsData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetPoolsPageInfoString("?page=${page}&size=${pageSize}")`
    )
    if (!poolsData || poolsData === '( string)') {
      console.error('No pools data received')
      return []
    }

    const dataMatch = poolsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid pools data format')
      return []
    }

    const poolsStr = dataMatch[1]
    
    return poolsStr.split(';')
      .filter(Boolean)
      .map(poolStr => {
        if (!poolStr.includes('>')) return null
        
        const [key, info] = poolStr.split('>')
        
        const tokenAMatch = info.match(/TokenA:{([^}]+)}/)
        const tokenBMatch = info.match(/TokenB:{([^}]+)}/)
        const reserveMatch = info.match(/ReserveA:(\d+),ReserveB:(\d+),TotalSupplyLP:(\d+)/)
        
        if (!tokenAMatch || !tokenBMatch || !reserveMatch) return null

        return {
          poolKey: key,
          tokenAInfo: parseTokenInfo(tokenAMatch[1]),
          tokenBInfo: parseTokenInfo(tokenBMatch[1]),
          reserveA: parseInt(reserveMatch[1]),
          reserveB: parseInt(reserveMatch[2]),
          totalSupplyLP: parseInt(reserveMatch[3])
        }
      })
      .filter((pool): pool is PoolInfo => pool !== null)
  } catch (error) {
    console.error('Error fetching pools page:', error)
    return []
  }
}

function parseTokenInfo(tokenStr: string): TokenDetails {
  const parts = tokenStr.split(',').reduce((acc: { [key: string]: string }, part) => {
    const [k, v] = part.split(':')
    acc[k] = v
    return acc
  }, {})
  
  return {
    key: parts.Path,
    name: parts.Name,
    symbol: parts.Symbol,
    decimals: parseInt(parts.Decimals)
  }
}

export async function getOpenTicketsCount(): Promise<number> {
  try {
    const count = await gnoService.evaluateExpression(
      REALM_PATH,
      'GetOpenTicketsCount()'
    )
    
    const numberMatch = count.match(/\((\d+)\s+int\)/)
    const parsedCount = numberMatch ? parseInt(numberMatch[1]) : 0
    
    if (isNaN(parsedCount)) {
      console.error('Failed to parse open tickets count:', count)
      return 0
    }
    
    return parsedCount
  } catch (error) {
    console.error('Error fetching open tickets count:', error)
    return 0
  }
}

export async function getOpenTicketsPage(page: number, pageSize: number): Promise<Ticket[]> {
  try {
    const ticketsData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetOpenTicketsPageInfoString("?page=${page}&size=${pageSize}")`,
    )
    if (!ticketsData || ticketsData === '( string)') {
      console.error('No tickets data received')
      return []
    }

    const dataMatch = ticketsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid tickets data format')
      return []
    }

    const ticketsStr = dataMatch[1]
    
    return ticketsStr.split(';')
      .filter(Boolean)
      .map(ticketStr => {
        if (!ticketStr.includes('>')) return null

        const [id, info] = ticketStr.split('>')
        
        const assetInMatch = info.match(/AssetIn:{([^}]+)}/)
        const assetOutMatch = info.match(/AssetOut:{([^}]+)}/)
        
        if (!assetInMatch || !assetOutMatch) return null

        const createdAtMatch = info.match(/CreatedAt:([^,]+UTC)/)
        const expiresAtMatch = info.match(/ExpiresAt:([^,]+UTC)/)
        
        const formatDate = (dateStr: string | null) => {
          if (!dateStr) return ''
          const date = new Date(dateStr)
          return date.toLocaleString('default', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        }

        const cleanInfo = info
          .replace(/AssetIn:{[^}]+},/, '')
          .replace(/AssetOut:{[^}]+},/, '')
          .replace(/CreatedAt:[^,]+UTC[^,]+,/, '')
          .replace(/ExpiresAt:[^,]+UTC[^,]+,/, '')

        const parts = cleanInfo.split(',').reduce((acc: { [key: string]: string }, part) => {
          const [k, v] = part.split(':')
          if (k && v) acc[k.trim()] = v.trim()
          return acc
        }, {})

        return {
          id,
          creator: parts.Creator,
          assetIn: parseAssetInfo(assetInMatch[1]),
          assetOut: parseAssetInfo(assetOutMatch[1]),
          amountIn: parseInt(parts.AmountIn),
          minAmountOut: parseInt(parts.MinAmountOut),
          createdAt: formatDate(createdAtMatch?.[1] ?? null),
          expiresAt: formatDate(expiresAtMatch?.[1] ?? null),
          status: parts.Status as TicketStatus
        }
      })
      .filter((ticket): ticket is Ticket => ticket !== null)
  } catch (error) {
    console.error('Error fetching open tickets page:', error)
    return []
  }
}

function parseAssetInfo(assetStr: string): Asset {
  if (!assetStr) {
    console.error('Empty asset string received:', assetStr)
    return {
      type: '',
      denom: '',
      path: '',
      name: '',
      symbol: '',
    }
  }

  const parts = assetStr.split(',').reduce((acc: { [key: string]: string }, part) => {
    const [k, v] = part.split(':')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})

  const path = parts.TokenhubPath || parts.Path

  return {
    type: parts.Type?.toLowerCase() || '', 
    denom: parts.Denom || '',
    path: path || '',
    name: parts.Name || '',
    symbol: parts.Symbol || '',
    decimals: parts.Decimals ? parseInt(parts.Decimals) : undefined,
    tokenHubPath: parts.TokenhubPath || ''
  }
}

export async function getOpenNFTTicketsCount(): Promise<number> {
  try {
    const count = await gnoService.evaluateExpression(
      REALM_PATH,
      'GetOpenNFTTicketsCount()'
    )
    
    const numberMatch = count.match(/\((\d+)\s+int\)/)
    const parsedCount = numberMatch ? parseInt(numberMatch[1]) : 0
    
    if (isNaN(parsedCount)) {
      console.error('Failed to parse open NFT tickets count:', count)
      return 0
    }
    
    return parsedCount
  } catch (error) {
    console.error('Error fetching open NFT tickets count:', error)
    return 0
  }
}

export async function getAllNFTTicketsPage(page: number, pageSize: number): Promise<Ticket[]> {
  try {
    const ticketsData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetAllNFTTicketsPageInfoString("?page=${page}&size=${pageSize}")`,
    )
    if (!ticketsData || ticketsData === '( string)') {
      console.error('No NFT tickets data received')
      return []
    }

    const dataMatch = ticketsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid NFT tickets data format')
      return []
    }

    return parseTicketsData(dataMatch[1])
  } catch (error) {
    console.error('Error fetching all NFT tickets page:', error)
    return []
  }
}

export async function getOpenNFTTicketsPage(page: number, pageSize: number): Promise<Ticket[]> {
  try {
    const ticketsData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetOpenNFTTicketsPageInfoString("?page=${page}&size=${pageSize}")`,
    )
    if (!ticketsData || ticketsData === '( string)') {
      console.error('No open NFT tickets data received')
      return []
    }

    const dataMatch = ticketsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid open NFT tickets data format')
      return []
    }

    return parseTicketsData(dataMatch[1])
  } catch (error) {
    console.error('Error fetching open NFT tickets page:', error)
    return []
  }
}

function parseTicketsData(ticketsStr: string): Ticket[] {
  return ticketsStr.split(';')
    .filter(Boolean)
    .map(ticketStr => {
      if (!ticketStr.includes('>')) return null

      const [id, info] = ticketStr.split('>')
      
      const assetInMatch = info.match(/AssetIn:{([^}]+)}/)
      const assetOutMatch = info.match(/AssetOut:{([^}]+)}/)
      
      if (!assetInMatch || !assetOutMatch) return null

      const createdAtMatch = info.match(/CreatedAt:([^,]+UTC)/)
      const expiresAtMatch = info.match(/ExpiresAt:([^,]+UTC)/)
      
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }

      const cleanInfo = info
        .replace(/AssetIn:{[^}]+},/, '')
        .replace(/AssetOut:{[^}]+},/, '')
        .replace(/CreatedAt:[^,]+UTC[^,]*,?/, '')
        .replace(/ExpiresAt:[^,]+UTC[^,]*,?/, '')

      const parts = cleanInfo.split(',').reduce((acc: { [key: string]: string }, part) => {
        const [k, v] = part.split(':')
        if (k && v) acc[k.trim()] = v.trim()
        return acc
      }, {})

      return {
        id,
        creator: parts.Creator || '',
        assetIn: parseAssetInfo(assetInMatch[1]),
        assetOut: parseAssetInfo(assetOutMatch[1]),
        amountIn: parseInt(parts.AmountIn) || 0,
        minAmountOut: parseInt(parts.MinAmountOut) || 0,
        createdAt: formatDate(createdAtMatch?.[1] ?? null),
        expiresAt: formatDate(expiresAtMatch?.[1] ?? null),
        status: parts.Status as TicketStatus || 'open'
      }
    })
    .filter((ticket): ticket is Ticket => ticket !== null)
}

export async function getTicketsCount(): Promise<number> {
  try {
    const count = await gnoService.evaluateExpression(
      REALM_PATH,
      'GetAllTicketsCount()'
    )
    
    const numberMatch = count.match(/\((\d+)\s+int\)/)
    const parsedCount = numberMatch ? parseInt(numberMatch[1]) : 0
    
    if (isNaN(parsedCount)) {
      console.error('Failed to parse tickets count:', count)
      return 0
    }
    
    return parsedCount
  } catch (error) {
    console.error('Error fetching tickets count:', error)
    return 0
  }
}

export async function getTicketsPage(page: number, pageSize: number): Promise<Ticket[]> {
  try {
    const ticketsData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetTicketsPageInfoString("?page=${page}&size=${pageSize}")`,
    )
    
    if (!ticketsData || ticketsData === '( string)') {
      console.error('No tickets data received')
      return []
    }

    const dataMatch = ticketsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid tickets data format')
      return []
    }

    return parseTicketsData(dataMatch[1])
  } catch (error) {
    console.error('Error fetching tickets page:', error)
    return []
  }
}

export async function getAllTokens(): Promise<TokenDetails[]> {
  try {
    const tokensData = await gnoService.evaluateExpression(
      TOKENHUB_PATH,
      'GetAllTokenWithDetails()'
    )

    if (tokensData === '( string)') {
      return []
    }

    const dataMatch = tokensData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid tokens data format')
      return []
    }

    return dataMatch[1]
      .split(';')
      .filter(Boolean)
      .map(tokenStr => {
        const parts = tokenStr.split(',').reduce((acc: { [key: string]: string }, part) => {
          const [k, v] = part.split(':')
          acc[k] = v
          return acc
        }, {})

        return {
          key: parts.Token,
          name: parts.Name,
          symbol: parts.Symbol,
          decimals: parseInt(parts.Decimals)
        }
      })
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return []
  }
}

export async function getUserTokenBalances(userNameOrAddress: string): Promise<TokenBalance[]> {
  try {
    const balancesData = await gnoService.evaluateExpression(
      TOKENHUB_PATH,
      `GetUserTokenBalancesNonZero("${userNameOrAddress}")`,
    )

    if (balancesData === '( string)') {
      return []
    }

    const dataMatch = balancesData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid token balances data format')
      return []
    }

    const balancesStr = dataMatch[1]
    
    const balances = balancesStr
      .split(',')
      .filter(Boolean)
      .map(tokenStr => {
        const [prefix, tokenKey, balanceStr] = tokenStr.split(':')
        
        if (prefix !== 'Token' || !tokenKey || !balanceStr) {
          console.error('Invalid token balance format:', tokenStr)
          return null
        }

        return {
          tokenKey,
          balance: parseInt(balanceStr)
        }
      })
      .filter((balance): balance is TokenBalance => balance !== null)

    return balances;
  } catch (error) {
    console.error('Error fetching user token balances:', error)
    return []
  }
}

export async function getUserNFTBalances(userNameOrAddress: string): Promise<NFTDetails[]> {
  try {
    const nftsData = await gnoService.evaluateExpression(
      TOKENHUB_PATH,
      `GetUserNFTBalances("${userNameOrAddress}")`,
    )

    if (nftsData === '( string)') {
      return []
    }

    const dataMatch = nftsData.match(/\("([^"]+)"\s+string\)/)
    if (!dataMatch) {
      console.error('Invalid NFT balances data format')
      return []
    }

    const nftsStr = dataMatch[1]
    
    return nftsStr
      .split(',')
      .filter(Boolean)
      .map(nftStr => {
        const [prefix, fullPath] = nftStr.split(':')
        
        if (prefix !== 'NFT' || !fullPath) {
          console.error('Invalid NFT format:', nftStr)
          return null
        }

        const pathParts = fullPath.split('.')
        const tokenId = pathParts.pop() || ''
        const collection = pathParts.join('.')

        return {
          key: fullPath,
          collection,
          tokenId,
          uri: '' // since the grc721 recreation is on it's way, this remains TODO
        }
      })
      .filter((nft): nft is NFTDetails => nft !== null)
  } catch (error) {
    console.error('Error fetching user NFT balances:', error)
    return []
  }
}

export async function getSwapEstimate(
  poolKey: string, 
  tokenInKey: string, 
  amountIn: number
): Promise<number> {
  try {
    const estimateData = await gnoService.evaluateExpression(
      REALM_PATH,
      `GetSwapEstimate("${poolKey}", "${tokenInKey}", ${amountIn})`
    )
    const numberMatch = estimateData.match(/\((\d+)\s+uint64\)/)
    if (!numberMatch) {
      console.error('Invalid swap estimate format:', estimateData)
      return 0
    }

    const estimate = parseInt(numberMatch[1])
    if (isNaN(estimate)) {
      console.error('Failed to parse swap estimate:', estimateData)
      return 0
    }

    return estimate
  } catch (error) {
    console.error('Error fetching swap estimate:', error)
    return 0
  }
} 

