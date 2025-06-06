import { getAllTokens, getOpenTicketsPage, getUserTokenBalances } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { cancelTicket, createTicket, fulfillTicket } from '@/app/services/tx-service'
import {
  CreateTicketVariables,
  FulfillTicketVariables,
  UseTicketsQueryParams
} from '@/app/types/tanstack.types'
import { Ticket, TokenBalance, TokenDetails } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useEffect, useState } from 'react'

export function useCreateTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: CreateTicketVariables) => {
      const response = await createTicket(
        variables.assetInType,
        variables.assetOutType,
        variables.assetInPath,
        variables.assetOutPath,
        variables.amountIn,
        variables.minAmountOut,
        variables.expiryHours
      )
      
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to create ticket')
      }
      
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "success",
      })
      
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
      
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      })
    }
  })
}

export function useTokensQuery() {
  return useQuery<TokenDetails[]>({
    queryKey: ['tokens'],
    queryFn: getAllTokens,
  })
}

export function useUserBalancesQuery(address: string | null) {
  return useQuery<TokenBalance[]>({
    queryKey: ['balances', address],
    queryFn: () => getUserTokenBalances(address || ''),
    enabled: !!address,
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

export function useTicketsQuery({ page, pageSize }: UseTicketsQueryParams) {
  return useQuery<Ticket[]>({
    queryKey: ['tickets', page, pageSize],
    queryFn: async () => {
      const tickets = await getOpenTicketsPage(page, pageSize);
      return [...tickets].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    placeholderData: keepPreviousData,
  })
}

export function useTicketSearch(tickets: Ticket[]) {
  const [fuse, setFuse] = useState<Fuse<Ticket> | null>(null)

  useEffect(() => {
    if (!tickets.length) {
      setFuse(null)
      return
    }

    const fuseInstance = new Fuse(tickets, {
      keys: [
        'assetIn.tokenHubPath',
        'assetIn.name',
        'assetIn.symbol',
        'assetIn.type',
        'assetOut.tokenHubPath',
        'assetOut.name',
        'assetOut.symbol',
        'assetOut.type',
        'id',
        'creator'
      ],
      threshold: 0.4,
      shouldSort: true,
      minMatchCharLength: 2
    })
    setFuse(fuseInstance)
  }, [tickets.length, tickets])

  return fuse
}

export function useFulfillTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticket, amount }: FulfillTicketVariables) => {
      const response = await fulfillTicket(ticket, amount)
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to fulfill ticket')
      }
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Trade successful",
        description: "Your trade has been completed.",
        variant: "success",
      })
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Trade failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  })
}

export function useCancelTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticket: Ticket) => {
      const response = await cancelTicket(ticket)
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to cancel ticket')
      }
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Ticket cancelled",
        description: "Your ticket has been cancelled successfully.",
        variant: "success",
      })
      await queryClient.invalidateQueries({ queryKey: ['tickets'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Cancel failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  })
}
