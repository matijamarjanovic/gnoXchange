'use client'
import { useFilteredTickets, useTicketSearch, useTicketsHistoryQuery } from '@/app/services/ticket-history/mutations-and-queries'
import { Ticket, TicketStatus } from '@/app/types/types'
import { getNFTName, getTicketStatusConfig } from '@/app/utils'
import { NoDataMessage } from "@/components/no-data-mess"
import { SearchBar } from '@/components/search-bar'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Filter } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from 'react-use'
import { PaginationControls } from '../../../components/pagination-controls'
import { useTicketSidebar } from "../contexts/TicketSidebarContext"
import { TicketSidebar } from "./ticket-sidebar"

const PAGE_SIZE_KEY = 'ticketHistory.pageSize'

export default function TicketHistory() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('all')
  const { setSelectedTicket, setIsOpen } = useTicketSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useLocalStorage(PAGE_SIZE_KEY, 25)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: tickets = [], isLoading } = useTicketsHistoryQuery()
  const fuse = useTicketSearch(tickets)
  const filteredTickets = useFilteredTickets(tickets, searchQuery, fuse)
    .filter(ticket => filterStatus === 'all' || ticket.status === filterStatus)

  const toggleFilterStatus = () => {
    const statuses: TicketStatus[] = ['all', 'open', 'fulfilled', 'cancelled', 'expired']
    const currentIndex = statuses.indexOf(filterStatus)
    const nextIndex = (currentIndex + 1) % statuses.length
    setFilterStatus(statuses[nextIndex])
  }

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * (pageSize || 25)
    const endIndex = startIndex + (pageSize || 25)
    return filteredTickets.slice(startIndex, endIndex)
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsOpen(true)
  }

  if (isLoading) return null

  return (
    <>
      <div className="container mx-auto p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <SearchBar 
              containerClassName="flex-1"
              placeholder="Search history..."
              onChange={(value) => setSearchQuery(value)}
            />
            <Button 
              onClick={toggleFilterStatus} 
              variant="ghost" 
              className={`flex items-center h-9 transition-colors ${getTicketStatusConfig(filterStatus).bgColor} ${getTicketStatusConfig(filterStatus).color} ${getTicketStatusConfig(filterStatus).hoverBg}`}
            >
              <Filter className={filterStatus === 'all' ? 'text-gray-400' : ''} />
              <span className="ml-2 text-sm">
                {getTicketStatusConfig(filterStatus).label}
              </span>
            </Button>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTickets.length / (pageSize || 25))}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
        <div className="relative">
          <div className="grid gap-1 max-h-[calc(81vh)] overflow-y-auto">
            {getCurrentPageItems().length > 0 ? (
              getCurrentPageItems().map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="p-2 bg-gray-800 text-gray-400 border-none shadow-lg cursor-pointer hover:bg-gray-900"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 w-16">{ticket.id}</span>
                      <span>
                        {ticket.assetIn.type === 'nft' 
                          ? `${getNFTName(ticket.assetIn.tokenHubPath || '')} → ${ticket.assetOut.denom || ticket.assetOut.symbol || ''}`
                          : ticket.assetIn.type === 'coin'
                          ? `${ticket.assetIn.denom} → ${ticket.assetOut.denom || ticket.assetOut.symbol || ''}`
                          : `${ticket.assetIn.symbol || ticket.assetIn.denom} → ${ticket.assetOut.symbol || ticket.assetOut.denom || ''}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-md ${getTicketStatusConfig(ticket.status).bgColor} ${getTicketStatusConfig(ticket.status).color}`}>
                        {getTicketStatusConfig(ticket.status).label}
                      </span>
                      <span className="text-gray-500">
                        {ticket.createdAt}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <NoDataMessage /> 
            )}
          </div>
        </div>
      </div>
      <TicketSidebar />
    </>
  )
}
