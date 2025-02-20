import { formatAmount } from "@/app/utils"
import { FormattedAmount } from "@/components/formatted-amount"
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

interface TradeConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
  sellingAmount: number
  sellingToken: string
  receivingToken: string
  minimumAmount: number
  sellingDecimals?: number
  receivingDecimals?: number
}

export function TradeConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  sellingAmount,
  sellingToken,
  receivingToken,
  minimumAmount,
  sellingDecimals,
  receivingDecimals,
}: TradeConfirmationDialogProps) {
  const [amount, setAmount] = React.useState<string>("")
  const { toast } = useToast()

  const formattedInput = React.useMemo(() => {
    if (!amount) return "0";
    return formatAmount(parseFloat(amount) || 0, 6);
  }, [amount]);

  const handleConfirm = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid number"
      })
      return
    }
    
    if (numAmount < minimumAmount) {
      toast({
        variant: "destructive",
        title: "Amount too low",
        description: `Minimum amount required is ${minimumAmount}`
      })
      return
    }
    onConfirm(numAmount)
    setAmount("")  
  }

  const handleClose = () => {
    setAmount("") 
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-400 border-none">
        <DialogHeader>
          <DialogTitle>Confirm Trade</DialogTitle>
          <DialogDescription>
            How much would you like to pay for <FormattedAmount amount={formatAmount(sellingAmount, sellingDecimals ?? 6)} /> {receivingToken}?
            (Minimum: <FormattedAmount amount={formatAmount(minimumAmount, receivingDecimals ?? 6)} /> {receivingToken})
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center py-4">
          <Label htmlFor="amount" className="text-left flex-1">
            Amount of {sellingToken} <span className="text-[10px] text-gray-500">(in denom)</span>
          </Label>
          <div className="flex-1">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-gray-900 text-gray-400 border-none text-right"
              inputMode="decimal"
              spacing={receivingDecimals ?? 6}
            />
            <div className="sr-only" aria-live="polite">
              Current amount: {formattedInput}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="bg-gray-700 text-gray-400 border-none hover:bg-gray-700 hover:text-gray-400">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-gray-900 text-gray-400 border-none hover:bg-blue-700" >
            Confirm Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
