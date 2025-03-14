'use client'

import { useFulfillTicketMutation } from "@/app/services/ticket-history/mutations-and-queries"
import { validateTicketFulfillment } from "@/app/services/ticket-history/validation"
import { formatDate, getTicketStatusConfig, showValidationError } from '@/app/utils'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useCallback, useEffect, useState } from "react"
import { useTicketSidebar } from "../contexts/TicketSidebarContext"

export function TicketSidebar() {
  const { selectedTicket, isOpen, setIsOpen, setSelectedTicket } = useTicketSidebar()
  const [swapAmount, setSwapAmount] = useState("")
  const walletAddress = useWalletAddress()

  const fulfillMutation = useFulfillTicketMutation(() => {
    handleClose()
  })

  const handleClose = useCallback(() => {
    setSwapAmount("")
    setSelectedTicket(null)
  }, [setSelectedTicket])

  useEffect(() => {
    if (!isOpen) {
      handleClose()
    }
  }, [isOpen, handleClose])

  const handleFulfillTicket = async () => {
    if (!selectedTicket) return;
    
    const validationError = validateTicketFulfillment(selectedTicket, Number(swapAmount), walletAddress);
    if (validationError) {
      showValidationError({
        title: "Cannot fulfill ticket",
        description: validationError
      });
      return;
    }
    
    await fulfillMutation.mutateAsync({ 
      ticket: selectedTicket, 
      amount: Number(swapAmount) 
    });
  }

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

            {(selectedTicket.status === 'open' && selectedTicket.assetIn.type !== 'nft') && (
              <div className="space-y-2">
                <Label className="text-gray-400">Payment Amount</Label>
                <Input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                  placeholder="Enter amount to pay"
                  disabled={walletAddress === selectedTicket.creator}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Status</span>
              <span className={`px-2 py-0.5 rounded-md ${
                selectedTicket.status === 'fulfilled' 
                  ? `${getTicketStatusConfig('fulfilled').bgColor} ${getTicketStatusConfig('fulfilled').color}`
                  : selectedTicket.status === 'cancelled'
                  ? `${getTicketStatusConfig('cancelled').bgColor} ${getTicketStatusConfig('cancelled').color}`
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

          {(selectedTicket.status === 'open' && selectedTicket.assetIn.type !== 'nft') && (
            <Button 
              onClick={handleFulfillTicket}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              disabled={!swapAmount || Number(swapAmount) <= 0 || walletAddress === selectedTicket.creator}
            >
              {walletAddress === selectedTicket.creator ? 'Cannot fulfill own ticket' : 'Fulfill Ticket'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 
