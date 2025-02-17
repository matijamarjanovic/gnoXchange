'use client'

import { Ticket } from "@/app/types"
import { formatAmount } from '@/app/utils'
import { Card } from "@/components/ui/card"

interface SelectedTicketProps {
  ticket: Ticket
}

export function SelectedTicket({ ticket }: SelectedTicketProps) {
  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-4">
        P2P Trade - {ticket.assetIn.symbol} → {ticket.assetOut.symbol}
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Creator</p>
            <p className="text-gray-300 truncate">{ticket.creator}</p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-gray-300">{ticket.status}</p>
          </div>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">Selling</p>
          <p className="text-gray-300">
            {formatAmount(ticket.amountIn, ticket.assetIn.decimals ?? 0)} {ticket.assetIn.symbol}
          </p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">Minimum Receiving</p>
          <p className="text-gray-300">
            {formatAmount(ticket.minAmountOut, ticket.assetOut.decimals ?? 0)} {ticket.assetOut.symbol}
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
        <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
          Take Trade
        </button>
      </div>
    </Card>
  )
} 
