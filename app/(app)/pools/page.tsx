'use client'

import { Card } from '@/components/ui/card'
import { useState } from 'react'

interface Pool {
  id: number
  name: string
  token0: string
  token1: string
  liquidity: string
}

export default function PoolsPage() {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [pageSize] = useState(10)

  // Placeholder pool data
  const pools: Pool[] = Array.from({ length: pageSize }, (_, i) => ({
    id: i + 1,
    name: `Pool ${i + 1}`,
    token0: 'ETH',
    token1: 'USDC',
    liquidity: `$${(Math.random() * 1000000).toFixed(2)}`
  }))

  return (
    <div className="container mx-auto p-6 flex gap-6 h-full">
      {/* Left side - Pool cards */}
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

      {/* Right side - Swap card */}
      <div className="w-2/3">
        {selectedPool ? (
          <Card className="p-6 h-[500px] bg-gray-800 text-gray-400 border-none shadow-lg">
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
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a pool to start swapping
          </div>
        )}
      </div>
    </div>
  )
}
