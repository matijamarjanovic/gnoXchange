'use client'

import { formatDate, getTicketStatusConfig } from '@/app/utils'
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useWalletAddress } from "@/hooks/use-wallet-address"
import { ArrowDown, ArrowRight } from "lucide-react"
import { useCallback, useEffect } from "react"
import { useTicketSidebar } from "../contexts/TicketSidebarContext"

export function TicketSidebar() {
  const { selectedTicket, isOpen, setIsOpen, setSelectedTicket } = useTicketSidebar()
  const walletAddress = useWalletAddress()

  const handleClose = useCallback(() => {
    setSelectedTicket(null)
  }, [setSelectedTicket])

  useEffect(() => {
    if (!isOpen) {
      handleClose()
    }
  }, [isOpen, handleClose])

  if (!selectedTicket) return null

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => setIsOpen(open)}
    >
      <SheetContent 
        className="w-[400px] bg-gray-800 text-gray-300 border-gray-700"
        style={{
          '--tw-backdrop-brightness': '0.8',
        } as React.CSSProperties}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-gray-200">Ticket Details</SheetTitle>
            {selectedTicket.creator === walletAddress && (
              <span className="px-2 py-0.5 text-xs bg-yellow-700 rounded-md text-yellow-400">Owner</span>
            )}
          </div>
          <SheetDescription className="text-gray-400">
            ID: {selectedTicket.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <Label className="text-gray-400">From</Label>
                <div className="text-sm truncate flex items-center gap-2">
                  {selectedTicket.assetIn.type === 'nft' 
                    ? selectedTicket.assetIn.tokenHubPath
                    : selectedTicket.assetIn.type === 'coin'
                    ? selectedTicket.assetIn.denom
                    : selectedTicket.assetIn.symbol
                  }
                </div>
              </div>
              <ArrowRight className="hidden sm:block text-gray-500 shrink-0" />
              <ArrowDown className="block sm:hidden text-gray-500 shrink-0" />
              <div className="space-y-1 min-w-0 flex-1">
                <Label className="text-gray-400">To</Label>
                <div className="text-sm truncate">
                  {selectedTicket.assetOut.type === 'nft'
                    ? selectedTicket.assetOut.tokenHubPath
                    : selectedTicket.assetOut.type === 'coin'
                    ? selectedTicket.assetOut.denom
                    : selectedTicket.assetOut.symbol
                  }
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Amount In</Label>
              <div className="text-sm">{selectedTicket.amountIn}</div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Minimum Amount Out</Label>
              <div className="text-sm">{selectedTicket.minAmountOut}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Status</span>
              <span className={`px-2 py-0.5 rounded-md ${
                selectedTicket.status === 'fulfilled' 
                  ? `${getTicketStatusConfig('fulfilled').bgColor} ${getTicketStatusConfig('fulfilled').color}`
                  : selectedTicket.status === 'cancelled'
                  ? `${getTicketStatusConfig('cancelled').bgColor} ${getTicketStatusConfig('cancelled').color}`
                  : selectedTicket.status === 'open'
                  ? `${getTicketStatusConfig('open').bgColor} ${getTicketStatusConfig('open').color}`
                  : `${getTicketStatusConfig('expired').bgColor} ${getTicketStatusConfig('expired').color}`
              }`}>
                {selectedTicket.status}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Created</span>
              <span>{formatDate(selectedTicket.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Expires</span>
              <span>{formatDate(selectedTicket.expiresAt)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 
