'use client'

import { getAllNFTTicketsPage, getOpenNFTTicketsCount } from '@/app/queries/abci-queries'
import { Asset, NFTDetails, Ticket } from '@/app/types'
import { formatAmount, getNFTName, getTicketStatusConfig } from '@/app/utils'
import { SearchBar } from '@/components/search-bar'
import { SelectedNFT } from '@/components/selected-nft'
import { SellNFT } from '@/components/sell-nft'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CirclePlus } from 'lucide-react'
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
      const containerPadding = 48
      const cardGap = 8 
      const containerHeight = window.innerHeight - containerPadding
      
      const availableHeight = containerHeight - searchBarHeight - 40 
      
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

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none h-screen">
      <div className="flex justify-between items-center space-x-3">
        <div className="flex items-center flex-1 space-x-3">
          <SearchBar 
            containerClassName="flex-1"
            placeholder="Search NFTs..."
            onChange={(value) => {
              console.log(value)
            }}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalTickets / pageSize)}
            onPageChange={setCurrentPage}
            variant="minimal"
          />
        </div>
        <Button 
          onClick={() => setIsSellingNFT(true)}
          className="bg-gray-800 hover:bg-gray-900 h-9"
        >
          <CirclePlus name="plus" className="" />Sell NFT
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
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const statusConfig = getTicketStatusConfig(ticket.status)
                      return (
                        <>
                          <span style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="w-2/3">
          {isSellingNFT ? (
            <SellNFT 
              onCloseAction={() => setIsSellingNFT(false)}
              onSubmitAction={handleSellNFT}
            />
          ) : (
            selectedTicket && <SelectedNFT ticket={selectedTicket} />
          )}
        </div>
      </div>
    </div>
  )
}
