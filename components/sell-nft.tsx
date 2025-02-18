'use client'

import { mockCoinDetails, mockNFTDetails, mockTokenDetails } from "@/app/mock"
import { Asset, NFTDetails } from "@/app/types"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { DollarSign } from "lucide-react"

interface SellNFTProps {
  onCloseAction: () => void
  onSubmitAction: (nft: NFTDetails, assetType: Asset, amount: string) => void
}

export function     SellNFT({ onCloseAction, onSubmitAction }: SellNFTProps) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)
  const [amountOut, setAmountOut] = useState<string>('')
  const [isSelling, setIsSelling] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nftDetails && assetOutType && amountOut) {
      setIsSelling(true)
      onSubmitAction(nftDetails, assetOutType, amountOut)
      setTimeout(() => setIsSelling(false), 1000)
    }
  }

  const assetOptions = [
    ...mockCoinDetails.map(coin => ({ type: 'coin', denom: coin.denom, name: coin.name })),
    ...mockTokenDetails.map(token => ({ type: 'token', key: token.key, name: token.name, symbol: token.symbol })),
  ]

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sell NFT</h2>
        <Button 
          variant="ghost" 
          onClick={onCloseAction}
          className="bg-gray-900 text-gray-400 hover:bg-gray-900 hover:text-gray-400"
        >
          Cancel
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Select NFT</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 hover:bg-gray-900 w-full hover:ring-2 hover:ring-gray-700">
                {nftDetails ? nftDetails.tokenId : 'Select NFT'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-gray-900 text-gray-400 border-none w-[var(--radix-dropdown-menu-trigger-width)]"
              align="start"
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault()
              }}
            >
              {mockNFTDetails.map((nft, index) => (
                <DropdownMenuItem 
                  className="hover:bg-gray-800 justify-start" 
                  key={index} 
                  onClick={() => setNftDetails(nft)}
                >
                  {nft.tokenId}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Select Asset to Receive</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 hover:bg-gray-900 w-full hover:ring-2 hover:ring-gray-700">
                {assetOutType ? assetOutType.name : 'Select Asset'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-gray-900 text-gray-400 border-none w-[var(--radix-dropdown-menu-trigger-width)]"
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault()
              }}
            >
              {assetOptions.map((asset, index) => (
                <DropdownMenuItem 
                  className="hover:bg-gray-800 justify-start" 
                  key={index} 
                  onClick={() => setAssetOutType(asset)}
                >
                  {asset.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2">
          <label className="text-sm">Amount of Asset</label>
          <Input
            type="number"
            placeholder="Amount to receive"
            value={amountOut}
            onChange={(e) => setAmountOut(e.target.value)}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={isSelling}
        >
          <DollarSign className={`mr-2 h-4 w-4 transition-all duration-500 ${isSelling ? 'rotate-[360deg] scale-110' : ''}`} />
          {isSelling ? 'Listing NFT...' : 'Sell NFT'}
        </Button>
      </form>
    </Card>
  )
} 
