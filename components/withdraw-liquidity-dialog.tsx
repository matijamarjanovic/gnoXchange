import { getUserTokenBalances } from "@/app/queries/abci-queries"
import { AdenaService } from "@/app/services/adena-service"
import { PoolInfo } from "@/app/types/types"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import * as React from "react"

interface WithdrawLiquidityDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
  pool: PoolInfo
}

export function WithdrawLiquidityDialog({
  isOpen,
  onClose,
  onConfirm,
  pool,
}: WithdrawLiquidityDialogProps) {
  const [amount, setAmount] = React.useState<string>("")
  const [lpBalance, setLpBalance] = React.useState<number>(0)
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchLPBalance = async () => {
      const address = AdenaService.getInstance().getAddress()
      if (address) {
        const balances = await getUserTokenBalances(address)
        const lpSymbol = `LP-${pool.tokenAInfo.symbol}-${pool.tokenBInfo.symbol}`
        const lpBalance = balances.find(balance => {
          const lpTokenKey = balance.tokenKey.split(/\./).pop()
          return lpTokenKey === lpSymbol
        })
        setLpBalance(lpBalance?.balance || 0)
      }
    }

    if (isOpen) {
      fetchLPBalance()
    }
  }, [isOpen, pool.tokenAInfo.symbol, pool.tokenBInfo.symbol])

  const handleConfirm = () => {
    const numAmount = parseInt(amount.replaceAll(' ', ''))
    if (isNaN(numAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid number"
      })
      return
    }

    if (numAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Amount must be greater than 0"
      })
      return
    }

    if (numAmount > lpBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: `You only have ${lpBalance} LP tokens`
      })
      return
    }
    
    onConfirm(numAmount)
    handleClose()
  }

  const handleClose = () => {
    setAmount("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-400 border-none">
        <DialogHeader>
          <DialogTitle>Withdraw Liquidity</DialogTitle>
          <DialogDescription>
            Enter the amount of LP tokens you want to withdraw from {pool.tokenAInfo.symbol}-{pool.tokenBInfo.symbol} pool.
            You have {lpBalance} LP tokens available.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center py-4">
          <Label htmlFor="amount" className="text-left flex-1">
            LP Token Amount
          </Label>
          <div className="flex-1">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-gray-900 text-gray-400 border-none text-right"
              inputMode="decimal"
              max={lpBalance}
              placeholder={`Max: ${lpBalance}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="bg-gray-700 text-gray-400 border-none hover:bg-gray-700 hover:text-gray-400">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-gray-900 text-gray-400 border-none hover:bg-blue-700">
            Confirm Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
