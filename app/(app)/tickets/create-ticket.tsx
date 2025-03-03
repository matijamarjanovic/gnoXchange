'use client'

import { Asset } from "@/app/types/types"
import { formatAmount } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Coins, Ticket } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useCreateTicketMutation, useTokensAndBalances } from './mutations-and-queries'
import { showValidationError, validateTicketCreation } from "./validations"

interface CreateTicketForm {
  tokenInKey: string
  tokenOutKey: string
  amountIn: string
  minAmountOut: string
  expiryHours: string
}

interface CreateTicketProps {
  onCancelAction: () => void
  onSuccess?: () => Promise<void>
}

export function CreateTicket({ onCancelAction, onSuccess }: CreateTicketProps) {
  const [createTicketForm, setCreateTicketForm] = useState<CreateTicketForm>({
    tokenInKey: '',
    tokenOutKey: '',
    amountIn: '',
    minAmountOut: '',
    expiryHours: ''
  })
  const [assetInType, setAssetInType] = useState<Asset | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)
  const [showLPTokens, setShowLPTokens] = useState(false)

  const { tokens, balances, isLoading, refetch } = useTokensAndBalances()
  const createTicketMutation = useCreateTicketMutation(onSuccess)

  const nativeCoin: Asset = {
    type: 'coin',
    denom: 'ugnot',
    name: 'GNOT',
    symbol: 'GNOT',
    decimals: 6
  }

  useEffect(() => {
    const handleAddressChange = () => {
      refetch()
      setCreateTicketForm({
        tokenInKey: '',
        tokenOutKey: '',
        amountIn: '',
        minAmountOut: '',
        expiryHours: ''
      })
      setAssetInType(null)
      setAssetOutType(null)
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange)

    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange)
    }
  }, [refetch])

  const assetsIn: Asset[] = [
    nativeCoin,
    ...tokens
      .filter(token => balances.some(balance => balance.tokenKey === token.key))
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

      const balanceA = balances.find(balance => balance.tokenKey === a.path)
      const balanceB = balances.find(balance => balance.tokenKey === b.path)
      
      if (balanceA && !balanceB) return -1
      if (!balanceA && balanceB) return 1
      
      return (a.symbol || '').localeCompare(b.symbol || '')
    })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = validateTicketCreation({
      assetInType,
      assetOutType,
      amountIn: createTicketForm.amountIn,
      minAmountOut: createTicketForm.minAmountOut,
      expiryHours: createTicketForm.expiryHours
    })

    if (!validationResult.isValid) {
      showValidationError(validationResult.error!)
      return
    }

    createTicketMutation.mutate({
      assetInType: assetInType!.type as 'coin' | 'token',
      assetOutType: assetOutType!.type as 'coin' | 'token',
      assetInPath: assetInType!.type === 'coin' ? assetInType!.denom! : assetInType!.path!,
      assetOutPath: assetOutType!.type === 'coin' ? assetOutType!.denom! : assetOutType!.path!,
      amountIn: parseFloat(createTicketForm.amountIn),
      minAmountOut: parseFloat(createTicketForm.minAmountOut),
      expiryHours: parseInt(createTicketForm.expiryHours)
    }, {
      onSuccess: () => {
        onCancelAction()
      }
    })
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
                const balance = balances.find(b => b.tokenKey === asset.path)
                const isDisabled = assetOutType && (
                  (asset.type === 'coin' && assetOutType.type === 'coin') ||
                  (asset.type === 'token' && asset.path === assetOutType.path)
                )
                return (
                  <DropdownMenuItem 
                    className={`flex justify-between items-center ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-800'
                    }`} 
                    key={index} 
                    disabled={isDisabled!}
                    onClick={() => {
                      if (!isDisabled) {
                        setAssetInType(asset)
                        setCreateTicketForm(prev => ({
                          ...prev, 
                          tokenInKey: asset.type === 'coin' ? asset.denom! : asset.path!
                        }))
                      }
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
                const balance = balances.find(b => b.tokenKey === asset.path)
                const isDisabled = assetInType && (
                  (asset.type === 'coin' && assetInType.type === 'coin') ||
                  (asset.type === 'token' && asset.path === assetInType.path)
                )
                return (
                  <DropdownMenuItem 
                    className={`flex justify-between items-center ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-800'
                    }`} 
                    key={index} 
                    disabled={isDisabled!}
                    onClick={() => {
                      if (!isDisabled) {
                        setAssetOutType(asset)
                        setCreateTicketForm(prev => ({
                          ...prev, 
                          tokenOutKey: asset.type === 'coin' ? asset.denom! : asset.path!
                        }))
                      }
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
              id="amountIn"
              type="number"
              placeholder="Amount of asset to sell"
              value={createTicketForm.amountIn}
              onChange={(e) => setCreateTicketForm({ ...createTicketForm, amountIn: e.target.value })}
              className="flex-1 bg-gray-900 text-gray-400 border-none"
              inputMode="decimal"
              spacing={assetInType?.decimals ?? 6}
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
            inputMode="decimal"
            spacing={assetOutType?.decimals ?? 6}
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
        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={createTicketMutation.isPending}
        >
          <Ticket className="mr-2 h-4 w-4" />
          {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
        </Button>
      </form>
    </Card>
  )
} 
