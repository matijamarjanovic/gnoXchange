import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WavesLadder } from "lucide-react"
import { useState } from "react"

interface CreatePoolForm {
  tokenA: string
  tokenB: string
  amountA: string
  amountB: string
}

interface CreatePoolProps {
  onClose: () => void
  onSubmit: (form: CreatePoolForm) => Promise<void>
}

export function CreatePool({ onClose, onSubmit }: CreatePoolProps) {
  const [createPoolForm, setCreatePoolForm] = useState<CreatePoolForm>({
    tokenA: '',
    tokenB: '',
    amountA: '',
    amountB: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(createPoolForm)
    setCreatePoolForm({
      tokenA: '',
      tokenB: '',
      amountA: '',
      amountB: ''
    })
  }

  return (
    <Card className="p-6 bg-gray-800 text-gray-400 border-none shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create New Pool</h2>
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="hover:bg-gray-900 bg-gray-900 text-gray-400 hover:text-gray-400"
        >
          Cancel
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Token A</label>
          <Input
            placeholder="Enter token A symbol"
            value={createPoolForm.tokenA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setCreatePoolForm(prev => ({...prev, tokenA: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Initial Amount A</label>
          <Input
            type="number"
            placeholder="Enter amount for token A"
            value={createPoolForm.amountA}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setCreatePoolForm(prev => ({...prev, amountA: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Token B</label>
          <Input
            placeholder="Enter token B symbol"
            value={createPoolForm.tokenB}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setCreatePoolForm(prev => ({...prev, tokenB: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Initial Amount B</label>
          <Input
            type="number"
            placeholder="Enter amount for token B"
            value={createPoolForm.amountB}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setCreatePoolForm(prev => ({...prev, amountB: e.target.value}))}
            className="bg-gray-900 border-gray-700"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-600 text-gray-300 transition-all shadow-md"
        >
          <WavesLadder className="mr-2 h-4 w-4" />
          Create Pool
        </Button>
      </form>
    </Card>
  )
} 
