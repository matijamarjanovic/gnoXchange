'use client'

import { Ticket } from "@/app/types/types"
import { createContext, useContext, useState } from "react"

interface TicketSidebarContextType {
  selectedTicket: Ticket | null
  setSelectedTicket: (ticket: Ticket | null) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const TicketSidebarContext = createContext<TicketSidebarContextType | undefined>(undefined)

export function TicketSidebarProvider({ children }: { children: React.ReactNode }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TicketSidebarContext.Provider value={{
      selectedTicket,
      setSelectedTicket,
      isOpen,
      setIsOpen
    }}>
      {children}
    </TicketSidebarContext.Provider>
  )
}

export function useTicketSidebar() {
  const context = useContext(TicketSidebarContext)
  if (!context) {
    throw new Error('useTicketSidebar must be used within a TicketSidebarProvider')
  }
  return context
} 
