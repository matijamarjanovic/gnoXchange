'use client'

import { formatDate } from '@/app/utils'
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
import { ArrowDown, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useTicketSidebar } from "../app/(app)/contexts/TicketSidebarContext"

export function TicketSidebar() {
  const { selectedTicket, isOpen, setIsOpen, setSelectedTicket } = useTicketSidebar()
  const [swapAmount, setSwapAmount] = useState("")

  const handleClose = () => {
    setIsOpen(false)
    setSelectedTicket(null)
    setSwapAmount("")
  }

  const handleFulfillTicket = () => {
    // todo : implement fulfill ticket logic here
    console.log("Fulfilling ticket with payment:", swapAmount)
    handleClose()
  }

  if (!selectedTicket) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        className="w-[400px] bg-gray-800 text-gray-300 border-gray-700"
        style={{
          '--tw-backdrop-brightness': '0.8',
        } as React.CSSProperties}
      >
        <SheetHeader>
          <SheetTitle className="text-gray-200">Ticket Details</SheetTitle>
          <SheetDescription className="text-gray-400">
            ID: {selectedTicket.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <Label className="text-gray-400">From</Label>
                <div className="text-sm truncate">
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

            {selectedTicket.status === 'open' && (
              <div className="space-y-2">
                <Label className="text-gray-400">Payment Amount</Label>
                <Input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                  placeholder="Enter amount to pay"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Status</span>
              <span className={`px-2 py-0.5 rounded-full ${
                selectedTicket.status === 'fulfilled' 
                  ? 'bg-green-900/50 text-green-400'
                  : selectedTicket.status === 'cancelled'
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-red-900/50 text-red-400'
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

          {selectedTicket.status === 'open' && (
            <Button 
              onClick={handleFulfillTicket}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!swapAmount || Number(swapAmount) <= 0}
            >
              Fulfill Ticket
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 
