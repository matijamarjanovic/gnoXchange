import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock,
  XCircle
} from 'lucide-react'
import { TicketStatus } from './types/types'
import { toast } from '@/hooks/use-toast'

export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('default', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatAmount = (amount: number, decimals: number = 6) => {
  return (amount / Math.pow(10, decimals)).toFixed(decimals)
}

export const getNFTName = (path: string) => {
  const parts = path.split('.')
  return parts[parts.length - 2] + '.' + parts[parts.length - 1]
}

export const getTicketStatusConfig = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return {
        icon: Clock,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/50',
        hoverBg: 'hover:bg-blue-900/70',
        label: 'Open'
      }
    case 'fulfilled':
      return {
        icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'bg-green-900/50',
        hoverBg: 'hover:bg-green-900/70',
        label: 'Fulfilled'
      }
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/50',
        hoverBg: 'hover:bg-yellow-900/70',
        label: 'Cancelled'
      }
    case 'expired':
      return {
        icon: AlertCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/50',
        hoverBg: 'hover:bg-red-900/70',
        label: 'Expired'
      }
    case 'all':
      return {
        icon: CircleDot,
        color: 'text-gray-400',
        bgColor: 'bg-gray-800',
        hoverBg: 'hover:bg-gray-900 hover:text-gray-300',
        label: 'All'
      }
  }
} 

export function showValidationError(error: { title: string; description: string }) {
  toast({
    variant: "destructive",
    title: error.title,
    description: error.description
  });
}
