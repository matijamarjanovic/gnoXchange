'use client'

import { getPoolCount, getPoolsPage } from '@/app/queries/abci-queries'
import { PoolInfo } from '@/app/types/types'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CreatePool } from '../../../components/create-pool'
import { PaginationControls } from '../../../components/pagination-controls'
import { SelectedPool } from '../../../components/selected-pool'

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
        const count = await getPoolCount()
        setTotalPools(count)

        const poolsArray = await getPoolsPage(currentPage, pageSize)
        setPools(poolsArray)
        
        if (poolsArray.length > 0 && !selectedPool) {
          setSelectedPool(poolsArray[0])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching pools data:', error)
        setIsLoading(false)
      }
    }

    const calculatePageSize = () => {
      const cardHeight = 116 
      const searchBarHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight) / cardHeight)
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

    return selectedPool ? <SelectedPool pool={selectedPool} /> : null
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none">
      <div className="flex justify-between items-center space-x-3">
        <div className="flex items-center flex-1 space-x-3">
          <SearchBar 
            containerClassName="flex-1"
            placeholder="Search pools..."
            onChange={(value) => {
              console.log(value)
            }}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalPools / pageSize)}
            onPageChange={setCurrentPage}
            variant="minimal"
          />
        </div>
        <Button 
          onClick={() => setIsCreatingPool(true)}
          className="bg-gray-800 hover:bg-gray-900 h-9"
        >
          <CirclePlus name="plus" className="" /> Create Pool
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
        </div>

        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
