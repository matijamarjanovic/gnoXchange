'use client'

import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

interface Pool {
  id: number
  name: string
  token0: string
  token1: string
  liquidity: string
}

interface CreatePoolForm {
  tokenA: string
  tokenB: string
  amountA: string
  amountB: string
}

export default function PoolsPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPool, setIsCreatingPool] = useState(false)
  const [createPoolForm, setCreatePoolForm] = useState<CreatePoolForm>({
    tokenA: '',
    tokenB: '',
    amountA: '',
    amountB: ''
  })

  useEffect(() => {
    const initializePools = () => {
      const cardHeight = 116 
      const searchBarHeight = 40
      const containerHeight = window.innerHeight - 64 
      const calculatedPageSize = Math.floor((containerHeight - searchBarHeight) / cardHeight)
      
      const initialPools = Array.from({ length: calculatedPageSize }, (_, i) => ({
        id: i + 1,
        name: `Pool ${i + 1}`,
        token0: 'ETH',
        token1: 'USDC',
        liquidity: `$${(Math.random() * 1000000).toFixed(2)}`
      }))
      setPools(initialPools)
      setSelectedPool(initialPools[0])
      setIsLoading(false)
    }

    initializePools()
  }, [])

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: abci call
    try {
      console.log('Creating pool with:', {
        tokenA: createPoolForm.tokenA,
        tokenB: createPoolForm.tokenB,
        amountA: parseInt(createPoolForm.amountA),
        amountB: parseInt(createPoolForm.amountB)
      })
      setCreatePoolForm({
        tokenA: '',
        tokenB: '',
        amountA: '',
        amountB: ''
      })
      setIsCreatingPool(false)
    } catch (error) {
      console.error('Error creating pool:', error)
    }
  }

  const renderRightCard = () => {
    if (isCreatingPool) {
      return (
        <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Pool</h2>
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingPool(false)}
              className="hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleCreatePool} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Token A</label>
              <Input
                placeholder="Enter token A symbol"
                value={createPoolForm.tokenA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePoolForm(prev => ({...prev, tokenA: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Initial Amount A</label>
              <Input
                type="number"
                placeholder="Enter amount for token A"
                value={createPoolForm.amountA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePoolForm(prev => ({...prev, amountA: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Token B</label>
              <Input
                placeholder="Enter token B symbol"
                value={createPoolForm.tokenB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePoolForm(prev => ({...prev, tokenB: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Initial Amount B</label>
              <Input
                type="number"
                placeholder="Enter amount for token B"
                value={createPoolForm.amountB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePoolForm(prev => ({...prev, amountB: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-gray-900">
              Create Pool
            </Button>
          </form>
        </Card>
      )
    }

    return selectedPool ? (
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
    ) : null
  }

  if (isLoading) {
    return null // or a loading spinner
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
              key={pool.id}
              className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                selectedPool?.id === pool.id && !isCreatingPool ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedPool(pool)
                setIsCreatingPool(false)
              }}
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
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
