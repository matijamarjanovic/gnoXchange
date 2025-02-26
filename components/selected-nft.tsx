'use client'

import { AdenaService } from "@/app/services/adena-service"
import { buyNFT, cancelTicket } from "@/app/services/tx-service"
import { Ticket } from "@/app/types/types"
import { formatAmount, getTicketStatusConfig } from '@/app/utils'
import { FormattedAmount } from "@/components/formatted-amount"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog"
import { Ghost, ShoppingCart, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface SelectedNFTProps {
  ticket: Ticket
  onSuccess?: () => Promise<void>
}

export function SelectedNFT({ ticket, onSuccess }: SelectedNFTProps) {
  const [isTrading, setIsTrading] = useState(false)
  const [walletAddress, setWalletAddress] = useState(AdenaService.getInstance().getAddress())
  const statusConfig = getTicketStatusConfig(ticket.status)
  const StatusIcon = statusConfig.icon

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent<{ newAddress: string | null }>) => {
      setWalletAddress(event.detail.newAddress || '');
    };

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener);

    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener);
    };
  }, []);

  const getNFTName = (path: string) => {
    const parts = path.split('.')
    return parts[parts.length - 2] + '.' + parts[parts.length - 1]
  }

  const handleBuyNFT = async () => {
    try {
      setIsTrading(true)
      
      const success = await buyNFT(
        ticket.id,
        ticket.minAmountOut,
        ticket.assetOut.type as 'coin' | 'token',
        ticket.assetOut.type === 'coin' ? '' : ticket.assetOut.path || ''
      )

      if (success) {
        toast({
          title: "Success",
          description: "NFT purchased successfully",
          variant: "default"
        })
        await onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to purchase NFT",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error buying NFT:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase NFT",
        variant: "destructive"
      })
    } finally {
      setIsTrading(false)
    }
  }

  const handleCancelSale = async () => {
    try {
      setIsTrading(true)
      const success = await cancelTicket(ticket)

      if (success) {
        toast({
          title: "Sale cancelled",
          description: "Your NFT sale has been cancelled successfully.",
          variant: "default"
        })
        await onSuccess?.()
      }
    } catch (error) {
      console.error('Cancel failed:', error)
      toast({
        title: "Cancel failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsTrading(false)
    }
  }

  // TODO: replace mock image with actual image when grc721 is implemented
  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 bg-transparent hover:bg-gray-700 hover:text-gray-300" 
          >
            <Ghost className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogDescription/>
        <DialogTitle/>
        <DialogContent className="bg-gray-800 border-gray-700 -p-4" showCloseButton={false}>
          <Image 
            src="/nft-mock.png" 
            alt="NFT Preview"
            className="w-full h-auto object-cover rounded-lg"
            width={400}
            height={400}
          />
        </DialogContent>
      </Dialog>

      <h2 className="text-lg mb-4">
        NFT Sale <span className="text-2xl ml-2 font-bold">
          {getNFTName(ticket.assetIn.tokenHubPath || '')} → {ticket.assetOut.symbol || ticket.assetOut.denom || 'GNOT'}
        </span>
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
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
          <p className="text-sm text-gray-400">NFT Path</p>
          <p className="text-gray-300 break-all">
            {ticket.assetIn.tokenHubPath}
          </p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">Price</p>
          <p className="text-gray-300">
            {ticket.assetOut.symbol || ticket.assetOut.denom || 'GNOT'} <FormattedAmount 
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
          onClick={walletAddress === ticket.creator ? handleCancelSale : handleBuyNFT}
          className={`w-full transition-all shadow-md ${
            walletAddress === ticket.creator 
              ? 'bg-red-700/80 hover:bg-red-600 text-gray-100'
              : 'bg-blue-700 hover:bg-blue-600 text-gray-300'
          }`}
          disabled={isTrading || ticket.status !== 'open'}
        >
          {walletAddress === ticket.creator ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel Sale
            </>
          ) : (
            <>
              <ShoppingCart className={`mr-2 h-4 w-4 transition-transform duration-500 ${isTrading ? 'scale-125' : ''}`} />
              {isTrading ? 'Buying...' : 'Buy NFT'}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
} 
