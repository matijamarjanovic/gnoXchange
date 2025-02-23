'use client'

import { getOpenTicketsCount, getOpenTicketsPage } from '@/app/queries/abci-queries'
import { Ticket } from '@/app/types/types'
import { formatTime } from '@/app/utils'
import { CreateTicket } from '@/components/create-ticket'
import { SearchBar } from '@/components/search-bar'
import { SelectedTicket } from '@/components/selected-ticket'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CirclePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PaginationControls } from '../../../components/pagination-controls'

interface CreateTicketForm {
  tokenInKey: string
  tokenOutKey: string
  amountIn: string
  minAmountOut: string
  expiryHours: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalTickets, setTotalTickets] = useState(0)

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 64 
      const searchBarHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight) / cardHeight)
    }

    const fetchTickets = async () => {
      const calculatedPageSize = calculatePageSize()
      setPageSize(calculatedPageSize)
      
      try {
        const [ticketsCount, ticketsData] = await Promise.all([
          getOpenTicketsCount(),
          getOpenTicketsPage(currentPage, calculatedPageSize)
        ])
        
        setTotalTickets(ticketsCount)
        setTickets(ticketsData)
        setSelectedTicket(ticketsData[0] || null)
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()

    const handleResize = () => {
      const newPageSize = calculatePageSize()
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentPage, pageSize])

  const handleCreateTicket = async (form: CreateTicketForm) => {
    try {
      console.log('Creating ticket with:', form)
      setIsCreatingTicket(false)
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const renderRightCard = () => {
    if (isCreatingTicket) {
      return (
        <CreateTicket
          onCancelAction={() => setIsCreatingTicket(false)}
          onSubmitAction={handleCreateTicket}
        />
      )
    }

    return selectedTicket ? <SelectedTicket ticket={selectedTicket} /> : null
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
            placeholder="Search tickets..."
            onChange={(value) => {
              console.log(value)
            }}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalTickets / pageSize)}
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
          {tickets.map((ticket) => (
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
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {formatTime(ticket.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
