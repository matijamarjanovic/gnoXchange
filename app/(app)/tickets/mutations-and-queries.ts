import { getAllTokens, getUserTokenBalances } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { createTicket } from '@/app/services/tx-service'
import { TokenBalance, TokenDetails } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface CreateTicketVariables {
  assetInType: 'coin' | 'token'
  assetOutType: 'coin' | 'token'
  assetInPath: string
  assetOutPath: string
  amountIn: number
  minAmountOut: number
  expiryHours: number
}

export function useCreateTicketMutation(onSuccess?: () => Promise<void>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: CreateTicketVariables) => {
      const success = await createTicket(
        variables.assetInType,
        variables.assetOutType,
        variables.assetInPath,
        variables.assetOutPath,
        variables.amountIn,
        variables.minAmountOut,
        variables.expiryHours
      )
      
      if (!success) {
        throw new Error('Failed to create ticket')
      }
      
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "default"
      })
      
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
      
      await onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create ticket"
      })
    }
  })
}

export function useTokensQuery() {
  return useQuery<TokenDetails[]>({
    queryKey: ['tokens'],
    queryFn: getAllTokens,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUserBalancesQuery(address: string | null) {
  return useQuery<TokenBalance[]>({
    queryKey: ['balances', address],
    queryFn: () => getUserTokenBalances(address || ''),
    enabled: !!address,
    staleTime: 1000 * 60,
  })
}

export function useTokensAndBalances() {
  const tokensQuery = useTokensQuery()
  const balancesQuery = useUserBalancesQuery(AdenaService.getInstance().getAddress())

  useEffect(() => {
    const handleAddressChange = () => {
      balancesQuery.refetch()
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange)
    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange)
    }
  }, [balancesQuery])

  return {
    tokens: tokensQuery.data ?? [],
    balances: balancesQuery.data ?? [],
    isLoading: tokensQuery.isLoading || balancesQuery.isLoading,
    isError: tokensQuery.isError || balancesQuery.isError,
    error: tokensQuery.error || balancesQuery.error,
    refetch: async () => {
      await Promise.all([
        tokensQuery.refetch(),
        balancesQuery.refetch()
      ])
    }
  }
}
