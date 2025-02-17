'use client'
import { mockNFTTickets, mockTickets } from "@/app/mock";
import { Ticket, TicketStatus } from '@/app/types';
import { formatTime } from '@/app/utils';
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
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('all');
  const { setSelectedTicket, setIsOpen } = useTicketSidebar()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    const storedSize = localStorage.getItem(PAGE_SIZE_KEY)
    return storedSize ? parseInt(storedSize) : 25
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);

  useEffect(() => {
    localStorage.setItem(PAGE_SIZE_KEY, pageSize.toString())
  }, [pageSize])

  const toggleFilterStatus = () => {
    const statuses: TicketStatus[] = ['all', 'open', 'fulfilled', 'cancelled', 'expired'];
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight) < 1;
    const top = e.currentTarget.scrollTop === 0;
    setIsScrolledToBottom(bottom);
    setIsScrolledToTop(top);
  };

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
            onScroll={handleScroll}
            style={{
              maskImage: `linear-gradient(
                to bottom,
                transparent 0%,
                black ${isScrolledToTop ? '0%' : '0.5rem'},
                black calc(100% - ${isScrolledToBottom ? '0rem' : '0.5rem'}),
                transparent 100%
              )`,
              WebkitMaskImage: `linear-gradient(
                to bottom,
                transparent 0%,
                black ${isScrolledToTop ? '0%' : '0.5rem'},
                black calc(100% - ${isScrolledToBottom ? '0rem' : '0.5rem'}),
                transparent 100%
              )`
            }}
          >
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
