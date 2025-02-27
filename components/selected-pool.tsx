import { getSwapEstimate, getUserTokenBalances } from "@/app/queries/abci-queries"
import { AdenaService } from "@/app/services/adena-service"
import { addLiquidity, swap, withdrawLiquidity } from "@/app/services/tx-service"
import { PoolInfo, TokenBalance } from "@/app/types/types"
import { formatAmount } from "@/app/utils"
import { AddLiquidityDialog } from "@/components/add-liquidity-dialog"
import { FormattedAmount } from "@/components/formatted-amount"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WithdrawLiquidityDialog } from "@/components/withdraw-liquidity-dialog"
import { toast } from "@/hooks/use-toast"
import { ArrowBigLeftDash, Coins, RefreshCw, X } from "lucide-react"
import { useEffect, useState } from "react"

interface SelectedPoolProps {
  pool: PoolInfo
}

export function SelectedPool({ pool }: SelectedPoolProps) {
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false)
  const [isWithdrawingLiquidity, setIsWithdrawingLiquidity] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] = useState(false)
  const [userBalances, setUserBalances] = useState<TokenBalance[]>([])

  useEffect(() => {
    const handleAddressChange = () => {
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

  const getUserBalance = (tokenKey: string): number => {
    const balance = userBalances.find(b => b.tokenKey === tokenKey);
    return balance?.balance || 0;
  };

  const isBalanceExceeded = (amount: string, tokenKey: string): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;
    const balance = getUserBalance(tokenKey);
    return numAmount > balance;
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    setActiveInput("from");
    
    if (value && !isNaN(parseFloat(value))) {
      const estimate = await getSwapEstimate(
        pool.poolKey,
        pool.tokenAInfo.key,
        parseInt(value)
      );
      setToAmount(estimate.toString());
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = async (value: string) => {
    setToAmount(value);
    setActiveInput("to");
    
    if (value && !isNaN(parseFloat(value))) {
      const estimate = await getSwapEstimate(
        pool.poolKey,
        pool.tokenBInfo.key,
        parseInt(value)
      );
      setFromAmount(estimate.toString());
    } else {
      setFromAmount("");
    }
  };

  const clearInputs = () => {
    setFromAmount("");
    setToAmount("");
    setActiveInput(null);
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    try {
      const success = await swap(
        pool.poolKey,
        activeInput === "from" ? pool.tokenAInfo.key : pool.tokenBInfo.key,
        parseInt(activeInput === "from" ? fromAmount : toAmount),
        parseInt(activeInput === "from" ? toAmount : fromAmount)
      );

      if (success) {
        toast({
          title: "Success",
          description: "Swap executed successfully",
          variant: "default"
        });
        clearInputs();
        fetchUserBalances();
      } else {
        toast({
          title: "Error",
          description: "Failed to execute swap",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error executing swap:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute swap",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

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

  const hasLPTokens = () => {
    const lpSymbol = `LP-${pool.tokenAInfo.symbol}-${pool.tokenBInfo.symbol}`;
    return userBalances.some(balance => {
      const lpTokenKey = balance.tokenKey.split(/\./).pop();
      return lpTokenKey === lpSymbol && balance.balance > 0;
    });
  };

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
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900 relative">
          <p className="text-sm text-gray-400">From ({pool.tokenAInfo.symbol})</p>
          <div className="flex items-center">
            <input
              type="number"
              className={`w-full mt-1 p-2 bg-transparent ${
                isBalanceExceeded(fromAmount, pool.tokenAInfo.key) ? 'text-red-500' : 'text-gray-300'
              }`}
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              disabled={activeInput === "to"}
            />
            {fromAmount && (
              <FormattedAmount 
                amount={formatAmount(parseFloat(fromAmount), pool.tokenAInfo.decimals)}
                decimals={pool.tokenAInfo.decimals}
                className="absolute right-2 top-2 text-sm text-gray-500"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your Balance: <FormattedAmount 
              amount={formatAmount(getUserBalance(pool.tokenAInfo.key), pool.tokenAInfo.decimals)}
              decimals={pool.tokenAInfo.decimals}
            />
          </p>
        </div>
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-900 relative">
          <p className="text-sm text-gray-400">To ({pool.tokenBInfo.symbol})</p>
          <div className="flex items-center">
            <input
              type="number"
              className={`w-full mt-1 p-2 bg-transparent ${
                isBalanceExceeded(toAmount, pool.tokenBInfo.key) ? 'text-red-500' : 'text-gray-300'
              }`}
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              disabled={activeInput === "from"}
            />
            {toAmount && (
              <FormattedAmount 
                amount={formatAmount(parseFloat(toAmount), pool.tokenBInfo.decimals)}
                decimals={pool.tokenBInfo.decimals}
                className="absolute right-2 top-2 text-sm text-gray-500"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your Balance: <FormattedAmount 
              amount={formatAmount(getUserBalance(pool.tokenBInfo.key), pool.tokenBInfo.decimals)}
              decimals={pool.tokenBInfo.decimals}
            />
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSwap}
            className="flex-grow bg-blue-700 hover:bg-blue-600 text-gray-300"
            disabled={isSwapping || !activeInput || !fromAmount || !toAmount}
          >
            <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-500 ${isSwapping ? 'rotate-180' : ''}`} />
            {isSwapping ? 'Swapping...' : 'Swap'}
          </Button>
          <Button 
            onClick={clearInputs}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 w-12"
            disabled={isSwapping || (!fromAmount && !toAmount)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
