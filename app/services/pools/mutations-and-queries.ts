import { getAllTokens, getPoolsPage, getSwapEstimate, getUserTokenBalances } from '@/app/queries/abci-queries'
import { addLiquidity, createPool, swap, withdrawLiquidity } from '@/app/services/tx-service'
import {
  AddLiquidityVariables,
  CreatePoolVariables,
  SwapVariables,
  UsePoolsQueryParams,
  UseSwapEstimateParams,
  WithdrawLiquidityVariables
} from '@/app/types/tanstack.types'
import { PoolInfo, TokenBalance, TokenDetails } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useCreatePoolMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const walletAddress = useWalletAddress()

  return useMutation({
    mutationFn: async (variables: CreatePoolVariables) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      
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
      await queryClient.invalidateQueries({ queryKey: ['balances', walletAddress] })
      
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

export function usePoolsQuery({ page, pageSize }: UsePoolsQueryParams) {
  return useQuery<PoolInfo[]>({
    queryKey: ['pools', page, pageSize],
    queryFn: () => getPoolsPage(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}

export function useSwapMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const walletAddress = useWalletAddress()

  return useMutation({
    mutationFn: async (variables: SwapVariables) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      
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
      await queryClient.invalidateQueries({ queryKey: ['balances', walletAddress] })
      
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

export function useAddLiquidityMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const walletAddress = useWalletAddress()

  return useMutation({
    mutationFn: async (variables: AddLiquidityVariables) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      
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
      await queryClient.invalidateQueries({ queryKey: ['balances', walletAddress] })
      
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

export function useWithdrawLiquidityMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const walletAddress = useWalletAddress()

  return useMutation({
    mutationFn: async (variables: WithdrawLiquidityVariables) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      
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
      await queryClient.invalidateQueries({ queryKey: ['balances', walletAddress] })
      
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

export function useSwapEstimateQuery({ poolKey, tokenKey, amount }: UseSwapEstimateParams) {
  const walletAddress = useWalletAddress()
  
  return useQuery<number>({
    queryKey: ['swapEstimate', poolKey, tokenKey, amount, walletAddress],
    queryFn: () => getSwapEstimate(poolKey, tokenKey, amount || 0),
    enabled: !!amount && amount > 0 && !!walletAddress,
    staleTime: 1000 * 30,
  })
} 
