import { GnoService } from '@/app/services/abci-service'
import { PoolInfo, TokenDetails } from '@/app/types'

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
