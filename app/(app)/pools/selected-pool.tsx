'use client'

import { PoolInfo } from "@/app/types/types"
import { formatAmount, showValidationError } from "@/app/utils"
import { AddLiquidityDialog } from "@/components/add-liquidity-dialog"
import { FormattedAmount } from "@/components/formatted-amount"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WithdrawLiquidityDialog } from "@/components/withdraw-liquidity-dialog"
import { ArrowBigLeftDash, Coins, RefreshCw, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  useAddLiquidityMutation,
  useSwapEstimateQuery,
  useSwapMutation,
  useTokensAndBalances,
  useWithdrawLiquidityMutation
} from '../../services/pools/mutations-and-queries'
import { PoolValidations } from '../../services/pools/validations'

interface SelectedPoolProps {
  pool: PoolInfo
}

export function SelectedPool({ pool }: SelectedPoolProps) {
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null)
  const [isSwapping, ] = useState(false)
  const [isAddingLiquidity, ] = useState(false)
  const [isWithdrawingLiquidity, ] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] = useState(false)

  const { balances, refetch: refetchBalances } = useTokensAndBalances()
  const swapMutation = useSwapMutation(refetchBalances)
  const addLiquidityMutation = useAddLiquidityMutation(refetchBalances)
  const withdrawLiquidityMutation = useWithdrawLiquidityMutation(refetchBalances)

  const fromSwapEstimate = useSwapEstimateQuery({
    poolKey: pool.poolKey,
    tokenKey: pool.tokenAInfo.key,
    amount: activeInput === "from" ? Number(fromAmount) || null : null
  })

  const toSwapEstimate = useSwapEstimateQuery({
    poolKey: pool.poolKey,
    tokenKey: pool.tokenBInfo.key,
    amount: activeInput === "to" ? Number(toAmount) || null : null
  })

  const getUserBalance = (tokenKey: string): number => {
    const balance = balances.find(b => b.tokenKey === tokenKey)
    return balance?.balance || 0
  }

  const isBalanceExceeded = (amount: string, tokenKey: string): boolean => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return false
    const balance = getUserBalance(tokenKey)
    return numAmount > balance
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    setActiveInput("from")
    if (!value || isNaN(parseFloat(value))) {
      setToAmount("")
    }
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    setActiveInput("to")
    if (!value || isNaN(parseFloat(value))) {
      setFromAmount("")
    }
  }

  useEffect(() => {
    if (activeInput === "from" && fromSwapEstimate.data) {
      setToAmount(fromSwapEstimate.data.toString())
    }
  }, [activeInput, fromSwapEstimate.data])

  useEffect(() => {
    if (activeInput === "to" && toSwapEstimate.data) {
      setFromAmount(toSwapEstimate.data.toString())
    }
  }, [activeInput, toSwapEstimate.data])

  const clearInputs = () => {
    setFromAmount("")
    setToAmount("")
    setActiveInput(null)
  }

  const handleSwap = async () => {
    const validation = PoolValidations.validateSwap(
      activeInput === "from" ? fromAmount : toAmount,
      activeInput === "from" ? toAmount : fromAmount,
      getUserBalance(activeInput === "from" ? pool.tokenAInfo.key : pool.tokenBInfo.key)
    )

    if (!validation.isValid && validation.error) {
      showValidationError(validation.error)
      return
    }

    swapMutation.mutate({
      poolKey: pool.poolKey,
      tokenKey: activeInput === "from" ? pool.tokenAInfo.key : pool.tokenBInfo.key,
      amount: parseInt(activeInput === "from" ? fromAmount : toAmount),
      minAmountOut: parseInt(activeInput === "from" ? toAmount : fromAmount)
    }, {
      onSuccess: clearInputs
    })
  }

  const handleAddLiquidity = async (amountA: number, amountB: number) => {
    addLiquidityMutation.mutate({
      poolKey: pool.poolKey,
      amountA,
      amountB
    }, {
      onSuccess: () => setIsAddLiquidityDialogOpen(false)
    })
  }

  const handleWithdrawLiquidity = async (amount: number) => {
    withdrawLiquidityMutation.mutate({
      poolKey: pool.poolKey,
      amount
    }, {
      onSuccess: () => setIsWithdrawDialogOpen(false)
    })
  }

  const hasLPTokens = () => {
    const lpSymbol = `LP-${pool.tokenAInfo.symbol}-${pool.tokenBInfo.symbol}`
    return balances.some(balance => {
      const lpTokenKey = balance.tokenKey.split(/\./).pop()
      return lpTokenKey === lpSymbol && balance.balance > 0
    })
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
