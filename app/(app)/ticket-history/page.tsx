'use client'
import { mockNFTTickets, mockTickets } from "@/app/mock";
import { Ticket, TicketStatus } from '@/app/types';
import { SearchBar } from '@/components/search-bar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TicketSidebar } from "../components/ticket-sidebar";
import { useTicketSidebar } from "../contexts/TicketSidebarContext";

export default function TicketHistory() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('all');
  const { setSelectedTicket, setIsOpen } = useTicketSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [isLoading, setIsLoading] = useState(true)

  const toggleFilterStatus = () => {
    const statuses: TicketStatus[] = ['all', 'open', 'completed', 'pending'];
    const currentIndex = statuses.indexOf(filterStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setFilterStatus(statuses[nextIndex]);
  };

  const sortedTickets = [...mockTickets, ...mockNFTTickets].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const filteredTickets = sortedTickets.filter(ticket => 
    filterStatus === 'all' || ticket.status === filterStatus
  );

  const totalTickets = filteredTickets.length
  const totalPages = Math.ceil(totalTickets / pageSize)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const currentTickets = filteredTickets.slice(start, end)

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsOpen(true)
  }

  useEffect(() => {
    setCurrentPage(1)
    setIsLoading(false)
  }, [pageSize, filterStatus])

  const pageSizeOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 5)

  const PaginationControls = () => (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="bg-gray-800 hover:bg-gray-900 hover:text-gray-400 h-9"
      >
        Previous
      </Button>
      <span className="text-gray-400 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="ghost"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-gray-800 hover:bg-gray-900 hover:text-gray-400 h-9"
      >
        Next
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-gray-800 hover:bg-gray-900 hover:text-gray-400 h-9">
            {pageSize} per page <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-none">
          {pageSizeOptions.map((size) => (
            <DropdownMenuItem
              key={size}
              onClick={() => setPageSize(size)}
              className="text-gray-400 hover:text-gray-700"
            >
              {size} tickets
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

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
            <PaginationControls />
          </div>
        </div>
        <div className="grid gap-1">
          {currentTickets.map((ticket) => (
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
                      ? `${ticket.assetIn.tokenHubPath} → ${ticket.assetOut.denom || ''}`
                      : `${ticket.assetIn.symbol} → ${ticket.assetOut.symbol}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full ${
                    ticket.status === 'completed' 
                      ? 'bg-green-900/50 text-green-400'
                      : ticket.status === 'pending'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-gray-500">
                    {new Date(ticket.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <TicketSidebar />
    </>
  )
}
