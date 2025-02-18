import { PoolInfo } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

interface SelectedPoolProps {
  pool: PoolInfo
}

export function SelectedPool({ pool }: SelectedPoolProps) {
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [isSwapping, setIsSwapping] = useState(false)

  const handleSwap = () => {
    setIsSwapping(true)
    // todo : add swap logic
    setTimeout(() => setIsSwapping(false), 1000) 
  }

  // todo : add toast when swapping
  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-4">
        {pool.tokenAInfo.symbol} ⇄ {pool.tokenBInfo.symbol}
      </h2>
      <div className="space-y-4">
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">From</p>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-transparent text-gray-300"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">To</p>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-transparent text-gray-300"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSwap}
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={isSwapping}
        >
          <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-500 ${isSwapping ? 'rotate-180' : ''}`} />
          {isSwapping ? 'Swapping...' : 'Swap'}
        </Button>
      </div>
    </Card>
  )
} 
