'use client'

import { getAllNFTTicketsPage, getOpenNFTTicketsCount } from '@/app/queries/abci-queries'
import { Asset, NFTDetails, Ticket } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { SellNFT } from '@/components/sell-nft'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'

export default function NFTMarketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isSellingNFT, setIsSellingNFT] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalTickets, setTotalTickets] = useState(0)

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 100
      const searchBarHeight = 40
      const paginationHeight = 40
      const containerPadding = 48
      const cardGap = 8 
      const containerHeight = window.innerHeight - containerPadding
      
      const availableHeight = containerHeight - searchBarHeight - paginationHeight - 40 
      
      return Math.floor(availableHeight / (cardHeight + cardGap))
    }

    const fetchTickets = async (calculatedPageSize: number) => {
      try {
        const [ticketsData, ticketsCount] = await Promise.all([
          getAllNFTTicketsPage(currentPage, calculatedPageSize),
          getOpenNFTTicketsCount()
        ])
        
        setTickets(ticketsData)
        setTotalTickets(ticketsCount)
        setSelectedTicket(ticketsData[0] || null)
      } catch (error) {
        console.error('Error fetching NFT tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const initializeTickets = () => {
      const calculatedPageSize = calculatePageSize()
      setPageSize(calculatedPageSize)
      fetchTickets(calculatedPageSize)
    }

    initializeTickets()

    const handleResize = () => {
      const newPageSize = calculatePageSize()
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentPage, pageSize])

  const handleSellNFT = async (nft: NFTDetails, assetType: Asset, amount: string) => {
    try {
      console.log('Selling NFT:', nft, 'for', amount, assetType)
      // todo: implement the logic to sell the NFT
      setIsSellingNFT(false)
    } catch (error) {
      console.error('Error selling NFT:', error)
    }
  }

  if (isLoading) {
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
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none h-screen">
      <div className="flex justify-between items-center mb-4">
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
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-1/3">
          <div className="space-y-2 mb-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`p-3 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                  selectedTicket?.id === ticket.id && !isSellingNFT ? 'ring-2 ring-primary' : ''
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
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalTickets / pageSize)}
            onPageChange={setCurrentPage}
            variant="minimal"
          />
        </div>

        <div className="w-2/3">
          {isSellingNFT ? (
            <SellNFT 
              onCloseAction={() => setIsSellingNFT(false)}
              onSubmitAction={handleSellNFT}
            />
          ) : (
            selectedTicket && (
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
                  <Button className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md">
                    Buy NFT
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  )
}
