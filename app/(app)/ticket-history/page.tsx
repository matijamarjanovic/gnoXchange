'use client'
import { mockNFTTickets, mockTickets } from "@/app/mock";
import { Ticket, TicketStatus } from '@/app/types';
import { SearchBar } from '@/components/search-bar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { TicketSidebar } from "../components/ticket-sidebar";
import { useTicketSidebar } from "../contexts/TicketSidebarContext";

export default function TicketHistory() {
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('all');
  const { setSelectedTicket, setIsOpen } = useTicketSidebar()

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

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsOpen(true)
  }

  return (
    <>
      <div className="container mx-auto p-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <SearchBar 
            containerClassName="w-full"
            placeholder="Search history..."
            onChange={(value) => {
              console.log(value)
            }}
          />
          <Button onClick={toggleFilterStatus} variant="ghost" className="ml-4 flex items-center bg-gray-800 text-gray-400 h-9 hover:bg-gray-900 hover:text-gray-300">
            <Filter className="text-gray-400" />
            <span className="ml-2 text-sm">{filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
          </Button>
        </div>
        <div className="grid gap-1 overflow-auto scrollbar-thin">
          {filteredTickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="p-2 bg-gray-800 text-gray-400 border-none shadow-lg cursor-pointer hover:bg-gray-700"
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
