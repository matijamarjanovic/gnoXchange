'use client'
import { getTicketsCount, getTicketsPage } from "@/app/queries/abci-queries";
import { Ticket, TicketStatus } from '@/app/types/types';
import { formatTime, getNFTName } from '@/app/utils';
import { SearchBar } from '@/components/search-bar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PaginationControls } from '../../../components/pagination-controls';
import { TicketSidebar } from "../../../components/ticket-sidebar";
import { useTicketSidebar } from "../contexts/TicketSidebarContext";

const PAGE_SIZE_KEY = 'ticketHistory.pageSize'

export default function TicketHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [totalTickets, setTotalTickets] = useState(0)
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('all');
  const { setSelectedTicket, setIsOpen } = useTicketSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    const storedSize = localStorage.getItem(PAGE_SIZE_KEY)
    return storedSize ? parseInt(storedSize) : 25
  })
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => { 
    localStorage.setItem(PAGE_SIZE_KEY, pageSize.toString())
  }, [pageSize])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const [count, ticketsData] = await Promise.all([
          getTicketsCount(),
          getTicketsPage(currentPage, pageSize)
        ])
        
        setTotalTickets(count)
        setTickets(ticketsData)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [currentPage, pageSize])

  const toggleFilterStatus = () => {
    const statuses: TicketStatus[] = ['all', 'open', 'fulfilled', 'cancelled', 'expired'];
    const currentIndex = statuses.indexOf(filterStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setFilterStatus(statuses[nextIndex]);
  };

  const filteredTickets = tickets.filter(ticket => 
    filterStatus === 'all' || ticket.status === filterStatus
  );

  const totalPages = Math.ceil(totalTickets / pageSize)

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsOpen(true)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus])

  if (isLoading) return null

  return (
    <>
      <div className="container mx-auto p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <SearchBar 
              containerClassName="flex-1"
              placeholder="Search history..."
              onChange={(value) => {
                console.log(value)
              }}
            />
            <Button 
              onClick={toggleFilterStatus} 
              variant="ghost" 
              className="flex items-center bg-gray-800 text-gray-400 h-9 hover:bg-gray-900 hover:text-gray-300"
            >
              <Filter className="text-gray-400" />
              <span className="ml-2 text-sm">
                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </span>
            </Button>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
        <div className="relative">
          <div 
            className="grid gap-1 max-h-[calc(81vh)] overflow-y-auto" 
          >
            {filteredTickets.map((ticket) => (
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
                    <span className={`px-2 py-0.5 rounded-full ${
                      ticket.status === 'fulfilled' 
                        ? 'bg-green-900/50 text-green-400'
                        : ticket.status === 'cancelled'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-gray-500">
                      {formatTime(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <TicketSidebar />
    </>
  )
}
