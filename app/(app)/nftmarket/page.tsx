'use client'

import { mockCoinDetails, mockNFTDetails, mockNFTTickets, mockTokenDetails } from '@/app/mock'
import { Asset, NFTDetails, Ticket } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

export default function NFTMarketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null)
  const [isSellingNFT, setIsSellingNFT] = useState(false)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)
  const [amountOut, setAmountOut] = useState<string>('')

  useEffect(() => {
    const cardHeight = 100
    const cardGap = 16
    const containerPadding = 48
    const searchBarHeight = 60
    const containerHeight = window.innerHeight - containerPadding - searchBarHeight
    const calculatedPageSize = Math.floor(containerHeight / (cardHeight + cardGap))
    
    const visibleTickets = mockNFTTickets.slice(0, calculatedPageSize)
    setTickets(visibleTickets)
    setSelectedTicket(visibleTickets[0])
  }, [])

  const handleSellNFT = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (nftDetails && assetOutType && amountOut) {
        console.log('Selling NFT:', nftDetails, 'for', amountOut, assetOutType)
        // todo: implement the logic to sell the NFT
        setIsSellingNFT(false)
      }
    } catch (error) {
      console.error('Error selling NFT:', error)
    }
  }


  const renderSellNFTCard = () => {
    if (isSellingNFT) {
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
              onClick={() => setIsSellingNFT(false)}
              className="hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleSellNFT} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Select NFT</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gray-900 text-gray-400 w-full">
                    {nftDetails ? nftDetails.tokenId : 'Select NFT'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-gray-900 text-gray-400 border-none"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  {mockNFTDetails.map((nft, index) => (
                    <DropdownMenuItem 
                      className="hover:bg-gray-800" 
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
                  <Button className="bg-gray-900 text-gray-400 w-full">
                    {assetOutType ? assetOutType.name : 'Select Asset'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-gray-900 text-gray-400 border-none"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  {assetOptions.map((asset, index) => (
                    <DropdownMenuItem 
                      className="hover:bg-gray-800" 
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
            <Button type="submit" className="w-full bg-primary hover:bg-gray-900">
              Sell NFT
            </Button>
          </form>
        </Card>
      )
    }
    return null
  }

  if (!selectedTicket) {
    return null
  }

  const formatAmount = (amount: number, decimals: number = 6) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals)
  }

  const getNFTName = (path: string) => {
    const parts = path.split('.')
    return parts[parts.length - 1]
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SearchBar 
          containerClassName="flex-grow mr-4"
          placeholder="Search NFTs..."
          onChange={(value) => {
            console.log(value)
          }}
        />
        <Button 
          onClick={() => setIsSellingNFT(true)}
          className="bg-primary hover:bg-gray-900 h-9"
        >
          Sell NFT
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 space-y-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedTicket(ticket)
                setIsSellingNFT(false)
              }}
            >
              <h3 className="font-bold text-lg">NFT {getNFTName(ticket.assetIn.tokenHubPath || '')}</h3>
              <div className="text-sm text-gray-400">
                <p>Price: {formatAmount(ticket.minAmountOut)} GNOT</p>
                <p>Status: {ticket.status}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="w-2/3">
          {isSellingNFT ? (
            renderSellNFTCard()
          ) : (
            <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-4">
                NFT Sale - {getNFTName(selectedTicket.assetIn.tokenHubPath || '')}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <p className="text-sm text-gray-400">Creator</p>
                    <p className="text-gray-300 truncate">{selectedTicket.creator}</p>
                  </div>
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-gray-300">{selectedTicket.status}</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                  <p className="text-sm text-gray-400">NFT Path</p>
                  <p className="text-gray-300 break-all">
                    {selectedTicket.assetIn.tokenHubPath}
                  </p>
                </div>
                <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-gray-300">
                    {formatAmount(selectedTicket.minAmountOut)} GNOT
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <p className="text-sm text-gray-400">Created At</p>
                    <p className="text-gray-300">{selectedTicket.createdAt}</p>
                  </div>
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <p className="text-sm text-gray-400">Expires At</p>
                    <p className="text-gray-300">{selectedTicket.expiresAt}</p>
                  </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
                  Buy NFT
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
