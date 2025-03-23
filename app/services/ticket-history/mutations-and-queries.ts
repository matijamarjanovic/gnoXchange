import { getTicketsPage } from '@/app/queries/abci-queries'
import { fulfillTicket } from '@/app/services/tx-service'
import { Ticket } from '@/app/types/types'
import { toast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Fuse from 'fuse.js'
import { useMemo } from 'react'

export function useTicketsHistoryQuery(pageSize: number = 10000) {
  return useQuery<Ticket[]>({
    queryKey: ['tickets-history'],
    queryFn: () => getTicketsPage(1, pageSize),
    staleTime: 1000 * 60, 
  })
}

export function useTicketSearch(tickets: Ticket[]) {
  const fuse = useMemo(() => {
    const fuseOptions = {
      keys: [
        'id',
        'creator',
        'assetIn.tokenHubPath',
        'assetIn.name',
        'assetIn.symbol',
        'assetIn.type',
        'assetOut.tokenHubPath',
        'assetOut.name',
        'assetOut.symbol',
        'assetOut.type',
      ],
      threshold: 0.2,
      shouldSort: true,
      minMatchCharLength: 2
    }
    return new Fuse(tickets, fuseOptions)
  }, [tickets])

  return fuse
}

export function useFilteredTickets(tickets: Ticket[], searchQuery: string, fuse: Fuse<Ticket> | null) {
  const filteredTickets = useMemo(() => {
    if (!searchQuery) return tickets;
    if (!fuse) return tickets;
    
    const searchResults = fuse.search(searchQuery);
    return searchResults.map(result => result.item);
  }, [searchQuery, tickets, fuse]);

  return filteredTickets;
}

export function useFulfillTicketMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticket, amount }: { ticket: Ticket, amount: number }) => {
      return await fulfillTicket(ticket, amount)
    },
    onSuccess: async (success) => {
      if (success) {
        toast({
          variant: "success",
          title: "Trade successful",
          description: "Your trade has been completed.",
        })
        await queryClient.invalidateQueries({ queryKey: ['tickets-history'] })
        onSuccess?.()
      }
    },
    onError: (error: Error) => {
      console.error('Trade failed:', error)
      toast({
        title: "Trade failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    }
  })
} 
