'use client'

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
import { ArrowRight, X } from "lucide-react"
import { useState } from "react"
import { useTicketSidebar } from "../contexts/TicketSidebarContext"

export function TicketSidebar() {
  const { selectedTicket, isOpen, setIsOpen, setSelectedTicket } = useTicketSidebar()
  const [swapAmount, setSwapAmount] = useState("")

  const handleClose = () => {
    setIsOpen(false)
    setSelectedTicket(null)
    setSwapAmount("")
  }

  const handleSwap = () => {
    // todo : implement swap logic here
    console.log("Swapping:", swapAmount)
    handleClose()
  }

  if (!selectedTicket) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[400px] bg-gray-800 text-gray-300 border-gray-700">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle className="text-gray-200">Ticket Details</SheetTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription className="text-gray-400">
            ID: {selectedTicket.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-gray-400">From</Label>
                <div className="text-sm">
                  {selectedTicket.assetIn.type === 'nft' 
                    ? selectedTicket.assetIn.tokenHubPath
                    : selectedTicket.assetIn.symbol
                  }
                </div>
              </div>
              <ArrowRight className="text-gray-500" />
              <div className="space-y-1 text-right">
                <Label className="text-gray-400">To</Label>
                <div className="text-sm">
                  {selectedTicket.assetOut.type === 'nft'
                    ? selectedTicket.assetOut.tokenHubPath
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
                <Label className="text-gray-400">Swap Amount</Label>
                <Input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200"
                  placeholder="Enter amount to swap"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Status</span>
              <span className={`px-2 py-0.5 rounded-full ${
                selectedTicket.status === 'completed' 
                  ? 'bg-green-900/50 text-green-400'
                  : selectedTicket.status === 'pending'
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-red-900/50 text-red-400'
              }`}>
                {selectedTicket.status}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Created</span>
              <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Expires</span>
              <span>{new Date(selectedTicket.expiresAt).toLocaleString()}</span>
            </div>
          </div>

          {selectedTicket.status === 'open' && (
            <Button 
              onClick={handleSwap}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!swapAmount || Number(swapAmount) <= 0}
            >
              Swap
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 
