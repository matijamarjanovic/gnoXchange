'use client'

import { SelectedNFT } from '@/app/(app)/nftmarket/selected-nft'
import { SellNFT } from '@/app/(app)/nftmarket/sell-nft'
import { getOpenNFTTicketsPage } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { Ticket } from '@/app/types/types'
import { formatAmount, getNFTName } from '@/app/utils'
import { NoDataMessage } from '@/components/no-data-mess'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Fuse from 'fuse.js'
import { CirclePlus } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'

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

  const refreshNFTs = useCallback(async () => {
    try {
      const ticketsData = await getOpenNFTTicketsPage(1, 10000)
      const sortedTickets = [...ticketsData]
        .filter(ticket => {
          const expiryDate = new Date(ticket.expiresAt)
          return expiryDate > new Date()
        })
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      
      setTickets(sortedTickets)
      setFilteredTickets(sortedTickets)
      setSelectedTicket(sortedTickets[0] || null)
    } catch (error) {
      console.error('Error refreshing NFTs:', error)
    }
  }, [])

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
        const ticketsData = await getOpenNFTTicketsPage(1, 10000)
        
        const sortedTickets = [...ticketsData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        setTickets(sortedTickets)
        setFilteredTickets(sortedTickets)
        setSelectedTicket(sortedTickets[0] || null)

        const fuseInstance = new Fuse(sortedTickets, {
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
  }, [pageSize, refreshNFTs])

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

  const getCurrentPageItems = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredTickets.slice(startIndex, endIndex)
  }, [currentPage, pageSize, filteredTickets])

  const handleSellNFT = async () => {
    try {
      refreshNFTs()
      setIsSellingNFT(false)
    } catch (error) {
      console.error('Error selling NFT:', error)
    }
  }

  const handleAddressChange = () => {
    refreshNFTs()
  }

  useEffect(() => {
    window.addEventListener('adenaAddressChanged', handleAddressChange)
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange)
    }
  })

  useEffect(() => {
    if (getCurrentPageItems().length === 0 && !isSellingNFT) {
      setIsSellingNFT(true);
    }
  }, [isSellingNFT, setIsSellingNFT, getCurrentPageItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg
          className="animate-spin h-24 w-24 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
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
              setCurrentPage(1)
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
                    <div className="flex-1 -mt-2">
                      <span className="text-xs font-normal">{ticket.id}</span>
                      <h3 className="font-bold text-lg">NFT {getNFTName(ticket.assetIn.tokenHubPath || '')}</h3>
                      <div className="text-sm text-gray-400">
                        <p>Price: {formatAmount(ticket.minAmountOut)} GNOT</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {ticket.creator === AdenaService.getInstance().getAddress() && (
                        <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-md text-gray-400">Owner</span>
                      )}
                      <div className="h-16 w-16 rounded-md overflow-hidden ml-4">
                        <Image 
                          src="/nft-mock.png" 
                          alt="NFT Preview"
                          className="h-full w-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
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
            selectedTicket && <SelectedNFT 
              ticket={selectedTicket} 
              onSuccess={refreshNFTs}
            />
          )}
        </div>
      </div>
    </div>
  )
}
