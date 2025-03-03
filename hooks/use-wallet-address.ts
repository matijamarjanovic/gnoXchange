"use client"

import { AdenaService } from "@/app/services/adena-service"
import { useEffect, useState } from "react"

export function useWalletAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    setAddress(AdenaService.getInstance().getAddress())

    const handleAddressChange = (event: CustomEvent<{ newAddress: string | null }>) => {
      setAddress(event.detail.newAddress)
    }

    window.addEventListener('adenaAddressChanged', handleAddressChange as EventListener)

    return () => {
      window.removeEventListener('adenaAddressChanged', handleAddressChange as EventListener)
    }
  }, [])

  return address
} 
