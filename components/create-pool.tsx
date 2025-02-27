import { getAllTokens, getUserTokenBalances } from "@/app/queries/abci-queries"
import { AdenaService } from "@/app/services/adena-service"
import { createPool } from "@/app/services/tx-service"
import { Asset, TokenBalance, TokenDetails } from "@/app/types/types"
import { formatAmount } from "@/app/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { Coins, WavesLadder } from "lucide-react"
import { useEffect, useState } from "react"

interface CreatePoolForm {
  tokenA: string 
  tokenB: string  
  amountA: string
  amountB: string
}

interface CreatePoolProps {
  onClose: () => void
}

export function CreatePool({ onClose }: CreatePoolProps) {
  const [createPoolForm, setCreatePoolForm] = useState<CreatePoolForm>({
    tokenA: '',
    tokenB: '',
    amountA: '',
    amountB: '',
  })
  const [assetAType, setAssetAType] = useState<Asset | null>(null)
  const [assetBType, setAssetBType] = useState<Asset | null>(null)
  const [tokens, setTokens] = useState<TokenDetails[]>([])
  const [showLPTokens, setShowLPTokens] = useState(false)
  const [userBalances, setUserBalances] = useState<TokenBalance[]>([])
  const [, setWalletAddress] = useState(AdenaService.getInstance().getAddress())

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent<{ newAddress: string | null }>) => {
      setWalletAddress(event.detail.newAddress || '');
      fetchData();
    };

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener);
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedTokens, fetchedBalances] = await Promise.all([
        getAllTokens(),
        getUserTokenBalances(AdenaService.getInstance().getAddress())
      ])
      
      const tokensWithBalances = fetchedTokens.filter(token => 
        fetchedBalances.some(balance => balance.tokenKey === token.key)
      )
      
      setTokens(tokensWithBalances)
      setUserBalances(fetchedBalances)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const assets: Asset[] = [
    ...tokens.map(token => ({
      type: 'token',
      path: token.key,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals
    }))
  ]

  const filteredAssets = assets.filter(asset => {
    if (asset.type === 'coin') return true
    const isLPToken = asset.symbol?.includes('LP-')
    return showLPTokens ? true : !isLPToken
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const success = await createPool(
        createPoolForm.tokenA,
        createPoolForm.tokenB,
        parseInt(createPoolForm.amountA),
        parseInt(createPoolForm.amountB),
      )
      
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to create pool:", error)
    }
    
    setCreatePoolForm({
      tokenA: '',
      tokenB: '',
      amountA: '',
      amountB: '',

    })
  }

  const isFormValid = () => {
    return createPoolForm.tokenA !== '' && 
           createPoolForm.tokenB !== '' && 
           createPoolForm.amountA !== '' && 
           createPoolForm.amountB !== '' &&
           Number(createPoolForm.amountA) > 0 &&
           Number(createPoolForm.amountB) > 0;
  };

  const getFilteredAssetsB = () => {
    return filteredAssets.filter(asset => {
      if (createPoolForm.tokenA === '') return true;
      if (asset.type === 'coin' && assetAType?.type === 'coin') {
        return asset.denom !== assetAType.denom;
      }
      return asset.type === 'coin' || asset.path !== createPoolForm.tokenA;
    });
  };

  const getFilteredAssetsA = () => {
    return filteredAssets.filter(asset => {
      if (createPoolForm.tokenB === '') return true;
      if (asset.type === 'coin' && assetBType?.type === 'coin') {
        return asset.denom !== assetBType.denom;
      }
      return asset.type === 'coin' || asset.path !== createPoolForm.tokenB;
    });
  };

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create New Token Pool</h2>
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
            onClick={onClose}
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
                {assetAType ? assetAType.symbol : 'Select Token A'}
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
              {getFilteredAssetsA().map((asset, index) => {
                const balance = userBalances.find(b => b.tokenKey === asset.path)
                return (
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex justify-between items-center" 
                    key={index} 
                    onClick={() => {
                      setAssetAType(asset)
                      setCreatePoolForm(prev => ({
                        ...prev,
                        tokenA: asset.path!
                      }))
                    }}
                  >
                    <span>{asset.symbol}</span>
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
          <span className="text-gray-400">+</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gray-900 text-gray-400 hover:ring-2 hover:ring-gray-700 hover:bg-gray-900 hover:text-gray-400 w-64">
                {assetBType ? assetBType.symbol : 'Select Token B'}
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
              {getFilteredAssetsB().map((asset, index) => {
                const balance = userBalances.find(b => b.tokenKey === asset.path)
                return (
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 flex justify-between items-center" 
                    key={index} 
                    onClick={() => {
                      setAssetBType(asset)
                      setCreatePoolForm(prev => ({
                        ...prev,
                        tokenB: asset.path!
                      }))
                    }}
                  >
                    <span>{asset.symbol}</span>
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
          <label className="text-sm">Initial Amount A</label>
          <Input
            type="number"
            placeholder="Enter amount for token A"
            value={createPoolForm.amountA}
            onChange={(e) => setCreatePoolForm(prev => ({...prev, amountA: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Initial Amount B</label>
          <Input
            type="number"
            placeholder="Enter amount for token B"
            value={createPoolForm.amountB}
            onChange={(e) => setCreatePoolForm(prev => ({...prev, amountB: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={!isFormValid()}
        >
          <WavesLadder className="mr-2 h-4 w-4" />
          Create Pool
        </Button>
      </form>
    </Card>
  )
} 
