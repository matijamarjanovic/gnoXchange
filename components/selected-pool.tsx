import { PoolInfo } from "@/app/types"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface SelectedPoolProps {
  pool: PoolInfo
}

export function SelectedPool({ pool }: SelectedPoolProps) {
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")

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
        <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
          Swap
        </button>
      </div>
    </Card>
  )
} 
