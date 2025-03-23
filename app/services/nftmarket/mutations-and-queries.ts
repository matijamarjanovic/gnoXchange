import { getOpenNFTTicketsPage, getUserNFTBalances } from '@/app/queries/abci-queries'
import { AdenaService } from '@/app/services/adena-service'
import { buyNFT, cancelTicket, createNFTTicket } from '@/app/services/tx-service'
import {
  BuyNFTVariables,
  CreateNFTTicketVariables,
  NFTBalancesResult
} from '@/app/types/tanstack.types'
import { NFTDetails, Ticket } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useNFTTicketsQuery(page: number, pageSize: number) {
  return useQuery<Ticket[]>({
    queryKey: ['nft-tickets', page, pageSize],
    queryFn: () => getOpenNFTTicketsPage(page, pageSize),
    placeholderData: keepPreviousData,
  })
}

export function useUserNFTBalancesQuery(address: string | null) {
  return useQuery<NFTDetails[]>({
    queryKey: ['nft-balances', address],
    queryFn: () => getUserNFTBalances(address || ''),
    enabled: !!address,
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
      const response = await createNFTTicket(
        variables.nftPath,
        variables.assetOutType as 'coin' | 'token',
        variables.assetOutPath,
        variables.minAmountOut,
        variables.expiryHours
      )
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to create NFT ticket')
      }
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT listed for sale successfully",
        variant: "success",
        
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
        description: error.message || "Failed to list NFT for sale",
        variant: "destructive",
        
      })
    }
  })
}

export function useBuyNFTMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, BuyNFTVariables>({
    mutationFn: async (variables) => {
      const response = await buyNFT(
        variables.ticketId,
        variables.amount,
        variables.assetType as 'coin' | 'token',
        variables.assetPath
      )
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to buy NFT')
      }
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT purchased successfully",
        variant: "success",
        
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
        variant: "destructive",
        
      })
    }
  })
}

export function useCancelNFTSaleMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, Ticket>({
    mutationFn: async (ticket) => {
      const response = await cancelTicket(ticket)
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to cancel NFT sale')
      }
      return true
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "NFT sale cancelled successfully",
        variant: "success",
        
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
        variant: "destructive",
        
      })
    }
  })
} 
