'use client'

import { Ticket } from "@/app/types"
import { formatAmount, getTicketStatusConfig } from '@/app/utils'
import { Card } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

interface SelectedNFTProps {
  ticket: Ticket
}

export function SelectedNFT({ ticket }: SelectedNFTProps) {
  const [isTrading, setIsTrading] = useState(false)
  const statusConfig = getTicketStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon

  const getNFTName = (path: string) => {
    const parts = path.split('.')
    return parts[parts.length - 2] + '.' + parts[parts.length - 1]
  }

  const handleTrade = () => {
    setIsTrading(true)
    setTimeout(() => setIsTrading(false), 1000)
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <h2 className="text-lg mb-4">
        NFT Sale <span className="text-2xl ml-2 font-bold">
          {getNFTName(ticket.assetIn.tokenHubPath || '')} → {ticket.assetOut.symbol || ticket.assetOut.denom || 'GNOT'}
        </span>
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Creator</p>
            <p className="text-gray-300 truncate">{ticket.creator}</p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-gray-300 flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
              {statusConfig.label}
            </p>
          </div>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">NFT Path</p>
          <p className="text-gray-300 break-all">
            {ticket.assetIn.tokenHubPath}
          </p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">Price</p>
          <p className="text-gray-300">
            {formatAmount(ticket.minAmountOut)} {ticket.assetOut.symbol || ticket.assetOut.denom || 'GNOT'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Created At</p>
            <p className="text-gray-300">{ticket.createdAt}</p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Expires At</p>
            <p className="text-gray-300">{ticket.expiresAt}</p>
          </div>
        </div>
        <Button 
          onClick={handleTrade}
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={isTrading}
        >
          <ShoppingCart className={`mr-2 h-4 w-4 transition-transform duration-500 ${isTrading ? 'scale-125' : ''}`} />
          {isTrading ? 'Buying...' : 'Buy NFT'}
        </Button>
      </div>
    </Card>
  )
} 
