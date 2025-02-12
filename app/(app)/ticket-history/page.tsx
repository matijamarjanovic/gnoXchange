'use client'
import { mockNFTTickets, mockTickets } from "@/app/mock"
import { SearchBar } from '@/components/search-bar'
import { Card } from "@/components/ui/card"

export default function TicketHistory() {
  const sortedTickets = [...mockTickets, ...mockNFTTickets].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="container mx-auto p-6 flex flex-col gap-4 overflow-hidden">
      <SearchBar 
        containerClassName="w-full"
        placeholder="Search history..."
        onChange={(value) => {
          console.log(value)
        }}
      />
      <div className="grid gap-1 overflow-auto scrollbar-thin">
        {sortedTickets.map((ticket) => (
          <Card 
            key={ticket.id} 
            className="p-2 bg-gray-800 text-gray-400 border-none shadow-lg"
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
  )
}
