'use client'

import { Asset } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface CreateTicketForm {
  tokenInKey: string
  tokenOutKey: string
  amountIn: string
  minAmountOut: string
  expiryHours: string
}

interface CreateTicketProps {
  onCancelAction: () => void
  onSubmitAction: (form: CreateTicketForm) => Promise<void>
  assets: Array<{ type: string; denom?: string; key?: string; name: string; symbol?: string }>
}

export function CreateTicket({ onCancelAction, onSubmitAction, assets }: CreateTicketProps) {
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketForm>({
    tokenInKey: '',
    tokenOutKey: '',
    amountIn: '',
    minAmountOut: '',
    expiryHours: ''
  })
  const [assetInType, setAssetInType] = useState<Asset | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmitAction(createTicketForm)
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create New Ticket</h2>
        <Button 
          variant="ghost" 
          onClick={onCancelAction}
          className="hover:bg-gray-700"
        >
          Cancel
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 w-64">
                {assetInType 
                  ? (assetInType.symbol || assetInType.denom || assetInType.name) 
                  : 'Select Asset In'}
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
                {assetOutType 
                  ? (assetOutType.symbol || assetOutType.denom || assetOutType.name) 
                  : 'Select Asset Out'}
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
