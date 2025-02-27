import { getUserTokenBalances } from "@/app/queries/abci-queries"
import { AdenaService } from "@/app/services/adena-service"
import { addLiquidity, withdrawLiquidity } from "@/app/services/tx-service"
import { PoolInfo, TokenBalance } from "@/app/types/types"
import { AddLiquidityDialog } from "@/components/add-liquidity-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WithdrawLiquidityDialog } from "@/components/withdraw-liquidity-dialog"
import { toast } from "@/hooks/use-toast"
import { ArrowBigLeftDash, Coins, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

interface SelectedPoolProps {
  pool: PoolInfo
}

export function SelectedPool({ pool }: SelectedPoolProps) {
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false)
  const [isWithdrawingLiquidity, setIsWithdrawingLiquidity] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] = useState(false)
  const [, setWalletAddress] = useState(AdenaService.getInstance().getAddress())
  const [userBalances, setUserBalances] = useState<TokenBalance[]>([])

  useEffect(() => {
    const handleAddressChange = (event: CustomEvent<{ newAddress: string | null }>) => {
      setWalletAddress(event.detail.newAddress || '');
      fetchUserBalances();
    };

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener);
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener);
    };
  }, []);

  const fetchUserBalances = async () => {
    try {
      const address = AdenaService.getInstance().getAddress();
      if (address) {
        const balances = await getUserTokenBalances(address);
        setUserBalances(balances);
      }
    } catch (error) {
      console.error('Error fetching user balances:', error);
    }
  };

  useEffect(() => {
    fetchUserBalances();
  }, []);

  const hasLPTokens = () => {
    const lpSymbol = `LP-${pool.tokenAInfo.symbol}-${pool.tokenBInfo.symbol}`;
    return userBalances.some(balance => {
      const lpTokenKey = balance.tokenKey.split(/\./).pop();
      return lpTokenKey === lpSymbol && balance.balance > 0;
    });
  };

  const handleSwap = () => {
    setIsSwapping(true)
    // todo : add swap logic
    setTimeout(() => setIsSwapping(false), 1000) 
  }

  const handleAddLiquidity = async (amountA: number, amountB: number) => {
    setIsAddingLiquidity(true)
    try {
      const success = await addLiquidity(pool.poolKey, amountA, amountB)

      if (success) {
        toast({
          title: "Success",
          description: "Liquidity added successfully",
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add liquidity",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error adding liquidity:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add liquidity",
        variant: "destructive"
      })
    } finally {
      setIsAddingLiquidity(false)
    }
  }

  const handleWithdrawLiquidity = async (amount: number) => {
    setIsWithdrawingLiquidity(true)
    try {
      const success = await withdrawLiquidity(pool.poolKey, amount)

      if (success) {
        toast({
          title: "Success",
          description: "Liquidity withdrawn successfully",
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to withdraw liquidity",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error withdrawing liquidity:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to withdraw liquidity",
        variant: "destructive"
      })
    } finally {
      setIsWithdrawingLiquidity(false)
    }
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {pool.tokenAInfo.symbol} ⇄ {pool.tokenBInfo.symbol}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddLiquidityDialogOpen(true)}
            className="bg-blue-900/80 hover:bg-blue-800 text-gray-100"
            disabled={isAddingLiquidity}
            size="sm"
          >
            <ArrowBigLeftDash className="h-4 w-4 mr-1" />
            {isAddingLiquidity ? 'Adding ...' : 'Add Liquidity'}
          </Button>
          {hasLPTokens() && (
            <Button
              onClick={() => setIsWithdrawDialogOpen(true)}
              className="bg-red-900/80 hover:bg-red-800 text-gray-100"
              disabled={isWithdrawingLiquidity}
              size="sm"
            >
              <Coins className="h-4 w-4 mr-1" />
              {isWithdrawingLiquidity ? 'Withdrawing ...' : 'Withdraw Liquidity'}
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">From</p>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-transparent text-gray-300"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
          <p className="text-sm text-gray-400">To</p>
          <input
            type="number"
            className="w-full mt-1 p-2 bg-transparent text-gray-300"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSwap}
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
          disabled={isSwapping}
        >
          <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-500 ${isSwapping ? 'rotate-180' : ''}`} />
          {isSwapping ? 'Swapping...' : 'Swap'}
        </Button>
      </div>
      <WithdrawLiquidityDialog
        isOpen={isWithdrawDialogOpen}
        onClose={() => setIsWithdrawDialogOpen(false)}
        onConfirm={handleWithdrawLiquidity}
        pool={pool}
      />
      <AddLiquidityDialog
        isOpen={isAddLiquidityDialogOpen}
        onClose={() => setIsAddLiquidityDialogOpen(false)}
        onConfirm={handleAddLiquidity}
        pool={pool}
      />
    </Card>
  )
} 
