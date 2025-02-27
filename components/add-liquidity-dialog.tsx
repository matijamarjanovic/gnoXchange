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

interface AddLiquidityDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amountA: number, amountB: number) => void
  pool: PoolInfo
}

export function AddLiquidityDialog({
  isOpen,
  onClose,
  onConfirm,
  pool,
}: AddLiquidityDialogProps) {
  const [amountA, setAmountA] = React.useState<string>("")
  const [amountB, setAmountB] = React.useState<string>("")
  const { toast } = useToast()

  const poolRatio = React.useMemo(() => {
    return pool.reserveB / pool.reserveA
  }, [pool])

  const handleAmountAChange = (value: string) => {
    setAmountA(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      const expectedB = Math.floor(numValue * poolRatio)
      setAmountB(expectedB.toString())
    } else {
      setAmountB("")
    }
  }

  const handleAmountBChange = (value: string) => {
    setAmountB(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      const expectedA = Math.floor(numValue / poolRatio)
      setAmountA(expectedA.toString())
    } else {
      setAmountA("")
    }
  }

  const handleConfirm = () => {
    const numAmountA = parseInt(amountA.replaceAll(' ', ''))
    const numAmountB = parseInt(amountB.replaceAll(' ', ''))
    
    if (isNaN(numAmountA) || isNaN(numAmountB)) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter valid numbers for both tokens"
      })
      return
    }

    if (numAmountA <= 0 || numAmountB <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Amounts must be greater than 0"
      })
      return
    }

    if ((numAmountA * pool.reserveB) !== (numAmountB * pool.reserveA)) {
      toast({
        variant: "destructive",
        title: "Invalid ratio",
        description: `Token amounts must maintain the pool ratio of ${pool.reserveA}:${pool.reserveB}`
      })
      return
    }
    
    onConfirm(numAmountA, numAmountB)
    handleClose()
  }

  const handleClose = () => {
    setAmountA("")
    setAmountB("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-400 border-none">
        <DialogHeader>
          <DialogTitle>Add Liquidity</DialogTitle>
          <DialogDescription>
            Enter the amounts of {pool.tokenAInfo.symbol} and {pool.tokenBInfo.symbol} to add to the pool.
            Current pool ratio: 1 {pool.tokenAInfo.symbol} = {poolRatio.toFixed(6)} {pool.tokenBInfo.symbol}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center">
            <Label htmlFor="amountA" className="text-left flex-1">
              {pool.tokenAInfo.symbol} Amount
            </Label>
            <div className="flex-1">
              <Input
                id="amountA"
                type="number"
                value={amountA}
                onChange={(e) => handleAmountAChange(e.target.value)}
                className="flex-1 bg-gray-900 text-gray-400 border-none text-right"
                inputMode="decimal"
              />
            </div>
          </div>
          <div className="flex items-center">
            <Label htmlFor="amountB" className="text-left flex-1">
              {pool.tokenBInfo.symbol} Amount
            </Label>
            <div className="flex-1">
              <Input
                id="amountB"
                type="number"
                value={amountB}
                onChange={(e) => handleAmountBChange(e.target.value)}
                className="flex-1 bg-gray-900 text-gray-400 border-none text-right"
                inputMode="decimal"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="bg-gray-700 text-gray-400 border-none hover:bg-gray-700 hover:text-gray-400">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-gray-900 text-gray-400 border-none hover:bg-blue-700">
            Add Liquidity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
