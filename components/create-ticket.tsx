'use client'

import { getAllTokens, getUserTokenBalances } from "@/app/queries/abci-queries"
import { Asset, TokenBalance, TokenDetails } from "@/app/types"
import { formatAmount } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Coins, Ticket } from "lucide-react"
import { useEffect, useState } from "react"

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
}

export function CreateTicket({ onCancelAction, onSubmitAction }: CreateTicketProps) {
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketForm>({
    tokenInKey: '',
    tokenOutKey: '',
    amountIn: '',
    minAmountOut: '',
    expiryHours: ''
  })
  const [assetInType, setAssetInType] = useState<Asset | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)
  const [tokens, setTokens] = useState<TokenDetails[]>([])
  const [userBalances, setUserBalances] = useState<TokenBalance[]>([])
  const [showLPTokens, setShowLPTokens] = useState(false)

  const nativeCoin: Asset = {
    type: 'coin',
    denom: 'ugnot',
    name: 'GNOT',
    symbol: 'GNOT',
    decimals: 6
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedTokens, fetchedBalances] = await Promise.all([
          getAllTokens(),
          getUserTokenBalances("g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y") // TODO: Replace with actual user address
        ])
        
        setTokens(fetchedTokens)
        setUserBalances(fetchedBalances)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  const assetsIn: Asset[] = [
    nativeCoin,
    ...tokens
      .filter(token => userBalances.some(balance => balance.tokenKey === token.key))
      .map(token => ({
        type: 'token',
        path: token.key,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals
      }))
  ]

  const assetsOut: Asset[] = [
    nativeCoin,
    ...tokens.map(token => ({
      type: 'token',
      path: token.key,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals
    }))
  ]

  const filteredAssetsIn = assetsIn.filter(asset => {
    if (asset.type === 'coin') return true
    const isLPToken = asset.symbol?.includes('LP-')
    return showLPTokens ? true : !isLPToken
  })

  const filteredAssetsOut = assetsOut
    .filter(asset => {
      if (asset.type === 'coin') return true
      const isLPToken = asset.symbol?.includes('LP-')
      return showLPTokens ? true : !isLPToken
    })
    .sort((a, b) => {
      if (a.type === 'coin') return -1
      if (b.type === 'coin') return 1

      const balanceA = userBalances.find(balance => balance.tokenKey === a.path)
      const balanceB = userBalances.find(balance => balance.tokenKey === b.path)
      
      if (balanceA && !balanceB) return -1
      if (!balanceA && balanceB) return 1
      
      return (a.symbol || '').localeCompare(b.symbol || '')
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmitAction(createTicketForm)
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create New Ticket</h2>
        <div className="flex items-center gap-2">
          <Toggle
            variant="default"
            pressed={showLPTokens}
            onPressedChange={setShowLPTokens}
            size="sm"
            className="bg-gray-900 data-[state=on]:bg-navy-700 data-[state=on]:hover:bg-navy-800 hover:bg-gray-900 hover:text-gray-400"
          >
            <Coins className="h-4 w-4 mr-2" />
            {showLPTokens ? 'Hide' : 'Show'} LP Tokens
          </Toggle>
          <Button 
            variant="ghost" 
            onClick={onCancelAction}
            size="sm"
            className="bg-gray-900 text-gray-400 hover:bg-gray-900 hover:text-gray-400"
          >
            Cancel
          </Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 hover:ring-2 hover:ring-gray-700 hover:bg-gray-900 hover:text-gray-400 w-64">
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
              {filteredAssetsIn.map((asset, index) => {
                const balance = userBalances.find(b => b.tokenKey === asset.path)
                return (
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex justify-between items-center" 
                    key={index} 
                    onClick={() => {
                      setAssetInType(asset)
                      setCreateTicketForm(prev => ({
                        ...prev, 
                        tokenInKey: asset.type === 'coin' ? asset.denom! : asset.path!
                      }))
                    }}
                  >
                    <span>{asset.symbol || asset.name}</span>
                    {balance && (
                      <span className="text-xs text-gray-500">
                        {formatAmount(balance.balance, asset.decimals)}
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-gray-400">→</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 hover:ring-2 hover:ring-gray-700 hover:bg-gray-900 hover:text-gray-400 w-64">
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
              {filteredAssetsOut.map((asset, index) => {
                const balance = userBalances.find(b => b.tokenKey === asset.path)
                return (
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex justify-between items-center" 
                    key={index} 
                    onClick={() => {
                      setAssetOutType(asset)
                      setCreateTicketForm(prev => ({
                        ...prev, 
                        tokenOutKey: asset.type === 'coin' ? asset.denom! : asset.path!
                      }))
                    }}
                  >
                    <span>{asset.symbol || asset.name}</span>
                    {balance && (
                      <span className="text-xs text-gray-500">
                        {formatAmount(balance.balance, asset.decimals)}
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
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
        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md">
          <Ticket className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </form>
    </Card>
  )
} 
