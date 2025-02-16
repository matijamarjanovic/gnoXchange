'use client'

import { mockCoinDetails, mockTickets, mockTokenDetails } from '@/app/mock'
import { Asset, Ticket } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

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
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketForm>({
    tokenInKey: '',
    tokenOutKey: '',
    amountIn: '',
    minAmountOut: '',
    expiryHours: ''
  })
  const [assetInType, setAssetInType] = useState<Asset | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)

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

  const PaginationControls = () => {
    const totalPages = Math.ceil(totalTickets / pageSize)
    
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-800 hover:bg-gray-700"
        >
          Previous
        </Button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-800 hover:bg-gray-700"
        >
          Next
        </Button>
      </div>
    )
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Creating ticket with:', createTicketForm)
      setCreateTicketForm({
        tokenInKey: '',
        tokenOutKey: '',
        amountIn: '',
        minAmountOut: '',
        expiryHours: ''
      })
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
        <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Ticket</h2>
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingTicket(false)}
              className="hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gray-900 text-gray-400 w-64">
                    {assetInType ? assetInType.name : 'Select Asset In'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-gray-900 text-gray-400 border-none"
                  style={{
                    width: '16rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  {assets.map((asset, index) => (
                    <DropdownMenuItem className="hover:bg-gray-800" key={index} onClick={() => setAssetInType(asset)}>
                      {asset.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-gray-400">→</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gray-900 text-gray-400 w-64">
                    {assetOutType ? assetOutType.name : 'Select Asset Out'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-gray-900 text-gray-400 border-none"
                  style={{
                    width: '16rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                  }}
                >
                  {assets.map((asset, index) => (
                    <DropdownMenuItem className="hover:bg-gray-800" key={index} onClick={() => setAssetOutType(asset)}>
                      {asset.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Amount In</label>
              <Input
                type="number"
                placeholder="Amount of asset to swap"
                value={createTicketForm.amountIn}
                onChange={(e) => setCreateTicketForm(prev => ({...prev, amountIn: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Minimum Amount Out</label>
              <Input
                type="number"
                placeholder="Minimum amount to receive"
                value={createTicketForm.minAmountOut}
                onChange={(e) => setCreateTicketForm(prev => ({...prev, minAmountOut: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Expiry Hours</label>
              <Input
                type="number"
                placeholder="Number of hours until expiry"
                value={createTicketForm.expiryHours}
                onChange={(e) => setCreateTicketForm(prev => ({...prev, expiryHours: e.target.value}))}
                className="bg-gray-900 border-gray-700"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-gray-900">
              Create Ticket
            </Button>
          </form>
        </Card>
      )
    }

    return selectedTicket ? (
      <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-4">
          P2P Trade - {selectedTicket.assetIn.symbol} → {selectedTicket.assetOut.symbol}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
              <p className="text-sm text-gray-400">Creator</p>
              <p className="text-gray-300 truncate">{selectedTicket.creator}</p>
            </div>
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-gray-300">{selectedTicket.status}</p>
            </div>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Selling</p>
            <p className="text-gray-300">
              {formatAmount(selectedTicket.amountIn, selectedTicket.assetIn.decimals ?? 0)} {selectedTicket.assetIn.symbol}
            </p>
          </div>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <p className="text-sm text-gray-400">Minimum Receiving</p>
            <p className="text-gray-300">
              {formatAmount(selectedTicket.minAmountOut, selectedTicket.assetOut.decimals ?? 0)} {selectedTicket.assetOut.symbol}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
              <p className="text-sm text-gray-400">Created At</p>
              <p className="text-gray-300">{selectedTicket.createdAt}</p>
            </div>
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
              <p className="text-sm text-gray-400">Expires At</p>
              <p className="text-gray-300">{selectedTicket.expiresAt}</p>
            </div>
          </div>
          <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-gray-900 transition-colors">
            Take Trade
          </button>
        </div>
      </Card>
    ) : null
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
          <PaginationControls />
        </div>
        <div className="w-2/3">
          {renderRightCard()}
        </div>
      </div>
    </div>
  )
}
