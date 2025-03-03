'use client'

import { CreateTicket } from '@/app/(app)/tickets/create-ticket'
import { SelectedTicket } from '@/app/(app)/tickets/selected-ticket'
import { AdenaService } from '@/app/services/adena-service'
import { Ticket } from '@/app/types/types'
import { formatTime } from '@/app/utils'
import { NoDataMessage } from '@/components/no-data-mess'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CirclePlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'
import { useTicketSearch, useTicketsQuery } from './mutations-and-queries'
import { filterTickets } from './validations'

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)

  const { data: tickets = [], isLoading } = useTicketsQuery({ 
    page: currentPage, 
    pageSize 
  })
  
  const fuse = useTicketSearch(tickets)
  const filteredTickets = filterTickets({ tickets, searchQuery, fuse })

  useEffect(() => {
    if (!isLoading && filteredTickets.length > 0 && !selectedTicket && !isCreatingTicket) {
      setSelectedTicket(filteredTickets[0])
    }else{
      setIsCreatingTicket(true)
    }
  }, [filteredTickets, isLoading, selectedTicket, isCreatingTicket])

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 64 
      const searchBarHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight) / cardHeight)
    }

    const handleResize = () => {
      const newPageSize = calculatePageSize()
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pageSize])

  const getCurrentPageItems = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredTickets.slice(startIndex, endIndex)
  }, [currentPage, pageSize, filteredTickets])

  const handleTicketAction = useCallback(() => {
    const items = getCurrentPageItems()
    if (items.length > 0) {
      setSelectedTicket(items[0])
      setIsCreatingTicket(false)
    } else {
      setSelectedTicket(null)
      setIsCreatingTicket(true)
    }
  }, [getCurrentPageItems])

  const renderRightCard = () => {
    if (isCreatingTicket) {
      return (
        <CreateTicket
          onCancelAction={() => setIsCreatingTicket(false)}
          onSuccess={() => handleTicketAction()}
        />
      )
    }

    return selectedTicket ? (
      <SelectedTicket 
        ticket={selectedTicket}
        onSuccess={handleTicketAction}
      />
    ) : null
  }

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
