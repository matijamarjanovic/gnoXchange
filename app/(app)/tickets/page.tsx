'use client'

import { mockTickets } from '@/app/mock'
import { Ticket } from '@/app/types'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from 'react'

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
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketForm>({
    tokenInKey: '',
    tokenOutKey: '',
    amountIn: '',
    minAmountOut: '',
    expiryHours: ''
  })

  // todo: instead of using tab view use 2 dropdowns and then depending on the dropdowns, show the form for that ticket type   
  useEffect(() => {
    const cardHeight = 116
    const cardGap = 16
    const containerPadding = 48
    const searchBarHeight = 80
    const containerHeight = window.innerHeight - containerPadding - searchBarHeight
    const calculatedPageSize = Math.floor(containerHeight / (cardHeight + cardGap))
    
    const visibleTickets = mockTickets.slice(0, calculatedPageSize)
    setTickets(visibleTickets)
    setSelectedTicket(visibleTickets[0])
  }, [])

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
          <Tabs defaultValue="coin-token" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900">
              <TabsTrigger 
                value="coin-token" 
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-200 text-gray-400"
              >
                Coin → Token
              </TabsTrigger>
              <TabsTrigger 
                value="token-coin"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-200 text-gray-400"
              >
                Token → Coin
              </TabsTrigger>
              <TabsTrigger 
                value="token-token"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-gray-200 text-gray-400"
              >
                Token → Token
              </TabsTrigger>
            </TabsList>
            <TabsContent value="coin-token">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Coin Denom</label>
                  <Input
                    placeholder="e.g. ugnot"
                    value={createTicketForm.tokenInKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenInKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Token Key</label>
                  <Input
                    placeholder="e.g. gno.land/r/test.gtoken"
                    value={createTicketForm.tokenOutKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenOutKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Minimum Amount Out</label>
                  <Input
                    type="number"
                    placeholder="Minimum amount of tokens to receive"
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
            </TabsContent>
            <TabsContent value="token-coin">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Token Key</label>
                  <Input
                    placeholder="e.g. gno.land/r/test.gtoken"
                    value={createTicketForm.tokenInKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenInKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Coin Denom</label>
                  <Input
                    placeholder="e.g. ugnot"
                    value={createTicketForm.tokenOutKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenOutKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Amount In</label>
                  <Input
                    type="number"
                    placeholder="Amount of tokens to swap"
                    value={createTicketForm.amountIn}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, amountIn: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Minimum Amount Out</label>
                  <Input
                    type="number"
                    placeholder="Minimum amount of coins to receive"
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
            </TabsContent>
            <TabsContent value="token-token">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Token In Key</label>
                  <Input
                    placeholder="e.g. gno.land/r/test1.gtokenA"
                    value={createTicketForm.tokenInKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenInKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Token Out Key</label>
                  <Input
                    placeholder="e.g. gno.land/r/test2.gtokenB"
                    value={createTicketForm.tokenOutKey}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, tokenOutKey: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Amount In</label>
                  <Input
                    type="number"
                    placeholder="Amount of tokens to swap"
                    value={createTicketForm.amountIn}
                    onChange={(e) => setCreateTicketForm(prev => ({...prev, amountIn: e.target.value}))}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Minimum Amount Out</label>
                  <Input
                    type="number"
                    placeholder="Minimum amount of tokens to receive"
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
            </TabsContent>
          </Tabs>
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

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SearchBar 
          containerClassName="w-2/3"
          placeholder="Search tickets..."
          onChange={(value) => {
            console.log(value)
          }}
        />
        <Button 
          onClick={() => setIsCreatingTicket(true)}
          className="bg-primary hover:bg-gray-900"
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
                selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <h3 className="font-bold text-lg">Ticket {ticket.id}</h3>
              <div className="text-sm text-gray-400">
                <p>{`${ticket.assetIn.symbol} → ${ticket.assetOut.symbol}`}</p>
                <p>Amount: {formatAmount(ticket.amountIn, ticket.assetIn.decimals ?? 0)} {ticket.assetIn.symbol}</p>
                <p>Status: {ticket.status}</p>
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
