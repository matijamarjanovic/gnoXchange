'use client'

import { mockNFTTickets } from '@/app/mock'
import { Ticket } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function NFTMarketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

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
      <SearchBar 
        containerClassName="w-full"
        placeholder="Search NFTs..."
        onChange={(value) => {
          console.log(value)
        }}
      />
      <div className="flex gap-6">
        <div className="w-1/3 space-y-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
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
              <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
                Buy NFT
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
