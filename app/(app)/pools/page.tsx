'use client'

import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface Pool {
  id: number
  name: string
  token0: string
  token1: string
  liquidity: string
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)

  useEffect(() => {
    const cardHeight = 116; 
    const containerHeight = window.innerHeight - 64; 
    const calculatedPageSize = Math.floor(containerHeight / cardHeight);
    
    const initialPools = Array.from({ length: calculatedPageSize }, (_, i) => ({
      id: i + 1,
      name: `Pool ${i + 1}`,
      token0: 'ETH',
      token1: 'USDC',
      liquidity: `$${(Math.random() * 1000000).toFixed(2)}`
    }))
    setPools(initialPools)
    setSelectedPool(initialPools[0])
  }, []) 

  if (!selectedPool) {
    return null 
  }

  return (
    <div className="container mx-auto p-6 flex gap-6">
      <div className="w-1/3 space-y-4">
        {pools.map((pool) => (
          <Card
            key={pool.id}
            className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
              selectedPool?.id === pool.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPool(pool)}
          >
            <h3 className="font-bold text-lg">{pool.name}</h3>
            <div className="text-sm text-gray-400">
              <p>{`${pool.token0}/${pool.token1}`}</p>
              <p>Liquidity: {pool.liquidity}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="w-2/3">
        <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-4">
            Swap - {selectedPool.token0}/{selectedPool.token1}
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
      </div>
    </div>
  )
}
