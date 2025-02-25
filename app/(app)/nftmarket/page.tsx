'use client'

import { getAllNFTTicketsPage } from '@/app/queries/abci-queries'
import { Asset, NFTDetails, Ticket } from '@/app/types/types'
import { formatAmount, getNFTName } from '@/app/utils'
import { SearchBar } from '@/components/search-bar'
import { SelectedNFT } from '@/components/selected-nft'
import { SellNFT } from '@/components/sell-nft'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Fuse from 'fuse.js'
import { CirclePlus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'
import { NoDataMessage } from '@/components/no-data-mess'
export default function NFTMarketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isSellingNFT, setIsSellingNFT] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [fuse, setFuse] = useState<Fuse<Ticket> | null>(null)

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 80
      const searchBarHeight = 40
      const containerPadding = 48
      const cardGap = 8 
      const containerHeight = window.innerHeight - containerPadding
      
      const availableHeight = containerHeight - searchBarHeight - 40 
      
      return Math.floor(availableHeight / (cardHeight + cardGap))
    }

    const fetchTickets = async () => {
      try {
        const ticketsData = await getAllNFTTicketsPage(1, 10000)
        
        setTickets(ticketsData)
        setFilteredTickets(ticketsData)
        setSelectedTicket(ticketsData[0] || null)

        const fuseInstance = new Fuse(ticketsData, {
          keys: [
            'assetIn.tokenHubPath',
            'assetIn.name',
            'assetIn.symbol',
            'assetIn.type',
            'assetOut.tokenHubPath',
            'assetOut.name',
            'assetOut.symbol',
            'assetOut.type',
            'id',
            'creator',
            'amountIn',
            'minAmountOut',
            'status'
          ],
          threshold: 0.4,
          shouldSort: true,
          minMatchCharLength: 2
        })
        setFuse(fuseInstance)
      } catch (error) {
        console.error('Error fetching NFT tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const initializeTickets = () => {
      const calculatedPageSize = calculatePageSize()
      setPageSize(calculatedPageSize)
      fetchTickets()
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
  }, [pageSize])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTickets(tickets)
      return
    }

    if (fuse) {
      const results = fuse.search(searchQuery)
      setFilteredTickets(results.map(result => result.item))
    }
  }, [searchQuery, tickets, fuse])

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredTickets.slice(startIndex, endIndex)
  }

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
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none">
      <div className="flex justify-between items-center space-x-3">
        <div className="flex items-center flex-1 space-x-3">
          <SearchBar 
            containerClassName="flex-1"
            placeholder="Search NFTs..."
            onChange={(value) => {
              setSearchQuery(value)
              setCurrentPage(1) // Reset to first page on search
            }}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTickets.length / pageSize)}
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
      <div className="flex gap-6">
        <div className="w-1/3">
          <div className="space-y-2 mb-4">
            {getCurrentPageItems().length > 0 ? (
              getCurrentPageItems().map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`p-3 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                    selectedTicket?.id === ticket.id && !isSellingNFT ? 'ring-2 ring-gray-900' : ''
                  }`}
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setIsSellingNFT(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">NFT {getNFTName(ticket.assetIn.tokenHubPath || '')}</h3>
                      <div className="text-sm text-gray-400">
                        <p>Price: {formatAmount(ticket.minAmountOut)} GNOT</p>
                      </div>
                    </div>
                    <div className="h-16 w-16 rounded-md overflow-hidden">
                      <Image 
                        src="/nft-mock.png" 
                        alt="NFT Preview"
                        className="h-full w-full object-cover"
                        width={64}
                        height={64}
                      />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <NoDataMessage />
            )}
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
