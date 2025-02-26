'use client'

import { getOpenTicketsPage } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { Ticket } from '@/app/types/types'
import { formatTime } from '@/app/utils'
import { CreateTicket } from '@/components/create-ticket'
import { NoDataMessage } from '@/components/no-data-mess'
import { SearchBar } from '@/components/search-bar'
import { SelectedTicket } from '@/components/selected-ticket'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Fuse from 'fuse.js'
import { CirclePlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [fuse, setFuse] = useState<Fuse<Ticket> | null>(null)

  const refreshTickets = useCallback(async () => {
    try {
      const ticketsData = await getOpenTicketsPage(1, 10000)
      const sortedTickets = [...ticketsData].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setTickets(sortedTickets)
      setFilteredTickets(sortedTickets)
      setSelectedTicket(sortedTickets[0] || null)

    } catch (error) {
      console.error('Error refreshing tickets:', error)
    }
  }, [])

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 64 
      const searchBarHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight) / cardHeight)
    }

    const fetchTickets = async () => {
      try {
        const ticketsData = await getOpenTicketsPage(1, 10000)
        
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
            'creator'
          ],
          threshold: 0.4,
          shouldSort: true,
          minMatchCharLength: 2
        })
        setFuse(fuseInstance)
      } catch (error) {
        console.error('Error fetching tickets:', error)
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

    const handleAddressChange = () => {
      refreshTickets()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('adenaAddressChanged', handleAddressChange)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('adenaAddressChanged', handleAddressChange)
    }
  }, [pageSize, refreshTickets])

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

  const renderRightCard = () => {
    if (isCreatingTicket) {
      return (
        <CreateTicket
          onCancelAction={() => setIsCreatingTicket(false)}
          onSuccess={refreshTickets}
        />
      )
    }

    return selectedTicket ? (
      <SelectedTicket 
        ticket={selectedTicket} 
        onSuccess={refreshTickets}
      />
    ) : null
  }

  useEffect(() => {
    if (getCurrentPageItems().length === 0 && !isCreatingTicket) {
      setIsCreatingTicket(true);
    }
  }, [isCreatingTicket, getCurrentPageItems]);

  if (isLoading) {
    return null
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none">
      <div className="flex justify-between items-center space-x-3">
        <div className="flex items-center flex-1 space-x-3">
          <SearchBar 
            containerClassName="flex-1"
            placeholder="Search tickets..."
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
          onClick={() => setIsCreatingTicket(true)}
          className="bg-gray-800 hover:bg-gray-900 h-9"
        >
          <CirclePlus className="" /> Create Ticket
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 space-y-3">
          {getCurrentPageItems().length > 0 ? (
            getCurrentPageItems().map((ticket) => (
              <Card
                key={ticket.id}
                className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                  selectedTicket?.id === ticket.id && !isCreatingTicket ? 'ring-2 ring-gray-900' : ''
                }`}
                onClick={() => {
                  setSelectedTicket(ticket)
                  setIsCreatingTicket(false)
                }}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-16">{ticket.id}</span>
                    <span>
                      {ticket.assetIn.type === 'nft' 
                        ? `${ticket.assetIn.tokenHubPath} → ${ticket.assetOut.denom || ticket.assetOut.symbol || ''}`
                        : `${ticket.assetIn.symbol || ticket.assetIn.denom} → ${ticket.assetOut.symbol || ticket.assetOut.denom}`
                      }
                    </span>
                    {ticket.creator === AdenaService.getInstance().getAddress() && ( 
                      <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-md text-gray-400">Owner</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      {formatTime(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <NoDataMessage />
          )}
        </div>
        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
