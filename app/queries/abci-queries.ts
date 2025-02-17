import { GnoService } from '@/app/services/abci-service'
import { Asset, PoolInfo, Ticket, TicketStatus, TokenDetails } from '@/app/types'

const REALM_PATH = 'gno.land/r/matijamarjanovic/gnoxchange'
const gnoService = new GnoService()

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
    
    if (!poolsData) {
      console.error('No pools data received')
      return []
    }

    return poolsData.split(';')
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
    if (!ticketsData || !ticketsData.includes('string)')) {
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
  const parts = assetStr.split(',').reduce((acc: { [key: string]: string }, part) => {
    const [k, v] = part.split(':')
    acc[k] = v
    return acc
  }, {})

  return {
    type: parts.Type.toLowerCase(), // Convert to lowercase to match our type
    denom: parts.Denom,
    path: parts.Path,
    name: parts.Name,
    symbol: parts.Symbol,
    decimals: parts.Decimals ? parseInt(parts.Decimals) : undefined
  }
} 
