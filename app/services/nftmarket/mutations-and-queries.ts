import { getOpenNFTTicketsPage, getUserNFTBalances } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { buyNFT, cancelTicket, createNFTTicket } from '@/app/services/tx-service'
import { NFTDetails, Ticket } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  CreateNFTTicketVariables,
  BuyNFTVariables,
  NFTBalancesResult
} from '@/app/types/tanstack.types'

export function useNFTTicketsQuery(page: number, pageSize: number) {
  return useQuery<Ticket[]>({
    queryKey: ['nft-tickets', page, pageSize],
    queryFn: () => getOpenNFTTicketsPage(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, 
  })
}

export function useUserNFTBalancesQuery(address: string | null) {
  return useQuery<NFTDetails[]>({
    queryKey: ['nft-balances', address],
    queryFn: () => getUserNFTBalances(address || ''),
    enabled: !!address,
    staleTime: 1000 * 60, 
  })
}

export function useNFTBalances(): NFTBalancesResult {
  const balancesQuery = useUserNFTBalancesQuery(AdenaService.getInstance().getAddress())

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
    nfts: balancesQuery.data ?? [],
    isLoading: balancesQuery.isLoading,
    isError: balancesQuery.isError,
    error: balancesQuery.error,
    refetch: () => balancesQuery.refetch()
  }
}

export function useCreateNFTTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, CreateNFTTicketVariables>({
    mutationFn: async (variables) => {
      const success = await createNFTTicket(
        variables.nftPath,
        variables.assetOutType as 'coin' | 'token',
        variables.assetOutPath,
        variables.minAmountOut,
        variables.expiryHours
      )
      if (!success) {
        throw new Error('Failed to create NFT ticket')
      }
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT listed for sale successfully",
        variant: "default"
      })
      await queryClient.invalidateQueries({ queryKey: ['nft-tickets'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to list NFT for sale",
        variant: "destructive"
      })
    }
  })
}

export function useBuyNFTMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, BuyNFTVariables>({
    mutationFn: async (variables) => {
      const success = await buyNFT(
        variables.ticketId,
        variables.amount,
        variables.assetType as 'coin' | 'token',
        variables.assetPath
      )
      if (!success) {
        throw new Error('Failed to buy NFT')
      }
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT purchased successfully",
        variant: "default"
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nft-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['nft-balances'] })
      ])
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase NFT",
        variant: "destructive"
      })
    }
  })
}

export function useCancelNFTSaleMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, Ticket>({
    mutationFn: async (ticket) => {
      const success = await cancelTicket(ticket)
      if (!success) {
        throw new Error('Failed to cancel NFT sale')
      }
      return success
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT sale cancelled successfully",
        variant: "default"
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nft-tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['nft-balances'] })
      ])
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel NFT sale",
        variant: "destructive"
      })
    }
  })
} 
