'use client'

import { mockCoinDetails, mockTickets, mockTokenDetails } from '@/app/mock'
import { Ticket } from '@/app/types'
import { CreateTicket } from '@/components/create-ticket'
import { SearchBar } from '@/components/search-bar'
import { SelectedTicket } from '@/components/selected-ticket'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { PaginationControls } from '../components/pagination-controls'

interface CreateTicketForm {
  tokenInKey: string
  tokenOutKey: string
  amountIn: string
  minAmountOut: string
  expiryHours: string
}

export default function TicketsPage() {
  const [tickets, setTickets] =     useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalTickets] = useState(mockTickets.length)

  useEffect(() => {
    const calculatePageSize = () => {
      const cardHeight = 130 
      const searchBarHeight = 40
      const paginationHeight = 40
      const containerHeight = window.innerHeight - 64 
      return Math.floor((containerHeight - searchBarHeight - paginationHeight) / cardHeight)
    }

    const initializeTickets = () => {
      const calculatedPageSize = calculatePageSize()
      setPageSize(calculatedPageSize)
      
      const start = (currentPage - 1) * calculatedPageSize
      const end = start + calculatedPageSize
      const paginatedTickets = mockTickets.slice(start, end)
      
      setTickets(paginatedTickets)
      setSelectedTicket(paginatedTickets[0])
      setIsLoading(false)
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
      const assets = [
        ...mockCoinDetails.map(coin => ({ type: 'coin', denom: coin.denom, name: coin.name })),
        ...mockTokenDetails.map(token => ({ type: 'token', key: token.key, name: token.name, symbol: token.symbol })),
      ]

      return (
        <CreateTicket
          onCancelAction={() => setIsCreatingTicket(false)}
          onSubmitAction={handleCreateTicket}
          assets={assets}
        />
      )
    }

    return selectedTicket ? <SelectedTicket ticket={selectedTicket} /> : null
  }

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals)
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4 scrollbar-none">
      <div className="flex justify-between items-center">
        <SearchBar 
          containerClassName="flex-grow mr-4"
          placeholder="Search tickets..."
          onChange={(value) => {
            console.log(value)
          }}
        />
        <Button 
          onClick={() => setIsCreatingTicket(true)}
          className="bg-primary hover:bg-gray-900 h-9"
        >
          Create Ticket
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 space-y-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`p-4 cursor-pointer transition-colors bg-gray-800 text-gray-400 border-none shadow-lg hover:bg-gray-900 ${
                selectedTicket?.id === ticket.id && !isCreatingTicket ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setSelectedTicket(ticket)
                setIsCreatingTicket(false)
              }}
            >
              <h3 className="font-bold text-lg">Ticket {ticket.id}</h3>
              <div className="text-sm text-gray-400">
                <p>{`${ticket.assetIn.symbol} → ${ticket.assetOut.symbol}`}</p>
                <p>Amount: {formatAmount(ticket.amountIn, ticket.assetIn.decimals ?? 0)} {ticket.assetIn.symbol}</p>
                <p>Status: {ticket.status}</p>
              </div>
            </Card>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalTickets / pageSize)}
            onPageChange={setCurrentPage}
            variant="minimal"
            className="mt-8"
          />
        </div>
        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
