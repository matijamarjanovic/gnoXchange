import { getAllTokens, getPoolsPage, getSwapEstimate, getUserTokenBalances } from '@/app/queries/abci-queries'
import { addLiquidity, createPool, swap, withdrawLiquidity } from '@/app/services/tx-service'
import { PoolInfo, TokenBalance, TokenDetails } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CreatePoolVariables {
  tokenA: string
  tokenB: string
  amountA: number
  amountB: number
}

export function useCreatePoolMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: CreatePoolVariables) => {
      const success = await createPool(
        variables.tokenA,
        variables.tokenB,
        variables.amountA,
        variables.amountB
      )
      
      if (!success) {
        throw new Error('Failed to create pool')
      }
      
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Pool created successfully",
        variant: "default"
      })
      
      await queryClient.invalidateQueries({ queryKey: ['pools'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create pool"
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

export function useUserBalancesQuery() {
  const walletAddress = useWalletAddress()
  
  return useQuery<TokenBalance[]>({
    queryKey: ['balances', walletAddress],
    queryFn: () => getUserTokenBalances(walletAddress || ''),
    enabled: !!walletAddress,
    staleTime: 1000 * 60,
  })
}

export function useTokensAndBalances() {
  const tokensQuery = useTokensQuery()
  const balancesQuery = useUserBalancesQuery()

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

interface UsePoolsQueryParams {
  page: number
  pageSize: number
}

export function usePoolsQuery({ page, pageSize }: UsePoolsQueryParams) {
  return useQuery<PoolInfo[]>({
    queryKey: ['pools', page, pageSize],
    queryFn: () => getPoolsPage(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}

interface SwapVariables {
  poolKey: string
  tokenKey: string
  amount: number
  minAmountOut: number
}

export function useSwapMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: SwapVariables) => {
      const success = await swap(
        variables.poolKey,
        variables.tokenKey,
        variables.amount,
        variables.minAmountOut
      )
      
      if (!success) {
        throw new Error('Failed to execute swap')
      }
      
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Swap executed successfully",
        variant: "default"
      })
      
      await queryClient.invalidateQueries({ queryKey: ['pools'] })
      await queryClient.invalidateQueries({ queryKey: ['balances'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to execute swap"
      })
    }
  })
}

interface AddLiquidityVariables {
  poolKey: string
  amountA: number
  amountB: number
}

export function useAddLiquidityMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: AddLiquidityVariables) => {
      const success = await addLiquidity(
        variables.poolKey,
        variables.amountA,
        variables.amountB
      )
      
      if (!success) {
        throw new Error('Failed to add liquidity')
      }
      
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Liquidity added successfully",
        variant: "default"
      })
      
      await queryClient.invalidateQueries({ queryKey: ['pools'] })
      await queryClient.invalidateQueries({ queryKey: ['balances'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add liquidity"
      })
    }
  })
}

interface WithdrawLiquidityVariables {
  poolKey: string
  amount: number
}

export function useWithdrawLiquidityMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: WithdrawLiquidityVariables) => {
      const success = await withdrawLiquidity(
        variables.poolKey,
        variables.amount
      )
      
      if (!success) {
        throw new Error('Failed to withdraw liquidity')
      }
      
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Liquidity withdrawn successfully",
        variant: "default"
      })
      
      await queryClient.invalidateQueries({ queryKey: ['pools'] })
      await queryClient.invalidateQueries({ queryKey: ['balances'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to withdraw liquidity"
      })
    }
  })
}

interface UseSwapEstimateParams {
  poolKey: string
  tokenKey: string
  amount: number | null
}

export function useSwapEstimateQuery({ poolKey, tokenKey, amount }: UseSwapEstimateParams) {
  return useQuery<number>({
    queryKey: ['swapEstimate', poolKey, tokenKey, amount],
    queryFn: () => getSwapEstimate(poolKey, tokenKey, amount || 0),
    enabled: !!amount && amount > 0,
    staleTime: 1000 * 30,
  })
} 
