'use client'

import { getAllTokens, getUserNFTBalances, getUserTokenBalances } from "@/app/queries/abci-queries"
import { AdenaService } from "@/app/services/adena-service"
import { createNFTTicket } from "@/app/services/tx-service"
import { Asset, NFTDetails, TokenBalance, TokenDetails } from "@/app/types/types"
import { formatAmount, getNFTName } from "@/app/utils"
import { Toggle } from "@/components/ui/toggle"
import { Coins, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Input } from "./ui/input"

interface SellNFTProps {
  onCloseAction: () => void
  onSubmitAction: (nft: NFTDetails, assetType: Asset, amount: string) => void
}

export function     SellNFT({ onCloseAction, onSubmitAction }: SellNFTProps) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null)
  const [assetOutType, setAssetOutType] = useState<Asset | null>(null)
  const [amountOut, setAmountOut] = useState<string>('')
  const [isSelling, setIsSelling] = useState(false)
  const [tokens, setTokens] = useState<TokenDetails[]>([])
  const [userBalances, setUserBalances] = useState<TokenBalance[]>([])
  const [showLPTokens, setShowLPTokens] = useState(false)
  const [nfts, setNfts] = useState<NFTDetails[]>([])
  const [expiryHours, setExpiryHours] = useState<string>('')

  const nativeCoin: Asset = {
    type: 'coin',
    denom: 'ugnot',
    name: 'GNOT',
    symbol: 'GNOT',
    decimals: 6
  }

  const fetchData = async () => {
    try {
      const [fetchedTokens, fetchedBalances, fetchedNFTs] = await Promise.all([
        getAllTokens(),
        getUserTokenBalances(AdenaService.getInstance().getAddress() || ''),
        getUserNFTBalances(AdenaService.getInstance().getAddress() || '')
      ])
      setTokens(fetchedTokens)
      setUserBalances(fetchedBalances)
      setNfts(fetchedNFTs)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()

    const handleAddressChange = () => {
      fetchData()
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange)

    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange)
    }
  }, [])

  const assets: Asset[] = [
    nativeCoin,
    ...tokens.map(token => ({
      type: 'token',
      path: token.key,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals
    }))
  ]

  const filteredAssets = assets
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
    if (nftDetails && assetOutType && amountOut) {
      try {
        setIsSelling(true)
        
        const success = await createNFTTicket(
          nftDetails.key,
          assetOutType.type as 'coin' | 'token',
          assetOutType.type === 'coin' ? assetOutType.denom || '' : assetOutType.path || '',
          parseInt(amountOut.replaceAll(' ', '')),
          parseInt(expiryHours.trim())
        );

        if (success) {
          onSubmitAction(nftDetails, assetOutType, amountOut)
          onCloseAction()
        } else {
          console.error("Failed to create NFT ticket")
          // todo: add error handling UI here
        }
      } catch (error) {
        console.error("Error creating NFT ticket:", error)
        // todo: add error handling UI here
      } finally {
        setIsSelling(false)
      }
    }
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sell NFT</h2>
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
            onClick={onCloseAction}
            size="sm"
            className="bg-gray-900 text-gray-400 hover:bg-gray-900 hover:text-gray-400"
          >
            Cancel
          </Button>
        </div>
      </div>
      {nfts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You don&apos;t have any NFTs available to sell.</p>
          <Button 
            variant="ghost" 
            onClick={onCloseAction}
            className="bg-gray-900 text-gray-400 hover:bg-gray-900 hover:text-gray-400"
          >
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Select NFT</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gray-900 text-gray-400 hover:bg-gray-900 w-full hover:ring-2 hover:ring-gray-700">
                  {nftDetails ? getNFTName(nftDetails.key) : 'Select NFT'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="bg-gray-900 text-gray-400 border-none w-[var(--radix-dropdown-menu-trigger-width)]"
                align="start"
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                }}
                onCloseAutoFocus={(event) => {
                  event.preventDefault()
                }}
              >
                {nfts.map((nft, index) => (
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 justify-start" 
                    key={index} 
                    onClick={() => setNftDetails(nft)}
                  >
                    {nft.key}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Select Asset to Receive</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gray-900 text-gray-400 hover:bg-gray-900 w-full hover:ring-2 hover:ring-gray-700">
                  {assetOutType ? (assetOutType.symbol || assetOutType.name) : 'Select Asset'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="bg-gray-900 text-gray-400 border-none w-[var(--radix-dropdown-menu-trigger-width)]"
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
                {filteredAssets.map((asset, index) => {
                  const balance = userBalances.find(b => b.tokenKey === asset.path)
                  return (
                    <DropdownMenuItem 
                      className="hover:bg-gray-800 flex justify-between items-center" 
                      key={index} 
                      onClick={() => setAssetOutType(asset)}
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
            <label className="text-sm">Amount of Asset</label>
            <Input
              type="number"
              placeholder="Amount to receive"
              value={amountOut}
              onChange={(e) => setAmountOut(e.target.value)}
              className="bg-gray-900 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Expiry Hours</label>
            <Input
              type="number"
              placeholder="Number of hours until expiry"
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              className="bg-gray-900 border-gray-700"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
            disabled={isSelling}
          >
            <DollarSign className={`mr-2 h-4 w-4 transition-all duration-500 ${isSelling ? 'rotate-[360deg] scale-110' : ''}`} />
            {isSelling ? 'Listing NFT...' : 'Sell NFT'}
          </Button>
        </form>
      )}
    </Card>
  )
} 
