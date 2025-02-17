'use client'

import { GnoService } from '@/app/services/abci_service'
import { PoolInfo, TokenDetails } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from 'react'
import { CreatePool } from '../components/create-pool'
import { PaginationControls } from '../components/pagination-controls'

interface CreatePoolForm {
  tokenA: string
  tokenB: string
  amountA: string
  amountB: string
}

export default function PoolsPage() {
  const [pools, setPools] = useState<PoolInfo[]>([])
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPool, setIsCreatingPool] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalPools, setTotalPools] = useState(0)

  useEffect(() => {
    const fetchPoolsData = async () => {
      try {
        const gnoService = new GnoService()
        
        // returns "(100 int)"
        const poolCount = await gnoService.evaluateExpression(
          'gno.land/r/matijamarjanovic/gnoxchange',
          'GetAllPoolNamesCount()'
        )
        
        // parsing
        const numberMatch = poolCount.match(/\((\d+)\s+int\)/)
        const parsedCount = numberMatch ? parseInt(numberMatch[1]) : 0
        
        if (isNaN(parsedCount)) {
          console.error('Failed to parse pool count:', poolCount)
          setTotalPools(0)
        } else {
          setTotalPools(parsedCount)
        }

        const poolsData = await gnoService.evaluateExpression(
          'gno.land/r/matijamarjanovic/gnoxchange',
          `GetPoolsPageInfoString("?page=${currentPage}&size=${pageSize}")`
        )
                
        if (!poolsData) {
          console.error('No pools data received')
          setPools([])
          setIsLoading(false)
          return
        }

        const poolsArray = poolsData.split(';')
          .filter(Boolean)
          .map(poolStr => {
            if (!poolStr.includes('>')) return null
            
            const [key, info] = poolStr.split('>')
            
            // parsing pool info
            const tokenAMatch = info.match(/TokenA:{([^}]+)}/)
            const tokenBMatch = info.match(/TokenB:{([^}]+)}/)
            const reserveMatch = info.match(/ReserveA:(\d+),ReserveB:(\d+),TotalSupplyLP:(\d+)/)
            
            if (!tokenAMatch || !tokenBMatch || !reserveMatch) return null

            const parseTokenInfo = (tokenStr: string): TokenDetails => {
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

        setPools(poolsArray)
        if (poolsArray.length > 0 && !selectedPool) {
          setSelectedPool(poolsArray[0])
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching pools data:', error)
        console.error('Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack
        })
        setIsLoading(false)
      }
    }

    const calculatePageSize = () => {
      const cardHeight = 116 
      const searchBarHeight = 40
      const paginationHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight - paginationHeight) / cardHeight)
    }

    const newPageSize = calculatePageSize()
    setPageSize(newPageSize)
    fetchPoolsData()

    const handleResize = () => {
      const calculatedPageSize = calculatePageSize()
      if (calculatedPageSize !== pageSize) {
        setPageSize(calculatedPageSize)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentPage, pageSize, selectedPool])

  const handleCreatePool = async (formData: CreatePoolForm) => {
    try {
      console.log('Creating pool with:', {
        tokenA: formData.tokenA,
        tokenB: formData.tokenB,
        amountA: parseInt(formData.amountA),
        amountB: parseInt(formData.amountB)
      })
      setIsCreatingPool(false)
    } catch (error) {
      console.error('Error creating pool:', error)
    }
  }

  const renderRightCard = () => {
    if (isCreatingPool) {
      return (
        <CreatePool
          onClose={() => setIsCreatingPool(false)}
          onSubmit={handleCreatePool}
        />
      )
    }

    return selectedPool ? (
      <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-4">
          {selectedPool.tokenAInfo.symbol} ⇄ {selectedPool.tokenBInfo.symbol}
        </h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">From</p>
            <input
              type="number"
              className="w-full mt-1 p-2 bg-transparent text-gray-300"
              placeholder="0.0"
            />
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">To</p>
            <input
              type="number"
              className="w-full mt-1 p-2 bg-transparent text-gray-300"
              placeholder="0.0"
            />
          </div>
          <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
            Swap
          </button>
        </div>
      </Card>
    ) : null
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none">
      <div className="flex justify-between items-center">
        <SearchBar 
          containerClassName="flex-grow mr-4"
          placeholder="Search pools..."
          onChange={(value) => {
            console.log(value)
          }}
        />
        <Button 
          onClick={() => setIsCreatingPool(true)}
          className="bg-primary hover:bg-gray-900 h-9"
        >
          Create Pool
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 space-y-4">
          {pools.map((pool) => (
            <Card
              key={pool.poolKey}
              className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                selectedPool?.poolKey === pool.poolKey && !isCreatingPool ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedPool(pool)
                setIsCreatingPool(false)
              }}
            >
              <h3 className="font-bold text-lg">{`${pool.tokenAInfo.symbol} ⇄ ${pool.tokenBInfo.symbol}`}</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger>
                        <p>Liquidity</p>
                      </TooltipTrigger>
                      <TooltipContent className="text-[10px] bg-gray-700 border-gray-900 text-gray-400">
                        <p>All values are shown in their native token denominations.</p>
                        <div className="flex space-x-2">
                          <p><strong>{pool.tokenAInfo.symbol}</strong> {pool.tokenAInfo.decimals} decimals</p>
                          <p><strong>{pool.tokenBInfo.symbol}</strong> {pool.tokenBInfo.decimals} decimals</p>
                          <p><strong>LP Token</strong> 6 decimals</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex space-x-4">
                  <p><strong>{pool.tokenAInfo.symbol}</strong> {pool.reserveA}</p>
                  <p><strong>{pool.tokenBInfo.symbol}</strong> {pool.reserveB}</p>
                  <p><strong>LP amount</strong> {pool.totalSupplyLP}</p>
                </div>
              </div>
            </Card>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalPools / pageSize)}
            onPageChange={setCurrentPage}
            variant="minimal"
            className="mt-8"
          />
        </div>

        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
