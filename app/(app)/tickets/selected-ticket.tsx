'use client'

import { Ticket } from "@/app/types/types"
import { formatAmount, getTicketStatusConfig } from '@/app/utils'
import { FormattedAmount } from "@/components/formatted-amount"
import { TradeConfirmationDialog } from "@/components/p2p-confirm-dialog"
import { Card } from "@/components/ui/card"
import { Handshake, X } from "lucide-react"
import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { useCancelTicketMutation, useFulfillTicketMutation } from "./mutations-and-queries"
import { useWalletAddress } from "@/hooks/use-wallet-address"

interface SelectedTicketProps {
  ticket: Ticket
  onSuccess?: () => void
}

export function SelectedTicket({ ticket, onSuccess }: SelectedTicketProps) {
  const [showTradeDialog, setShowTradeDialog] = useState(false)
  const walletAddress = useWalletAddress()
  const statusConfig = getTicketStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon

  const fulfillMutation = useFulfillTicketMutation(onSuccess)
  const cancelMutation = useCancelTicketMutation(onSuccess)

  const handleTrade = () => {
    setShowTradeDialog(true)
  }

  const handleTradeConfirm = async (amount: number) => {
    await fulfillMutation.mutateAsync({ ticket, amount })
    setShowTradeDialog(false)
  }

  const handleCancelTicket = async () => {
    await cancelMutation.mutateAsync(ticket)
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <h2 className="text-lg mb-4">
        P2P Trade <span className="text-2xl ml-2 font-bold">
          {ticket.assetIn.symbol || ticket.assetIn.denom} → {ticket.assetOut.symbol || ticket.assetOut.denom}
        </span>
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900 relative">
            <p className="text-sm text-gray-400">
              {walletAddress === ticket.creator ? 'Creator (you)' : 'Creator'}
            </p>
            <p className={`truncate ${walletAddress === ticket.creator ? 'text-blue-500' : 'text-gray-300'}`}>
              {ticket.creator}
            </p>
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
          <p className="text-sm text-gray-400">Selling</p>
          <p className="text-gray-300">
            {ticket.assetIn.symbol || ticket.assetIn.denom} <FormattedAmount 
              amount={formatAmount(ticket.amountIn, ticket.assetIn.decimals ?? 6)} 
            /> 
          </p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">Minimum Receiving</p>
          <p className="text-gray-300">
            {ticket.assetOut.symbol || ticket.assetOut.denom} <FormattedAmount 
              amount={formatAmount(ticket.minAmountOut, ticket.assetOut.decimals ?? 6)} 
            />
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
          onClick={walletAddress === ticket.creator ? handleCancelTicket : handleTrade}
          className={`w-full transition-all shadow-md ${
            walletAddress === ticket.creator 
              ? 'bg-red-700/80 hover:bg-red-600 text-gray-100'
              : 'bg-blue-700 hover:bg-blue-600 text-gray-300'
          }`}
          disabled={fulfillMutation.isPending || cancelMutation.isPending}
        >
          {walletAddress === ticket.creator ? (
            <>
              <X className="mr-2 h-4 w-4" />
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Ticket'}
            </>
          ) : (
            <>
              <Handshake className={`mr-2 h-4 w-4 transition-transform duration-500 ${fulfillMutation.isPending ? 'scale-125' : ''}`} />
              {fulfillMutation.isPending ? 'Swapping...' : 'Swap'}
            </>
          )}
        </Button>
      </div>
      <TradeConfirmationDialog
        isOpen={showTradeDialog}
        onClose={() => setShowTradeDialog(false)}
        onConfirm={handleTradeConfirm}
        ticket={ticket}
      />
    </Card>
  )
} 
